import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Building2,
  CalendarDays,
  Check,
  FlaskConical,
  FolderKanban,
  Medal,
  Plus,
  Shield,
  Sparkles,
  Star,
  UserRound,
  X,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UsersService } from '../../services/firebase/users';
import { hasPermission } from '../../services/firebase/permissions';
import { getLevelProgress } from '../../services/firebase/gamification';
import { OrganizationService } from '../../services/firebase/organization';
import { UniverseService } from '../../services/firebase/universe';
import { PresenceService } from '../../services/realtime/presence';
import { DEFAULT_SKILLS } from '../../services/firebase/skills';
import { getSpecializationById } from '../../constants/specializations';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/UIElements';
import { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { MembershipService } from '../../services/firebase/membership';
import { PERMISSIONS } from '../../constants/permissions';

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Unknown';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatActivityDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Recently';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getInitials(profile) {
  const source = profile?.displayName || profile?.username || 'Member';
  return source
    .split(/\s|_/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'M';
}

function normalizeAchievements(profile) {
  const achievements = profile?.achievements || [];
  if (!Array.isArray(achievements)) return [];

  return achievements.map((achievement, index) => (
    typeof achievement === 'string'
      ? { id: achievement, title: achievement.replace(/-/g, ' ') }
      : { id: achievement.id || `achievement-${index}`, ...achievement }
  ));
}

function getStats(profile, activityCount) {
  const stats = profile?.stats || {};
  return [
    ['Tasks Completed', stats.tasksCompleted || stats.completedTasks || 0],
    ['Experiments', stats.experimentsCount || 0],
    ['Products', stats.productsCount || 0],
    ['Messages', stats.messagesSent || 0],
    ['Activity Logs', activityCount],
    ['Achievements', normalizeAchievements(profile).length || stats.achievementsEarned || 0],
  ];
}

function MembershipCard({ userId, role }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkMembership = async () => {
      try {
        const isMember = await MembershipService.isApprovedMember(userId);
        if (!isMember) {
          const app = await MembershipService.getUserApplication(userId);
          setApplication(app);
        }
      } catch (err) {
        console.error('Error checking membership:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [userId]);

  if (loading || PERMISSIONS.isApprovedMember(role)) return null;

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-purple-500/10 to-cyan-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Membership Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {application?.status === 'pending' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Application Pending</span>
            </div>
            <p className="text-sm text-text-soft">
              Your membership application is under review by leadership.
            </p>
          </div>
        ) : application?.status === 'rejected' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <X className="h-5 w-5" />
              <span className="font-semibold">Application Rejected</span>
            </div>
            <p className="text-sm text-text-soft">
              {application.reviewNotes || 'Your application was not approved at this time.'}
            </p>
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 text-accent hover:text-cyan-400 font-semibold text-sm"
            >
              Submit New Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-soft">
              You currently have a standard BeastBuck account. Apply for membership to access internal collaboration, projects, research labs, and member-only experiences.
            </p>
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-background font-bold hover:bg-cyan-300 transition-colors"
            >
              Apply for Membership
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ProfileHero({ profile, status }) {
  const state = status?.state || 'offline';
  const presenceColor = PresenceService.getPresenceColor(state);
  const presenceLabel = PresenceService.getPresenceLabel(state);

  return (
    <section className="rounded-2xl border border-border bg-surface/70 p-5 shadow-xl md:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-accent/30 bg-accent/10">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-accent">
              {getInitials(profile)}
            </div>
          )}
          <span className={`absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-surface ${presenceColor}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="break-words font-heading text-3xl font-bold text-white md:text-4xl">
              {profile.displayName || profile.username || 'BeastBuck Member'}
            </h1>
            <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-accent">
              {profile.role || 'Member'}
            </span>
          </div>
          <p className="mb-3 text-sm font-medium text-text-muted">@{profile.username || 'member'}</p>
          <div className="flex flex-wrap gap-3 text-sm text-text-soft">
            <span className="inline-flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${presenceColor}`} />
              {presenceLabel}
              {status?.activity ? ` · ${status.activity}` : ''}
            </span>
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-text-muted" />
              Joined {formatDate(profile.joinedAt)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function XPLevelCard({ profile }) {
  const xp = Number(profile.xp || 0);
  const progress = getLevelProgress(xp);
  const level = Math.max(Number(profile.level || 1), progress.level);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-accent" />
          XP & Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Current XP</p>
            <p className="mt-2 text-2xl font-bold text-white">{xp}</p>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Level</p>
            <p className="mt-2 text-2xl font-bold text-white">{level}</p>
          </div>
        </div>
        <div className="mb-2 flex justify-between text-xs text-text-muted">
          <span>Level {level}</span>
          <span>{progress.remainingXP} XP to next level</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-status-success transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SpecializationsCard({
  profile,
  specializations,
  canManage,
  managing,
  onAssign,
  onRemove,
}) {
  const assignedIds = Array.isArray(profile.specializations) ? profile.specializations : [];
  const assigned = assignedIds
    .map(id => specializations.find(item => item.id === id) || getSpecializationById(id))
    .filter(Boolean);
  const available = specializations.filter(item => !assignedIds.includes(item.id));

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Specializations
        </CardTitle>
        {canManage && (
          <span className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            <Shield className="h-3.5 w-3.5" />
            CEO Controls
          </span>
        )}
      </CardHeader>
      <CardContent>
        {assigned.length === 0 ? (
          <EmptyState 
            icon={Award} 
            title="No specializations assigned yet" 
            description="Specializations showcase your expertise in specific domains."
            compact={true}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {assigned.map(specialization => (
              <div key={specialization.id} className="rounded-xl border border-accent/20 bg-accent/10 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-bold text-white">{specialization.name}</h3>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => onRemove(specialization.id)}
                      disabled={managing}
                      className="rounded-lg p-1 text-text-muted transition hover:bg-status-danger/10 hover:text-status-danger disabled:opacity-50"
                      aria-label={`Remove ${specialization.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs leading-5 text-text-muted">{specialization.description}</p>
              </div>
            ))}
          </div>
        )}

        {canManage && available.length > 0 && (
          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">Assign specialization</p>
            <div className="flex flex-wrap gap-2">
              {available.map(specialization => (
                <button
                  key={specialization.id}
                  type="button"
                  onClick={() => onAssign(specialization.id)}
                  disabled={managing}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-2 text-sm font-semibold text-text-soft transition hover:border-accent/40 hover:text-white disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {specialization.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AchievementsCard({ profile }) {
  const achievements = normalizeAchievements(profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-accent" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-sm text-text-muted">
            Achievements will appear here when this member completes milestones.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map(achievement => (
              <div key={achievement.id} className="flex items-start gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
                <Medal className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold capitalize text-white">{achievement.title || achievement.name}</h3>
                  {achievement.description && (
                    <p className="mt-1 text-xs leading-5 text-text-muted">{achievement.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsCard({ profile, activityCount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-accent" />
          Contribution Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {getStats(profile, activityCount).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-white/[0.03] p-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs font-medium text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SkillExpertiseCard({ profile }) {
  const skillXp = profile.skillXp || {};
  const topSkills = Object.entries(skillXp)
    .map(([skillId, xp]) => ({
      skillId,
      xp: Number(xp || 0),
      skill: DEFAULT_SKILLS.find(item => item.id === skillId),
    }))
    .filter(item => item.skill)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  const expertise = (xp) => {
    if (xp >= 500) return 'Expert';
    if (xp >= 250) return 'Advanced';
    if (xp >= 100) return 'Builder';
    if (xp > 0) return 'Learner';
    return 'New';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-accent" />
          Skill XP & Expertise
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topSkills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-sm text-text-muted">
            Skill XP appears here when this member posts, shares resources, or completes skill challenges.
          </div>
        ) : (
          <div className="space-y-3">
            {topSkills.map(item => (
              <div key={item.skillId} className="rounded-xl border border-border bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-bold text-white">{item.skill.name}</span>
                  <span className="text-xs font-bold text-accent">{expertise(item.xp)}</span>
                </div>
                <div className="mb-1 flex justify-between text-xs text-text-muted">
                  <span>{item.xp} XP</span>
                  <span>{Math.min(100, Math.round((item.xp % 250) / 250 * 100))}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-status-success" style={{ width: `${Math.min(100, Math.round((item.xp % 250) / 250 * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AffiliationsCard({ affiliations }) {
  const departments = affiliations?.departments || [];
  const labs = affiliations?.labs || [];
  const projects = affiliations?.activeProjects || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-accent" />
          Organization Affiliations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <Building2 className="h-4 w-4 text-accent" />
            Departments
          </h3>
          {departments.length === 0 ? (
            <EmptyState 
              icon={Building2} 
              title="No department affiliation yet" 
              description="Join a department to collaborate with team members."
              compact={true}
            />
          ) : (
            <div className="space-y-2">
              {departments.map(department => <p key={department.id} className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-text-soft">{department.name}</p>)}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <FlaskConical className="h-4 w-4 text-accent" />
            Labs
          </h3>
          {labs.length === 0 ? (
            <EmptyState 
              icon={FlaskConical} 
              title="No lab affiliation yet" 
              description="Join a lab to work on research and innovation projects."
              compact={true}
            />
          ) : (
            <div className="space-y-2">
              {labs.map(lab => <p key={lab.id} className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-text-soft">{lab.name}</p>)}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <FolderKanban className="h-4 w-4 text-accent" />
            Active Projects
          </h3>
          {projects.length === 0 ? (
            <EmptyState 
              icon={FolderKanban} 
              title="No active projects yet" 
              description="Join a project to collaborate on meaningful work."
              compact={true}
            />
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project.id} className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-sm font-bold text-white">{project.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{project.status} / {project.progressPercent || 0}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ activity }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState 
            icon={Activity} 
            title="No recent profile activity yet" 
            description="Your activity will appear here as you engage with the platform."
            compact={true}
          />
        ) : (
          <div className="space-y-3">
            {activity.map(item => (
              <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Check className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold text-white">{item.title || item.type || 'Activity'}</h3>
                  {item.description && (
                    <p className="mt-1 break-words text-xs leading-5 text-text-muted">{item.description}</p>
                  )}
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {formatActivityDate(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { uid } = useParams();
  const [searchParams] = useSearchParams();
  const { user, roleData } = useAuth();
  const usernameParam = searchParams.get('username');
  const [resolvedUid, setResolvedUid] = useState(null);
  const profileUid = uid || resolvedUid || (!usernameParam ? user?.uid : null);
  const [profile, setProfile] = useState(null);
  const [presence, setPresence] = useState({ state: 'offline' });
  const [specializations, setSpecializations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [affiliations, setAffiliations] = useState({ departments: [], labs: [], activeProjects: [] });
  const [universeSummary, setUniverseSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managing, setManaging] = useState(false);
  const canManageMembers = hasPermission(roleData?.role, 'canManageMembers');

  const isOwnProfile = user?.uid === profileUid;
  const pageTitle = useMemo(() => {
    if (!profile) return 'Member Profile';
    return `${profile.displayName || profile.username || 'Member'}'s Profile`;
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    async function resolveUsername() {
      if (!usernameParam || uid) return;

      try {
        const nextUid = await UsersService.getUidForUsername(usernameParam);
        if (!cancelled) {
          setResolvedUid(nextUid);
          if (!nextUid) setLoading(false);
        }
      } catch (err) {
        console.error('Username profile lookup failed:', err);
        if (!cancelled) {
          setError('Could not find a profile for that username.');
          setLoading(false);
        }
      }
    }

    resolveUsername();

    return () => {
      cancelled = true;
    };
  }, [uid, usernameParam]);

  useEffect(() => {
    if (!profileUid) return undefined;

    const unsubscribe = UsersService.subscribeToUserProfile(profileUid, {
      onProfile: (nextProfile) => {
        setProfile(nextProfile);
        setLoading(false);
      },
      onError: (err) => {
        console.error('Profile listener failed:', err);
        setError('Could not load this profile. Check Firestore permissions and try again.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [profileUid]);

  useEffect(() => {
    if (!profileUid) return undefined;
    return UsersService.subscribeToPresence(profileUid, {
      onStatus: setPresence,
    });
  }, [profileUid]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileSupportData() {
      try {
        const [specializationResult, activityResult, affiliationResult] = await Promise.allSettled([
          UsersService.getSpecializations(),
          UsersService.getUserActivity(profileUid),
          OrganizationService.getMemberAffiliations(profileUid),
        ]);

        if (!cancelled) {
          if (specializationResult.status === 'fulfilled') {
            setSpecializations(specializationResult.value);
          }
          if (activityResult.status === 'fulfilled') {
            setActivity(activityResult.value);
          }
          if (affiliationResult.status === 'fulfilled') {
            setAffiliations(affiliationResult.value);
          }
        }
      } catch (err) {
        console.error('Profile support data failed:', err);
        if (!cancelled) setError('Some profile details could not be loaded.');
      }
    }

    if (profileUid) loadProfileSupportData();

    return () => {
      cancelled = true;
    };
  }, [profileUid]);

  useEffect(() => {
    if (!profileUid) return;
    let cancelled = false;
    Promise.all([
      UniverseService.getUniverseProfile(profileUid),
      UniverseService.getMemberJourney(profileUid),
      UniverseService.getMemberGoals(profileUid),
    ])
      .then(([profileData, journey, goals]) => {
        if (!cancelled) setUniverseSummary({ profile: profileData, journey, goals });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [profileUid]);

  useEffect(() => {
    if (!canManageMembers || !user?.uid) return;

    UsersService.seedDefaultSpecializations(user.uid).catch((err) => {
      console.error('Default specialization seed failed:', err);
    });
  }, [canManageMembers, user?.uid]);

  const assignSpecialization = async (specializationId) => {
    setManaging(true);
    setError(null);
    try {
      await UsersService.assignSpecialization(profileUid, specializationId);
    } catch (err) {
      console.error('Assign specialization failed:', err);
      setError('Specialization could not be assigned. CEO or Co-CEO access is required.');
    } finally {
      setManaging(false);
    }
  };

  const removeSpecialization = async (specializationId) => {
    setManaging(true);
    setError(null);
    try {
      await UsersService.removeSpecialization(profileUid, specializationId);
    } catch (err) {
      console.error('Remove specialization failed:', err);
      setError('Specialization could not be removed. CEO or Co-CEO access is required.');
    } finally {
      setManaging(false);
    }
  };

  if (!uid && !usernameParam && user?.uid) {
    return <Navigate to={`/profile/${user.uid}`} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center p-4 text-center">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <UserRound className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <h1 className="mb-2 text-2xl font-bold text-white">Profile not found</h1>
          <p className="text-sm text-text-muted">This member profile does not exist or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Identity</p>
        <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">{pageTitle}</h1>
        <p className="text-sm text-text-muted">
          {isOwnProfile ? 'Your BeastBuck identity, progress, and reputation.' : 'Member identity, progress, and reputation.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      <ProfileHero profile={profile} status={presence} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-5">
          <SpecializationsCard
            profile={profile}
            specializations={specializations}
            canManage={canManageMembers}
            managing={managing}
            onAssign={assignSpecialization}
            onRemove={removeSpecialization}
          />
          <AffiliationsCard affiliations={affiliations} />
          {universeSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Universe Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-text-soft">
                <p>
                  Journey milestones:{' '}
                  <span className="font-bold text-white">
                    {Object.keys(universeSummary.journey?.milestones || {}).length}
                  </span>
                </p>
                <p>
                  Active goals:{' '}
                  <span className="font-bold text-white">
                    {(universeSummary.goals || []).filter(g => g.status === 'ACTIVE').length}
                  </span>
                </p>
                {isOwnProfile && (
                  <a href="/universe" className="inline-block font-bold text-accent hover:underline">
                    Open Universe OS →
                  </a>
                )}
              </CardContent>
            </Card>
          )}
          <AchievementsCard profile={profile} />
          <ActivityFeed activity={activity} />
        </div>

        <aside className="space-y-5">
          {isOwnProfile && <MembershipCard userId={profileUid} role={profile.role} />}
          <XPLevelCard profile={profile} />
          <SkillExpertiseCard profile={profile} />
          <StatsCard profile={profile} activityCount={activity.length} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-accent" />
                Reputation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-text-soft">
                <div className="flex justify-between gap-3">
                  <span>Role</span>
                  <span className="font-bold text-white">{profile.role || 'Member'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Specializations</span>
                  <span className="font-bold text-white">{(profile.specializations || []).length}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Achievements</span>
                  <span className="font-bold text-white">{normalizeAchievements(profile).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
