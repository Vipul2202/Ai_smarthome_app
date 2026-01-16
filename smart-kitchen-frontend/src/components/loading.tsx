import React from 'react';
import { Loader2, ChefHat, Apple, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'kitchen';
  text?: string;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
        {text && (
          <p className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-primary rounded-full animate-pulse',
                size === 'sm' ? 'w-1 h-1' : 
                size === 'md' ? 'w-2 h-2' :
                size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
        <div className={cn(
          'bg-primary/20 rounded-full animate-pulse',
          sizeClasses[size]
        )} />
        {text && (
          <p className={cn('text-muted-foreground animate-pulse', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'kitchen') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className="relative">
          <ChefHat className={cn('text-primary animate-bounce', sizeClasses[size])} />
          <div className="absolute -top-1 -right-1">
            <Apple className="w-3 h-3 text-green-500 animate-pulse" />
          </div>
        </div>
        {text && (
          <p className={cn('text-muted-foreground text-center', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return null;
}

// Page loading component
export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading variant="kitchen" size="xl" text={text} />
    </div>
  );
}

// Inline loading component
export function InlineLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading variant="spinner" size="md" text={text} />
    </div>
  );
}

// Button loading component
export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <Loader2 className={cn('animate-spin', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
  );
}

// Card loading skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-muted rounded-lg p-4 space-y-3">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted-foreground/20 rounded"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// List loading skeleton
export function ListSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Table loading skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {/* Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-muted-foreground/20 rounded"></div>
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="h-3 bg-muted-foreground/10 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Chart loading skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="bg-muted rounded-lg p-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-muted-foreground/10 rounded"></div>
      </div>
    </div>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ text = 'Loading...', show = true }: { text?: string; show?: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg p-6 shadow-lg">
        <Loading variant="kitchen" size="lg" text={text} />
      </div>
    </div>
  );
}