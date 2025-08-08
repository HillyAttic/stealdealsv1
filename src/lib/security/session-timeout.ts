import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export interface SessionTimeoutConfig {
  maxIdleTime: number; // Maximum idle time in milliseconds
  maxSessionTime: number; // Maximum total session time in milliseconds
  warningTime: number; // Time before expiry to show warning in milliseconds
  extendOnActivity: boolean; // Whether to extend session on activity
}

export interface SessionActivity {
  userId: string;
  lastActivity: number;
  sessionStart: number;
  warningShown: boolean;
}

// In-memory store for session activity (use Redis in production)
const sessionActivityStore = new Map<string, SessionActivity>();

/**
 * Default session timeout configuration
 */
export const DEFAULT_SESSION_CONFIG: SessionTimeoutConfig = {
  maxIdleTime: 30 * 60 * 1000, // 30 minutes
  maxSessionTime: 8 * 60 * 60 * 1000, // 8 hours
  warningTime: 5 * 60 * 1000, // 5 minutes before expiry
  extendOnActivity: true
};

/**
 * Strict session configuration for sensitive operations
 */
export const STRICT_SESSION_CONFIG: SessionTimeoutConfig = {
  maxIdleTime: 15 * 60 * 1000, // 15 minutes
  maxSessionTime: 2 * 60 * 60 * 1000, // 2 hours
  warningTime: 2 * 60 * 1000, // 2 minutes before expiry
  extendOnActivity: false
};

/**
 * Update session activity
 */
export function updateSessionActivity(
  userId: string,
  sessionToken: string
): void {
  const now = Date.now();
  const existing = sessionActivityStore.get(sessionToken);
  
  const activity: SessionActivity = {
    userId,
    lastActivity: now,
    sessionStart: existing?.sessionStart || now,
    warningShown: false
  };
  
  sessionActivityStore.set(sessionToken, activity);
}

/**
 * Check if session is expired
 */
export function isSessionExpired(
  sessionToken: string,
  config: SessionTimeoutConfig = DEFAULT_SESSION_CONFIG
): {
  expired: boolean;
  reason?: 'idle' | 'max_time';
  timeRemaining?: number;
  showWarning?: boolean;
} {
  const activity = sessionActivityStore.get(sessionToken);
  
  if (!activity) {
    return { expired: true, reason: 'idle' };
  }
  
  const now = Date.now();
  const idleTime = now - activity.lastActivity;
  const totalTime = now - activity.sessionStart;
  
  // Check maximum session time
  if (totalTime > config.maxSessionTime) {
    return { expired: true, reason: 'max_time' };
  }
  
  // Check idle time
  if (idleTime > config.maxIdleTime) {
    return { expired: true, reason: 'idle' };
  }
  
  // Check if warning should be shown
  const timeUntilIdleExpiry = config.maxIdleTime - idleTime;
  const timeUntilMaxExpiry = config.maxSessionTime - totalTime;
  const timeRemaining = Math.min(timeUntilIdleExpiry, timeUntilMaxExpiry);
  
  const showWarning = timeRemaining <= config.warningTime && !activity.warningShown;
  
  if (showWarning) {
    activity.warningShown = true;
    sessionActivityStore.set(sessionToken, activity);
  }
  
  return {
    expired: false,
    timeRemaining,
    showWarning
  };
}

/**
 * Extend session if allowed
 */
export function extendSession(
  sessionToken: string,
  config: SessionTimeoutConfig = DEFAULT_SESSION_CONFIG
): boolean {
  if (!config.extendOnActivity) {
    return false;
  }
  
  const activity = sessionActivityStore.get(sessionToken);
  if (!activity) {
    return false;
  }
  
  const now = Date.now();
  activity.lastActivity = now;
  activity.warningShown = false;
  
  sessionActivityStore.set(sessionToken, activity);
  return true;
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(
  config: SessionTimeoutConfig = DEFAULT_SESSION_CONFIG
): void {
  const now = Date.now();
  
  for (const [token, activity] of sessionActivityStore.entries()) {
    const idleTime = now - activity.lastActivity;
    const totalTime = now - activity.sessionStart;
    
    if (idleTime > config.maxIdleTime || totalTime > config.maxSessionTime) {
      sessionActivityStore.delete(token);
    }
  }
}

/**
 * Middleware to handle session timeout
 */
export function withSessionTimeout(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: SessionTimeoutConfig = DEFAULT_SESSION_CONFIG
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const session = getSessionFromRequest(request);
    
    if (!session) {
      return handler(request);
    }
    
    const { expired, reason, timeRemaining, showWarning } = isSessionExpired(
      session.token,
      config
    );
    
    if (expired) {
      // Clear session and return unauthorized
      const response = NextResponse.json(
        {
          success: false,
          error: 'Session expired',
          code: 'SESSION_EXPIRED',
          reason
        },
        { status: 401 }
      );
      
      // Clear session cookies
      response.cookies.set('auth_session', '', { maxAge: 0 });
      response.cookies.set('auth_user', '', { maxAge: 0 });
      
      // Clean up session activity
      sessionActivityStore.delete(session.token);
      
      return response;
    }
    
    // Update activity for this request
    updateSessionActivity(session.user.id, session.token);
    
    // Execute the handler
    const response = await handler(request);
    
    // Add session timeout headers
    if (timeRemaining !== undefined) {
      response.headers.set('X-Session-Timeout', Math.floor(timeRemaining / 1000).toString());
    }
    
    if (showWarning) {
      response.headers.set('X-Session-Warning', 'true');
    }
    
    return response;
  };
}

/**
 * Get session timeout status for client
 */
export function getSessionTimeoutStatus(
  sessionToken: string,
  config: SessionTimeoutConfig = DEFAULT_SESSION_CONFIG
): {
  active: boolean;
  timeRemaining?: number;
  showWarning?: boolean;
  reason?: string;
} {
  const { expired, reason, timeRemaining, showWarning } = isSessionExpired(
    sessionToken,
    config
  );
  
  return {
    active: !expired,
    timeRemaining,
    showWarning,
    reason
  };
}

/**
 * Reset session warning flag
 */
export function resetSessionWarning(sessionToken: string): void {
  const activity = sessionActivityStore.get(sessionToken);
  if (activity) {
    activity.warningShown = false;
    sessionActivityStore.set(sessionToken, activity);
  }
}

/**
 * Get all active sessions for a user
 */
export function getUserActiveSessions(userId: string): string[] {
  const sessions: string[] = [];
  
  for (const [token, activity] of sessionActivityStore.entries()) {
    if (activity.userId === userId) {
      const { expired } = isSessionExpired(token);
      if (!expired) {
        sessions.push(token);
      }
    }
  }
  
  return sessions;
}

/**
 * Terminate all sessions for a user
 */
export function terminateUserSessions(userId: string): number {
  let terminated = 0;
  
  for (const [token, activity] of sessionActivityStore.entries()) {
    if (activity.userId === userId) {
      sessionActivityStore.delete(token);
      terminated++;
    }
  }
  
  return terminated;
}

// Cleanup expired sessions every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cleanupExpiredSessions(), 5 * 60 * 1000);
}