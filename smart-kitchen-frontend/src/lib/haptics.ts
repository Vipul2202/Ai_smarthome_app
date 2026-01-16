"use client"

// Haptic feedback utilities for mobile devices
export class HapticFeedback {
  private static isSupported(): boolean {
    return typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  private static isMobile(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Light tap feedback (10ms)
  static light(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate(10);
    }
  }

  // Medium tap feedback (25ms)
  static medium(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate(25);
    }
  }

  // Heavy tap feedback (50ms)
  static heavy(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate(50);
    }
  }

  // Success feedback pattern
  static success(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate([10, 50, 10]);
    }
  }

  // Error feedback pattern
  static error(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate([50, 100, 50, 100, 50]);
    }
  }

  // Warning feedback pattern
  static warning(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate([25, 50, 25]);
    }
  }

  // Selection feedback (for tabs, buttons)
  static selection(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate(15);
    }
  }

  // Impact feedback (for actions like delete, submit)
  static impact(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate(30);
    }
  }

  // Notification feedback
  static notification(): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate([20, 100, 20]);
    }
  }

  // Custom pattern
  static custom(pattern: number | number[]): void {
    if (HapticFeedback.isSupported() && HapticFeedback.isMobile()) {
      navigator.vibrate(pattern);
    }
  }
}

// Hook for using haptic feedback in components
export function useHapticFeedback() {
  return {
    light: HapticFeedback.light,
    medium: HapticFeedback.medium,
    heavy: HapticFeedback.heavy,
    success: HapticFeedback.success,
    error: HapticFeedback.error,
    warning: HapticFeedback.warning,
    selection: HapticFeedback.selection,
    impact: HapticFeedback.impact,
    notification: HapticFeedback.notification,
    custom: HapticFeedback.custom,
  };
}