import { useEffect, useState, useRef } from 'react';
import { cn } from '../../lib/utils';

export function ProgressBar({ 
  value, 
  max = 100, 
  color = 'accent', 
  size = 'md',
  animated = true,
  showLabel = false,
  className 
}) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !animated) {
      setProgress(value);
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    const startProgress = 0;
    const endProgress = value;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      
      setProgress(startProgress + (endProgress - startProgress) * easeOutQuart);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, animated]);

  const percentage = Math.min((progress / max) * 100, 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    accent: 'bg-accent',
    success: 'bg-status-success',
    danger: 'bg-status-danger',
    warning: 'bg-status-warning',
  };

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className={cn(
        "w-full bg-surface rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-slow",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className="text-badge text-text-muted">Progress</span>
          <span className="text-badge font-medium text-text">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}

export function CircularProgress({ 
  value, 
  max = 100, 
  size = 120, 
  strokeWidth = 8,
  color = 'accent',
  showLabel = true,
  className 
}) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setProgress(value);
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    const startProgress = 0;
    const endProgress = value;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progressRatio, 4);
      
      setProgress(startProgress + (endProgress - startProgress) * easeOutQuart);

      if (progressRatio < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value]);

  const percentage = Math.min((progress / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colorMap = {
    accent: '#00f0ff',
    success: '#00ff88',
    danger: '#ff4444',
    warning: '#ffaa00',
  };

  return (
    <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-surface"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-slow"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-text">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
