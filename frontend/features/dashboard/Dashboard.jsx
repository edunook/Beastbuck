import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import ErrorBoundary from '@frontend/components/ErrorBoundary';
import { createSafeWidget } from './widgets/SafeLazyWidget';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { MembershipService } from '@services/firestore/membership';
import { ROLES } from '@shared/constants/roles';
import { PERMISSIONS } from '@shared/permissions/permissions';
import { Sparkles, ArrowRight, X, Sliders, Gift, Zap, Crown, Shield, Users } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { CelebrationOverlay } from './CelebrationOverlay';
import { AICompanionWidget } from './widgets/AICompanionWidget';
import { CommandPalette } from './widgets/CommandPalette';
import './Dashboard.css';

const MembershipBanner = () => {
  const { user, roleData } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const checkMembership = async () => {
      try {
        const isMember = await MembershipService.isApprovedMember(user.uid);
        if (!isMember && !cancelled) {
          try {
            const app = await MembershipService.getUserApplication(user.uid);
            if (!cancelled) setApplication(app);
          } catch (appErr) {
            // Ignored
          }
        }
      } catch (err) {
        // Ignored
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkMembership();
    return () => { cancelled = true; };
  }, [user]);

  if (loading || dismissed) return null;
  if (PERMISSIONS.isApprovedMember(roleData)) return null;

  return (
    <div className="membership-banner animate-slide-up">
      <div className="banner-bg"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="banner-icon shrink-0">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white mb-1">
              Apply for Full Membership
            </h3>
            <p className="text-xs sm:text-sm text-text-muted">
              {application?.status === 'pending'
                ? 'Your application is actively under review by leadership.'
                : 'Unlock inner research labs, collaborative creative studios, and leader ranks.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          {application?.status === 'pending' ? (
            <span className="px-4 py-2 rounded-xl bg-yellow-500/15 text-yellow-300 text-xs font-black uppercase tracking-wider border border-yellow-500/30">
              Pending Review
            </span>
          ) : (
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent to-purple-600 text-slate-950 font-black text-xs hover:shadow-lg hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5"
            >
              Apply Now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-text-muted hover:text-white transition-all duration-200 rounded-xl hover:bg-white/10"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DailyLoginReward = ({ onClaimSuccess }) => {
  const { user } = useAuth();
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    let cancelled = false;
    const checkReward = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const canClaimReward = await GamificationService.canClaimDailyReward(user.uid);
        if (!cancelled) setCanClaim(canClaimReward);
      } catch (err) {
        // Ignored
      }
    };

    checkReward();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const handleClaim = async () => {
    if (!user?.uid || claiming) return;
    setClaiming(true);

    try {
      const { GamificationService } = await import('@services/firestore/gamification');
      await GamificationService.claimDailyReward(user.uid);
      setCanClaim(false);
      onClaimSuccess?.();
    } catch (err) {
      console.warn('Claim error:', err);
    } finally {
      setClaiming(false);
    }
  };

  if (!canClaim) return null;

  return (
    <div className="daily-reward animate-bounce-in">
      <div className="reward-bg"></div>
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="reward-icon shrink-0">
            <Gift className="h-7 w-7 text-amber-300" />
          </div>
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-black text-white mb-0.5">Daily Login Bonus Ready!</h3>
            <p className="text-xs sm:text-sm text-text-muted">Claim your daily streak bonus for XP boost and mystery gifts.</p>
          </div>
        </div>
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="self-end sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:shadow-lg hover:shadow-yellow-400/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50"
        >
          {claiming ? 'Claiming...' : 'Claim Daily Bonus +XP'}
        </button>
      </div>
    </div>
  );
};

function safeModule(module, name) {
  const Component = module[name];
  if (!Component) {
    console.error(`Widget ${name} not found in module`);
    return () => null;
  }
  return Component;
}

