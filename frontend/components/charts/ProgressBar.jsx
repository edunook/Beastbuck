import { useEffect, useState, useRef } from 'react';
import { cn } from '@shared/lib/utils';

const gradientColors = {
  accent: 'linear-gradient(90deg, #00f0ff 0%, #00ff88 50%, #00f0ff 100%)',
  success: 'linear-gradient(90deg, #00ff88 0%, #00ffaa 50%, #00ff88 100%)',
  danger: 'linear-gradient(90deg, #ff4444 0%, #ff6666 50%, #ff4444 100%)',
  warning: 'linear-gradient(90deg, #ffaa00 0%, #ffcc00 50%, #ffaa00 100%)',
  purple: 'linear-gradient(90deg, #9333ea 0%, #c084fc 50%, #9333ea 100%)',
  rainbow: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 16%, #ffff00 33%, #00ff00 50%, #0000ff 66%, #4b0082 83%, #9400d3 100%)',
};

const glowColors = {
  accent: 'rgba(0, 240, 255, 0.6)',
  success: 'rgba(0, 255, 136, 0.6)',
  danger: 'rgba(255, 68, 68, 0.6)',
  warning: 'rgba(255, 170, 0, 0.6)',
  purple: 'rgba(147, 51, 234, 0.6)',
  rainbow: 'rgba(255, 255, 255, 0.6)',
};

export function ProgressBar({ 
  value, 
  max = 100, 
  color = 'accent', 
  size = 'md',
  animated = true,
  showLabel = false,
  shimmer = true,
  glow = true,
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
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const gradient = gradientColors[color] || gradientColors.accent;
  const glow = glowColors[color] || glowColors.accent;

  return (
    <div ref={ref} className={cn("w-full", className)}>
      <div className={cn(
        "w-full rounded-full overflow-hidden relative",
        "bg-gradient-to-r from-white/5 to-white/10",
        "border border-white/10 shadow-inner",
        sizeClasses[size]
      )}>
        {/* Background glow */}
        {glow && (
          <div 
            className="absolute inset-0 rounded-full opacity-30 blur-sm"
            style={{ 
              background: gradient,
              width: `${percentage}%`,
              transition: 'width 0.5s ease-out'
            }}
          />
        )}
        
        {/* Main progress bar */}
        <div
          className={cn(
            "h-full rounded-full relative overflow-hidden",
            "transition-all duration-500 ease-out"
          )}
          style={{ 
            width: `${percentage}%`,
            background: gradient,
            boxShadow: glow ? `0 0 20px ${glow}, 0 0 40px ${glow}` : 'none'
          }}
        >
          {/* Shimmer effect */}
          {shimmer && (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite linear'
              }}
            />
          )}
          
          {/* Particle dots */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full flex justify-around">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 h-full bg-white/30 rounded-full"
                  style={{
                    animation: `pulse 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {showLabel && (
        <div className="flex justify-between mt-2">
          <span className="text-xs font-bold text-text-muted tracking-wide uppercase">Progress</span>
          <span className="text-xs font-bold text-white">{Math.round(percentage)}%</span>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.5); }
          50% { opacity: 0.8; transform: scaleY(1); }
        }
      `}</style>
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
  glow = true,
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

  const gradient = gradientColors[color] || gradientColors.accent;
  const glowColor = glowColors[color] || glowColors.accent;

  return (
    <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Glow effect */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ 
            background: glowColor,
            transform: 'scale(1.1)'
          }}
        />
      )}
      
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#bgGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-30"
        />
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[color]?.split(',')[0]?.split(': ')[1] || '#00f0ff'} />
            <stop offset="50%" stopColor={gradientColors[color]?.split(',')[1]?.trim() || '#00ff88'} />
            <stop offset="100%" stopColor={gradientColors[color]?.split(',')[2]?.split(')')[0] || '#00f0ff'} />
          </linearGradient>
        </defs>
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: glow ? `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor})` : 'none'
          }}
        />
        
        {/* Animated particles */}
        {percentage > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={strokeWidth / 2}
            fill="transparent"
            strokeDasharray={`${circumference * 0.1} ${circumference * 0.9}`}
            strokeDashoffset={offset - circumference * 0.05}
            strokeLinecap="round"
            className="animate-spin"
            style={{
              animationDuration: '3s',
              filter: 'blur(1px)'
            }}
          />
        )}
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            <span className="text-2xl font-bold text-white drop-shadow-lg">{Math.round(percentage)}%</span>
            <div className="w-8 h-1 mx-auto mt-1 rounded-full bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          </div>
        </div>
      )}
    </div>
  );
}
