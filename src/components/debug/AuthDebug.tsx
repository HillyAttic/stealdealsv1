'use client';

import { useAuthContext } from '@/components/auth/AuthProvider';
import { clientSession } from '@/lib/auth/client-session';
import { useEffect, useState } from 'react';

export function AuthDebug() {
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [localStorage, setLocalStorage] = useState<any>({});

  useEffect(() => {
    // Get client session info
    const session = clientSession.getSession();
    setSessionInfo(session);

    // Get localStorage info
    if (typeof window !== 'undefined') {
      setLocalStorage({
        mockAuth: window.localStorage.getItem('mock_authenticated'),
        mockUser: window.localStorage.getItem('mock_user'),
        allKeys: Object.keys(window.localStorage)
      });
    }
  }, [isAuthenticated, user]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🐛 Auth Debug</h3>
      <div className="space-y-2">
        <div>
          <strong>AuthContext:</strong>
          <div>• isAuthenticated: {String(isAuthenticated)}</div>
          <div>• isLoading: {String(isLoading)}</div>
          <div>• user: {user ? user.email : 'null'}</div>
        </div>
        
        <div>
          <strong>ClientSession:</strong>
          <div>• session: {sessionInfo ? 'exists' : 'null'}</div>
          <div>• user: {sessionInfo?.user?.email || 'null'}</div>
        </div>
        
        <div>
          <strong>localStorage:</strong>
          <div>• mock_authenticated: {localStorage.mockAuth}</div>
          <div>• mock_user exists: {localStorage.mockUser ? 'yes' : 'no'}</div>
          <div>• all keys: {localStorage.allKeys?.length || 0}</div>
        </div>
        
        <button
          onClick={() => {
            console.log('=== AUTH DEBUG ===');
            console.log('AuthContext:', { isAuthenticated, user, isLoading });
            console.log('ClientSession:', clientSession.getSession());
            console.log('localStorage:', localStorage);
          }}
          className="bg-blue-600 px-2 py-1 rounded text-white text-xs"
        >
          Log to Console
        </button>
      </div>
    </div>
  );
}