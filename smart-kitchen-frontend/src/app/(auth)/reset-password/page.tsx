'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ChefHat, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { RESET_PASSWORD_MUTATION } from '@/lib/graphql/mutations';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      // Redirect to forgot password if no token
      router.replace('/forgot-password');
    }
  }, [searchParams, router]);

  const [resetPassword, { loading, error, data }] = useMutation(RESET_PASSWORD_MUTATION);

  useEffect(() => {
    if (data?.resetPassword?.success) {
      setIsSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  }, [data, router]);

  useEffect(() => {
    if (error) {
      console.error('Reset password error:', error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword || !token) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 6) {
      return;
    }

    try {
      await resetPassword({
        variables: { 
          token,
          newPassword: password 
        },
      });
    } catch (err) {
      console.error('Reset password failed:', err);
    }
  };

  const isFormValid = password && confirmPassword && password === confirmPassword && password.length >= 6;

  if (isSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Success Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 shadow-xl shadow-emerald-500/25 dark:shadow-emerald-500/10"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl mobile-text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-blue-400 bg-clip-text text-transparent">
                Password Reset
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base mobile-text-sm">
                Your password has been successfully reset
              </p>
            </div>
          </div>

          {/* Success Card */}
          <Card className="border-0 shadow-xl shadow-slate-900/10 dark:shadow-black/30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
            <CardContent className="p-8 text-center space-y-6">
              <div className="space-y-4">
                <p className="text-xs md:text-sm mobile-text-xs text-slate-600 dark:text-slate-300">
                  You can now sign in with your new password.
                </p>
                <p className="text-xs mobile-text-xs text-slate-500 dark:text-slate-400">
                  Redirecting to login page in 3 seconds...
                </p>
              </div>

              <Link href="/login">
                <Button className="w-full mobile-btn bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-sm mobile-text-sm">
                  Continue to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect to forgot password
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 shadow-xl shadow-emerald-500/25 dark:shadow-emerald-500/10"
          >
            <ChefHat className="h-10 w-10 text-white" />
          </motion.div>
          
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl mobile-text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-blue-400 bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base mobile-text-sm">
              Enter your new password below
            </p>
          </div>
        </div>

        {/* Reset Card */}
        <Card className="border-0 shadow-xl shadow-slate-900/10 dark:shadow-black/30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs mobile-text-xs">{error.message}</span>
                </motion.div>
              )}

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-xs md:text-sm mobile-text-xs font-medium text-slate-700 dark:text-slate-200">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mobile-input pl-12 pr-12 h-10 md:h-12 border-slate-200/60 dark:border-slate-600/60 bg-white/95 dark:bg-slate-700/95 text-slate-900 dark:text-slate-100 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 text-sm mobile-text-sm backdrop-blur-xl"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {password && password.length < 6 && (
                  <p className="text-xs mobile-text-xs text-amber-600 dark:text-amber-400">Password must be at least 6 characters</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-xs md:text-sm mobile-text-xs font-medium text-slate-700 dark:text-slate-200">
                  Confirm New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-500" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mobile-input pl-12 pr-12 h-10 md:h-12 border-slate-200/60 dark:border-slate-600/60 bg-white/95 dark:bg-slate-700/95 text-slate-900 dark:text-slate-100 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 text-sm mobile-text-sm backdrop-blur-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs mobile-text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full mobile-btn h-10 md:h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] text-sm mobile-text-sm"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm mobile-text-sm">Resetting Password...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-xs md:text-sm mobile-text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto">
        <div className="text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 shadow-xl">
            <ChefHat className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl mobile-text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-blue-400 bg-clip-text text-transparent">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}