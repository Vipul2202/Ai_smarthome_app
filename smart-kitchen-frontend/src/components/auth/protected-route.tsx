'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { isAuthenticated, getCurrentUser, clearAuthState } from '@/lib/auth';
import { ME_QUERY } from '@/lib/graphql/queries';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !isAuthenticated(),
    errorPolicy: 'all',
  });

  useEffect(() => {
    if (data && !loading) {
      setIsAuthed(true);
      setIsChecking(false);
    }
  }, [data, loading]);

  useEffect(() => {
    if (error && !loading) {
      console.error('Auth check failed:', error);
      clearAuthState();
      setIsAuthed(false);
      setIsChecking(false);
      router.replace('/login');
    }
  }, [error, loading, router]);

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsAuthed(false);
      setIsChecking(false);
      router.replace('/login');
      return;
    }

    // If we have a token but no query result yet, wait for the query
    if (!loading && !data && !error) {
      setIsChecking(false);
    }
  }, [router, loading, data, error]);

  if (isChecking || loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      )
    );
  }

  if (!isAuthed) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}