import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// Generic page skeleton loader
export function PageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardContent className="p-2.5 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg mb-2 sm:mb-3" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mb-1" />
                <Skeleton className="h-6 sm:h-8 w-8 sm:w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border">
                  <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  </div>
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mb-1" />
                    <Skeleton className="h-2 sm:h-3 w-12 sm:w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Shopping page specific skeleton
export function ShoppingSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-56 sm:w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
          <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
          <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardContent className="p-2.5 sm:p-5">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg mb-2 sm:mb-3" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mb-1" />
                <Skeleton className="h-6 sm:h-8 w-8 sm:w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="mobile-card">
            <CardContent className="p-3 sm:p-4">
              {/* Tab switcher skeleton */}
              <div className="flex gap-1 bg-muted/50 rounded-xl p-1 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 h-8 sm:h-11 rounded-lg" />
                ))}
              </div>

              {/* Progress bar skeleton */}
              <Skeleton className="h-2 sm:h-3 w-full rounded-full mb-4" />

              {/* Shopping items skeleton */}
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border">
                    <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    </div>
                    <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-8 sm:h-10 w-full mt-4 rounded-lg" />
            </CardContent>
          </Card>

          {/* Summary card skeleton */}
          <Card className="mobile-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32 mb-2" />
                  <Skeleton className="h-8 sm:h-12 w-20 sm:w-24 mb-1" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                </div>
                <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl" />
              </div>
              <Skeleton className="h-8 sm:h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Festival templates skeleton */}
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Kitchen alerts skeleton */}
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg">
                  <Skeleton className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Inventory page skeleton
export function InventorySkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
          <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardContent className="p-2.5 sm:p-4">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg mb-2" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 mb-1" />
                <Skeleton className="h-5 sm:h-6 w-8 sm:w-12" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inventory grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  </div>
                </div>
                <Skeleton className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                </div>
                <Skeleton className="h-2 sm:h-3 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  <Skeleton className="h-4 sm:h-5 w-12 sm:w-16 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Recipe page skeleton
export function RecipeSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
          <Skeleton className="h-8 sm:h-10 w-24 sm:w-28" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 sm:h-10 w-20 sm:w-24 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="mobile-card overflow-hidden">
            <div className="aspect-video">
              <Skeleton className="w-full h-full" />
            </div>
            <CardContent className="p-3 sm:p-4">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-full mb-3" />
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                </div>
              </div>

              <div className="flex gap-2">
                <Skeleton className="flex-1 h-8 sm:h-10 rounded-lg" />
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Settings page skeleton
export function SettingsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-64" />
        </div>
        <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main settings card */}
        <Card className="mobile-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 mb-1" />
                  <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                </div>
              </div>
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Kitchens section */}
            <div>
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-2" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg border">
                    <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-1" />
                      <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Members section */}
            <div>
              <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-2" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-full border">
                    <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
                    <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences card */}
        <Card className="mobile-card">
          <CardHeader>
            <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
                <div>
                  <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-1" />
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                </div>
              </div>
            ))}
            <Skeleton className="h-8 sm:h-10 w-full rounded-lg mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Expenses page skeleton
export function ExpensesSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-28 sm:w-36 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-40 sm:w-48" />
        </div>
        <Skeleton className="h-8 sm:h-10 w-24 sm:w-28" />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg" />
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              </div>
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expense list */}
      <Card className="mobile-card">
        <CardHeader>
          <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                <div>
                  <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mb-1" />
                <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// Analytics page skeleton
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-28 sm:w-36 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
          <Skeleton className="h-8 sm:h-10 w-16 sm:w-20" />
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg" />
                <Skeleton className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 mb-1" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="mobile-card">
          <CardHeader>
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-48 sm:h-64 rounded-lg" />
          </CardContent>
        </Card>

        <Card className="mobile-card">
          <CardHeader>
            <Skeleton className="h-5 sm:h-6 w-28 sm:w-36" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-48 sm:h-64 rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Additional charts */}
      <Card className="mobile-card">
        <CardHeader>
          <Skeleton className="h-5 sm:h-6 w-36 sm:w-44" />
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-32 sm:h-40 rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}

// Price comparison page skeleton
export function PricesSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="h-7 w-7 sm:h-10 sm:w-10" />
        <div className="flex-1">
          <Skeleton className="h-6 sm:h-8 w-40 sm:w-48 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-56 sm:w-64" />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 sm:h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* Price comparison cards */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                  <Skeleton className="h-5 sm:h-6 w-20 sm:w-24 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="p-4 rounded-xl border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                      </div>
                      <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1 mb-2">
                        <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
                        <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
                      </div>
                      <Skeleton className="h-4 sm:h-5 w-12 sm:w-16" />
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 sm:h-4 w-8 sm:w-10" />
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                        <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                      </div>
                    </div>

                    <Skeleton className="h-8 sm:h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price alerts */}
      <Card className="mobile-card">
        <CardHeader>
          <Skeleton className="h-5 sm:h-6 w-28 sm:w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-5 h-5 rounded-lg mt-0.5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-2" />
                    <Skeleton className="h-3 sm:h-4 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
// Dashboard/Home page skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 mb-2" />
          <Skeleton className="h-3 sm:h-4 w-48 sm:w-56" />
        </div>
        <Skeleton className="h-8 sm:h-10 w-20 sm:w-24" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="mobile-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg" />
                <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
              </div>
              <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-1" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Recent activity */}
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border">
                  <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 sm:h-5 w-32 sm:w-40 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-36" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-3 sm:p-4 rounded-xl border text-center">
                    <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg mx-auto mb-2 sm:mb-3" />
                    <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 mx-auto mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-12 sm:w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Upcoming reminders */}
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg border">
                  <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mt-0.5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 sm:h-5 w-20 sm:w-24 mb-1" />
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Kitchen status */}
          <Card className="mobile-card">
            <CardHeader>
              <Skeleton className="h-5 sm:h-6 w-28 sm:w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3" />
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mx-auto mb-2" />
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24 mx-auto" />
              </div>
              
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-3 sm:h-4 w-8 sm:w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}