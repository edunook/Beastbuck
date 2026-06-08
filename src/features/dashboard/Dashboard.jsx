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
import { Sparkles, ArrowRight, X } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-subtle-1 p-6 mb-6 shadow-depth-2">
      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent opacity-50" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-accent/30 flex items-center justify-center shrink-0 shadow-glow-1">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-white text-section-title">Apply for Membership</h3>
            <p className="text-text-soft text-description">
              {application?.status === 'pending' 
                ? 'Your application is under review' 
                : 'Unlock internal collaboration, projects, and research labs'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {application?.status === 'pending' ? (
            <span className="px-4 py-2 rounded-lg bg-status-warning/10 text-status-warning text-badge font-semibold">
              Pending Review
            </span>
          ) : (
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-premium-1 text-background font-bold hover:shadow-glow-2 transition-all duration-200 hover:-translate-y-0.5"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-text-muted hover:text-white transition-colors rounded-lg hover:bg-white/5"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Welcome Span */}
          <div className="lg:col-span-3">
            <WelcomePanel />
          </div>

          {/* Row 2: Metrics */}
          <div className="lg:col-span-1">
            <XPOverview />
          </div>
          <div className="lg:col-span-1">
            <ActiveTasksPanel />
          </div>
          <div className="lg:col-span-1">
            <TrendingExperimentsPanel />
          </div>
          <div className="lg:col-span-1">
            <LevelWidget />
          </div>
          <div className="lg:col-span-1">
            <RankWidget />
          </div>
          <div className="lg:col-span-1">
            <RecentAchievementsWidget />
          </div>

          {/* Row 3: Info & Actions */}
          <div className="lg:col-span-2">
            <AnnouncementsPanel />
          </div>
          <div className="lg:col-span-1">
            <QuickActionsPanel />
          </div>
        </div>
      </SectionWrapper>
    </PageContainer>
  );
});

export default Dashboard;
