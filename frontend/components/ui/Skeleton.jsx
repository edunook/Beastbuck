import { cn } from '@shared/lib/utils';

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface", className)}
      {...props}
    />
  );
}

function CardSkeleton({ className }) {
  return (
    <div className={cn("bg-surface border border-border rounded-2xl p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    </div>
  );
}

function DashboardCardSkeleton({ className }) {
  return (
    <div className={cn("bg-surface border border-border rounded-2xl p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-10 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center space-x-4 p-4 bg-surface rounded-xl">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-xl">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-4 w-20" />
          ))}
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ items = 5, className }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border border-border rounded-xl">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

function ProgressiveImageSkeleton({ className }) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-surface",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface-100 to-surface animate-shimmer" />
      <Skeleton className="w-full h-full" />
    </div>
  );
}

function TextSkeleton({ lines = 3, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )} 
        />
      ))}
    </div>
  );
}

export { Skeleton, CardSkeleton, DashboardCardSkeleton, TableSkeleton, ListSkeleton, ProgressiveImageSkeleton, TextSkeleton };
