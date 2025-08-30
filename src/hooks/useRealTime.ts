'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export interface RealTimeEvent {
  type: 'connection' | 'user_update' | 'admin_update' | 'global_update' | 'heartbeat' | 'error';
  data?: any;
  timestamp: string;
  channel?: string;
  userId?: string | null;
  error?: string;
}

export interface UseRealTimeOptions {
  channel?: 'user' | 'admin' | 'global';
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatTimeout?: number;
}

export interface UseRealTimeReturn {
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdate: Date | null;
  connectionError: string | null;
  connectionAttempts: number;
  subscribe: (callback: (event: RealTimeEvent) => void) => () => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

const DEFAULT_OPTIONS: Required<UseRealTimeOptions> = {
  channel: 'global',
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelay: 1000,
  heartbeatTimeout: 45000 // 45 seconds
};

/**
 * Hook for managing Server-Sent Events real-time connections
 */
export function useRealTime(options: UseRealTimeOptions = {}): UseRealTimeReturn {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // Refs for managing connection
  const eventSourceRef = useRef<EventSource | null>(null);
  const subscribersRef = useRef<Set<(event: RealTimeEvent) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualDisconnect = useRef(false);
  
  // Refs for stable values
  const connectionAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  
  // Update refs when state changes
  useEffect(() => {
    connectionAttemptsRef.current = connectionAttempts;
  }, [connectionAttempts]);
  
  useEffect(() => {
    isConnectingRef.current = isConnecting;
  }, [isConnecting]);

  // Clear timeouts helper
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Reset heartbeat timeout
  const resetHeartbeatTimeout = useCallback(() => {
    clearTimeouts();
    heartbeatTimeoutRef.current = setTimeout(() => {
      console.log('[useRealTime] 💔 Heartbeat timeout, connection may be stale');
      if (opts.autoReconnect && !isManualDisconnect.current) {
        // Use ref to avoid circular dependency
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        setIsConnected(false);
        setIsConnecting(false);
        // Trigger reconnection by setting a flag that the connect effect will pick up
        setTimeout(() => {
          if (!isManualDisconnect.current) {
            setConnectionAttempts(prev => prev + 1);
          }
        }, 100);
      }
    }, opts.heartbeatTimeout);
  }, [opts.heartbeatTimeout, opts.autoReconnect, clearTimeouts]);

  // Broadcast event to all subscribers
  const broadcastToSubscribers = useCallback((event: RealTimeEvent) => {
    subscribersRef.current.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[useRealTime] ❌ Error in subscriber callback:', error);
      }
    });
  }, []);

  // Connect to SSE endpoint
  const connectRef = useRef<() => void>(() => {});
  
  const connect = useCallback(() => {
    if (eventSourceRef.current || isConnectingRef.current) {
      console.log('[useRealTime] ⚠️ Connection already exists or in progress');
      return;
    }

    console.log(`[useRealTime] 🔌 Connecting to SSE channel: ${opts.channel}`);
    setIsConnecting(true);
    setConnectionError(null);
    isManualDisconnect.current = false;

    try {
      // Build SSE URL with channel parameter
      const url = new URL('/api/realtime', window.location.origin);
      url.searchParams.set('channel', opts.channel);
      
      // Create EventSource connection
      const eventSource = new EventSource(url.toString());
      eventSourceRef.current = eventSource;

      // Handle connection open
      eventSource.onopen = () => {
        console.log(`[useRealTime] ✅ SSE connection established to ${opts.channel}`);
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(null);
        setConnectionAttempts(0);
        resetHeartbeatTimeout();
      };

      // Handle incoming messages
      eventSource.onmessage = (event) => {
        try {
          const data: RealTimeEvent = JSON.parse(event.data);
          console.log(`[useRealTime] 📨 Received event:`, data.type);
          
          setLastUpdate(new Date());
          
          // Reset heartbeat timeout on any message
          if (data.type === 'heartbeat') {
            resetHeartbeatTimeout();
          } else {
            // Broadcast non-heartbeat events to subscribers
            broadcastToSubscribers(data);
            resetHeartbeatTimeout();
          }
        } catch (error) {
          console.error('[useRealTime] ❌ Error parsing SSE message:', error);
        }
      };

      // Handle connection errors
      eventSource.onerror = (error) => {
        console.error('[useRealTime] ❌ SSE connection error:', error);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Only attempt reconnection if not manually disconnected
        const currentAttempts = connectionAttemptsRef.current;
        if (!isManualDisconnect.current && opts.autoReconnect && currentAttempts < opts.maxReconnectAttempts) {
          const delay = opts.reconnectDelay * Math.pow(2, currentAttempts); // Exponential backoff
          console.log(`[useRealTime] 🔄 Attempting reconnection in ${delay}ms (attempt ${currentAttempts + 1}/${opts.maxReconnectAttempts})`);
          
          setConnectionError(`Connection lost. Reconnecting in ${Math.ceil(delay / 1000)}s...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            eventSourceRef.current = null;
            // Use ref to avoid circular dependency
            if (connectRef.current) {
              connectRef.current();
            }
          }, delay);
        } else if (currentAttempts >= opts.maxReconnectAttempts) {
          setConnectionError('Connection failed after maximum retry attempts');
          console.error('[useRealTime] ❌ Max reconnection attempts reached');
        }
      };

    } catch (error) {
      console.error('[useRealTime] ❌ Error creating SSE connection:', error);
      setIsConnecting(false);
      setConnectionError('Failed to establish connection');
    }
  }, [opts.channel, opts.autoReconnect, opts.maxReconnectAttempts, opts.reconnectDelay, resetHeartbeatTimeout, broadcastToSubscribers]);
  
  // Store connect function in ref to avoid circular dependencies
  connectRef.current = connect;

  // Disconnect from SSE
  const disconnect = useCallback(() => {
    console.log('[useRealTime] 🔌 Disconnecting SSE connection');
    isManualDisconnect.current = true;
    clearTimeouts();
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    setConnectionAttempts(0);
  }, [clearTimeouts]);

  // Reconnect (disconnect and connect)
  const reconnect = useCallback(() => {
    console.log('[useRealTime] 🔄 Reconnecting SSE connection');
    // Manual disconnect
    isManualDisconnect.current = true;
    clearTimeouts();
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    setConnectionAttempts(0);
    
    // Reset manual disconnect flag and reconnect
    setTimeout(() => {
      isManualDisconnect.current = false;
      if (connectRef.current) {
        connectRef.current();
      }
    }, 100); // Small delay to ensure cleanup
  }, [clearTimeouts]);

  // Subscribe to real-time events
  const subscribe = useCallback((callback: (event: RealTimeEvent) => void) => {
    console.log('[useRealTime] 📝 Adding subscriber');
    subscribersRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      console.log('[useRealTime] 📝 Removing subscriber');
      subscribersRef.current.delete(callback);
    };
  }, []);

  // Auto-connect effect - stable dependencies only
  useEffect(() => {
    // Check authentication requirements
    if (opts.channel === 'user' && !isSignedIn) {
      console.log('[useRealTime] 👤 User channel requires authentication, skipping connection');
      return;
    }
    
    if (opts.channel === 'admin' && (!isSignedIn || !userId)) {
      console.log('[useRealTime] 👨‍💼 Admin channel requires authentication, skipping connection');
      return;
    }

    // Auto-connect only if no connection exists
    if (!eventSourceRef.current) {
      console.log('[useRealTime] 🚀 Initiating auto-connection');
      // Use a timeout to avoid immediate re-execution
      const connectTimeout = setTimeout(() => {
        if (!eventSourceRef.current && !isManualDisconnect.current) {
          if (connectRef.current) {
            connectRef.current();
          }
        }
      }, 10);
      
      return () => {
        clearTimeout(connectTimeout);
      };
    }
  }, [opts.channel, isSignedIn, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[useRealTime] 🔌 Component unmounting, cleaning up connection');
      isManualDisconnect.current = true;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }
      
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    lastUpdate,
    connectionError,
    connectionAttempts,
    subscribe,
    connect,
    disconnect,
    reconnect
  };
}