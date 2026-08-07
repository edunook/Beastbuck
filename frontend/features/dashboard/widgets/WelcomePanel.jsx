import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { GamificationService, getLevelProgress } from '@services/firestore/gamification';
import { Sparkles, Crown, Shield, Users, TrendingUp, Target, Flame, Star, Trophy } from 'lucide-react';
import './WelcomePanel.css';

const EMOJIS = ['🚀', '⭐', '🎮', '🎯', '💎', '🔥', '✨', '🎨', '💡', '🧪'];
const MOTIVATIONS = [
  "Ready for an epic adventure?",
  "Your next achievement is waiting!",
  "Your squad has been active!",
  "Something amazing happened!",
  "Let's make today legendary!",
  "Your creativity shines!",
];

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function WelcomePanel() {
  const { user, roleData } = useAuth();
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [displayedXP, setDisplayedXP] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [missions, setMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(true);

  const progress = getLevelProgress(roleData?.xp || 0);
  const greeting = getTimeGreeting();

  useEffect(() => {
    setMotivationalMessage(MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]);

    const interval = setInterval(() => {
      setFloatingEmojis(prev => {
        const newEmoji = {
          id: Date.now(),
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          left: Math.random() * 100,
          duration: 3 + Math.random() * 2,
        };
        return [...prev, newEmoji];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const loadDashboardData = async () => {
      try {
        const stats = await GamificationService.getUserStats(user.uid);
        setCurrentStreak(stats?.streak || 0);

        const targetXP = stats?.xp || 0;
        const totalSteps = 40;
        let step = 0;
        const increment = Math.max(1, Math.ceil(targetXP / totalSteps));

        const timer = setInterval(() => {
          step++;
          const current = Math.min(targetXP, Math.round((step / totalSteps) * targetXP));
          setDisplayedXP(current);
          if (step >= totalSteps) {
            setDisplayedXP(targetXP);
            clearInterval(timer);
          }
        }, 30);
      } catch (err) {
      }
    };

    loadDashboardData();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingMissions(false);
      return;
    }

    const loadMissions = async () => {
      try {
        const userMissions = await GamificationService.getUserDailyMissions(user.uid);
        setMissions(userMissions || []);
      } catch (err) {
      } finally {
        setLoadingMissions(false);
      }
    };

    loadMissions();
  }, [user?.uid]);

  const getRoleIcon = (role) => {
    const roleIcons = {
      'Main CEO': <Crown className="h-6 w-6" />,
      'Co-CEO': <Crown className="h-6 w-6" />,
      'Leader': <Shield className="h-6 w-6" />,
    };
    return roleIcons[role] || <Users className="h-6 w-6" />;
  };

  const missionPreviews = missions.length > 0 ? missions.slice(0, 3) : [];

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
              animationDelay: '0s'
            }}
          >
            {emoji.emoji}
          </span>
        ))}
      </div>

      <div className="welcome-card">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>

        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="role-badge">
              <Sparkles className="h-5 w-5" />
              {getRoleIcon(roleData?.role)}
              <span className="badge-text">{roleData?.role || 'Explorer'}</span>
            </div>

            {currentStreak > 0 && (
              <div className="streak-badge">
                <Flame className="h-5 w-5 animate-pulse" />
                <span className="streak-text">{currentStreak} Day Streak!</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4">
              <span className="greeting-emoji">{greeting.emoji}</span>
              <span className={cn("greeting-text bg-clip-text text-transparent bg-gradient-to-r", greeting.color)}>
                {greeting.text}
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-white mb-2">
              {roleData?.displayName || roleData?.username || 'Explorer'}
            </p>
            <p className="text-base text-text-muted font-medium">
              {motivationalMessage}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="stat-card level-card">
              <div className="stat-icon">
                <Star className="h-6 w-6" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{progress.level}</div>
                <div className="stat-label">Level</div>
              </div>
              <div className="stat-glow"></div>
            </div>

            <div className="stat-card xp-card">
              <div className="stat-icon">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{displayedXP.toLocaleString()}</div>
                <div className="stat-label">Total XP</div>
              </div>
              <div className="stat-glow"></div>
            </div>

            <div className="stat-card progress-card">
              <div className="stat-icon">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{Math.round(progress.percent)}%</div>
                <div className="stat-label">Progress</div>
              </div>
              <div className="stat-glow"></div>
            </div>
          </div>

          <div className="progress-section mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-text-muted">Level {progress.level}</span>
              <span className="text-sm font-bold text-accent">{progress.remainingXP} XP to Level {progress.level + 1}</span>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress.percent}%` }}
              >
                <div className="progress-bar-shimmer"></div>
              </div>
            </div>
          </div>

          {!loadingMissions && missionPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {missionPreviews.map((mission, idx) => {
                const Icon = mission.icon || Target;
                return (
                  <div key={mission.id || idx} className="mission-preview-card">
                    <Icon className="h-6 w-6 mb-2" />
                    <p className="text-xs font-bold text-white">{mission.label}</p>
                    <p className="text-xs text-text-muted">{mission.xp || 0} XP</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', emoji: '🌞', color: 'from-yellow-400 to-orange-500' };
  if (hour < 18) return { text: 'Good Afternoon', emoji: '🌤️', color: 'from-cyan-400 to-blue-500' };
  return { text: 'Good Evening', emoji: '🌙', color: 'from-purple-500 to-indigo-600' };
}
