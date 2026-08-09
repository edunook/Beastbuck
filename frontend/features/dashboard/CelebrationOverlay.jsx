import { useState, useEffect, useRef } from 'react';
import './CelebrationOverlay.css';

const EMOJIS = ['⭐', '✨', '🎉', '🎊', '💫', '🌟', '💎', '🏆', '🚀', '🔥'];
const COLORS = ['#00f0ff', '#b026ff', '#ff2a90', '#ff5400', '#00ff88', '#ffaa00', '#3a86ff'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function CelebrationOverlay({ trigger, message = '+50 XP!', duration = 3000, onComplete }) {
  const [particles, setParticles] = useState([]);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [active, setActive] = useState(false);
  const previousTrigger = useRef(trigger);

  useEffect(() => {
    if (trigger && trigger !== previousTrigger.current) {
      previousTrigger.current = trigger;
      setActive(true);

      const newParticles = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        left: randomBetween(10, 90),
        delay: randomBetween(0, 0.5),
        duration: randomBetween(2, 4),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: randomBetween(6, 14),
        rotation: randomBetween(0, 360),
        type: Math.random() > 0.5 ? 'confetti' : 'emoji',
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      }));

      const newFloatingTexts = Array.from({ length: 3 }).map((_, i) => ({
        id: i,
        left: 50 + randomBetween(-20, 20),
        delay: 0.2 + i * 0.3,
        duration: randomBetween(2, 3),
      }));

      setParticles(newParticles);
      setFloatingTexts(newFloatingTexts);

      const timer = setTimeout(() => {
        setActive(false);
        setParticles([]);
        setFloatingTexts([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, onComplete]);

  if (!active) return null;

  return (
    <div className="celebration-overlay">
      {/* Floating XP Text */}
      {floatingTexts.map((text) => (
        <div
          key={text.id}
          className="floating-xp-text"
          style={{
            left: `${text.left}%`,
            animationDelay: `${text.delay}s`,
            animationDuration: `${text.duration}s`,
          }}
        >
          <span className="xp-icon">✨</span>
          <span className="xp-value">{message}</span>
          <span className="xp-icon">✨</span>
        </div>
      ))}

      {/* Main Celebration Text */}
      <div className="celebration-main-text">
        <div className="celebration-icon">🎉</div>
        <h2 className="celebration-title">LEVEL UP!</h2>
        <p className="celebration-subtitle">Daily Reward Claimed</p>
      </div>

      {/* Confetti & Emojis */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`celebration-particle ${particle.type === 'emoji' ? 'particle-emoji' : 'particle-confetti'}`}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            backgroundColor: particle.type === 'confetti' ? particle.color : undefined,
            width: particle.type === 'confetti' ? `${particle.size}px` : undefined,
            height: particle.type === 'confetti' ? `${particle.size}px` : undefined,
            fontSize: particle.type === 'emoji' ? `${particle.size * 2}px` : undefined,
          }}
        >
          {particle.type === 'emoji' ? particle.emoji : undefined}
        </div>
      ))}

      {/* Sparkle Rings */}
      <div className="sparkle-rings">
        <div className="ring ring-1"></div>
        <div className="ring ring-2"></div>
        <div className="ring ring-3"></div>
      </div>
    </div>
  );
}
