'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SignedInProps {
  children: ReactNode;
}

export default function SignedIn({ children }: SignedInProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
