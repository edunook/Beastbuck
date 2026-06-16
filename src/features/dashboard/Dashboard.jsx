import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { WelcomePanel } from './widgets/WelcomePanel';
import { LevelWidget, RankWidget, RecentAchievementsWidget, XPOverview } from './widgets/XPOverview';
import { AnnouncementsPanel } from './widgets/AnnouncementsPanel';
import { ActiveTasksPanel, QuickActionsPanel, TrendingExperimentsPanel } from './widgets/MiscWidgets';
import { useAuth } from '../../features/auth/AuthContext';
import { MembershipService } from '../../services/firebase/membership';
import { PERMISSIONS } from '../../services/firebase/permissions';
import { Sparkles, ArrowRight, X, TrendingUp, Activity, Target, Zap, Award, Crown, Shield } from 'lucide-react';

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
          const app = await MembershipService.getUserApplication(user.uid);
          setApplication(app);
        }
      } catch (err) {
        console.error('Error checking membership:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [user]);

  if (loading || dismissed) return null;
  if (PERMISSIONS.isApprovedMember(roleData?.role)) return null;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-purple-500/10 to-cyan-500/10 p-6 mb-8 shadow-2xl shadow-accent/20 backdrop-blur-sm transition-all duration-500 hover:shadow-accent/30 hover:border-accent/50 animate-fade-in-up">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-purple-500/0 to-cyan-500/0 opacity-0 transition-all duration-700 group-hover:from-accent/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 group-hover:opacity-100" />
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/20 blur-3xl transition-all duration-700 group-hover:bg-accent/30 group-hover:scale-150" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl transition-all duration-700 group-hover:bg-purple-500/30 group-hover:scale-150" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-accent/30 border border-accent/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent/50">
            <Sparkles className="h-7 w-7 text-accent animate-pulse" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/0 to-purple-500/0 opacity-0 transition-all duration-300 group-hover:from-accent/10 group-hover:to-purple-500/10 group-hover:opacity-100" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-black text-white mb-1">Apply for Membership</h3>
            <p className="text-sm text-text-soft">
              {application?.status === 'pending' 
                ? 'Your application is under review' 
                : 'Unlock internal collaboration, projects, and research labs'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {application?.status === 'pending' ? (
            <span className="px-5 py-2.5 rounded-xl bg-status-warning/10 text-status-warning text-sm font-bold uppercase tracking-wider border border-status-warning/30 shadow-lg shadow-status-warning/20">
              Pending Review
            </span>
          ) : (
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-purple-500 text-background font-bold hover:shadow-lg hover:shadow-accent/50 transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Apply Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

const Dashboard = React.memo(function Dashboard() {
  return (
    <PageContainer>
      <PageHeader 
        title="Command Center" 
        description="Your personal overview of the BeastBuck ecosystem."
        hero={true}
      />

      <MembershipBanner />

      <SectionWrapper>
        <div className="grid gap-6 md:gap-8">
          {/* Main Welcome Span */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <WelcomePanel />
          </div>

          {/* Stats Overview Row */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <XPOverview />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
              <ActiveTasksPanel />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <LevelWidget />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
              <RankWidget />
            </div>
          </div>

          {/* Content Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <AnnouncementsPanel />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
              <QuickActionsPanel />
            </div>
          </div>

          {/* Achievements Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <RecentAchievementsWidget />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
              <TrendingExperimentsPanel />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out both;
        }
      `}</style>
    </PageContainer>
  );
});

export default Dashboard;
