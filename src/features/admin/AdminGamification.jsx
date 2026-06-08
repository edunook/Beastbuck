import { useEffect, useState } from 'react';
import { Award, BadgePlus, Minus, Plus, Trophy, Zap, Search, X } from 'lucide-react';
import { AdminService } from '../../services/firebase/admin';
import { UsersService } from '../../services/firebase/users';
import { SPECIALIZATIONS } from '../../constants/specializations';
import { useAuth } from '../auth/AuthContext';
import { AdminPanel, AdminToast, LoadingRows } from './adminUtils';

const PRESET_XP = [10, 25, 50, 100, 250, 500];

const ACHIEVEMENT_PRESETS = [
  { title: 'Early Adopter', id: 'early-adopter' },
  { title: 'First Experiment', id: 'first-experiment' },
  { title: 'Team Player', id: 'team-player' },
  { title: 'Innovator', id: 'innovator' },
  { title: 'Top Contributor', id: 'top-contributor' },
  { title: 'Lab Master', id: 'lab-master' },
  { title: '100 XP Club', id: '100-xp-club' },
  { title: 'Product Creator', id: 'product-creator' },
];

function MemberPicker({ members, value, onChange }) {
  const [search, setSearch] = useState('');
  const filtered = members.filter(m =>
    [m.displayName, m.username].join(' ').toLowerCase().includes(search.toLowerCase()),
  );
  const selected = members.find(m => m.id === value);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-bold text-text-muted">Target Member</label>
      {selected && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-sm font-black text-accent">
            {(selected.displayName || selected.username || '?')[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">{selected.displayName || selected.username}</p>
            <p className="text-xs text-text-muted">{selected.xp || 0} XP · Lvl {selected.level || 1}</p>
          </div>
          <button onClick={() => onChange('')} className="text-text-muted hover:text-white"><X className="h-4 w-4" /></button>
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members…"
          className="h-9 w-full rounded-xl border border-border bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
        />
      </div>
      {search && (
        <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          {filtered.slice(0, 6).map(m => (
            <button
              key={m.id}
              onClick={() => { onChange(m.id); setSearch(''); }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-black text-accent">
                {(m.displayName || m.username || '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{m.displayName || m.username}</p>
                <p className="text-xs text-text-muted">@{m.username} · {m.xp || 0} XP</p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="px-3 py-2.5 text-sm text-text-muted">No members found</p>}
        </div>
      )}
    </div>
  );
}

export default function AdminGamification() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberId, setMemberId] = useState('');
  const [xp, setXp] = useState(25);
  const [achievementTitle, setAchievementTitle] = useState('');
  const [badge, setBadge] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    UsersService.getAssignableMembers().then(items => {
      setMembers(items);
      setLoading(false);
    });
  }, []);

  const run = async (action, message) => {
    if (!memberId) { setToast('Please select a member first.'); return; }
    try {
      await action();
      setToast(message);
    } catch (err) {
      setToast('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <AdminToast message={toast} onClear={() => setToast('')} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* XP Adjustment */}
        <AdminPanel title="XP Adjustment" icon={Zap}>
          {loading ? <LoadingRows count={3} /> : (
            <div className="space-y-4">
              <MemberPicker members={members} value={memberId} onChange={setMemberId} />

              {/* Preset XP Buttons */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-muted">Quick Amount</label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_XP.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setXp(amount)}
                      className={`rounded-lg border px-3 py-1 text-xs font-bold transition-all ${
                        xp === amount ? 'border-accent/40 bg-accent/10 text-accent' : 'border-border bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-muted">Custom Amount</label>
                <input
                  type="number"
                  value={xp}
                  min={1}
                  onChange={e => setXp(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white focus:border-accent/40 focus:outline-none"
                />
              </div>

              {/* Award / Remove */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => run(() => AdminService.adjustXP(memberId, xp, user.uid, `Admin awarded ${xp} XP`), `+${xp} XP awarded.`)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-status-success/20 to-status-success/10 border border-status-success/20 py-2.5 text-sm font-bold text-status-success transition-all hover:from-status-success/30"
                >
                  <Plus className="h-4 w-4" /> Award
                </button>
                <button
                  onClick={() => run(() => AdminService.adjustXP(memberId, -xp, user.uid, `Admin removed ${xp} XP`), `-${xp} XP removed.`)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-status-danger/20 to-status-danger/10 border border-status-danger/20 py-2.5 text-sm font-bold text-status-danger transition-all hover:from-status-danger/30"
                >
                  <Minus className="h-4 w-4" /> Remove
                </button>
              </div>
            </div>
          )}
        </AdminPanel>

        {/* Achievement */}
        <AdminPanel title="Grant Achievement" icon={Trophy}>
          {loading ? <LoadingRows count={3} /> : (
            <div className="space-y-4">
              <MemberPicker members={members} value={memberId} onChange={setMemberId} />

              {/* Preset Achievements */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-muted">Preset Achievements</label>
                <div className="flex flex-wrap gap-1.5">
                  {ACHIEVEMENT_PRESETS.map(a => (
                    <button
                      key={a.id}
                      onClick={() => setAchievementTitle(a.title)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-all ${
                        achievementTitle === a.title
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'border-border bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      {a.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Achievement */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-muted">Custom Title</label>
                <input
                  value={achievementTitle}
                  onChange={e => setAchievementTitle(e.target.value)}
                  placeholder="Achievement title…"
                  className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
                />
              </div>

              <button
                disabled={!achievementTitle.trim()}
                onClick={() => run(
                  () => AdminService.grantAchievement(memberId, {
                    id: achievementTitle.toLowerCase().replace(/\s+/g, '-'),
                    title: achievementTitle,
                    rewardXP: 0,
                    grantedAt: new Date().toISOString(),
                  }, user.uid),
                  `Achievement "${achievementTitle}" granted.`,
                )}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent/20 to-accent-alt/20 border border-accent/20 py-2.5 text-sm font-bold text-accent transition-all hover:from-accent/30 disabled:opacity-50"
              >
                <Award className="h-4 w-4" /> Grant Achievement
              </button>
            </div>
          )}
        </AdminPanel>

        {/* Badges */}
        <AdminPanel title="Grant Badge" icon={BadgePlus}>
          {loading ? <LoadingRows count={3} /> : (
            <div className="space-y-4">
              <MemberPicker members={members} value={memberId} onChange={setMemberId} />

              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-muted">Select Badge</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {SPECIALIZATIONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setBadge(s.id)}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-xs font-bold transition-all ${
                        badge === s.id
                          ? 'border-accent-alt/40 bg-accent-alt/10 text-accent-alt'
                          : 'border-border bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      <span className="text-base">{s.emoji || '🏷️'}</span>
                      <span className="truncate">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!badge}
                onClick={() => run(
                  () => AdminService.assignSpecialization(memberId, badge, user.uid),
                  `Badge "${badge}" granted.`,
                )}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-alt/20 to-accent/20 border border-accent-alt/20 py-2.5 text-sm font-bold text-accent-alt transition-all hover:from-accent-alt/30 disabled:opacity-50"
              >
                <BadgePlus className="h-4 w-4" /> Grant Badge
              </button>
            </div>
          )}
        </AdminPanel>
      </div>

      {/* XP Leaderboard Preview */}
      {!loading && members.length > 0 && (
        <AdminPanel title="XP Leaderboard Preview" icon={Trophy}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...members]
              .sort((a, b) => (b.xp || 0) - (a.xp || 0))
              .slice(0, 10)
              .map((m, i) => (
                <div
                  key={m.id}
                  onClick={() => setMemberId(m.id)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 transition-all hover:border-white/10 ${
                    m.id === memberId ? 'border-accent/40 bg-accent/5' : 'border-border bg-white/[0.02]'
                  }`}
                >
                  <span className={`shrink-0 font-heading text-sm font-black ${i < 3 ? 'text-status-warning' : 'text-text-muted'}`}>
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{m.displayName || m.username}</p>
                    <p className="text-xs text-accent">{(m.xp || 0).toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
          </div>
        </AdminPanel>
      )}
    </div>
  );
}

