import { useEffect, useMemo, useState } from 'react';
import { FlaskConical, Medal, Package, Trophy, CheckSquare, GraduationCap, BookOpen, Users, Brain, Network, PackageOpen, Palette, FileText, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import { GamificationService } from '@services/firestore/gamification';

const BOARDS = [
  { id: 'xp', label: 'Top XP', icon: Trophy, metric: 'XP' },
  { id: 'experiments', label: 'Top Scientist', icon: FlaskConical, metric: 'experiments' },
  { id: 'products', label: 'Top Inventor', icon: Package, metric: 'products' },
  { id: 'tasks', label: 'Top Contributor', icon: CheckSquare, metric: 'tasks' },
  { id: 'developer', label: 'Top Developer', icon: Trophy, metric: 'dev points' },
  { id: 'engineer', label: 'Top Engineer', icon: Medal, metric: 'eng points' },
  { id: 'researcher', label: 'Top Researcher', icon: FlaskConical, metric: 'research points' },
  { id: 'rising_star', label: 'Rising Star', icon: Trophy, metric: 'velocity' },
  { id: 'most_improved', label: 'Most Improved', icon: Medal, metric: 'improvement' },
  { id: 'learners', label: 'Top Learners', icon: GraduationCap, metric: 'learner score' },
  { id: 'instructors', label: 'Top Instructors', icon: BookOpen, metric: 'courses' },
  { id: 'mentors', label: 'Top Mentors', icon: Users, metric: 'mentor points' },
  { id: 'knowledge', label: 'Knowledge Contributors', icon: Brain, metric: 'knowledge' },
  { id: 'skills', label: 'Skill Builders', icon: Network, metric: 'skill nodes' },
  { id: 'creators', label: 'Top Creators', icon: PackageOpen, metric: 'creator score' },
  { id: 'publishers', label: 'Top Publishers', icon: FileText, metric: 'resources' },
  { id: 'designers', label: 'Top Designers', icon: Palette, metric: 'design assets' },
  { id: 'educators', label: 'Top Educators', icon: BookOpen, metric: 'course assets' },
];

function getScore(member, boardId) {
  if (boardId === 'xp') return member.xp || 0;
  if (boardId === 'tasks') return member.stats?.tasksCompleted || member.stats?.completedTasks || 0;
  if (boardId === 'experiments') return member.stats?.experimentsCount || 0;
  if (boardId === 'products') return member.stats?.productsCount || 0;
  if (boardId === 'learners') return member.stats?.learnerScore || 0;
  if (boardId === 'instructors') return member.stats?.coursesCreated || member.stats?.instructorScore || 0;
  if (boardId === 'mentors') return member.stats?.mentorScore || 0;
  if (boardId === 'knowledge') return member.stats?.knowledgeContributions || 0;
  if (boardId === 'skills') return member.stats?.skillNodesUnlocked || 0;
  if (boardId === 'creators') return member.stats?.creatorScore || 0;
  if (boardId === 'publishers') return member.stats?.resourcesPublished || 0;
  if (boardId === 'designers') return member.stats?.designAssetsPublished || 0;
  if (boardId === 'educators') return member.stats?.courseAssetsPublished || member.stats?.coursesCreated || 0;
  return 0;
}

function getInitials(member) {
  const source = member.displayName || member.username || 'Member';
  return source
    .split(/\s|_/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'M';
}

export default function LeaderboardsPage() {
  const { user } = useAuth();
  const [activeBoard, setActiveBoard] = useState('xp');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeConfig = useMemo(
    () => BOARDS.find(board => board.id === activeBoard) || BOARDS[0],
    [activeBoard],
  );
  const ActiveIcon = activeConfig.icon;
  const currentUserRank = members.findIndex(m => m.id === user?.uid) + 1;

  useEffect(() => {
    let cancelled = false;

    async function loadLeaderboard() {
      setLoading(true);
      setError(null);
      try {
        const nextMembers = await GamificationService.getLeaderboard({ type: activeBoard, maxCount: 25 });
        if (!cancelled) setMembers(nextMembers);
      } catch (err) {
        console.error('Leaderboard load failed:', err);
        if (!cancelled) setError('Could not load leaderboard data. Check Firestore indexes and permissions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [activeBoard]);

  return (
    <PageContainer>
      <PageHeader
        title="Leaderboards"
        description="Friendly BeastBuck rankings for XP, tasks, experiments, products, learning, teaching, mentoring, research, and skill building."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <ActiveIcon className="h-6 w-6" />
          </div>
        }
      />

      <SectionWrapper>
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {BOARDS.map(board => {
            const Icon = board.icon;
            const active = board.id === activeBoard;

            return (
              <button
                key={board.id}
                type="button"
                onClick={() => setActiveBoard(board.id)}
                className={`inline-flex min-h-10 sm:min-h-11 shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl border px-3 sm:px-4 text-xs sm:text-sm font-bold transition ${
                  active
                    ? 'border-accent/40 bg-accent/10 text-white'
                    : 'border-border bg-white/[0.03] text-text-muted hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{board.label}</span>
                <span className="sm:hidden">{board.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        {error && (
          <div className="mb-3 sm:mb-4 rounded-xl border border-status-danger/20 bg-status-danger/10 px-3 py-2.5 text-xs sm:text-sm text-status-danger sm:px-4 sm:py-3">
            {error}
          </div>
        )}

        {user && currentUserRank > 0 && currentUserRank <= 25 && (
          <div className="mb-4 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 flex items-center gap-3">
            <Crown className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Your current rank: #{currentUserRank}</p>
              <p className="text-xs text-text-muted">Keep earning {activeConfig.metric} to climb higher!</p>
            </div>
          </div>
        )}

        <Card className="rounded-lg">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-52 sm:min-h-64 items-center justify-center">
                <LoadingState text={`Loading ${activeConfig.label} leaderboard...`} />
              </div>
            ) : members.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <Medal className="mx-auto mb-3 h-8 w-8 sm:h-10 sm:w-10 text-text-muted" />
                <h2 className="mb-1 text-base sm:text-lg font-bold text-white">No leaderboard entries yet</h2>
                <p className="text-xs sm:text-sm text-text-muted">Members will appear here after earning reputation stats.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {members.map((member, index) => (
                  <Link
                    key={member.id}
                    to={`/profile/${member.id}`}
                    className="grid gap-2 sm:gap-3 p-3 sm:p-4 transition hover:bg-white/[0.03] sm:grid-cols-[4rem_minmax(0,1fr)_8rem] sm:items-center"
                  >
                    <div className="flex items-center gap-3 sm:block">
                      <span className={`inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border text-xs sm:text-sm font-black ${
                        index === 0
                          ? 'border-status-warning/40 bg-status-warning/10 text-status-warning'
                          : 'border-border bg-white/5 text-text-soft'
                      }`}>
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                      <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-accent/10 text-xs sm:text-sm font-bold text-accent">
                        {member.avatar ? <img src={member.avatar} alt={`Avatar of ${member.displayName || member.username}`} className="h-full w-full object-cover" /> : getInitials(member)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs sm:text-sm font-bold text-white">{member.displayName || member.username || 'Member'}</p>
                        <p className="truncate text-[10px] sm:text-xs text-text-muted">@{member.username || 'member'} · Level {member.level || 1}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-lg sm:text-xl font-black text-white">{getScore(member, activeBoard)}</p>
                      <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-muted">{activeConfig.metric}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SectionWrapper>
    </PageContainer>
  );
}
