import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState, EmptyState } from '../../components/ui/UIElements';
import { Zap, Activity, CheckCircle2 } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { useAuth } from '../../features/auth/AuthContext';

const TABS = ['Active Workflows', 'Scheduled Jobs', 'Trigger Monitor', 'Recent Executions'];

export default function AutomationCenter() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [workflows, setWorkflows] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const [workflowsSnap, jobsSnap, triggersSnap] = await Promise.all([
          getDocs(query(collection(db, 'automation_workflows'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(10))),
          getDocs(query(collection(db, 'automation_jobs'), where('userId', '==', user.uid), orderBy('nextExecution', 'asc'), limit(10))),
          getDocs(query(collection(db, 'automation_triggers'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10))),
        ]);
        
        setWorkflows(workflowsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTriggers(triggersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error('Failed to load automation data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Automation Center" description="Monitor active workflows, scheduled jobs, and triggers." />
        <LoadingState text="Loading automation data..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Automation Center" description="Monitor active workflows, scheduled jobs, and triggers." />

      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${tab === i ? 'bg-accent text-black' : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="space-y-3">
          {workflows.length > 0 ? (
            workflows.map(w => (
              <div key={w.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Zap className={`h-5 w-5 ${w.status === 'running' ? 'text-emerald-400' : 'text-text-muted'}`} />
                  <div>
                    <h3 className="font-bold text-white">{w.name || 'Untitled Workflow'}</h3>
                    <p className="text-xs text-text-muted">Last run: {w.lastRun || 'Never'} · Next: {w.nextRun || 'Scheduled'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${w.status === 'running' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{w.status || 'idle'}</span>
                  <span className="text-sm font-bold text-emerald-400">{w.successRate || 0}%</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Zap}
              title="No Workflows Yet"
              description="Create your first automation workflow to get started."
            />
          )}
        </div>
      )}

      {tab === 1 && (
        <div className="space-y-3">
          {jobs.length > 0 ? (
            jobs.map(j => (
              <div key={j.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface/40 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-white">{j.name || 'Untitled Job'}</h3>
                  <p className="text-xs text-text-muted mt-1">Schedule: {j.schedule || 'Not set'}</p>
                  <p className="text-xs text-text-muted">Next: {j.nextExecution || 'Not scheduled'}</p>
                </div>
                <div className="mt-3 sm:mt-0">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${j.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>{j.status || 'inactive'}</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon={Activity}
              title="No Scheduled Jobs"
              description="Create scheduled jobs to automate recurring tasks."
            />
          )}
        </div>
      )}

      {tab === 2 && (
        <div className="space-y-3">
          {triggers.length > 0 ? (
            triggers.map(t => (
              <div key={t.id} className="flex flex-col gap-2 rounded-xl border border-border bg-surface/40 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4">
                <Activity className="h-4 w-4 shrink-0 text-accent" />
                <span className="shrink-0 text-xs text-text-muted">{t.timestamp || 'Just now'}</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">{t.type || 'Event'}</span>
                <span className="text-sm text-white">{t.event || 'Trigger event'}</span>
                <CheckCircle2 className="hidden h-4 w-4 shrink-0 text-emerald-400 sm:block" />
                <span className="text-xs text-emerald-400">{t.result || 'Executed successfully'}</span>
              </div>
            ))
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No Triggers Yet"
              description="Triggers will appear here when workflows are activated."
            />
          )}
        </div>
      )}

      {tab === 3 && (
        <div className="space-y-3">
          <EmptyState
            icon={Activity}
            title="Recent Executions"
            description="Recent workflow executions will appear here."
          />
        </div>
      )}
    </PageContainer>
  );
}
