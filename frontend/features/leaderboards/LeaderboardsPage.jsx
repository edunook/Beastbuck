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
  if (index === 0) return 'text-amber-400 bg-gradient-to-br from-amber-400/20 to-amber-600/10 border-amber-400/40 shadow-amber-400/20';
  if (index === 1) return 'text-slate-300 bg-gradient-to-br from-slate-300/20 to-slate-400/10 border-slate-300/40 shadow-slate-300/20';
  if (index === 2) return 'text-orange-400 bg-gradient-to-br from-orange-400/20 to-orange-600/10 border-orange-400/40 shadow-orange-400/20';
  return 'text-slate-400 bg-gradient-to-br from-slate-400/10 to-slate-500/5 border-slate-400/30';
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
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {BOARDS.map(board => {
            const Icon = board.icon;
            const active = board.id === activeBoard;

            return (
              <button
                key={board.id}
                type="button"
                onClick={() => setActiveBoard(board.id)}
                className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-300 backdrop-blur-sm ${
                  active
                    ? 'border-accent/50 bg-gradient-to-br from-accent/20 to-accent/10 text-white shadow-lg shadow-accent/20 hover:shadow-accent/30'
                    : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:border-slate-600/50 hover:bg-slate-700/40 hover:text-slate-200 hover:shadow-lg'
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
          <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm text-red-300 backdrop-blur-sm">
            {error}
          </div>
        )}

        {user && currentUserRank > 0 && currentUserRank <= 25 && (
          <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 to-accent/5 px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 backdrop-blur-sm shadow-lg shadow-accent/10">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 shrink-0">
              <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold text-white">Your rank: #{currentUserRank}</p>
              <p className="text-xs sm:text-sm text-slate-400">Keep earning {activeConfig.metric} to climb higher!</p>
            </div>
          </div>
        )}

        <Card className="rounded-xl sm:rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl shadow-2xl shadow-slate-900/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-64 sm:min-h-80 items-center justify-center">
                <LoadingState text={`Loading ${activeConfig.label} leaderboard...`} />
              </div>
            ) : members.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center mx-auto mb-3 sm:mb-4 rounded-2xl bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/30">
                  <Medal className="h-8 w-8 sm:h-10 sm:w-10 text-slate-500" />
                </div>
                <h2 className="mb-1 sm:mb-2 text-lg sm:text-xl font-semibold text-white">No leaderboard entries yet</h2>
                <p className="text-xs sm:text-sm text-slate-400">Members will appear here after earning reputation stats.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {members.map((member, index) => {
                  const isCurrentUser = member.id === user?.uid;
                  const rankColor = getRankColor(index);

                  return (
                    <Link
                      key={member.id}
                      to={`/profile/${member.id}`}
                      className={`flex items-center gap-3 sm:gap-5 p-3 sm:p-5 transition-all duration-300 hover:bg-slate-800/50 ${
                        isCurrentUser ? 'bg-gradient-to-r from-accent/10 to-transparent border-l-2 border-accent' : ''
                      }`}
                    >
                      {/* Rank */}
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl border text-xs sm:text-sm font-bold shadow-lg shrink-0 ${rankColor}`}>
                        {index + 1}
                      </div>

                      {/* Avatar */}
                      <div className={`flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl border overflow-hidden shrink-0 shadow-lg ${
                        isCurrentUser ? 'border-accent/50 bg-gradient-to-br from-accent/20 to-accent/10' : 'border-slate-600/50 bg-slate-800/50'
                      }`}>
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm sm:text-base font-bold text-accent">{getInitials(member)}</span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-white truncate">
                          {member.displayName || member.username || 'Member'}
                          {isCurrentUser && <span className="ml-1 sm:ml-2 text-xs text-accent font-medium">(You)</span>}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">@{member.username || 'member'}</p>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <p className="text-base sm:text-xl font-bold text-white tracking-tight">{getScore(member, activeBoard).toLocaleString()}</p>
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-wider sm:tracking-widest font-medium">{activeConfig.metric}</p>
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
