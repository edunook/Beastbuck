import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Heart,
  Building2,
  Clock,
  Target,
  Award,
  BarChart3,
  Rocket,
  Zap
} from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { GovernanceService } from '../../services/firebase/governance';
import { OrganizationService } from '../../services/firebase/organization';

export default function MissionControl() {
  const { user } = useAuth();
  const [, setLoading] = useState(true);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const loadMissionControlData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Load organization health metrics (with error handling)
      try {
        const healthData = await GovernanceService.getOrganizationHealth();
        setHealthMetrics(healthData);
      } catch (healthError) {
        console.warn('Could not load organization health (permission denied):', healthError.message);
        setHealthMetrics({ overallHealth: 75, totalMembers: 0, weeklyGrowth: 0 });
      }

      // Load department statistics (with error handling)
      try {
        const deptStats = await OrganizationService.getDepartmentStatistics();
        setDepartmentStats(deptStats);
      } catch (deptError) {
        console.warn('Could not load department statistics (permission denied):', deptError.message);
        setDepartmentStats([]);
      }

      // Load critical alerts (with error handling)
      try {
        const criticalAlerts = await GovernanceService.getCriticalAlerts();
        setAlerts(criticalAlerts);
      } catch (alertsError) {
        console.warn('Could not load critical alerts (permission denied):', alertsError.message);
        setAlerts([]);
      }

    } catch (error) {
      console.error('Error loading mission control data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, setLoading, setHealthMetrics, setDepartmentStats, setAlerts]);

  useEffect(() => {
    loadMissionControlData();
  }, [loadMissionControlData]);

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Mission Control" 
        description="Executive dashboard for organization health, department performance, and critical metrics."
        hero={true}
      />

      {/* Health Score Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className="h-8 w-8 text-accent" />
              <span className={`text-3xl font-bold ${getHealthColor(healthMetrics?.overallHealth || 75)}`}>
                {healthMetrics?.overallHealth || 75}%
              </span>
            </div>
            <h3 className="font-bold text-white mb-1">Overall Health</h3>
            <p className="text-text-muted text-sm">Organization wellness score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-emerald-400" />
              <span className="text-3xl font-bold text-white">
                {healthMetrics?.totalMembers || 0}
              </span>
            </div>
            <h3 className="font-bold text-white mb-1">Active Members</h3>
            <p className="text-text-muted text-sm">Total approved members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-cyan-400" />
              <span className="text-3xl font-bold text-white">
                {healthMetrics?.weeklyGrowth || 0}%
              </span>
            </div>
            <h3 className="font-bold text-white mb-1">Weekly Growth</h3>
            <p className="text-text-muted text-sm">Member activity increase</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
              <span className="text-3xl font-bold text-white">
                {alerts?.length || 0}
              </span>
            </div>
            <h3 className="font-bold text-white mb-1">Active Alerts</h3>
            <p className="text-text-muted text-sm">Critical issues requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            Department Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div className="flex-1">
                  <h4 className="font-bold text-white mb-1">{dept.name}</h4>
                  <p className="text-text-muted text-sm">{dept.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-2xl font-bold ${getHealthColor(dept.healthScore)}`}>
                    {dept.healthScore}%
                  </div>
                  <p className="text-text-muted text-xs">{dept.memberCount} members</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{alert.title}</h4>
                      <p className="text-text-muted text-sm mb-2">{alert.description}</p>
                      <div className="flex items-center gap-2 text-xs text-text-muted">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="secondary" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Set Goals
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Review Achievements
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
            <Button variant="secondary" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Launch Initiative
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
