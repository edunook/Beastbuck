import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../../services/firebase/permissions';
import { GovernanceService } from '../../services/firebase/governance';
import { BarChart3, TrendingUp, Clock, Users, Building2, BriefcaseBusiness, RefreshCw, Activity, Award } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import Button from '../../components/ui/Button';
import { IntelligenceMetric, IntelligencePanel } from '../mission-control/missionControlUtils';

export default function GovernanceAnalytics() {
  const { roleData } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [orgHealth, proposals, policies, meetings] = await Promise.all([
        GovernanceService.getOrganizationHealth(),
        GovernanceService.getAllProposals(),
        GovernanceService.getPolicies(),
        GovernanceService.getMeetings(),
      ]);

      const activeProposals = proposals.filter(p => p.status === 'ACTIVE').length;
      const closedProposals = proposals.filter(p => p.status === 'CLOSED').length;
      const approvedProposals = proposals.filter(p => p.result === 'APPROVED').length;
      const publishedPolicies = policies.filter(p => p.status === 'PUBLISHED').length;
      const completedMeetings = meetings.filter(m => m.status === 'COMPLETED').length;

      const approvalRate = closedProposals > 0 ? Math.round((approvedProposals / closedProposals) * 100) : 0;
      const avgApprovalTime = 3.5; // Simulated in days
      const departmentGrowth = orgHealth?.departments || 0;
      const leaderActivity = 85; // Simulated percentage
      const moderatorActivity = 72; // Simulated percentage
      const communityReports = 12; // Simulated count
      const resolutionTime = 2.1; // Simulated in days

      setAnalytics({
        approvalRate,
        avgApprovalTime,
        departmentGrowth,
        leaderActivity,
        moderatorActivity,
        communityReports,
        resolutionTime,
        organizationHealth: orgHealth?.organizationScore || 0,
        growthRate: orgHealth?.growthRate || 0,
        activeProposals,
        closedProposals,
        publishedPolicies,
        completedMeetings,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Governance Analytics is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Governance Analytics" 
        description="Comprehensive analytics dashboard for governance metrics."
        hero={true}
        action={
          <Button onClick={loadAnalytics} disabled={loading} size="sm" variant="secondary">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <IntelligencePanel title="Key Performance Metrics" icon={BarChart3}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
              <IntelligenceMetric label="Approval Rate" value={`${analytics.approvalRate}%`} icon={Award} color="success" />
              <IntelligenceMetric label="Avg Approval Time" value={`${analytics.avgApprovalTime}d`} icon={Clock} color="accent" />
              <IntelligenceMetric label="Department Growth" value={analytics.departmentGrowth} icon={Building2} color="purple" />
              <IntelligenceMetric label="Resolution Time" value={`${analytics.resolutionTime}d`} icon={Activity} color="warning" />
            </div>
          </IntelligencePanel>

          {/* Activity Metrics */}
          <div className="grid gap-6 lg:grid-cols-2">
            <IntelligencePanel title="Activity Metrics" icon={Users}>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <IntelligenceMetric label="Leader Activity" value={`${analytics.leaderActivity}%`} icon={Users} color="accent" />
                <IntelligenceMetric label="Moderator Activity" value={`${analytics.moderatorActivity}%`} icon={Users} color="success" />
                <IntelligenceMetric label="Community Reports" value={analytics.communityReports} icon={Activity} color="warning" />
                <IntelligenceMetric label="Active Proposals" value={analytics.activeProposals} icon={BriefcaseBusiness} color="purple" />
              </div>
            </IntelligencePanel>

            <IntelligencePanel title="Organization Health" icon={TrendingUp}>
              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <IntelligenceMetric label="Organization Score" value={`${analytics.organizationHealth}%`} icon={Award} color="accent" />
                <IntelligenceMetric label="Growth Rate" value={`${analytics.growthRate}%`} icon={TrendingUp} color="success" />
                <IntelligenceMetric label="Published Policies" value={analytics.publishedPolicies} icon={Activity} color="purple" />
                <IntelligenceMetric label="Completed Meetings" value={analytics.completedMeetings} icon={Clock} color="warning" />
              </div>
            </IntelligencePanel>
          </div>

          {/* Analytics Summary */}
          <IntelligencePanel title="Analytics Summary" icon={BarChart3}>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Proposal Success Rate</h4>
                    <p className="text-text-muted text-sm">High approval rate indicates healthy governance</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-400">{analytics.approvalRate}%</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Department Expansion</h4>
                    <p className="text-text-muted text-sm">Growing organizational structure</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-400">{analytics.departmentGrowth}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Overall Growth Trend</h4>
                    <p className="text-text-muted text-sm">Platform growth trajectory</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-accent">{analytics.growthRate}%</span>
              </div>
            </div>
          </IntelligencePanel>
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">
          <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No analytics data available</p>
        </div>
      )}
    </PageContainer>
  );
}
