import { useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BarChart3,
  Bell,
  CheckCircle2,
  FlaskConical,
  Gift,
  Medal,
  MessageSquareText,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  UserCog,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UsersService } from '../../services/firebase/users';
import { GamificationService, XP_REWARD_TYPES } from '../../services/firebase/gamification';
import { ExperimentsService } from '../../services/firebase/experiments';
import { ProductsService } from '../../services/firebase/products';
import { MembershipService } from '../../services/firebase/membership';
import { SPECIALIZATIONS } from '../../constants/specializations';

const metrics = [
  ['42', 'active members'],
  ['18', 'pending reviews'],
  ['124', 'tasks completed'],
  ['9', 'open applications'],
];

const queues = [
  {
    title: 'Membership Applications',
    detail: 'Review new applicants, approve members, and assign starter roles.',
    icon: UserCog,
  },
  {
    title: 'Content Moderation',
    detail: 'Check products, experiments, profile updates, and reported comments.',
    icon: ShieldCheck,
  },
  {
    title: 'Announcements',
    detail: 'Publish challenges, winner updates, company news, and team reminders.',
    icon: Bell,
  },
];

const actions = [
  'Promote members to LEADER or CO_CEO',
  'Approve experiment and marketplace submissions',
  'Award XP for missions and challenge wins',
  'Create teams and assign team leaders',
  'Review analytics for activity and growth',
];

