/**
 * Test to verify that the useRealTime hook no longer causes infinite loops
 * This test validates the fix for the "Maximum update depth exceeded" error
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useRealTime } from '../hooks/useRealTime';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isSignedIn: true,
    userId: 'test-user-id'
  }),
  useUser: () => ({
    user: { id: 'test-user-id' }
  })
}));

// Mock EventSource
class MockEventSource {
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState: number = 0;
  url: string;

  constructor(url: string) {
    this.url = url;
    // Simulate connection opening after a short delay
    setTimeout(() => {
      this.readyState = 1;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 10);
  }

  close() {
    this.readyState = 2;
  }
}

global.EventSource = MockEventSource as any;

describe('useRealTime - Infinite Loop Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not cause infinite re-renders when connecting', async () => {
    const renderCount = jest.fn();
    
    const { result } = renderHook(() => {
      renderCount();
      return useRealTime({ channel: 'admin' });
    });

    // Wait for initial render and connection setup
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // The hook should not render more than a reasonable number of times
    // In a properly functioning hook, we expect:
    // 1. Initial render
    // 2. Connecting state change
    // 3. Connected state change
    // Total should be <= 5 renders for safety margin
    expect(renderCount).toHaveBeenCalledTimes(expect.any(Number));
    expect(renderCount.mock.calls.length).toBeLessThanOrEqual(5);

    // Verify the hook is in a stable state
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
  });

  it('should not create circular dependencies between connect and disconnect', () => {
    const { result } = renderHook(() => useRealTime({ channel: 'global' }));

    // These functions should be stable and not cause re-renders when called
    const initialConnect = result.current.connect;
    const initialDisconnect = result.current.disconnect;
    const initialReconnect = result.current.reconnect;

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Functions should remain stable (same reference)
    expect(result.current.connect).toBe(initialConnect);
    expect(result.current.disconnect).toBe(initialDisconnect);
    expect(result.current.reconnect).toBe(initialReconnect);
  });

  it('should handle reconnection without infinite loops', () => {
    const { result } = renderHook(() => useRealTime({ 
      channel: 'admin',
      autoReconnect: true,
      maxReconnectAttempts: 2
    }));

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Verify initial connection
    expect(result.current.isConnected).toBe(true);

    // Trigger a reconnection
    act(() => {
      result.current.reconnect();
      jest.advanceTimersByTime(200);
    });

    // Should successfully reconnect without causing infinite loops
    expect(result.current.isConnected).toBe(true);
    expect(result.current.connectionError).toBeNull();
  });

  it('should not trigger useEffect dependencies infinitely', () => {
    const effectCallback = jest.fn();
    
    const { rerender } = renderHook(
      ({ channel }) => {
        const realTimeResult = useRealTime({ channel });
        
        // This effect would trigger infinite loops if connect/disconnect functions
        // are not stable or if they cause the useRealTime effect to re-run
        React.useEffect(() => {
          effectCallback();
        }, [realTimeResult.connect, realTimeResult.disconnect]);
        
        return realTimeResult;
      },
      { initialProps: { channel: 'global' as const } }
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    // The effect should only run once for the initial setup
    expect(effectCallback).toHaveBeenCalledTimes(1);

    // Trigger a rerender with the same props
    rerender({ channel: 'global' });
    
    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Should not trigger additional effect runs
    expect(effectCallback).toHaveBeenCalledTimes(1);
  });
});