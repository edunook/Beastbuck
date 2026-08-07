import { cn } from '@shared/lib/utils';

export function MobileSafeContainer({ children, className }) {
  return (
    <div className={cn(
      "w-full max-w-full overflow-x-hidden",
      "px-4 sm:px-6 lg:px-8",
      className
    )}>
      {children}
    </div>
  );
}

export function MobileSafeView({ children, className }) {
  return (
    <div className={cn(
      "min-h-screen w-full overflow-x-hidden",
      "pb-safe-bottom",
      className
    )}>
      {children}
    </div>
  );
}

export function TouchTarget({ children, className, size = 'md' }) {
  const sizes = {
    sm: 'min-h-[44px] min-w-[44px]',
    md: 'min-h-[48px] min-w-[48px]',
    lg: 'min-h-[52px] min-w-[52px]',
  };

  return (
    <div className={cn(
      "inline-flex items-center justify-center",
      sizes[size],
      className
    )}>
      {children}
    </div>
  );
}

export function MobileGrid({ children, className, cols = 1 }) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn(
      "grid gap-4",
      gridCols[cols],
      "sm:grid-cols-2",
      "lg:grid-cols-3",
      "xl:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}
