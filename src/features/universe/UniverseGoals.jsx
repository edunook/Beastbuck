import { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UniverseService, UNIVERSE_GOAL_TYPES } from '../../services/firebase/universe';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function UniverseGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Learning');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user?.uid) return;
    setLoading(true);
    const list = await UniverseService.getMemberGoals(user.uid);
    setGoals(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const createGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !user?.uid) return;
    setSaving(true);
    await UniverseService.createMemberGoal(user.uid, { title: title.trim(), type });
    setTitle('');
    await load();
    setSaving(false);
  };

  const bumpProgress = async (goal) => {
    const next = Math.min(100, (goal.progress || 0) + 10);
    await UniverseService.updateMemberGoal(goal.id, {
      progress: next,
      status: next >= 100 ? 'COMPLETED' : 'ACTIVE',
    });
    await load();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Goals"
        description="Learning, research, project, innovation, and career goals — tracked across BeastBuck."
        action={<Target className="h-8 w-8 text-accent" />}
      />

      <SectionWrapper>
        <Card className="rounded-xl">
          <CardContent className="p-4">
            <form onSubmit={createGoal} className="grid gap-3 md:grid-cols-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Goal title..."
                className="md:col-span-2"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                {UNIVERSE_GOAL_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <Button type="submit" disabled={saving}>
                <Plus className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </form>
          </CardContent>
        </Card>
      </SectionWrapper>

      <SectionWrapper>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map(g => (
              <Card key={g.id} className="rounded-xl">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold text-accent">{g.type}</p>
                    <p className="font-bold text-white">{g.title}</p>
                    <p className="text-sm text-text-muted">{g.status} · {g.progress || 0}%</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${g.progress || 0}%` }}
                      />
                    </div>
                    {g.status === 'ACTIVE' && (
                      <Button size="sm" variant="secondary" onClick={() => bumpProgress(g)}>
                        +10%
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {goals.length === 0 && (
              <p className="text-center text-text-muted">Create your first goal above.</p>
            )}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
