import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface ErrorStateProps {
  title?: string
  message?: string
  showRetry?: boolean
  showHome?: boolean
  showBack?: boolean
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = "Something went wrong",
  message = "We encountered an error while loading this page. Please try again.",
  showRetry = true,
  showHome = false,
  showBack = false,
  onRetry,
  className = ""
}: ErrorStateProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`}>
      <Card className="mobile-card max-w-md mx-auto">
        <CardContent className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 dark:text-red-400" />
          </div>
          
          <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3">{title}</h3>
          <p className="text-[10px] sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            {showBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="h-8 sm:h-10 text-[10px] sm:text-sm"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Go Back
              </Button>
            )}
            
            {showHome && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="h-8 sm:h-10 text-[10px] sm:text-sm"
              >
                <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Home
              </Button>
            )}
            
            {showRetry && (
              <Button
                size="sm"
                onClick={handleRetry}
                className="h-8 sm:h-10 text-[10px] sm:text-sm bg-red-500 hover:bg-red-600"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title = "No data found",
  message = "There's nothing to show here yet.",
  actionLabel,
  onAction,
  className = ""
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`}>
      <div className="text-center max-w-md mx-auto p-6">
        {icon && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 sm:mb-6">
            {icon}
          </div>
        )}
        
        <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3">{title}</h3>
        <p className="text-[10px] sm:text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
          {message}
        </p>
        
        {actionLabel && onAction && (
          <Button
            size="sm"
            onClick={onAction}
            className="h-8 sm:h-10 text-[10px] sm:text-sm"
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

// Loading state component
interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({
  message = "Loading...",
  className = ""
}: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center min-h-64 ${className}`}>
      <div className="text-center">
        <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3 sm:mb-4" />
        <p className="text-[10px] sm:text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// Network error component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      showRetry={true}
      onRetry={onRetry}
    />
  )
}

// Not found component
export function NotFound({ 
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  showHome = true,
  showBack = true
}: {
  title?: string
  message?: string
  showHome?: boolean
  showBack?: boolean
}) {
  return (
    <ErrorState
      title={title}
      message={message}
      showRetry={false}
      showHome={showHome}
      showBack={showBack}
    />
  )
}

// Unauthorized access component
export function Unauthorized() {
  return (
    <ErrorState
      title="Access Denied"
      message="You don't have permission to access this page. Please contact your administrator if you believe this is an error."
      showRetry={false}
      showHome={true}
    />
  )
}

// Maintenance mode component
export function MaintenanceMode() {
  return (
    <ErrorState
      title="Under Maintenance"
      message="We're currently performing scheduled maintenance. Please check back in a few minutes."
      showRetry={true}
      showHome={false}
    />
  )
}