import { useEffect, useState, useRef } from 'react';
import { cn } from '@shared/lib/utils';

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  decimals = 0, 
  prefix = '', 
  suffix = '',
  className 
}) {
  const [displayValue, setDisplayValue] = useState(0);
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
    if (!isVisible) return;

    let startTime;
    let startValue = 0;
    const endValue = typeof value === 'number' ? value : parseFloat(value);

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, value, duration]);

  return (
    <span ref={ref} className={cn("font-mono", className)}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

export function LiveStat({ 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  className 
}) {
  const changeColors = {
    positive: 'text-status-success',
    negative: 'text-status-danger',
    neutral: 'text-text-muted',
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Icon && (
        <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-badge text-text-muted">{label}</p>
        <div className="flex items-center gap-2">
          <AnimatedCounter value={value} className="text-metric font-bold text-text" />
          {change !== undefined && (
            <span className={cn("text-badge font-medium", changeColors[changeType])}>
              {changeType === 'positive' && '+'}
              {change}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  trend,
  className 
}) {
  return (
    <div className={cn(
      "bg-surface backdrop-blur-glass-md border border-border rounded-2xl p-6",
      "hover:shadow-glow-sm transition-all duration-base",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center">
          {Icon && <Icon className="w-6 h-6 text-accent" />}
        </div>
        {trend && (
          <span className={cn(
            "text-badge font-medium px-2 py-1 rounded-full",
            trend === 'up' ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger"
          )}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="text-badge text-text-muted mb-1">{title}</p>
      <AnimatedCounter value={value} className="text-metric font-bold text-text mb-2" />
      {change !== undefined && (
        <p className={cn(
          "text-badge",
          changeType === 'positive' ? "text-status-success" : changeType === 'negative' ? "text-status-danger" : "text-text-muted"
        )}>
          {changeType === 'positive' && '+'}{change}% from last period
        </p>
      )}
    </div>
  );
}
