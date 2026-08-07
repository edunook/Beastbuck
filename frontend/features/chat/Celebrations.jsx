import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Star, Trophy, Award, Flame, Zap, Heart, Sparkles, Gift, Medal, Crown, Gem, BookOpen, Rocket, ShoppingBag, Film } from 'lucide-react';

const CELEBRATION_TYPES = {
  level_up: { icon: Trophy, color: 'text-yellow-400', bg: 'from-yellow-500/25 via-amber-500/15 to-orange-500/10', border: 'border-yellow-500/40', emoji: '🏆', shadow: 'shadow-yellow-500/50' },
  badge: { icon: Award, color: 'text-blue-400', bg: 'from-blue-500/25 via-cyan-500/15 to-sky-500/10', border: 'border-blue-500/40', emoji: '🎖️', shadow: 'shadow-blue-500/50' },
  streak: { icon: Flame, color: 'text-orange-400', bg: 'from-orange-500/25 via-red-500/15 to-rose-500/10', border: 'border-orange-500/40', emoji: '🔥', shadow: 'shadow-orange-500/50' },
  achievement: { icon: Star, color: 'text-purple-400', bg: 'from-purple-500/25 via-pink-500/15 to-violet-500/10', border: 'border-purple-500/40', emoji: '⭐', shadow: 'shadow-purple-500/50' },
  research_published: { icon: BookOpen, color: 'text-cyan-400', bg: 'from-cyan-500/25 via-blue-500/15 to-teal-500/10', border: 'border-cyan-500/40', emoji: '📜', shadow: 'shadow-cyan-500/50' },
  ai_published: { icon: Rocket, color: 'text-accent', bg: 'from-accent/25 via-purple-500/15 to-pink-500/10', border: 'border-accent/40', emoji: '🤖', shadow: 'shadow-accent/50' },
  product_released: { icon: ShoppingBag, color: 'text-emerald-400', bg: 'from-emerald-500/25 via-green-500/15 to-teal-500/10', border: 'border-emerald-500/40', emoji: '🛍️', shadow: 'shadow-emerald-500/50' },
  funflix_movie: { icon: Film, color: 'text-red-400', bg: 'from-red-500/25 via-rose-500/15 to-pink-500/10', border: 'border-red-500/40', emoji: '🎬', shadow: 'shadow-red-500/50' },
  birthday: { icon: Gift, color: 'text-pink-400', bg: 'from-pink-500/25 via-rose-500/15 to-red-500/10', border: 'border-pink-500/40', emoji: '🎂', shadow: 'shadow-pink-500/50' },
  anniversary: { icon: Medal, color: 'text-indigo-400', bg: 'from-indigo-500/25 via-purple-500/15 to-blue-500/10', border: 'border-indigo-500/40', emoji: '🎉', shadow: 'shadow-indigo-500/50' },
};

// Canvas Confetti Generator Component
function ConfettiCanvas({ reducedMotion = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 3,
      d: Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: Math.random() * 0.07 + 0.05,
      tiltAngle: 0
    }));

    let animationFrameId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        if (p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = -20;
        }
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

export function CelebrationCard({ celebration, onClose, onClaim, reducedMotion = false }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = CELEBRATION_TYPES[celebration.type] || CELEBRATION_TYPES.achievement;
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!celebration.autoClose) return;
    const timer = setTimeout(() => handleClose(), celebration.duration || 8000);
    return () => clearTimeout(timer);
  }, [celebration.autoClose, celebration.duration]);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 500);
  }, [onClose]);

  const handleClaim = useCallback(() => {
    onClaim?.(celebration);
    handleClose();
  }, [celebration, onClaim, handleClose]);

  return (
    <div
      className={`
        relative w-full max-w-sm rounded-3xl border backdrop-blur-2xl shadow-2xl overflow-hidden
        transition-all duration-500 ease-out
        bg-gradient-to-br ${config.bg} ${config.border} ${config.shadow}
        ${isVisible && !isLeaving ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
      `}
    >
      <div className="relative p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
          aria-label="Close celebration"
        >
          <X className="h-4 w-4 text-white/50" />
        </button>

        <div className="flex justify-center mb-5">
          <div className={`relative h-24 w-24 rounded-3xl bg-gradient-to-br ${config.bg} border ${config.border} flex items-center justify-center shadow-2xl ${config.shadow}`}>
            <Icon className={`h-12 w-12 ${config.color}`} />
          </div>
        </div>

        <div className="text-center mb-5">
          <h3 className="text-2xl font-bold text-white mb-2">{celebration.title || 'Achievement Unlocked!'}</h3>
          <p className="text-sm text-white/70 leading-relaxed">{celebration.description}</p>
        </div>

        {celebration.xp && (
          <div className="flex justify-center mb-5">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-yellow-500/25 via-amber-500/15 to-orange-500/10 border border-yellow-500/40 shadow-lg shadow-yellow-500/30">
              <Zap className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-bold text-yellow-400">+{celebration.xp} XP</span>
            </div>
          </div>
        )}

        <button
          onClick={handleClaim}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-accent to-purple-600 text-white font-bold text-sm shadow-xl hover:scale-105 transition active:scale-95 border border-accent/40"
        >
          {celebration.actionLabel || 'Claim Celebration Bonus'}
        </button>
      </div>
    </div>
  );
}

export function CelebrationContainer({ celebrations = [], onClose, onClaim, reducedMotion = false }) {
  const [dismissed, setDismissed] = useState(new Set());

  const handleDismiss = useCallback((id) => {
    setDismissed(prev => new Set([...prev, id]));
  }, []);

  const visibleCelebrations = celebrations.filter(c => !dismissed.has(c.id));

  if (visibleCelebrations.length === 0) return null;

  return (
    <>
      <ConfettiCanvas reducedMotion={reducedMotion} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pointer-events-none">
        <div className="flex flex-col gap-4 pointer-events-auto max-h-screen overflow-y-auto custom-scrollbar">
          {visibleCelebrations.map((celebration, index) => (
            <div
              key={celebration.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CelebrationCard
                celebration={celebration}
                onClose={() => handleDismiss(celebration.id)}
                onClaim={onClaim}
                reducedMotion={reducedMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
