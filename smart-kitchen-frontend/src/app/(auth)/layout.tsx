'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [router]);

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors">
      {/* Theme Toggle */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(5, 150, 105, 0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 dark:from-emerald-600/10 dark:to-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400/20 to-emerald-400/20 dark:from-blue-600/10 dark:to-emerald-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      {/* Content */}
      <div className="relative flex h-full items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {children}
        </div>
      </div>
    </div>
  );
}