export default function CEOPanel() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [products, setProducts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [bonusXP, setBonusXP] = useState(25);
  const [bonusReason, setBonusReason] = useState('CEO bonus XP');
  const [selectedAchievement, setSelectedAchievement] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedMember = useMemo(
    () => members.find(member => member.id === selectedMemberId),
    [members, selectedMemberId],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadControls() {
      try {
        if (user?.uid) await GamificationService.seedDefaultAchievements(user.uid);
        const [nextMembers, nextAchievements] = await Promise.all([
          UsersService.getAssignableMembers(),
          GamificationService.getAchievements(),
        ]);

        if (!cancelled) {
          setMembers(nextMembers);
          setAchievements(nextAchievements);
          setSelectedMemberId(nextMembers[0]?.id || '');
          setSelectedAchievement(nextAchievements[0]?.id || '');
          setSelectedBadge(SPECIALIZATIONS[0]?.id || '');
        }
      } catch (err) {
        console.error('CEO gamification controls failed:', err);
        if (!cancelled) setStatus('Could not load gamification controls.');
      }
    }

    loadControls();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    async function loadExperimentQueue() {
      try {
        const nextExperiments = await ExperimentsService.searchExperiments({ includeArchived: true });
        if (!cancelled) setExperiments(nextExperiments.slice(0, 8));
      } catch (err) {
        console.error('CEO experiment moderation queue failed:', err);
        if (!cancelled) setStatus('Could not load experiment moderation queue.');
      }
    }

    loadExperimentQueue();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadApplications() {
      try {
        const nextApplications = await MembershipService.getApplications();
        if (!cancelled) setApplications(nextApplications);
      } catch (err) {
        console.error('Membership applications failed:', err);
        if (!cancelled) setStatus('Could not load membership applications.');
      }
    }

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProductQueue() {
      try {
        const nextProducts = await ProductsService.searchProducts({ includeArchived: true });
        if (!cancelled) setProducts(nextProducts.slice(0, 8));
      } catch (err) {
        console.error('CEO product moderation queue failed:', err);
        if (!cancelled) setStatus('Could not load product moderation queue.');
      }
    }

    loadProductQueue();

    return () => {
      cancelled = true;
    };
  }, []);

  const runAction = async (action, successMessage) => {
    if (!selectedMemberId || busy) return;

    setBusy(true);
    setStatus('');
    try {
      await action();
      setStatus(successMessage);
    } catch (err) {
      console.error('CEO gamification action failed:', err);
      setStatus('Action failed. Check Firestore rules and try again.');
    } finally {
      setBusy(false);
    }
  };

  const awardBonusXP = () => runAction(
    () => GamificationService.awardXP({
      uid: selectedMemberId,
      amount: bonusXP,
      reason: bonusReason,
      sourceType: XP_REWARD_TYPES.CEO_BONUS,
      actorId: user.uid,
      metadata: { grantedFrom: 'CEO_PANEL' },
    }),
    `${bonusXP} XP awarded to ${selectedMember?.displayName || selectedMember?.username || 'member'}.`,
  );

  const grantAchievement = () => runAction(
    () => GamificationService.grantAchievement({
      uid: selectedMemberId,
      achievementId: selectedAchievement,
      actorId: user.uid,
    }),
    `Achievement granted to ${selectedMember?.displayName || selectedMember?.username || 'member'}.`,
  );

  const assignBadge = () => runAction(
    () => GamificationService.assignBadge(selectedMemberId, selectedBadge),
    `Badge assigned to ${selectedMember?.displayName || selectedMember?.username || 'member'}.`,
  );

  const moderateExperiment = async (experiment, action) => {
    setBusy(true);
    setStatus('');
    try {
      if (action === 'feature') {
        await ExperimentsService.featureExperiment(experiment.id, !experiment.featured);
      } else {
        await ExperimentsService.archiveExperiment(experiment.id);
      }

      const nextExperiments = await ExperimentsService.searchExperiments({ includeArchived: true });
      setExperiments(nextExperiments.slice(0, 8));
      setStatus(action === 'feature' ? 'Experiment feature status updated.' : 'Experiment archived.');
    } catch (err) {
      console.error('CEO experiment moderation failed:', err);
      setStatus('Experiment moderation failed. Check Firestore rules and try again.');
    } finally {
      setBusy(false);
    }
  };

  const moderateProduct = async (product, action) => {
    setBusy(true);
    setStatus('');
    try {
      if (action === 'feature') {
        await ProductsService.featureProduct(product.id, !product.featured);
      } else {
        await ProductsService.archiveProduct(product.id);
      }

      const nextProducts = await ProductsService.searchProducts({ includeArchived: true });
      setProducts(nextProducts.slice(0, 8));
      setStatus(action === 'feature' ? 'Product feature status updated.' : 'Product archived.');
    } catch (err) {
      console.error('CEO product moderation failed:', err);
      setStatus('Product moderation failed. Check Firestore rules and try again.');
    } finally {
      setBusy(false);
    }
  };

  const reviewApplication = async (application, nextStatus) => {
    setBusy(true);
    setStatus('');
    try {
      await MembershipService.reviewApplication(application.id, {
        status: nextStatus,
        reviewerId: user.uid,
        reviewNote: nextStatus === 'MORE_INFO' ? 'Please share more detail about your goals and how you want to contribute.' : '',
      });
      const nextApplications = await MembershipService.getApplications();
      setApplications(nextApplications);
      setStatus(`Application marked ${nextStatus}.`);
    } catch (err) {
      console.error('Membership review failed:', err);
      setStatus('Application review failed. Check permissions and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="CEO Control Center"
        description="Administration, moderation, applications, announcements, and analytics for BeastBuck leadership."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <BarChart3 className="h-6 w-6" />
          </div>
        }
      />

      <SectionWrapper>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([value, label]) => (
            <Card key={label} className="rounded-lg">
              <CardContent className="p-5">
                <div className="font-heading text-2xl font-black text-white">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4">
            {queues.map(({ title, detail, icon: Icon }) => (
              <Card key={title} className="rounded-lg">
                <CardContent className="flex gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-text-muted">{detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-accent" />
                Leadership Actions
              </CardTitle>
              <CardDescription>Core admin controls planned for MAIN_CEO and CO_CEO roles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {actions.map((action) => (
                <div key={action} className="flex items-center gap-3 rounded-lg border border-border bg-black/20 p-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-status-success" />
                  <span className="text-sm font-semibold text-text-soft">{action}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>

      <SectionWrapper title="Membership Review">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquareText className="h-5 w-5 text-accent" />
              Applications
            </CardTitle>
            <CardDescription>Approve, reject, or request more information from public membership applications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {applications.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">No membership applications yet.</p>
            ) : applications.map(application => (
              <div key={application.id} className="grid gap-3 rounded-xl border border-border bg-black/20 p-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{application.status}</span>
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">@{application.username}</span>
                    <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">Age {application.age}</span>
                  </div>
                  <h3 className="font-bold text-white">{application.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-muted">{application.motivation}</p>
                  <p className="mt-2 text-xs text-text-muted">Interests: {application.interests || 'Not listed'} / Skills: {application.skills || 'Not listed'}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">
                  <Button type="button" size="sm" disabled={busy || application.status === 'APPROVED'} onClick={() => reviewApplication(application, 'APPROVED')}>Approve</Button>
                  <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => reviewApplication(application, 'MORE_INFO')}>More Info</Button>
                  <Button type="button" size="sm" variant="danger" disabled={busy || application.status === 'REJECTED'} onClick={() => reviewApplication(application, 'REJECTED')}>Reject</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </SectionWrapper>

      <SectionWrapper title="Experiment Moderation">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FlaskConical className="h-5 w-5 text-accent" />
              Innovation Queue
            </CardTitle>
            <CardDescription>Feature standout experiments, archive unsafe or stale records, and review creator activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {experiments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">No experiments available for moderation.</p>
            ) : (
              experiments.map(experiment => (
                <div key={experiment.id} className="grid gap-3 rounded-xl border border-border bg-black/20 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{experiment.category || 'Experiment'}</span>
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{experiment.status || 'PLANNING'}</span>
                      {experiment.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
                    </div>
                    <h3 className="truncate font-bold text-white">{experiment.title || 'Untitled experiment'}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-muted">
                      {experiment.description || 'No description provided.'}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      By {experiment.authorName || experiment.authorUsername || 'Member'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => moderateExperiment(experiment, 'feature')}>
                      <Star className="mr-2 h-4 w-4" />{experiment.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button type="button" size="sm" variant="danger" disabled={busy || experiment.status === 'ARCHIVED'} onClick={() => moderateExperiment(experiment, 'archive')}>
                      <Archive className="mr-2 h-4 w-4" />Archive
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </SectionWrapper>

      <SectionWrapper title="Product Moderation">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-accent" />
              Marketplace Queue
            </CardTitle>
            <CardDescription>Feature standout products, archive inappropriate listings, and review marketplace activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {products.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">No products available for moderation.</p>
            ) : (
              products.map(product => (
                <div key={product.id} className="grid gap-3 rounded-xl border border-border bg-black/20 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent">{product.category || 'Product'}</span>
                      <span className="rounded-lg bg-white/5 px-2 py-1 text-xs font-bold text-text-muted">{product.status || 'DRAFT'}</span>
                      {product.featured && <span className="rounded-lg bg-status-warning/10 px-2 py-1 text-xs font-bold text-status-warning">Featured</span>}
                    </div>
                    <h3 className="truncate font-bold text-white">{product.title || 'Untitled product'}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-muted">
                      {product.description || 'No description provided.'}
                    </p>
                    <p className="mt-2 text-xs text-text-muted">
                      By {product.creatorName || product.creatorUsername || 'Member'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => moderateProduct(product, 'feature')}>
                      <Star className="mr-2 h-4 w-4" />{product.featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button type="button" size="sm" variant="danger" disabled={busy || product.status === 'ARCHIVED'} onClick={() => moderateProduct(product, 'archive')}>
                      <Archive className="mr-2 h-4 w-4" />Archive
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </SectionWrapper>

      <SectionWrapper title="XP, Achievements, and Badges">
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-accent" />
              Reputation Controls
            </CardTitle>
            <CardDescription>Bonus XP, achievement grants, and visible profile badges for members.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            {status && (
              <div className="rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">
                {status}
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_14rem]">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-muted">Member</span>
                <select
                  value={selectedMemberId}
                  onChange={(event) => setSelectedMemberId(event.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-accent"
                >
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.displayName || member.username} · {member.role}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-xl border border-border bg-white/[0.03] p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Current XP</p>
                <p className="mt-1 text-xl font-black text-white">{selectedMember?.xp || 0}</p>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <div className="rounded-xl border border-border bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-accent" />
                  <h3 className="font-bold text-white">Bonus XP</h3>
                </div>
                <div className="space-y-3">
                  <Input
                    type="number"
                    min="1"
                    max="5000"
                    value={bonusXP}
                    onChange={(event) => setBonusXP(event.target.value)}
                    aria-label="Bonus XP amount"
                  />
                  <Input
                    value={bonusReason}
                    onChange={(event) => setBonusReason(event.target.value)}
                    aria-label="Bonus XP reason"
                  />
                  <Button type="button" size="sm" className="w-full" disabled={busy || !selectedMemberId} onClick={awardBonusXP}>
                    Award XP
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Medal className="h-4 w-4 text-accent" />
                  <h3 className="font-bold text-white">Achievement</h3>
                </div>
                <div className="space-y-3">
                  <select
                    value={selectedAchievement}
                    onChange={(event) => setSelectedAchievement(event.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-accent"
                  >
                    {achievements.map(achievement => (
                      <option key={achievement.id} value={achievement.id}>
                        {achievement.title} · {achievement.rewardXP || 0} XP
                      </option>
                    ))}
                  </select>
                  <Button type="button" size="sm" className="w-full" disabled={busy || !selectedAchievement} onClick={grantAchievement}>
                    Grant Achievement
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="font-bold text-white">Badge</h3>
                </div>
                <div className="space-y-3">
                  <select
                    value={selectedBadge}
                    onChange={(event) => setSelectedBadge(event.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none transition focus:ring-2 focus:ring-accent"
                  >
                    {SPECIALIZATIONS.map(badge => (
                      <option key={badge.id} value={badge.id}>
                        {badge.name}
                      </option>
                    ))}
                  </select>
                  <Button type="button" size="sm" className="w-full" disabled={busy || !selectedBadge} onClick={assignBadge}>
                    Assign Badge
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </SectionWrapper>
    </PageContainer>
  );
}
