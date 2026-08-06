import { lazy, Suspense } from 'react';
import ErrorBoundary from '../../../components/ErrorBoundary';

const WIDGET_FALLBACK = (
  <div className="h-full min-h-[100px] animate-pulse rounded-xl bg-white/5 border border-white/10" />
);

const WIDGET_ERROR = (
  <div className="h-full min-h-[100px] rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
    <p className="text-[10px] font-bold text-text-muted">Widget unavailable</p>
  </div>
);

export function createSafeWidget(importFn, fallback = WIDGET_FALLBACK, errorFallback = WIDGET_ERROR) {
  const LazyComponent = lazy(importFn);

  function SafeWidget(props) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  SafeWidget.displayName = 'SafeWidget';

  return SafeWidget;
}
