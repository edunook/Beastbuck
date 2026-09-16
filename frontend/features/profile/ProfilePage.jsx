import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
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
  Globe,
  GraduationCap,
  MapPin,
  Medal,
  Plus,
  Shield,
  Share2,
  Sparkles,
  Star,
  UserRound,
  X,
  Zap,
  ArrowRight,
  Edit,
  TrendingUp,
  Download,
  Lock,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  Crown,
  Code,
  LogOut,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { AuthService } from '@services/auth/auth';
import { UsersService } from '@services/firestore/users';
import { PortfolioService } from '@services/firestore/portfolio';
import { normalizeMediaUrl } from '@services/storage/b2Client';
import { hasPermission, PERMISSIONS } from '@shared/permissions/permissions';
import { getLevelProgress } from '@services/firestore/gamification';
import { OrganizationService } from '@services/firestore/organization';
import { UniverseService } from '@services/firestore/universe';
import { PresenceService } from '@services/realtime/presence';
import { DEFAULT_SKILLS } from '@services/firestore/skills';
import { getSpecializationById } from '@shared/constants/specializations';
import { ROLES } from '@shared/constants/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { CardSkeleton } from '@frontend/components/ui/Skeleton';
import EmptyState from '@frontend/components/ui/EmptyState';
import { MembershipService } from '@services/firestore/membership';

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Unknown';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
import { THEME_TEMPLATES, resolveTheme, getThemeBackgroundStyle } from '@shared/constants/themes';

