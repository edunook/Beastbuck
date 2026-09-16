import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { GamificationService, getLevelProgress } from '@services/firestore/gamification';
import { Sparkles, Crown, Shield, Users, TrendingUp, Target, Flame, Star, Trophy, ArrowRight, Zap } from 'lucide-react';
import './WelcomePanel.css';

const EMOJIS = ['🚀', '⭐', '🎮', '🎯', '💎', '🔥', '✨', '🎨', '💡', '🧪'];
const MOTIVATIONS = [
  "Ready to create something legendary today?",
  "Your next breakthrough is one mission away!",
  "The squad is active — lead the frontier!",
  "Unleash your creativity and conquer today's goals!",
  "Earn XP, rise through ranks, and leave your mark!",
];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function WelcomePanel() {
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [displayedXP, setDisplayedXP] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(true);

  const rawXP = Number(roleData?.xp || 0);
  const progress = getLevelProgress(rawXP);
  const greeting = getTimeGreeting();

  useEffect(() => {
    setMotivationalMessage(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);

    const interval = setInterval(() => {
      setFloatingEmojis(prev => {
        const newEmoji = {
          id: Date.now(),
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          left: Math.random() * 95,
          duration: 3 + Math.random() * 2,
        };
        return [...prev.slice(-6), newEmoji];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;
    const loadDashboardData = async () => {
      try {
        const stats = await GamificationService.getUserStats(user.uid);
        if (cancelled) return;
        setCurrentStreak(stats?.streak || 0);

        const targetXP = stats?.xp || rawXP || 0;
        const totalSteps = 30;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          const current = Math.min(targetXP, Math.round((step / totalSteps) * targetXP));
          if (!cancelled) setDisplayedXP(current);
          if (step >= totalSteps) {
            if (!cancelled) setDisplayedXP(targetXP);
            clearInterval(timer);
          }
        }, 25);
      } catch (err) {
        console.warn('WelcomePanel stats error:', err);
      }
    };

    loadDashboardData();
    return () => { cancelled = true; };
  }, [user?.uid, rawXP]);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingMissions(false);
      return;
    }

    let cancelled = false;
    const loadMissions = async () => {
      try {
        const userMissions = await GamificationService.getUserDailyMissions(user.uid);
        if (!cancelled) {
          setMissions(userMissions || []);
        }
      } catch (err) {
        console.warn('WelcomePanel missions error:', err);
      } finally {
        if (!cancelled) {
          setLoadingMissions(false);
        }
      }
    };

    loadMissions();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const getRoleIcon = (role) => {
    const roleIcons = {
      'Main CEO': <Crown className="h-5 w-5 text-amber-300 animate-bounce" />,
      'Co-CEO': <Crown className="h-5 w-5 text-amber-300 animate-bounce" />,
      'Leader': <Shield className="h-5 w-5 text-purple-300" />,
      'Admin': <Shield className="h-5 w-5 text-cyan-300" />,
    };
    return roleIcons[role] || <Sparkles className="h-5 w-5 text-accent" />;
  };

  const displayName = roleData?.displayName || roleData?.username || user?.displayName || 'Explorer';
  const roleName = roleData?.role || 'Explorer';

  return (
    <div className="welcome-panel">
      <div className="floating-emojis">
        {floatingEmojis.map(emoji => (
          <span
            key={emoji.id}
            className="floating-emoji"
            style={{
              left: `${emoji.left}%`,
              animationDuration: `${emoji.duration}s`,
            }}
          >
            {emoji.emoji}
          </span>
        ))}
      </div>

      <div className="welcome-card group">
        <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>

        <div className="relative z-10 p-6 md:p-10">
          {/* Top badges bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="role-badge">
                {getRoleIcon(roleName)}
                <span className="badge-text">{roleName}</span>
              </div>

              {currentStreak > 0 ? (
                <div className="streak-badge">
                  <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
                  <span className="streak-text">{currentStreak} Day Streak!</span>
                </div>
              ) : (
                <div className="streak-badge opacity-80">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span className="streak-text">Active Explorer</span>
                </div>
              )}
            </div>

            <Link
              to="/leaderboards"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all duration-300 hover:scale-105"
            >
              <Trophy className="h-3.5 w-3.5 text-yellow-400" />
              <span>Rankings</span>
              <ArrowRight className="h-3 w-3 text-text-muted" />
            </Link>
          </div>

          {/* Hero Greeting text */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl md:text-4xl">{greeting.emoji}</span>
              <span className={cn("text-2xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r tracking-tight", greeting.color)}>
                {greeting.text}, {displayName}!
              </span>
            </div>
            <p className="text-sm md:text-base text-slate-300 font-medium max-w-2xl leading-relaxed">
              {motivationalMessage}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-5 mb-8">
            <Link
              to="/leaderboards"
              className="stat-card level-card group/stat cursor-pointer hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="stat-icon">
                <Star className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="stat-content">
                <div className="stat-value text-cyan-300">Lvl {progress.level}</div>
                <div className="stat-label">Current Tier</div>
              </div>
              <div className="stat-glow"></div>
            </Link>

            <Link
              to="/leaderboards"
              className="stat-card xp-card group/stat cursor-pointer hover:border-yellow-400/50 transition-all duration-300"
            >
              <div className="stat-icon">
                <Trophy className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="stat-content">
                <div className="stat-value text-yellow-300">{displayedXP.toLocaleString()}</div>
                <div className="stat-label">Total BeastXP</div>
              </div>
              <div className="stat-glow"></div>
            </Link>

            <Link
              to="/tasks"
              className="stat-card progress-card group/stat cursor-pointer hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="stat-icon">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div className="stat-content">
                <div className="stat-value text-purple-300">{Math.round(progress.percent)}%</div>
                <div className="stat-label">Tier Progress</div>
              </div>
              <div className="stat-glow"></div>
            </Link>
          </div>

          {/* Level Progress Bar */}
          <div className="progress-section">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-xs md:text-sm font-bold text-slate-300 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Level {progress.level} Evolution
              </span>
              <span className="text-xs md:text-sm font-bold text-accent font-mono">
                {progress.remainingXP} XP to Level {progress.level + 1}
              </span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.max(5, progress.percent)}%` }}
              >
                <div className="progress-bar-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', emoji: '🌅', color: 'from-amber-300 via-yellow-400 to-orange-500' };
  if (hour < 18) return { text: 'Good Afternoon', emoji: '⚡', color: 'from-cyan-300 via-blue-400 to-indigo-500' };
  return { text: 'Good Evening', emoji: '🌌', color: 'from-purple-300 via-pink-400 to-indigo-500' };
}
