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
  { id: 'tasks', label: 'Top Contributor', icon: CheckSquare, metric: 'tasks' },
  { id: 'experiments', label: 'Top Scientist', icon: FlaskConical, metric: 'experiments' },
  { id: 'products', label: 'Top Inventor', icon: Package, metric: 'products' },
  { id: 'learners', label: 'Top Learners', icon: GraduationCap, metric: 'learner score' },
  { id: 'mentors', label: 'Top Mentors', icon: Users, metric: 'mentor points' },
  { id: 'rising_star', label: 'Rising Star', icon: Medal, metric: 'velocity' },
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

function getRankColor(index) {
  if (index === 0) return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
  if (index === 1) return 'text-slate-300 bg-slate-300/10 border-slate-300/30';
  if (index === 2) return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
  return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
            <ActiveIcon className="h-6 w-6" />
          </div>
        }
      />

      <SectionWrapper>
        <div className="flex flex-wrap gap-2 mb-6">
          {BOARDS.map(board => {
            const Icon = board.icon;
            const active = board.id === activeBoard;

            return (
              <button
                key={board.id}
                type="button"
                onClick={() => setActiveBoard(board.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${
                  active
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-slate-800 text-slate-300 hover:border-slate-600 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {board.label}
              </button>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper>
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {user && currentUserRank > 0 && currentUserRank <= 25 && (
          <div className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 flex items-center gap-3">
            <Crown className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-white">Your rank: #{currentUserRank}</p>
              <p className="text-xs text-slate-400">Keep earning {activeConfig.metric} to climb higher!</p>
            </div>
          </div>
        )}

        <Card className="rounded-xl border border-slate-700 bg-slate-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <LoadingState text={`Loading ${activeConfig.label} leaderboard...`} />
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 text-center">
                <Medal className="mx-auto mb-3 h-10 w-10 text-slate-500" />
                <h2 className="mb-1 text-lg font-semibold text-white">No leaderboard entries yet</h2>
                <p className="text-sm text-slate-400">Members will appear here after earning reputation stats.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {members.map((member, index) => {
                  const isCurrentUser = member.id === user?.uid;
                  const rankColor = getRankColor(index);

                  return (
                    <Link
                      key={member.id}
                      to={`/profile/${member.id}`}
                      className={`flex items-center gap-4 p-4 transition-colors hover:bg-slate-800 ${
                        isCurrentUser ? 'bg-accent/10' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold ${rankColor}`}>
                        {index + 1}
                      </div>

                      {/* Avatar */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl border overflow-hidden shrink-0 ${
                        isCurrentUser ? 'border-accent' : 'border-slate-600'
                      }`}>
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm font-bold text-accent">{getInitials(member)}</span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {member.displayName || member.username || 'Member'}
                          {isCurrentUser && <span className="ml-2 text-xs text-accent">(You)</span>}
                        </p>
                        <p className="text-xs text-slate-400">@{member.username || 'member'}</p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">{getScore(member, activeBoard).toLocaleString()}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{activeConfig.metric}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </SectionWrapper>
    </PageContainer>
  );
}