const SafeBeastBuckHeadlinesWidget = createSafeWidget(() => import('./widgets/BeastBuckHeadlinesWidget').then(m => ({ default: safeModule(m, 'BeastBuckHeadlinesWidget') })));
const SafeWelcomePanel = createSafeWidget(() => import('./widgets/WelcomePanel').then(m => ({ default: safeModule(m, 'WelcomePanel') })));
const SafeXPOverview = createSafeWidget(() => import('./widgets/XPOverview').then(m => ({ default: safeModule(m, 'XPOverview') })));
const SafeDailyMissionWidget = createSafeWidget(() => import('./widgets/DailyMissionWidget').then(m => ({ default: safeModule(m, 'DailyMissionWidget') })));
const SafeContinueJourneyWidget = createSafeWidget(() => import('./widgets/ContinueJourneyWidget').then(m => ({ default: safeModule(m, 'ContinueJourneyWidget') })));
const SafeRecentAchievementsWidget = createSafeWidget(() => import('./widgets/XPOverview').then(m => ({ default: safeModule(m, 'RecentAchievementsWidget') })));
const SafeCreativeSpotlightWidget = createSafeWidget(() => import('./widgets/CreativeSpotlightWidget').then(m => ({ default: safeModule(m, 'CreativeSpotlightWidget') })));
const SafeFriendsActivityWidget = createSafeWidget(() => import('./widgets/FriendsActivityWidget').then(m => ({ default: safeModule(m, 'FriendsActivityWidget') })));
const SafeTrendingWidget = createSafeWidget(() => import('./widgets/TrendingWidget').then(m => ({ default: safeModule(m, 'TrendingWidget') })));
const SafeEventsWidget = createSafeWidget(() => import('./widgets/EventsWidget').then(m => ({ default: safeModule(m, 'EventsWidget') })));
const SafeLeaderboardPreviewWidget = createSafeWidget(() => import('./widgets/LeaderboardPreviewWidget').then(m => ({ default: safeModule(m, 'LeaderboardPreviewWidget') })));
const SafePersonalGoalsWidget = createSafeWidget(() => import('./widgets/PersonalGoalsWidget').then(m => ({ default: safeModule(m, 'PersonalGoalsWidget') })));
const SafeFunFlixWidget = createSafeWidget(() => import('./widgets/FunFlixWidget').then(m => ({ default: safeModule(m, 'FunFlixWidget') })));
const SafeQuickActionsPanel = createSafeWidget(() => import('./widgets/MiscWidgets').then(m => ({ default: safeModule(m, 'QuickActionsPanel') })));
const SafeNotificationsWidget = createSafeWidget(() => import('./widgets/NotificationsWidget').then(m => ({ default: safeModule(m, 'NotificationsWidget') })));
const SafeProjectsWidget = createSafeWidget(() => import('./widgets/ProjectsWidget').then(m => ({ default: safeModule(m, 'ProjectsWidget') })));
const SafeMySquadWidget = createSafeWidget(() => import('./widgets/MySquadWidget').then(m => ({ default: safeModule(m, 'MySquadWidget') })));
const SafeRecentActivityPanel = createSafeWidget(() => import('./widgets/RecentActivityPanel').then(m => ({ default: safeModule(m, 'RecentActivityPanel') })));

