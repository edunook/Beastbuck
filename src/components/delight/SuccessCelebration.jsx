import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { Check, Trophy, Star, Sparkles } from 'lucide-react';

export function SuccessCelebration({ 
  show, 
  message = 'Success!', 
  subtext, 
  duration = 3000,
  onComplete,
  variant = 'default',
  className 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show) return null;

  const variants = {
    default: 'bg-status-success/10 border-status-success/20 text-status-success',
    achievement: 'bg-accent/10 border-accent/20 text-accent',
    milestone: 'bg-gradient-premium-1 border-accent/30 text-text',
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-notification flex items-center justify-center pointer-events-none",
        isVisible ? "animate-in fade-in zoom-in duration-300" : "animate-out fade-out zoom-out duration-300",
        className
      )}
    >
      <div
        className={cn(
          "bg-surface backdrop-blur-glass-lg border border-border rounded-2xl p-8 shadow-glow-md",
          "animate-in slide-in-from-bottom-8 duration-500",
          variants[variant]
        )}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          {variant === 'achievement' ? (
            <div className="relative">
              <Trophy className="w-16 h-16 text-accent animate-bounce" />
              <Star className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          ) : variant === 'milestone' ? (
            <div className="relative">
              <Sparkles className="w-16 h-16 text-accent animate-spin" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-status-success/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-status-success" />
            </div>
          )}
          <div>
            <h3 className="font-heading text-2xl font-bold text-text">{message}</h3>
            {subtext && <p className="text-description text-text-muted mt-1">{subtext}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AchievementUnlock({ 
  show, 
  title, 
  description, 
  icon: Icon = Trophy,
  xp = 0,
  duration = 4000,
  onComplete,
  className 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(0);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      
      // Animate XP counter
      let startTime;
      const animateXP = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / 1000, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setXpAnimated(Math.floor(xp * easeOut));
        
        if (progress < 1) {
          requestAnimationFrame(animateXP);
        }
      };
      requestAnimationFrame(animateXP);

      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete, xp]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-notification flex items-center justify-center pointer-events-none",
        isVisible ? "animate-in fade-in duration-300" : "animate-out fade-out duration-300",
        className
      )}
    >
      <div
        className={cn(
          "bg-surface backdrop-blur-glass-lg border border-border rounded-2xl p-8 shadow-glow-md max-w-md",
          "animate-in slide-in-from-bottom-8 duration-500"
        )}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-premium-1 flex items-center justify-center animate-pulse">
              <Icon className="w-12 h-12 text-text" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-status-success flex items-center justify-center animate-bounce">
              <Star className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-heading text-2xl font-bold text-text gradient-text">Achievement Unlocked!</h3>
            <h4 className="text-xl font-bold text-accent">{title}</h4>
            <p className="text-description text-text-muted">{description}</p>
          </div>

          {xp > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="font-bold text-accent">+{xpAnimated} XP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function XPBar({ current, max, showLabel = true, className }) {
  const [animatedXP, setAnimatedXP] = useState(0);
  const percentage = Math.min((current / max) * 100, 100);

  useEffect(() => {
    let startTime;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / 500, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedXP(Math.floor(current * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [current]);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-badge text-text-muted">XP Progress</span>
          <span className="text-badge font-medium text-accent">{animatedXP} / {max}</span>
        </div>
      )}
      <div className="h-3 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-premium-1 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
