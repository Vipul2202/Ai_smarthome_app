// apps/web/src/lib/is-mobile.ts
export function isMobileDevice() {
    if (typeof navigator === "undefined") return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  }
  