const Dashboard = React.memo(function Dashboard() {
  const { user, roleData } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    headlines: true,
    welcome: true,
    mission: true,
    continue: true,
    funflix: true,
    spotlight: true,
    leaderboard: true,
    events: true,
    achievements: true,
    goals: true,
    quickActions: true,
    projects: true,
    notifications: true,
    activity: true,
    friends: true,
    trending: true,
    squad: true,
  });
  const [particles, setParticles] = useState([]);
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);

  const handleCelebration = useCallback(() => {
    setCelebrationTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (roleData?.profileCustomization?.dashboard) {
      setVisibleWidgets(prev => ({
        ...prev,
        ...roleData.profileCustomization.dashboard
      }));
    }
  }, [roleData?.profileCustomization]);

  useEffect(() => {
    const newParticles = Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 3,
      size: 2 + Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const handleToggleWidget = async (key) => {
    const nextWidgets = { ...visibleWidgets, [key]: !visibleWidgets[key] };
    setVisibleWidgets(nextWidgets);

    if (user?.uid) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          'profileCustomization.dashboard': nextWidgets
        });
      } catch (err) {
        console.error('Failed to save dashboard customization:', err);
      }
    }
  };

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  useEffect(() => {
    if (!showSettings) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSettings(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [showSettings]);

  return (
    <PageContainer>
      {/* Dynamic Animated Particles */}
      <div className="particles-container scrollbar-hide">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          />
        ))}
      </div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fade-in">
        <PageHeader
          title="Command Center"
          description="Your personal headquarters in the BeastBuck ecosystem."
          hero={true}
        />
        <button
          onClick={() => setShowSettings(true)}
          className="settings-btn self-start sm:self-center"
        >
          <Sliders className="h-4 w-4 text-accent" />
          <span>Personalize View</span>
        </button>
      </div>

      <MembershipBanner />
      <DailyLoginReward onClaimSuccess={handleCelebration} />
      <CelebrationOverlay
        trigger={celebrationTrigger}
        message="+50 XP Earned!"
        duration={3500}
      />

      <SectionWrapper>
        <div className="space-y-6 md:space-y-8">
          {/* Hero Welcome Section */}
          {visibleWidgets.welcome !== false && (
            <div className="animate-fade-in-up hero-section">
              <SafeWelcomePanel />
            </div>
          )}

          {/* Top 100% Real Executive News & Wire - Placed right below Welcome Panel */}
          {visibleWidgets.headlines && (
            <div className="animate-fade-in-up widget-glow">
              <SafeBeastBuckHeadlinesWidget />
            </div>
          )}

          {/* Core Row 1: Daily Missions & Continue Journey */}
          {(visibleWidgets.mission || visibleWidgets.continue) && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {visibleWidgets.mission && (
                <div className="widget-glow">
                  <SafeDailyMissionWidget />
                </div>
              )}
              {visibleWidgets.continue && (
                <div className="widget-glow">
                  <SafeContinueJourneyWidget />
                </div>
              )}
            </div>
          )}

          {/* Core Row 2: FunFlix & Creative Spotlight */}
          {(visibleWidgets.funflix || visibleWidgets.spotlight) && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {visibleWidgets.funflix && (
                <div className="widget-glow">
                  <SafeFunFlixWidget />
                </div>
              )}
              {visibleWidgets.spotlight && (
                <div className="widget-glow">
                  <SafeCreativeSpotlightWidget />
                </div>
              )}
            </div>
          )}

          {/* Core Row 3: Leaderboard & Events */}
          {(visibleWidgets.leaderboard || visibleWidgets.events) && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {visibleWidgets.leaderboard && (
                <div className="widget-glow">
                  <SafeLeaderboardPreviewWidget />
                </div>
              )}
              {visibleWidgets.events && (
                <div className="widget-glow">
                  <SafeEventsWidget />
                </div>
              )}
            </div>
          )}

          {/* Progression Row: Achievements & Goals */}
          {(visibleWidgets.achievements || visibleWidgets.goals) && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {visibleWidgets.achievements && (
                <div className="widget-glow">
                  <SafeRecentAchievementsWidget />
                </div>
              )}
              {visibleWidgets.goals && (
                <div className="widget-glow">
                  <SafePersonalGoalsWidget />
                </div>
              )}
            </div>
          )}

          {/* Quick Access Grid (3-Column clean cards) */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
            {visibleWidgets.quickActions && (
              <div className="widget-glow">
                <SafeQuickActionsPanel />
              </div>
            )}
            {visibleWidgets.projects && (
              <div className="widget-glow">
                <SafeProjectsWidget />
              </div>
            )}
            {visibleWidgets.notifications && (
              <div className="widget-glow">
                <SafeNotificationsWidget />
              </div>
            )}
          </div>

          {/* Social & Community Activity */}
          {(visibleWidgets.friends || visibleWidgets.trending || visibleWidgets.squad || visibleWidgets.activity) && (
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {visibleWidgets.friends && (
                <div className="widget-glow">
                  <SafeFriendsActivityWidget />
                </div>
              )}
              {visibleWidgets.trending && (
                <div className="widget-glow">
                  <SafeTrendingWidget />
                </div>
              )}
              {visibleWidgets.squad && (
                <div className="widget-glow">
                  <SafeMySquadWidget />
                </div>
              )}
              {visibleWidgets.activity && (
                <div className="widget-glow">
                  <SafeRecentActivityPanel />
                </div>
              )}
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* Floating AI Companion */}
      <AICompanionWidget />

      {/* Floating Command Palette */}
      <CommandPalette />

      {/* Personalization Drawer */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md animate-fade-in"
          onClick={handleCloseSettings}
        >
          <div
            className="settings-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="h-4 w-4 text-accent" />
                Customize Console
              </h3>
              <button
                onClick={handleCloseSettings}
                className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all"
                aria-label="Close settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => {
                  const allEnabled = Object.values(visibleWidgets).every(Boolean);
                  const next = Object.fromEntries(
                    Object.keys(visibleWidgets).map(key => [key, !allEnabled])
                  );
                  setVisibleWidgets(next);
                  if (user?.uid) {
                    const userRef = doc(db, 'users', user.uid);
                    updateDoc(userRef, { 'profileCustomization.dashboard': next }).catch(() => {});
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-all"
              >
                {Object.values(visibleWidgets).every(Boolean) ? 'Hide All' : 'Show All'}
              </button>
              <button
                onClick={handleCloseSettings}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-purple-600 text-xs font-bold text-slate-950 hover:brightness-110 transition-all"
              >
                Done
              </button>
            </div>

            <p className="text-[11px] font-bold text-text-muted mb-3 uppercase tracking-wider">Toggle Widgets</p>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1 pb-2 overscroll-contain">
              {[
                { key: 'headlines', label: '100% Real Top News Wire', icon: '📡' },
                { key: 'welcome', label: 'Welcome & Status Hero', icon: '👋' },
                { key: 'mission', label: 'Daily Missions', icon: '🎯' },
                { key: 'continue', label: 'Continue Journey', icon: '🚀' },
                { key: 'funflix', label: 'FunFlix Cinema', icon: '🎬' },
                { key: 'spotlight', label: 'Creative Spotlight', icon: '🎨' },
                { key: 'leaderboard', label: 'Leaderboard Arena', icon: '🏆' },
                { key: 'events', label: 'Upcoming Events', icon: '📅' },
                { key: 'achievements', label: 'Recent Achievements', icon: '🏅' },
                { key: 'goals', label: 'Personal Goals', icon: '🎯' },
                { key: 'quickActions', label: 'Quick Teleport', icon: '⚡' },
                { key: 'projects', label: 'My Projects', icon: '📁' },
                { key: 'notifications', label: 'Notifications', icon: '🔔' },
                { key: 'friends', label: 'Friends Activity', icon: '👥' },
                { key: 'trending', label: 'Trending', icon: '📈' },
                { key: 'squad', label: 'My Squad', icon: '👫' },
                { key: 'activity', label: 'Recent Activity Logs', icon: '📊' },
              ].map(({ key, label, icon }) => {
                const active = visibleWidgets[key] !== false;
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                      active
                        ? 'border-white/20 bg-white/[0.06]'
                        : 'border-white/5 bg-white/[0.02] opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{icon}</span>
                      <span className="text-xs font-bold text-white">{label}</span>
                    </div>
                    <button
                      onClick={() => handleToggleWidget(key)}
                      className={`toggle-switch ${active ? 'active' : ''}`}
                      role="switch"
                      aria-checked={active}
                      aria-label={`Toggle ${label}`}
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/10 text-center">
              <p className="text-[10px] text-text-muted font-bold flex items-center justify-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-success animate-pulse"></span>
                Preferences auto-saved to cloud
              </p>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
});

export default Dashboard;
