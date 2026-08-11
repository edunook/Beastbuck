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
import { Sparkles, ArrowRight, X, Sliders, Gift, Zap } from 'lucide-react';
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

    const checkMembership = async () => {
      try {
        const isMember = await MembershipService.isApprovedMember(user.uid);
        if (!isMember) {
          try {
            const app = await MembershipService.getUserApplication(user.uid);
            setApplication(app);
          } catch (appErr) {
          }
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [user]);

  if (loading || dismissed) return null;
  if (PERMISSIONS.isApprovedMember(roleData)) return null;

  return (
    <div className="membership-banner animate-slide-up">
      <div className="banner-bg"></div>
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="banner-icon">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-black text-white mb-1">Apply for Membership</h3>
            <p className="text-sm text-text-muted">
              {application?.status === 'pending'
                ? 'Your application is under review'
                : 'Unlock internal collaboration, projects, and research labs'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {application?.status === 'pending' ? (
            <span className="px-5 py-2.5 rounded-xl bg-yellow-500/10 text-yellow-400 text-sm font-bold uppercase tracking-wider border border-yellow-500/30">
              Pending Review
            </span>
          ) : (
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-cyan-500 text-background font-black hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-2.5 text-text-muted hover:text-white transition-all duration-200 rounded-xl hover:bg-white/10 hover:scale-110"
          >
            <X className="h-5 w-5" />
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

    const checkReward = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const canClaimReward = await GamificationService.canClaimDailyReward(user.uid);
        setCanClaim(canClaimReward);
      } catch (err) {
      }
    };

    checkReward();
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
    } finally {
      setClaiming(false);
    }
  };

  if (!canClaim) return null;

  return (
    <div className="daily-reward animate-bounce-in">
      <div className="reward-bg"></div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="reward-icon">
          <Gift className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-lg font-black text-white mb-1">Daily Reward Available!</h3>
          <p className="text-sm text-text-muted">Claim your daily login bonus for XP, coins, and surprises.</p>
        </div>
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-background font-black hover:shadow-lg hover:shadow-yellow-400/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claiming ? (
            <span className="flex items-center gap-2">
              <span className="reward-spinner"></span>
              Claiming...
            </span>
          ) : (
            <>
              Claim Now
              <Zap className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const WIDGET_FALLBACK = (
  <div className="h-full min-h-[100px] animate-pulse rounded-xl bg-white/5 border border-white/10" />
);

const WIDGET_ERROR = (
  <div className="h-full min-h-[100px] rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
    <p className="text-[10px] font-bold text-text-muted">Widget unavailable</p>
  </div>
);

function safeModule(module, name) {
  const Component = module[name];
  if (!Component) {
    console.error(`Widget ${name} not found in module`);
    return () => WIDGET_ERROR;
  }
  return Component;
}

const SafeWelcomePanel = createSafeWidget(() => import('./widgets/WelcomePanel').then(m => ({ default: safeModule(m, 'WelcomePanel') })));
const SafeXPOverview = createSafeWidget(() => import('./widgets/XPOverview').then(m => ({ default: safeModule(m, 'XPOverview') })));
const SafeDailyMissionWidget = createSafeWidget(() => import('./widgets/DailyMissionWidget').then(m => ({ default: safeModule(m, 'DailyMissionWidget') })));
const SafeContinueJourneyWidget = createSafeWidget(() => import('./widgets/ContinueJourneyWidget').then(m => ({ default: safeModule(m, 'ContinueJourneyWidget') })));
const SafeAchievementGalaxyWidget = createSafeWidget(() => import('./widgets/AchievementGalaxyWidget').then(m => ({ default: safeModule(m, 'AchievementGalaxyWidget') })));
const SafeRecentAchievementsWidget = createSafeWidget(() => import('./widgets/XPOverview').then(m => ({ default: safeModule(m, 'RecentAchievementsWidget') })));
const SafeCreativeSpotlightWidget = createSafeWidget(() => import('./widgets/CreativeSpotlightWidget').then(m => ({ default: safeModule(m, 'CreativeSpotlightWidget') })));
const SafeFriendsActivityWidget = createSafeWidget(() => import('./widgets/FriendsActivityWidget').then(m => ({ default: safeModule(m, 'FriendsActivityWidget') })));
const SafeTrendingWidget = createSafeWidget(() => import('./widgets/TrendingWidget').then(m => ({ default: safeModule(m, 'TrendingWidget') })));
const SafeCreativeEnergyCrystalWidget = createSafeWidget(() => import('./widgets/CreativeEnergyCrystalWidget').then(m => ({ default: safeModule(m, 'CreativeEnergyCrystalWidget') })));
const SafePersonalGrowthTreeWidget = createSafeWidget(() => import('./widgets/PersonalGrowthTreeWidget').then(m => ({ default: safeModule(m, 'PersonalGrowthTreeWidget') })));
const SafeEventsWidget = createSafeWidget(() => import('./widgets/EventsWidget').then(m => ({ default: safeModule(m, 'EventsWidget') })));
const SafeLeaderboardPreviewWidget = createSafeWidget(() => import('./widgets/LeaderboardPreviewWidget').then(m => ({ default: safeModule(m, 'LeaderboardPreviewWidget') })));
const SafePersonalGoalsWidget = createSafeWidget(() => import('./widgets/PersonalGoalsWidget').then(m => ({ default: safeModule(m, 'PersonalGoalsWidget') })));
const SafeFunFlixWidget = createSafeWidget(() => import('./widgets/FunFlixWidget').then(m => ({ default: safeModule(m, 'FunFlixWidget') })));
const SafeQuickActionsPanel = createSafeWidget(() => import('./widgets/MiscWidgets').then(m => ({ default: safeModule(m, 'QuickActionsPanel') })));
const SafeAnnouncementsPanel = createSafeWidget(() => import('./widgets/AnnouncementsPanel').then(m => ({ default: safeModule(m, 'AnnouncementsPanel') })));
const SafeDailyHighlightsWidget = createSafeWidget(() => import('./widgets/DailyHighlightsWidget').then(m => ({ default: safeModule(m, 'DailyHighlightsWidget') })));
const SafeNotificationsWidget = createSafeWidget(() => import('./widgets/NotificationsWidget').then(m => ({ default: safeModule(m, 'NotificationsWidget') })));
const SafeProjectsWidget = createSafeWidget(() => import('./widgets/ProjectsWidget').then(m => ({ default: safeModule(m, 'ProjectsWidget') })));
const SafeExperimentsWidget = createSafeWidget(() => import('./widgets/ExperimentsWidget').then(m => ({ default: safeModule(m, 'ExperimentsWidget') })));
const SafeSurpriseBoxWidget = createSafeWidget(() => import('./widgets/SurpriseBoxWidget').then(m => ({ default: safeModule(m, 'SurpriseBoxWidget') })));
const SafeLearningJourneyWidget = createSafeWidget(() => import('./widgets/LearningJourneyWidget').then(m => ({ default: safeModule(m, 'LearningJourneyWidget') })));
const SafeMySquadWidget = createSafeWidget(() => import('./widgets/MySquadWidget').then(m => ({ default: safeModule(m, 'MySquadWidget') })));
const SafeRecentActivityPanel = createSafeWidget(() => import('./widgets/RecentActivityPanel').then(m => ({ default: safeModule(m, 'RecentActivityPanel') })));

const Dashboard = React.memo(function Dashboard() {
  const { user, roleData } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    streak: true,
    mission: true,
    continue: true,
    discovery: true,
    achievements: true,
    friends: true,
    trending: true,
    events: true,
    spotlight: true,
    leaderboard: true,
    goals: true,
    funflix: true,
    quickActions: true,
    announcements: true,
    activity: true,
    experiments: true,
    highlights: true,
    notifications: true,
    projects: true,
    surpriseBox: true,
    learningJourney: true,
    squad: true,
    growthTree: true,
    achievementGalaxy: true,
    energyCrystal: true,
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
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 2,
      size: 2 + Math.random() * 4,
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

  const renderWidget = (Widget, key) => {
    if (!visibleWidgets[key]) return null;
    return <Widget key={key} />;
  };

  return (
    <PageContainer>
      {/* Animated Background Particles */}
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

      <div className="flex items-center justify-between gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0ms' }}>
        <PageHeader
          title="Command Center"
          description="Your personal headquarters in the BeastBuck ecosystem."
          hero={true}
        />
        <button
          onClick={() => setShowSettings(true)}
          className="settings-btn"
        >
          <Sliders className="h-5 w-5" />
          <span className="hidden sm:inline">Personalize</span>
          <Zap className="h-4 w-4 ml-1 text-accent" />
        </button>
      </div>

      <MembershipBanner />
      <DailyLoginReward onClaimSuccess={handleCelebration} />
      <CelebrationOverlay
        trigger={celebrationTrigger}
        message="+50 XP!"
        duration={3500}
      />

      <SectionWrapper>
        <div className="grid gap-6 md:gap-8">
          {/* Hero Welcome Section */}
          <div className="animate-fade-in-up hero-section" style={{ animationDelay: '0ms' }}>
            <SafeWelcomePanel />
          </div>

          {/* Today's Adventure */}
          {visibleWidgets.mission && (
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="widget-glow">
                <SafeDailyMissionWidget />
              </div>
            </div>
          )}

          {/* Continue Journey & Discovery Feed */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {visibleWidgets.continue && (
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <div className="widget-glow">
                  <SafeContinueJourneyWidget />
                </div>
              </div>
            )}
          </div>

          {/* Achievements Galaxy */}
          {visibleWidgets.achievementGalaxy && (
            <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="widget-glow">
                <SafeAchievementGalaxyWidget />
              </div>
            </div>
          )}

          {/* Achievements & Creative Spotlight */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {visibleWidgets.achievements && (
              <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
                <div className="widget-glow">
                  <SafeRecentAchievementsWidget />
                </div>
              </div>
            )}
            {visibleWidgets.spotlight && (
              <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="widget-glow">
                  <SafeCreativeSpotlightWidget />
                </div>
              </div>
            )}
          </div>

          {/* Community Activity */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {visibleWidgets.friends && (
              <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
                <div className="widget-glow">
                  <SafeFriendsActivityWidget />
                </div>
              </div>
            )}
            {visibleWidgets.trending && (
              <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                <div className="widget-glow">
                  <SafeTrendingWidget />
                </div>
              </div>
            )}
          </div>

          {/* Creative Energy Crystal & Personal Growth Tree */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {visibleWidgets.energyCrystal && (
              <div className="animate-fade-in-up" style={{ animationDelay: '550ms' }}>
                <div className="widget-glow">
                  <SafeCreativeEnergyCrystalWidget />
                </div>
              </div>
            )}
            {visibleWidgets.growthTree && (
              <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                <div className="widget-glow">
                  <SafePersonalGrowthTreeWidget />
                </div>
              </div>
            )}
          </div>

          {/* Events & Leaderboard */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {visibleWidgets.events && (
              <div className="animate-fade-in-up" style={{ animationDelay: '650ms' }}>
                <div className="widget-glow">
                  <SafeEventsWidget />
                </div>
              </div>
            )}
            {visibleWidgets.leaderboard && (
              <div className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
                <div className="widget-glow">
                  <SafeLeaderboardPreviewWidget />
                </div>
              </div>
            )}
          </div>

          {/* Goals & FunFlix */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {visibleWidgets.goals && (
              <div className="animate-fade-in-up" style={{ animationDelay: '750ms' }}>
                <div className="widget-glow">
                  <SafePersonalGoalsWidget />
                </div>
              </div>
            )}
            {visibleWidgets.funflix && (
              <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
                <div className="widget-glow">
                  <SafeFunFlixWidget />
                </div>
              </div>
            )}
          </div>

          {/* Quick Access Row */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {visibleWidgets.quickActions && (
              <div className="animate-fade-in-up" style={{ animationDelay: '850ms' }}>
                <div className="widget-glow">
                  <SafeQuickActionsPanel />
                </div>
              </div>
            )}
            {visibleWidgets.announcements && (
              <div className="animate-fade-in-up" style={{ animationDelay: '900ms' }}>
                <div className="widget-glow">
                  <SafeAnnouncementsPanel />
                </div>
              </div>
            )}
            {visibleWidgets.highlights && (
              <div className="animate-fade-in-up" style={{ animationDelay: '950ms' }}>
                <div className="widget-glow">
                  <SafeDailyHighlightsWidget />
                </div>
              </div>
            )}
            {visibleWidgets.notifications && (
              <div className="animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
                <div className="widget-glow">
                  <SafeNotificationsWidget />
                </div>
              </div>
            )}
          </div>

          {/* Secondary Widgets Row */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {visibleWidgets.projects && (
              <div className="animate-fade-in-up" style={{ animationDelay: '1050ms' }}>
                <div className="widget-glow">
                  <SafeProjectsWidget />
                </div>
              </div>
            )}
            {visibleWidgets.experiments && (
              <div className="animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
                <div className="widget-glow">
                  <SafeExperimentsWidget />
                </div>
              </div>
            )}
            {visibleWidgets.surpriseBox && (
              <div className="animate-fade-in-up" style={{ animationDelay: '1150ms' }}>
                <div className="widget-glow">
                  <SafeSurpriseBoxWidget />
                </div>
              </div>
            )}
            {visibleWidgets.learningJourney && (
              <div className="animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
                <div className="widget-glow">
                  <SafeLearningJourneyWidget />
                </div>
              </div>
            )}
          </div>

          {/* My Squad & Activity */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {visibleWidgets.squad && (
              <div className="animate-fade-in-up" style={{ animationDelay: '1250ms' }}>
                <div className="widget-glow">
                  <SafeMySquadWidget />
                </div>
              </div>
            )}
            {visibleWidgets.activity && (
              <div className="animate-fade-in-up" style={{ animationDelay: '1300ms' }}>
                <div className="widget-glow">
                  <SafeRecentActivityPanel />
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionWrapper>

      {/* Floating AI Companion */}
      <AICompanionWidget />

      {/* Floating Command Palette */}
      <CommandPalette />

      {/* Personalization Sidebar */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-md animate-fade-in"
          onClick={handleCloseSettings}
        >
          <div
            className="settings-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="h-5 w-5 text-accent animate-pulse" />
                Personalize Console
              </h3>
              <button
                onClick={handleCloseSettings}
                className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
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
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                {Object.values(visibleWidgets).every(Boolean) ? 'Hide All' : 'Show All'}
              </button>
              <button
                onClick={handleCloseSettings}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-purple-500 text-sm font-bold text-background hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                Done
              </button>
            </div>

            <p className="text-xs font-bold text-text-muted mb-4 uppercase tracking-wider">Show / Hide Widgets</p>

            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1 pb-2 overscroll-contain">
              {[
                { key: 'welcome', label: 'Welcome Hero', icon: '👋' },
                { key: 'streak', label: 'Daily Streak', icon: '🔥' },
                { key: 'mission', label: 'Daily Mission', icon: '🎯' },
                { key: 'continue', label: 'Continue Journey', icon: '🚀' },
                { key: 'discovery', label: 'Discovery', icon: '💎' },
                { key: 'achievementGalaxy', label: 'Achievement Galaxy', icon: '⭐' },
                { key: 'achievements', label: 'Achievements', icon: '🏆' },
                { key: 'spotlight', label: 'Creative Spotlight', icon: '🎨' },
                { key: 'friends', label: 'Friends Activity', icon: '👥' },
                { key: 'trending', label: 'Trending', icon: '📈' },
                { key: 'energyCrystal', label: 'Creative Energy', icon: '💎' },
                { key: 'growthTree', label: 'Growth Tree', icon: '🌳' },
                { key: 'events', label: 'Events', icon: '📅' },
                { key: 'leaderboard', label: 'Leaderboard', icon: '🏅' },
                { key: 'goals', label: 'Personal Goals', icon: '🎯' },
                { key: 'funflix', label: 'FunFlix', icon: '🎬' },
                { key: 'quickActions', label: 'Quick Actions', icon: '⚡' },
                { key: 'announcements', label: 'Announcements', icon: '📢' },
                { key: 'highlights', label: 'Daily Highlights', icon: '✨' },
                { key: 'notifications', label: 'Notifications', icon: '🔔' },
                { key: 'projects', label: 'Projects', icon: '📁' },
                { key: 'experiments', label: 'Experiments', icon: '🧪' },
                { key: 'surpriseBox', label: 'Surprise Box', icon: '🎁' },
                { key: 'learningJourney', label: 'Learning Journey', icon: '📚' },
                { key: 'squad', label: 'My Squad', icon: '👫' },
                { key: 'activity', label: 'Recent Activity', icon: '📊' },
              ].map(({ key, label, icon }) => {
                const active = visibleWidgets[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
                      active
                        ? 'border-white/20 bg-white/[0.06]'
                        : 'border-white/5 bg-white/[0.02] opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <span className="text-sm font-bold text-white">{label}</span>
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

            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-[10px] text-text-muted font-bold flex items-center justify-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-status-success animate-pulse"></span>
                Auto-saved to Firestore
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out both;
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3) translateY(50px); }
          50% { transform: scale(1.05) translateY(-10px); }
          70% { transform: scale(0.95) translateY(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-bounce-in {
          animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.6; }
          50% { transform: translateY(-10px) rotate(5deg); opacity: 1; }
        }
        .particles-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          bottom: -10px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8338ec, #ff006e, #3a86ff);
          animation: floatUp 4s ease-in-out infinite;
          opacity: 0.6;
        }
        .membership-banner {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, rgba(131, 56, 236, 0.3), rgba(255, 0, 110, 0.2), rgba(58, 134, 255, 0.3));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 40px rgba(131, 56, 236, 0.3);
        }
        .banner-bg {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 0, 110, 0.4), transparent 70%);
          border-radius: 50%;
          filter: blur(60px);
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .banner-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(131, 56, 236, 0.3), rgba(255, 0, 110, 0.3));
          border-radius: 20px;
          color: white;
          box-shadow: 0 0 30px rgba(131, 56, 236, 0.5);
          animation: floatUp 3s ease-in-out infinite;
        }
        .daily-reward {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, rgba(255, 84, 0, 0.3), rgba(255, 0, 110, 0.2), rgba(255, 240, 31, 0.2));
          backdrop-filter: blur(20px);
          border: 2px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 40px rgba(255, 84, 0, 0.3);
        }
        .reward-bg {
          position: absolute;
          top: -30%;
          left: -10%;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(255, 240, 31, 0.4), transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .reward-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255, 240, 31, 0.3), rgba(255, 84, 0, 0.3));
          border-radius: 20px;
          color: white;
          box-shadow: 0 0 30px rgba(255, 240, 31, 0.5);
          animation: floatUp 2.5s ease-in-out infinite;
        }
        .reward-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #ff5400, #ff006e);
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 0.875rem;
          box-shadow: 0 0 20px rgba(255, 0, 110, 0.4);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .reward-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 0 30px rgba(255, 84, 0, 0.6);
        }
        .reward-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .settings-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.25rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .settings-btn:hover {
          transform: translateY(-2px) scale(1.05);
          background: rgba(255, 255, 255, 0.12);
          box-shadow: 0 6px 20px rgba(131, 56, 236, 0.4);
          border-color: rgba(131, 56, 236, 0.5);
        }
        .widget-glow {
          position: relative;
          border-radius: 20px;
          transition: all 0.4s;
        }
        .widget-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 22px;
          background: linear-gradient(135deg, #8338ec, #ff006e, #3a86ff);
          opacity: 0;
          transition: opacity 0.4s;
          z-index: -1;
          filter: blur(8px);
        }
        .widget-glow:hover::before {
          opacity: 0.5;
        }
        .widget-wrapper {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .widget-wrapper:hover {
          transform: translateY(-4px) scale(1.02);
        }
        .settings-drawer {
          width: 100%;
          max-width: 400px;
          height: 100%;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.95));
          backdrop-filter: blur(30px);
          border-l: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2rem;
          display: flex;
          flex-col;
          box-shadow: 10px 0 40px rgba(0, 0, 0, 0.5);
        }
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
          cursor: pointer;
          padding: 0;
        }
        .toggle-switch.active {
          background: linear-gradient(135deg, #8338ec, #ff006e);
          box-shadow: 0 0 15px rgba(255, 0, 110, 0.4);
          border-color: rgba(255, 0, 110, 0.5);
        }
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .toggle-switch.active .toggle-thumb {
          left: 26px;
        }
        .hero-section {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </PageContainer>
  );
});

export default Dashboard;
