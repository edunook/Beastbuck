import { useEffect, useState } from 'react';
import { Atom, BookOpen, BriefcaseBusiness, GraduationCap, Users } from 'lucide-react';
import { UniverseService } from '@services/firestore/universe';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function UniverseAnalytics() {
  const { user } = useAuth();
  const [snapshots, setSnapshots] = useState([]);
  const [orgIntel, setOrgIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [snaps, intel] = await Promise.all([
          UniverseService.getUniverseAnalytics(14),
          UniverseService.getOrganizationIntelligence(),
        ]);
        setSnapshots(snaps);
        setOrgIntel(intel);
      } catch (err) {
        console.error('Universe analytics failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const latest = snapshots[snapshots.length - 1];

  const refresh = async () => {
    setBusy(true);
    await UniverseService.generateUniverseAnalytics(user.uid);
    const snaps = await UniverseService.getUniverseAnalytics(14);
    setSnapshots(snaps);
    setBusy(false);
  };

  if (loading) {
    return <p className="text-text-muted">Loading universe analytics...</p>;
  }

  const metrics = [
    { label: 'Knowledge Growth', value: latest?.knowledgeGrowth ?? 0, icon: BookOpen },
    { label: 'Learning Growth', value: latest?.learningGrowth ?? 0, icon: GraduationCap },
    { label: 'Innovation Growth', value: latest?.innovationGrowth ?? 0, icon: Atom },
    { label: 'Community Growth', value: latest?.communityGrowth ?? 0, icon: Users },
    { label: 'Venture Growth', value: latest?.ventureGrowth ?? 0, icon: BriefcaseBusiness },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-black text-white">Universe Analytics</h2>
          <p className="text-sm text-text-muted">Cross-system growth and organization intelligence.</p>
        </div>
        <Button size="sm" onClick={refresh} disabled={busy}>
          {busy ? 'Refreshing...' : 'Refresh Snapshot'}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="rounded-xl">
            <CardContent className="p-4">
              <Icon className="mb-2 h-5 w-5 text-accent" />
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {orgIntel && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <h3 className="mb-4 font-bold text-white">Skill Map</h3>
              <div className="flex flex-wrap gap-2">
                {orgIntel.skillMap.map(({ skill, count }) => (
                  <span
                    key={skill}
                    className="rounded-lg bg-accent/10 px-3 py-1 text-xs font-bold text-accent"
                  >
                    {skill} ({count})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4">
              <h3 className="mb-4 font-bold text-white">Talent Discovery</h3>
              <ul className="space-y-2">
                {orgIntel.talentPool.map(m => (
                  <li key={m.id} className="flex justify-between text-sm">
                    <span className="text-white">{m.name}</span>
                    <span className="text-accent">{m.xp} XP</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
