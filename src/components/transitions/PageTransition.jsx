import React, { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

const transitionVariants = {
  fade: {
    enter: 'opacity-0',
    enterActive: 'opacity-100 transition-opacity duration-base',
    exit: 'opacity-100',
    exitActive: 'opacity-0 transition-opacity duration-base',
  },
  scale: {
    enter: 'opacity-0 scale-95',
    enterActive: 'opacity-100 scale-100 transition-all duration-base',
    exit: 'opacity-100 scale-100',
    exitActive: 'opacity-0 scale-95 transition-all duration-base',
  },
  slide: {
    enter: 'opacity-0 translate-x-4',
    enterActive: 'opacity-100 translate-x-0 transition-all duration-base',
    exit: 'opacity-100 translate-x-0',
    exitActive: 'opacity-0 -translate-x-4 transition-all duration-base',
  },
  blur: {
    enter: 'opacity-0 blur-sm',
    enterActive: 'opacity-100 blur-0 transition-all duration-slow',
    exit: 'opacity-100 blur-0',
    exitActive: 'opacity-0 blur-sm transition-all duration-slow',
  },
  slideUp: {
    enter: 'opacity-0 translate-y-4',
    enterActive: 'opacity-100 translate-y-0 transition-all duration-base',
    exit: 'opacity-100 translate-y-0',
    exitActive: 'opacity-0 -translate-y-4 transition-all duration-base',
  },
};

export function PageTransition({ children, variant = 'fade', className }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    return () => {
      setIsExiting(true);
    };
  }, []);

  const transition = transitionVariants[variant] || transitionVariants.fade;

  return (
    <div
      className={cn(
        'w-full',
        isExiting ? transition.exit : transition.enter,
        isVisible && !isExiting ? transition.enterActive : '',
        isExiting ? transition.exitActive : '',
        className
      )}
    >
      {children}
    </div>
  );
}

export function FadeIn({ children, delay = 0, duration = 'base', className }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const durationClass = `duration-${duration}`;

  return (
    <div
      className={cn(
        'transition-all',
        durationClass,
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export function StaggeredChildren({ children, staggerDelay = 100, className }) {

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}

export function ScaleIn({ children, className }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'transition-all duration-base',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
    >
      {children}
    </div>
  );
}

export function SlideIn({ children, direction = 'up', className }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const directionClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4',
  };

  return (
    <div
      className={cn(
        'transition-all duration-base',
        isVisible ? 'opacity-100 translate-0' : `opacity-0 ${directionClasses[direction]}`,
        className
      )}
    >
      {children}
    </div>
  );
}
