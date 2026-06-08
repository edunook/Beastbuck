import { useEffect, useState } from 'react';
import { TrendingUp, Zap, UserMinus, RefreshCw } from 'lucide-react';
import { MissionControlService } from '../../services/firebase/missionControl';
import { IntelligencePanel, LoadingRows } from './missionControlUtils';
import { Link } from 'react-router-dom';

function MemberRow({ member, rank }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-black/20 p-3 transition-all hover:bg-black/40">
      <span className={`w-6 shrink-0 text-center font-heading text-sm font-black ${rank <= 3 ? 'text-status-warning' : 'text-text-muted'}`}>
        #{rank}
      </span>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 font-heading text-lg font-black text-accent">
        {(member.displayName || member.username || '?')[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <Link to={`/members/${member.id}`} className="truncate font-bold text-white hover:text-accent">
          {member.displayName || member.username}
        </Link>
        <p className="text-xs text-text-muted">{member.role}</p>
      </div>
      <div className="text-right">
        <p className="font-heading text-lg font-black text-white">{(member.xp || 0).toLocaleString()}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">XP</p>
      </div>
    </div>
  );
}

export default function MemberAnalytics() {
  const [data, setData] = useState({ topContributors: [], risingStars: [], inactive: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const result = await MissionControlService.getMemberAnalytics();
      setData(result);
    } catch (err) {
      console.error('Failed to load member analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-white">Member Analytics</h2>
          <p className="text-xs text-text-muted">Analyze contributor velocity, leadership potential, and member retention.</p>
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

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <IntelligencePanel title="Top Contributors" icon={Zap}>
          {loading ? <LoadingRows count={5} /> : (
            <div className="space-y-2">
              {data.topContributors.map((m, i) => (
                <MemberRow key={m.id} member={m} rank={i + 1} />
              ))}
            </div>
          )}
        </IntelligencePanel>

        <IntelligencePanel title="Rising Stars" icon={TrendingUp}>
          {loading ? <LoadingRows count={5} /> : (
            <div className="space-y-2">
              {data.risingStars.length === 0 ? (
                <p className="py-4 text-center text-sm text-text-muted">No recent high-velocity members detected.</p>
              ) : data.risingStars.map((m, i) => (
                <MemberRow key={m.id} member={m} rank={i + 1} />
              ))}
            </div>
          )}
        </IntelligencePanel>

        <IntelligencePanel title="At Risk (Inactive)" icon={UserMinus}>
          {loading ? <LoadingRows count={5} /> : (
            <div className="space-y-2">
              {data.inactive.length === 0 ? (
                <p className="py-4 text-center text-sm text-text-muted">Member retention is excellent.</p>
              ) : data.inactive.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-status-danger/20 bg-status-danger/5 p-3">
                  <div className="min-w-0">
                    <Link to={`/members/${m.id}`} className="truncate font-bold text-white hover:text-accent">
                      {m.displayName || m.username}
                    </Link>
                    <p className="text-xs text-text-muted">Inactive &gt; 30 days</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-lg font-black text-status-danger">{m.xp || 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </IntelligencePanel>
      </div>
    </div>
  );
}
