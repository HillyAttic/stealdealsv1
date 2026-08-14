'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SignedOutProps {
  children: ReactNode;
}

export default function SignedOut({ children }: SignedOutProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
