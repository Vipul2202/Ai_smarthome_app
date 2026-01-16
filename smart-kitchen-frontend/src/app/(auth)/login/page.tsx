'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ChefHat, AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { LOGIN_MUTATION } from '@/lib/graphql/mutations';
import { setAuthState } from '@/lib/auth';
import { getErrorMessage, getFieldError, ErrorMessages } from '@/lib/error-utils';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [login, { loading, error, data }] = useMutation(LOGIN_MUTATION);

  useEffect(() => {
    if (data?.login) {
      const { token, user } = data.login;
      setAuthState(user, token);
      router.push('/dashboard');
    }
  }, [data, router]);

  useEffect(() => {
    if (error) {
      console.error('Login error:', error);
    }
  }, [error]);

  // Get user-friendly error message
  const errorMessage = error ? getErrorMessage(error) : null;
  const emailError = error ? getFieldError(error, 'email') : null;
  const passwordError = error ? getFieldError(error, 'password') : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    try {
      await login({
        variables: {
          input: formData,
        },
      });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-4 sm:space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-4 sm:space-y-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 shadow-xl shadow-emerald-500/25 dark:shadow-emerald-500/10"
          >
            <ChefHat className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </motion.div>
          
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 dark:from-emerald-400 dark:via-emerald-500 dark:to-blue-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm md:text-base">
              Sign in to your Smart Kitchen Manager
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl shadow-slate-900/10 dark:shadow-black/30 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
          <CardContent className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Error Message */}
              {errorMessage && !emailError && !passwordError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 text-xs sm:text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/60 rounded-lg sm:rounded-xl backdrop-blur-sm"
                >
                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}

              {/* Email Field */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 sm:left-4 md:left-3.5 top-1/2 h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`!h-11 !min-h-[44px] sm:!h-12 sm:!min-h-[48px] md:!h-11 md:!min-h-[44px] !py-2.5 !px-4 pl-11 sm:pl-12 md:pl-11 text-sm sm:text-base md:text-sm !rounded-lg sm:!rounded-xl md:!rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 ${
                      emailError 
                        ? 'border-red-300/60 dark:border-red-600/60 bg-red-50/50 dark:bg-red-900/20' 
                        : 'border-slate-200/60 dark:border-slate-600/60 bg-white/95 dark:bg-slate-700/95'
                    } text-slate-900 dark:text-slate-100`}
                    required
                  />
                </div>
                {emailError && (
                  <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 sm:left-4 md:left-3.5 top-1/2 h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-emerald-500" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`!h-11 !min-h-[44px] sm:!h-12 sm:!min-h-[48px] md:!h-11 md:!min-h-[44px] !py-2.5 !px-4 pl-11 sm:pl-12 md:pl-11 pr-11 sm:pr-12 md:pr-11 text-sm sm:text-base md:text-sm !rounded-lg sm:!rounded-xl md:!rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 ${
                      passwordError 
                        ? 'border-red-300/60 dark:border-red-600/60 bg-red-50/50 dark:bg-red-900/20' 
                        : 'border-slate-200/60 dark:border-slate-600/60 bg-white/95 dark:bg-slate-700/95'
                    } text-slate-900 dark:text-slate-100`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 sm:right-4 md:right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 md:h-4 md:w-4" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 sm:h-12 md:h-11 text-sm sm:text-base md:text-sm font-medium rounded-lg sm:rounded-xl md:rounded-lg"
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors underline-offset-4 hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}