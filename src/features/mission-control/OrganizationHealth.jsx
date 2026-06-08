import { useEffect, useState } from 'react';
import { Building2, RefreshCw, Users, FolderKanban, Zap, Activity } from 'lucide-react';
import { MissionControlService } from '../../services/firebase/missionControl';
import { IntelligencePanel, LoadingRows, HealthBadge } from './missionControlUtils';

export default function OrganizationHealth() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await MissionControlService.getOrganizationHealth();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load org health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Department Analytics</h2>
          <p className="text-xs text-text-muted">Compare performance, activity, and XP growth across departments.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-border bg-white/5 px-4 py-2 text-sm font-bold text-text-soft hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <IntelligencePanel title="Organization Health" icon={Building2}>
        {loading ? <LoadingRows count={5} /> : (
          <div className="space-y-4">
            {departments.length === 0 ? (
              <p className="text-sm text-text-muted">No departments created yet.</p>
            ) : departments.map((dept, i) => (
              <div key={dept.id} className="rounded-xl border border-border/60 bg-black/20 p-5 transition-all hover:bg-black/40">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white">{dept.name}</h3>
                    <p className="text-xs text-text-muted">{dept.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Avg Health</p>
                      <div className="mt-1">
                        <HealthBadge score={dept.avgHealth} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-border/40 pt-4 sm:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{dept.memberCount}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Members</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{dept.activeProjectCount}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Active Proj</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-status-warning/10 text-status-warning">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">{dept.totalXP.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Total XP</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-status-success/10 text-status-success">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">#{i + 1}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Rank</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </IntelligencePanel>
    </div>
  );
}