function getThemeById(themeId, customTheme = null) {
  return resolveTheme(themeId, customTheme);
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

function getVerificationHalo(role, badges) {
  if (role === ROLES.MAIN_CEO) {
    return {
      color: '#ffd700',
      glow: '0 0 20px rgba(255, 215, 0, 0.6)',
      label: 'CEO'
    };
  }
  if (role === ROLES.CO_CEO) {
    return {
      color: '#c0c0c0',
      glow: '0 0 20px rgba(192, 192, 192, 0.6)',
      label: 'Co-CEO'
    };
  }
  if (badges?.includes('mentor')) {
    return {
      color: '#00ff87',
      glow: '0 0 20px rgba(0, 255, 135, 0.6)',
      label: 'Mentor'
    };
  }
  if (badges?.includes('innovator')) {
    return {
      color: '#ff6b6b',
      glow: '0 0 20px rgba(255, 107, 107, 0.6)',
      label: 'Innovator'
    };
  }
  return null;
}

// Portfolio Helper Components
function StatCard({ icon: Icon, label, value, theme }) {
  return (
    <div
      className="rounded-2xl border p-6 transition-all hover:scale-105"
      style={{
        borderColor: `${theme.accentColor}40`,
        background: theme.cardBg || 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <Icon className="mb-3 h-6 w-6" style={{ color: theme.accentColor }} />
      <div className="text-2xl font-black" style={{ color: theme.textColor }}>{value}</div>
      <div className="text-sm font-bold" style={{ color: theme.textColor }}>{label}</div>
    </div>
  );
}

function QuickInfoCard({ icon: Icon, label, value, theme }) {
  return (
    <div
      className="rounded-xl border p-4 transition-all hover:scale-105"
      style={{
        borderColor: `${theme.accentColor}40`,
        background: theme.cardBg || 'rgba(255, 255, 255, 0.05)'
      }}
    >
      <Icon className="mb-2 h-5 w-5" style={{ color: theme.accentColor }} />
      <div className="text-lg font-black" style={{ color: theme.textColor }}>{value}</div>
      <div className="text-xs font-bold opacity-70" style={{ color: theme.textColor }}>{label}</div>
    </div>
  );
}

function PortfolioSection({ title, icon: Icon, items, theme }) {
  return (
    <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg || 'rgba(255, 255, 255, 0.05)' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
          <Icon className="h-5 w-5" style={{ color: theme.accentColor }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {items?.slice(0, 4).map((item, index) => (
            <div
              key={index}
              className="rounded-xl border p-4 transition-all hover:scale-105"
              style={{ borderColor: `${theme.accentColor}40` }}
            >
              <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>{item.title || item.name}</h3>
              <p className="text-sm line-clamp-2" style={{ color: theme.textColor }}>{item.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
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

function CustomSectionsCard({ profile, theme }) {
  const customSections = profile?.customSections || [];

  if (customSections.length === 0) return null;

  return (
    <Card className="border-2 animate-scale-in" style={{ borderColor: theme.accentColor, animationDelay: '0.1s' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: theme.textColor }}>
          <Sparkles className="h-5 w-5" style={{ color: theme.accentColor }} />
          Custom Sections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customSections.map((section, index) => (
          <div
            key={index}
            className="rounded-xl border p-4 transition-all hover:scale-[1.02]"
            style={{
              borderColor: `${theme.accentColor}30`,
              background: `${theme.accentColor}10`
            }}
          >
            <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>
              {section.title}
            </h3>
            <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
              {section.content}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EducationInterestsCard({ profile, theme }) {
  const education = profile?.education;
  const interests = profile?.interests;

  if (!education && !interests) return null;

  return (
    <Card className="border-2 animate-scale-in" style={{ borderColor: theme.accentColor, animationDelay: '0.15s' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: theme.textColor }}>
          <GraduationCap className="h-5 w-5" style={{ color: theme.accentColor }} />
          Education & Interests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {education && (
          <div>
            <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Education</h3>
            <p className="text-sm opacity-80" style={{ color: theme.textColor }}>{education}</p>
          </div>
        )}
        {interests && (
          <div>
            <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.split(',').map((interest, index) => (
                <span
                  key={index}
                  className="rounded-lg px-3 py-1 text-xs font-bold transition-all hover:scale-105"
                  style={{
                    background: `${theme.accentColor}20`,
                    color: theme.accentColor,
                    border: `1px solid ${theme.accentColor}40`
                  }}
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShareActions({ profile, theme }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${profile.displayName || profile.username}'s profile on BeastBuck!`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName || profile.username}'s Profile`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all hover:scale-105"
        style={{
          borderColor: theme.accentColor,
          background: `${theme.accentColor}20`,
          color: theme.accentColor
        }}
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all hover:scale-105"
        style={{
          borderColor: theme.accentColor,
          background: `${theme.accentColor}20`,
          color: theme.accentColor
        }}
      >
        <Edit className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}

function ProfileHero({ profile, status, isOwnProfile }) {
  const state = status?.state || 'offline';
  const presenceColor = PresenceService.getPresenceColor(state);
  const presenceLabel = PresenceService.getPresenceLabel(state);
  const theme = getThemeById(profile?.theme, profile?.customTheme);

  return (
    <section
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 p-6 sm:p-8 md:p-12 shadow-2xl md:p-6 animate-scale-in"
      style={{
        ...getThemeBackgroundStyle(theme.background),
        borderColor: theme.accentColor,
        color: theme.textColor,
        animationDelay: '0s'
      }}
    >
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.accentColor }} />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.accentColor }} />

      <div className="relative flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-center md:flex-row md:items-center w-full">
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border-4 shadow-2xl transition-all duration-300 hover:scale-105" style={{ borderColor: theme.accentColor }}>
            {profile.photoURL || profile.avatar ? (
              <>
                <img
                  src={normalizeMediaUrl(profile.photoURL || profile.avatar)}
                  alt={`Avatar of ${profile.displayName || profile.username}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden h-full w-full items-center justify-center text-4xl sm:text-5xl md:text-6xl font-black" style={{ color: theme.accentColor }}>
                  {getInitials(profile)}
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl sm:text-5xl md:text-6xl font-black" style={{ color: theme.accentColor }}>
                {getInitials(profile)}
              </div>
            )}
            <span className={`absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 ${presenceColor}`} style={{ borderColor: theme.textColor }} />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="break-words font-heading text-3xl sm:text-4xl md:text-5xl font-black">
                {profile.displayName || profile.username || 'BeastBuck Member'}
              </h1>
              <span className="rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg" style={{
                background: `${theme.accentColor}30`,
                color: theme.accentColor,
                border: `1px solid ${theme.accentColor}`
              }}>
                {profile.role || 'Member'}
              </span>
            </div>
            <p className="mb-3 text-base sm:text-lg font-medium opacity-90">@{profile.username || 'member'}</p>

            {profile.bio && (
              <p className="mb-4 text-sm sm:text-base opacity-80 line-clamp-2 sm:line-clamp-3">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm opacity-70 sm:justify-start">
              <span className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${presenceColor}`} />
                {presenceLabel}
                {status?.activity ? ` · ${status.activity}` : ''}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Joined {formatDate(profile.joinedAt)}
              </span>
              {profile.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
            </div>

            {(profile.website || profile.company) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors hover:scale-105"
                    style={{
                      background: `${theme.accentColor}20`,
                      color: theme.accentColor,
                      border: `1px solid ${theme.accentColor}40`
                    }}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                {profile.company && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all hover:scale-105" style={{
                    background: `${theme.accentColor}20`,
                    color: theme.accentColor
                  }}>
                    <Building2 className="h-3.5 w-3.5" />
                    {profile.company}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <ShareActions profile={profile} theme={theme} />
          {(isOwnProfile || canManageMembers) && (
            <Link
              to={`/profile/${profile.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm sm:text-base font-bold transition-all hover:scale-105 shadow-lg"
              style={{
                borderColor: theme.accentColor,
                background: `${theme.accentColor}30`,
                color: theme.accentColor
              }}
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
              {isOwnProfile ? 'Edit Profile' : 'Manage Profile'}
            </Link>
          )}
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
  const navigate = useNavigate();
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
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managing, setManaging] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const canManageMembers = hasPermission(roleData?.role, 'canManageMembers');

  const isOwnProfile = user?.uid === profileUid;
  const profileTheme = useMemo(() => getThemeById(profile?.theme || 'default', profile?.customTheme), [profile?.theme, profile?.customTheme]);

  const expectedUsername = useMemo(() => {
    return (
      roleData?.username ||
      (isOwnProfile ? profile?.username : null) ||
      user?.displayName ||
      user?.email?.split('@')[0] ||
      'user'
    ).trim();
  }, [roleData?.username, isOwnProfile, profile?.username, user?.displayName, user?.email]);

  const isMatch = useMemo(() => {
    const input = confirmUsername.trim().replace(/^@/, '').toLowerCase();
    const target = expectedUsername.trim().replace(/^@/, '').toLowerCase();
    return input.length > 0 && input === target;
  }, [confirmUsername, expectedUsername]);

  useEffect(() => {
    if (!showSignOutModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSigningOut) {
        setShowSignOutModal(false);
        setConfirmUsername('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSignOutModal, isSigningOut]);

  useEffect(() => {
    if (showSignOutModal) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [showSignOutModal]);

  const handleSignOut = async () => {
    if (!isMatch || isSigningOut) return;
    setIsSigningOut(true);
    try {
      if (user?.uid) {
        try {
          await PresenceService.updateStatus(user.uid, 'offline');
        } catch (err) {
          console.warn('Presence status update failed:', err);
        }
      }
      await AuthService.logOut();
      navigate('/signin');
    } catch (err) {
      console.error('Sign out failed:', err);
      setIsSigningOut(false);
    }
  };

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
      .catch(() => { });
    return () => { cancelled = true; };
  }, [profileUid]);

  useEffect(() => {
    if (!profileUid || !profile) return;
    let cancelled = false;

    // Build portfolio data from profile and already-loaded data
    // This avoids complex queries that cause permission/index errors
    const buildPortfolioData = () => {
      if (!cancelled) {
        setPortfolioData({
          profile: profile,
          stats: {
            projectsJoined: affiliations?.activeProjects?.length || 0,
            researchProjectsCount: 0,
            achievementsEarned: normalizeAchievements(profile).length,
            impact: profile?.stats?.impact || 0,
            level: profile?.level || 1,
            totalXP: profile?.xp || 0
          },
          projects: affiliations?.activeProjects || [],
          researchProjects: [],
          achievements: normalizeAchievements(profile)
        });
      }
    };

    buildPortfolioData();
    return () => { cancelled = true; };
  }, [profileUid, profile, affiliations]);

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
    <div className="min-h-screen bg-background">
      {/* Portfolio Cover Section with Dynamic Styling */}
      <section
        className="relative overflow-hidden border-b-2 p-8 md:p-12 lg:p-16 transition-all duration-500"
        style={{
          ...getThemeBackgroundStyle(profileTheme.background),
          borderColor: profileTheme.accentColor,
          color: profileTheme.textColor
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full opacity-30 blur-3xl transition-all duration-700 animate-pulse" style={{ background: profileTheme.accentColor }} />
        <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full opacity-30 blur-3xl transition-all duration-700 animate-pulse" style={{ background: profileTheme.accentColor }} />

        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Avatar with Glowing Halo */}
            <div className="flex items-center gap-6">
              <div
                className="relative h-32 w-32 md:h-40 md:w-40 shrink-0 overflow-hidden rounded-2xl border-4 shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: profileTheme.accentColor,
                  boxShadow: getVerificationHalo(profile?.role, profile?.badges)?.glow || 'none'
                }}
              >
                {profile.photoURL || profile.avatar ? (
                  <>
                    <img
                      src={normalizeMediaUrl(profile.photoURL || profile.avatar)}
                      alt={profile.displayName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden h-full w-full items-center justify-center text-4xl font-black" style={{ color: profileTheme.accentColor }}>
                      {profile.displayName?.[0] || 'M'}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-black" style={{ color: profileTheme.accentColor }}>
                    {profile.displayName?.[0] || 'M'}
                  </div>
                )}
                <span className={`absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 ${PresenceService.getPresenceColor(presence?.state || 'offline')}`} style={{ borderColor: profileTheme.textColor }} />
                {getVerificationHalo(profile?.role, profile?.badges) && (
                  <div className="absolute -top-2 -right-2 rounded-full p-2" style={{ background: getVerificationHalo(profile?.role, profile?.badges)?.color }}>
                    <Crown className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-heading text-3xl font-black md:text-4xl lg:text-5xl">
                  {profile.displayName || profile.username}
                </h1>
                <p className="mt-2 text-lg opacity-80">@{profile.username}</p>
                <div className="mt-2 flex items-center gap-2 opacity-70">
                  <span className={`h-2.5 w-2.5 rounded-full ${PresenceService.getPresenceColor(presence?.state || 'offline')}`} />
                  <span className="text-sm">{PresenceService.getPresenceLabel(presence?.state || 'offline')}</span>
                  {presence?.activity && <span className="text-sm"> · {presence.activity}</span>}
                </div>
                {getVerificationHalo(profile?.role, profile?.badges) && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold" style={{ background: `${getVerificationHalo(profile?.role, profile?.badges)?.color}30`, color: getVerificationHalo(profile?.role, profile?.badges)?.color }}>
                    <Shield className="h-4 w-4" />
                    {getVerificationHalo(profile?.role, profile?.badges)?.label}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {isOwnProfile && (
                <Link
                  to={`/profile/${profile.uid}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border-2 px-3 sm:px-4 py-2 text-sm sm:text-base font-bold transition-all hover:scale-105"
                  style={{
                    borderColor: profileTheme.accentColor,
                    background: `${profileTheme.accentColor}20`,
                    color: profileTheme.accentColor
                  }}
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit Portfolio</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedShare(true);
                  setTimeout(() => setCopiedShare(false), 2000);
                }}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-3 sm:px-4 py-2 text-sm sm:text-base font-bold transition-all hover:scale-105 cursor-pointer"
                style={{
                  borderColor: profileTheme.accentColor,
                  background: `${profileTheme.accentColor}20`,
                  color: profileTheme.accentColor
                }}
                title="Share profile link"
              >
                {copiedShare ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
                <span>{copiedShare ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Content - Show user's own data */}
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        {/* Quick Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickInfoCard
            icon={Briefcase}
            label="Role"
            value={profile?.role || 'Member'}
            theme={profileTheme}
          />
          <QuickInfoCard
            icon={GraduationCap}
            label="Level"
            value={`Level ${portfolioData?.stats?.level || profile?.level || 1}`}
            theme={profileTheme}
          />
          <QuickInfoCard
            icon={Star}
            label="Total XP"
            value={portfolioData?.stats?.totalXP || profile?.xp || 0}
            theme={profileTheme}
          />
          <QuickInfoCard
            icon={Zap}
            label="Impact"
            value={portfolioData?.stats?.impact || profile?.stats?.impact || 0}
            theme={profileTheme}
          />
        </div>

        {/* Skills Section */}
        {specializations?.length > 0 && (
          <Card style={{ borderColor: `${profileTheme.accentColor}40`, background: profileTheme.cardBg || 'rgba(255, 255, 255, 0.05)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: profileTheme.textColor }}>
                <Code className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="rounded-full px-4 py-2 text-sm font-bold transition-all hover:scale-105"
                    style={{
                      background: `${profileTheme.accentColor}20`,
                      color: profileTheme.accentColor,
                      border: `1px solid ${profileTheme.accentColor}40`
                    }}
                  >
                    {spec.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            label="Projects"
            value={portfolioData?.stats?.projectsJoined || affiliations?.activeProjects?.length || 0}
            theme={profileTheme}
          />
          <StatCard
            icon={FlaskConical}
            label="Research"
            value={portfolioData?.stats?.researchProjectsCount || 0}
            theme={profileTheme}
          />
          <StatCard
            icon={Award}
            label="Achievements"
            value={portfolioData?.stats?.achievementsEarned || normalizeAchievements(profile).length}
            theme={profileTheme}
          />
          <StatCard
            icon={TrendingUp}
            label="Impact Score"
            value={portfolioData?.stats?.impact || profile?.stats?.impact || 0}
            theme={profileTheme}
          />
        </div>

        {/* Projects Section */}
        {portfolioData?.projects?.length > 0 && (
          <PortfolioSection
            title="Featured Projects"
            icon={FolderKanban}
            items={portfolioData.projects}
            theme={profileTheme}
          />
        )}

        {/* Research Section */}
        {portfolioData?.researchProjects?.length > 0 && (
          <PortfolioSection
            title="Research Papers"
            icon={FlaskConical}
            items={portfolioData.researchProjects}
            theme={profileTheme}
          />
        )}

        {/* Achievements Section */}
        {portfolioData?.achievements?.length > 0 && (
          <PortfolioSection
            title="Achievements"
            icon={Award}
            items={portfolioData.achievements}
            theme={profileTheme}
          />
        )}

        {/* Contact Section */}
        <Card style={{ borderColor: `${profileTheme.accentColor}40`, background: profileTheme.cardBg || 'rgba(255, 255, 255, 0.05)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: profileTheme.textColor }}>
              <Mail className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile?.email && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${profileTheme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${profileTheme.accentColor}20` }}>
                    <Mail className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: profileTheme.textColor }}>{profile.email}</span>
                </div>
              )}
              {profile?.phoneNumber && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${profileTheme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${profileTheme.accentColor}20` }}>
                    <Phone className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: profileTheme.textColor }}>{profile.phoneNumber}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${profileTheme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${profileTheme.accentColor}20` }}>
                    <MapPin className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: profileTheme.textColor }}>{profile.location}</span>
                </div>
              )}
              {profile?.education && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${profileTheme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${profileTheme.accentColor}20` }}>
                    <GraduationCap className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: profileTheme.textColor }}>{profile.education}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Education & Interests Section */}
        {(profile?.education || profile?.interests) && (
          <Card style={{ borderColor: `${profileTheme.accentColor}40`, background: profileTheme.cardBg || 'rgba(255, 255, 255, 0.05)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: profileTheme.textColor }}>
                <GraduationCap className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
                Education & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.education && (
                <div>
                  <h3 className="mb-2 font-bold" style={{ color: profileTheme.textColor }}>Education</h3>
                  <p className="text-sm opacity-80" style={{ color: profileTheme.textColor }}>{profile.education}</p>
                </div>
              )}
              {profile?.interests && (
                <div>
                  <h3 className="mb-2 font-bold" style={{ color: profileTheme.textColor }}>Interests</h3>
                  <p className="text-sm opacity-80" style={{ color: profileTheme.textColor }}>{profile.interests}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Feed */}
        {activity?.length > 0 && (
          <Card style={{ borderColor: `${profileTheme.accentColor}40`, background: profileTheme.cardBg || 'rgba(255, 255, 255, 0.05)' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: profileTheme.textColor }}>
                <Activity className="h-5 w-5" style={{ color: profileTheme.accentColor }} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activity.slice(0, 10).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-all hover:scale-[1.01]"
                    style={{ borderColor: `${profileTheme.accentColor}40` }}
                  >
                    <div className="rounded-lg p-2" style={{ background: `${profileTheme.accentColor}20` }}>
                      <Activity className="h-4 w-4" style={{ color: profileTheme.accentColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: profileTheme.textColor }}>{activity.type}</p>
                      <p className="text-xs opacity-70" style={{ color: profileTheme.textColor }}>
                        {activity.timestamp?.toDate?.()?.toLocaleString() || 'Unknown time'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Session / Sign Out Section - At the very bottom of the profile page */}
        {user && (
          <div className="pt-8 pb-4 border-t border-border/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-950/15 via-surface to-surface backdrop-blur-md shadow-lg transition-all hover:border-rose-500/30">
              <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-inner">
                  <LogOut className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Account Session</h3>
                  <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                    Signed in as <span className="font-mono text-rose-300 font-semibold">@{expectedUsername}</span> · Ready to end your session?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConfirmUsername('');
                  setShowSignOutModal(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-rose-500/40 bg-rose-500/15 px-6 py-2.5 text-sm sm:text-base font-bold text-rose-400 transition-all hover:scale-105 hover:bg-rose-500/25 hover:border-rose-400 active:scale-95 shadow-md shadow-rose-950/30 min-h-[44px] cursor-pointer"
                title="Sign out of your account"
                aria-label="Sign Out"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md transition-all animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSigningOut) {
              setShowSignOutModal(false);
              setConfirmUsername('');
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-modal-title"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/30 bg-[#0c0c14] p-5 sm:p-6 shadow-2xl shadow-black/80 text-white animate-in zoom-in-95 duration-200">
            {/* Ambient subtle glow effect */}
            <div className="pointer-events-none absolute -top-20 -left-20 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-rose-600/15 blur-3xl" />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-inner">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h3 id="signout-modal-title" className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Confirm Sign Out
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    Security confirmation required
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSigningOut}
                onClick={() => {
                  setShowSignOutModal(false);
                  setConfirmUsername('');
                }}
                className="rounded-lg p-2 text-text-muted hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="relative mt-4 space-y-4">
              <p className="text-xs sm:text-sm text-text-soft leading-relaxed">
                To prevent accidental sign-outs, please type your username below to confirm you want to log out.
              </p>

              {/* Username Display Badge */}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-surface/80 px-3.5 py-2.5">
                <span className="text-xs text-text-muted font-medium">Your username:</span>
                <span className="font-mono text-xs sm:text-sm font-bold text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2.5 py-1 rounded-lg select-all">
                  @{expectedUsername}
                </span>
              </div>

              {/* Verification Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signout-confirm-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-muted"
                >
                  Type <span className="text-rose-400 font-mono font-bold">@{expectedUsername}</span> to confirm
                </label>
                <div className="relative">
                  <input
                    id="signout-confirm-input"
                    type="text"
                    autoFocus
                    disabled={isSigningOut}
                    value={confirmUsername}
                    onChange={(e) => setConfirmUsername(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isMatch && !isSigningOut) {
                        e.preventDefault();
                        handleSignOut();
                      }
                    }}
                    placeholder={`Type ${expectedUsername}`}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm sm:text-base text-white placeholder:text-text-muted/40 outline-none transition-all duration-200 bg-black/40 ${confirmUsername.length === 0
                        ? 'border-border focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                        : isMatch
                          ? 'border-emerald-500/80 bg-emerald-950/20 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30'
                          : 'border-rose-500/70 bg-rose-950/20 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                      }`}
                  />
                  {confirmUsername.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {isMatch ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Status validation message */}
                <div className="min-h-[20px] pt-1">
                  {confirmUsername.length === 0 ? (
                    <p className="text-[11px] sm:text-xs text-text-muted/70">
                      The sign out button activates once your username matches.
                    </p>
                  ) : isMatch ? (
                    <p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-400">
                      <Check className="h-3.5 w-3.5" /> Identity verified. Ready to sign out.
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-rose-400">
                      <AlertTriangle className="h-3.5 w-3.5" /> Username doesn't match yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="relative mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={isSigningOut}
                onClick={() => {
                  setShowSignOutModal(false);
                  setConfirmUsername('');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-200 text-text font-semibold text-sm transition-all min-h-[44px] flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!isMatch || isSigningOut}
                onClick={handleSignOut}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] shadow-lg ${isMatch && !isSigningOut
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 active:scale-95 cursor-pointer'
                    : 'bg-rose-950/40 text-rose-300/40 border border-rose-900/30 cursor-not-allowed opacity-50'
                  }`}
              >
                {isSigningOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
