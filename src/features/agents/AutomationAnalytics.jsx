import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { BarChart3, Bot, CheckCircle2, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../features/auth/AuthContext';
import EmptyState from '../../components/ui/EmptyState';

export default function AutomationAnalytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [topWorkflows, setTopWorkflows] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch automation stats
        const statsQuery = query(
          collection(db, 'automation_stats'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const statsSnap = await getDocs(statsQuery);
        
        if (!statsSnap.empty) {
          const statsData = statsSnap.docs[0].data();
          setStats([
            { label: 'Total Workflows', value: statsData.totalWorkflows?.toString() || '0', icon: BarChart3, color: 'text-blue-400' },
            { label: 'Active Agents', value: statsData.activeAgents?.toString() || '0', icon: Bot, color: 'text-accent' },
            { label: 'Success Rate', value: `${statsData.successRate || 0}%`, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Time Saved', value: `${statsData.timeSaved || 0}h`, icon: Clock, color: 'text-purple-400' },
            { label: 'Productivity Gain', value: `+${statsData.productivityGain || 0}%`, icon: TrendingUp, color: 'text-pink-400' },
          ]);
        }

        // Fetch daily execution data
        const dailyQuery = query(
          collection(db, 'automation_daily'),
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(7)
        );
        const dailySnap = await getDocs(dailyQuery);
        
        const dailyItems = dailySnap.docs.map(doc => doc.data()).reverse();
        const maxVal = Math.max(...dailyItems.map(d => d.executions || 0), 1);
        
        setDailyData({
          items: dailyItems,
          maxVal
        });

        // Fetch top workflows
        const workflowsQuery = query(
          collection(db, 'automation_workflows'),
          where('userId', '==', user.uid),
          orderBy('executions', 'desc'),
          limit(5)
        );
        const workflowsSnap = await getDocs(workflowsQuery);
        
        setTopWorkflows(workflowsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to fetch automation analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  if (!stats && !dailyData && topWorkflows.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Automation Analytics" description="Track workflow performance, agent success rates, and productivity gains." />
        <EmptyState
          icon={Bot}
          title="No Automation Data"
          description="Create workflows and agents to start seeing analytics."
        />
      </PageContainer>
    );
  }

  const displayStats = stats || [
    { label: 'Total Workflows', value: '0', icon: BarChart3, color: 'text-blue-400' },
    { label: 'Active Agents', value: '0', icon: Bot, color: 'text-accent' },
    { label: 'Success Rate', value: '0%', icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Time Saved', value: '0h', icon: Clock, color: 'text-purple-400' },
    { label: 'Productivity Gain', value: '+0%', icon: TrendingUp, color: 'text-pink-400' },
  ];

  return (
    <PageContainer>
      <PageHeader title="Automation Analytics" description="Track workflow performance, agent success rates, and productivity gains." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {displayStats.map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-5 w-5 ${s.color}`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Workflow Executions Chart */}
      <div className="mb-8 rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
        <h3 className="mb-4 font-heading font-bold text-white">Workflow Executions (This Week)</h3>
        {dailyData && dailyData.items.length > 0 ? (
          <div className="flex items-end gap-3" style={{ height: 160 }}>
            {dailyData.items.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-accent">{d.executions || 0}</span>
                <div className="w-full rounded-t-md bg-accent/80 transition-all" style={{ height: `${((d.executions || 0) / dailyData.maxVal) * 120}px` }} />
                <span className="text-[10px] text-text-muted">{d.day || 'Day ' + (i + 1)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No Execution Data"
            description="No workflow execution data available for this week."
            variant="default"
          />
        )}
      </div>

      {/* Top Workflows */}
      <div className="space-y-3">
        {topWorkflows.length > 0 ? (
          topWorkflows.map((w) => (
            <div key={w.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface/40 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="font-bold text-white">{w.name || 'Untitled Workflow'}</h3>
                <p className="text-xs text-text-muted mt-1">Category: {w.category || 'General'}</p>
              </div>
              <div className="flex items-center gap-4 mt-3 sm:mt-0">
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{w.executions || 0}</p>
                  <p className="text-[10px] text-text-muted">Executions</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-emerald-400">{w.successRate || 0}%</p>
                  <p className="text-[10px] text-text-muted">Success</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-accent">{w.timeSaved || '0h'}</p>
                  <p className="text-[10px] text-text-muted">Time Saved</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-text-muted">
            No workflows created yet.
          </div>
        )}
      </div>
    </PageContainer>
  );
}
