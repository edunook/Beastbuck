// Performance monitoring utilities for BeastBuck

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 0,
      cls: 0,
      lcp: 0,
      inp: 0,
      fcp: 0,
      ttfb: 0,
    };
    this.observers = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }

  // Monitor FPS
  startFPSMonitoring() {
    const measureFPS = () => {
      const now = performance.now();
      this.frameCount++;
      
      if (now - this.lastFrameTime >= 1000) {
        this.metrics.fps = this.frameCount;
        this.frameCount = 0;
        this.lastFrameTime = now;
        
        // Warn if FPS drops below 30
        if (this.metrics.fps < 30) {
          console.warn(`Low FPS detected: ${this.metrics.fps}`);
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  // Monitor Core Web Vitals
  startCoreWebVitalsMonitoring() {
    // CLS (Cumulative Layout Shift)
    if ('LayoutShift' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    }

    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    }

    // INP (Interaction to Next Paint)
    if ('PerformanceEventTiming' in window) {
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let maxINP = 0;
        for (const entry of entries) {
          if (entry.duration > maxINP) {
            maxINP = entry.duration;
          }
        }
        this.metrics.inp = maxINP;
      });
      inpObserver.observe({ type: 'event', buffered: true });
      this.observers.push(inpObserver);
    }

    // FCP (First Contentful Paint)
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.metrics.fcp = fcpEntry.startTime;
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      this.observers.push(fcpObserver);
    }

    // TTFB (Time to First Byte)
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      this.metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
    }
  }

  // Get current metrics
  getMetrics() {
    return { ...this.metrics };
  }

  // Check if metrics meet performance thresholds
  checkPerformanceThresholds() {
    const thresholds = {
      fps: { good: 55, needsImprovement: 30 },
      cls: { good: 0.1, needsImprovement: 0.25 },
      lcp: { good: 2500, needsImprovement: 4000 },
      inp: { good: 200, needsImprovement: 500 },
      fcp: { good: 1800, needsImprovement: 3000 },
      ttfb: { good: 800, needsImprovement: 1800 },
    };

    const results = {};
    
    for (const [metric, value] of Object.entries(this.metrics)) {
      const threshold = thresholds[metric];
      if (!threshold) continue;
      
      if (value <= threshold.good) {
        results[metric] = 'good';
      } else if (value <= threshold.needsImprovement) {
        results[metric] = 'needs-improvement';
      } else {
        results[metric] = 'poor';
      }
    }
    
    return results;
  }

  // Stop all monitoring
  stop() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitorInstance = null;

export function getPerformanceMonitor() {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor();
  }
  return performanceMonitorInstance;
}

// Initialize performance monitoring (call this in your app's entry point)
export function initPerformanceMonitoring() {
  const monitor = getPerformanceMonitor();
  monitor.startFPSMonitoring();
  monitor.startCoreWebVitalsMonitoring();
  
  // Log metrics every 5 seconds in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const metrics = monitor.getMetrics();
      const thresholds = monitor.checkPerformanceThresholds();
      console.log('Performance Metrics:', metrics);
      console.log('Performance Thresholds:', thresholds);
    }, 5000);
  }
  
  return monitor;
}

// Bundle size monitoring utilities
export function estimateBundleSize() {
  if (typeof window !== 'undefined' && window.performance) {
    const resources = performance.getEntriesByType('resource');
    let totalSize = 0;
    
    resources.forEach(resource => {
      if (resource.transferSize) {
        totalSize += resource.transferSize;
      }
    });
    
    return {
      totalBytes: totalSize,
      totalKB: (totalSize / 1024).toFixed(2),
      totalMB: (totalSize / 1024 / 1024).toFixed(2),
    };
  }
  
  return null;
}

// Memory monitoring (if available)
export function getMemoryInfo() {
  if (performance.memory) {
    return {
      usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  
  return null;
}

// Performance optimization suggestions
export function getPerformanceSuggestions(metrics) {
  const suggestions = [];
  
  if (metrics.fps < 30) {
    suggestions.push({
      metric: 'FPS',
      issue: 'Low frame rate detected',
      suggestion: 'Consider reducing animation complexity, using CSS transforms instead of layout changes, or implementing virtual scrolling for large lists.',
    });
  }
  
  if (metrics.cls > 0.25) {
    suggestions.push({
      metric: 'CLS',
      issue: 'High cumulative layout shift',
      suggestion: 'Ensure images have dimensions specified, avoid inserting content above existing content, and use transform animations instead of layout-affecting properties.',
    });
  }
  
  if (metrics.lcp > 4000) {
    suggestions.push({
      metric: 'LCP',
      issue: 'Slow largest contentful paint',
      suggestion: 'Optimize images, use lazy loading, reduce server response time, and eliminate render-blocking resources.',
    });
  }
  
  if (metrics.inp > 500) {
    suggestions.push({
      metric: 'INP',
      issue: 'Slow interaction response',
      suggestion: 'Minimize long tasks, use web workers for heavy computations, and optimize event handlers.',
    });
  }
  
  return suggestions;
}
