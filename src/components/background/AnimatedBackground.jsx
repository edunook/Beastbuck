import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export function AnimatedBackground({ variant = 'mesh', className, intensity = 'medium' }) {
  const canvasRef = useRef(null);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const intensityMap = {
      low: 0.3,
      medium: 0.5,
      high: 0.8,
    };

    const intensityValue = intensityMap[intensity] || 0.5;

    // Particle system for floating particles
    const particles = [];
    const particleCount = Math.min(50, Math.floor(window.innerWidth / 40));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 * intensityValue,
      });
    }

    // Gradient mesh blobs
    const blobs = [
      { x: 0.2, y: 0.3, radius: 300, color: 'rgba(0, 240, 255, 0.15)', speed: 0.0003 },
      { x: 0.8, y: 0.2, radius: 250, color: 'rgba(176, 38, 255, 0.12)', speed: 0.0004 },
      { x: 0.5, y: 0.8, radius: 350, color: 'rgba(0, 255, 136, 0.1)', speed: 0.0002 },
      { x: 0.1, y: 0.7, radius: 280, color: 'rgba(255, 170, 0, 0.08)', speed: 0.00035 },
    ];

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (variant === 'mesh' || variant === 'aurora') {
        // Draw gradient mesh
        blobs.forEach((blob, index) => {
          const x = canvas.width * blob.x + Math.sin(time * blob.speed + index) * 100;
          const y = canvas.height * blob.y + Math.cos(time * blob.speed + index) * 100;
          
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, blob.radius);
          gradient.addColorStop(0, blob.color);
          gradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
      }

      if (variant === 'particles' || variant === 'mesh') {
        // Draw floating particles
        particles.forEach((particle) => {
          particle.x += particle.speedX;
          particle.y += particle.speedY;

          // Wrap around screen
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;

          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 240, 255, ${particle.opacity})`;
          ctx.fill();
        });
      }

      time += 1;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 pointer-events-none z-[-1]",
        className
      )}
      style={{ opacity: variant === 'none' ? 0 : 1 }}
    />
  );
}

export function GradientBackground({ variant = 'subtle-1', className }) {
  const gradients = {
    'subtle-1': 'bg-gradient-subtle-1',
    'subtle-2': 'bg-gradient-subtle-2',
    'mesh': 'bg-gradient-mesh-1',
  };

  return (
    <div
      className={cn(
        "fixed inset-0 pointer-events-none z-0",
        gradients[variant] || gradients['subtle-1'],
        className
      )}
    />
  );
}
