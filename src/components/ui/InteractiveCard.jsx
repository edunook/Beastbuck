import { forwardRef, useRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

const InteractiveCard = forwardRef(({ 
  className, 
  children, 
  depth = 2, 
  hoverable = false, 
  premium = false, 
  glass = false,
  tilt = false,
  tiltMax = 10,
  ...props 
}, ref) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0) rotateY(0)' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const depthClasses = {
    1: 'shadow-depth-1 hover:shadow-depth-2',
    2: 'shadow-depth-2 hover:shadow-depth-3',
    3: 'shadow-depth-3 hover:shadow-depth-4',
    4: 'shadow-depth-4 hover:shadow-glow-md',
  };

  const handleMouseMove = (e) => {
    if (!tilt || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -tiltMax;
    const rotateY = ((x - centerX) / centerX) * tiltMax;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
    });

    setMousePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setTiltStyle({ transform: 'perspective(1000px) rotateX(0) rotateY(0)' });
    setMousePosition({ x: 50, y: 50 });
  };

  const combinedRef = (node) => {
    cardRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div
      ref={combinedRef}
      className={cn(
        "bg-surface backdrop-blur-glass-md border border-border rounded-2xl overflow-hidden transition-all duration-base",
        glass && "bg-surface-100 backdrop-blur-glass-lg border-border-100",
        depthClasses[depth],
        hoverable && "hover:-translate-y-1 hover:border-border-100 hover:shadow-glow-sm cursor-pointer",
        premium && "premium-border",
        tilt && "transform-style-3d",
        className
      )}
      style={tilt ? tiltStyle : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      {...props}
    >
      {premium && isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(0, 240, 255, 0.15) 0%, transparent 50%)`,
          }}
        />
      )}
      {children}
    </div>
  );
});

InteractiveCard.displayName = 'InteractiveCard';

export { InteractiveCard };
