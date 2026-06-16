import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ArrowRight, Zap, Award, Search, Filter, Users, TrendingUp, Star, Shield, Crown, Medal } from 'lucide-react';
import { UsersService } from '../../services/firebase/users';
import { GamificationService } from '../../services/firebase/gamification';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';

export default function PortfolioShowcase() {
  const [allMembers, setAllMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('xp');

  useEffect(() => {
    async function load() {
      try {
        console.log('Loading members...');
        const members = await UsersService.getAllMembers();
        console.log('Members loaded:', members.length, members);
        setAllMembers(members);
        setFilteredMembers(members);
      } catch (err) {
        console.error('Failed to load all members, falling back to leaderboard:', err);
        try {
          // Fallback to leaderboard if getAllMembers fails
          const topMembers = await GamificationService.getLeaderboard({ type: 'xp', maxCount: 50 });
          console.log('Leaderboard loaded:', topMembers.length, topMembers);
          setAllMembers(topMembers);
          setFilteredMembers(topMembers);
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
          setAllMembers([]);
          setFilteredMembers([]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let filtered = [...allMembers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(member =>
        (member.displayName || member.username || '').toLowerCase().includes(query) ||
        (member.role || '').toLowerCase().includes(query)
      );
    }

    // Apply role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(member => member.role === filterRole);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
      if (sortBy === 'level') return (b.level || 0) - (a.level || 0);
      if (sortBy === 'name') return (a.displayName || a.username || '').localeCompare(b.displayName || b.username || '');
      if (sortBy === 'achievements') return (b.achievements?.length || 0) - (a.achievements?.length || 0);
      return 0;
    });

    setFilteredMembers(filtered);
  }, [allMembers, searchQuery, filterRole, sortBy]);

  const roles = useMemo(() => {
    const roleSet = new Set(allMembers.map(m => m.role).filter(Boolean));
    return ['all', ...Array.from(roleSet)];
  }, [allMembers]);

  const getRoleIcon = (role) => {
    if (role === 'Main CEO' || role === 'Co-CEO') return <Crown className="h-4 w-4" />;
    if (role === 'Leader') return <Shield className="h-4 w-4" />;
    if (role === 'Member') return <Users className="h-4 w-4" />;
    return <Star className="h-4 w-4" />;
  };

  const getRoleColor = (role) => {
    if (role === 'Main CEO' || role === 'Co-CEO') return 'text-yellow-400';
    if (role === 'Leader') return 'text-purple-400';
    if (role === 'Member') return 'text-cyan-400';
    return 'text-gray-400';
  };

  return (
    <PageContainer>
      <PageHeader
        title="Member Portfolios"
        description="Explore the complete community of innovators, builders, and scientists in the BeastBuck Ecosystem."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/25 bg-gradient-to-br from-accent/10 to-purple-500/10 text-accent shadow-lg shadow-accent/10">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
        }
      />

      <SectionWrapper>
        {/* Stats Bar */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-purple-500/5 p-5 transition-all hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-all group-hover:bg-accent/20" />
            <Users className="mb-3 h-6 w-6 text-accent" />
            <p className="text-3xl font-black text-white">{allMembers.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total Members</p>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-status-warning/20 bg-gradient-to-br from-status-warning/5 to-orange-500/5 p-5 transition-all hover:border-status-warning/40 hover:shadow-lg hover:shadow-status-warning/10">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-status-warning/10 blur-2xl transition-all group-hover:bg-status-warning/20" />
            <Trophy className="mb-3 h-6 w-6 text-status-warning" />
            <p className="text-3xl font-black text-white">{allMembers.reduce((sum, m) => sum + (m.xp || 0), 0).toLocaleString()}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Total XP</p>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-status-success/20 bg-gradient-to-br from-status-success/5 to-green-500/5 p-5 transition-all hover:border-status-success/40 hover:shadow-lg hover:shadow-status-success/10">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-status-success/10 blur-2xl transition-all group-hover:bg-status-success/20" />
            <Medal className="mb-3 h-6 w-6 text-status-success" />
            <p className="text-3xl font-black text-white">{allMembers.reduce((sum, m) => sum + (m.achievements?.length || 0), 0)}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Achievements</p>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-5 transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/10 blur-2xl transition-all group-hover:bg-purple-500/20" />
            <TrendingUp className="mb-3 h-6 w-6 text-purple-400" />
            <p className="text-3xl font-black text-white">{Math.floor(allMembers.reduce((sum, m) => sum + (m.level || 0), 0) / (allMembers.length || 1))}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Avg Level</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border/50 bg-surface/30 p-4 backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search members by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border/50 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-text-muted/50 transition-all focus:border-accent/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-xl border border-border/50 bg-white/5 px-4 py-3 text-white transition-all focus:border-accent/50 focus:bg-white/10 focus:outline-none"
            >
              {roles.map(role => (
                <option key={role} value={role} className="bg-surface">
                  {role === 'all' ? 'All Roles' : role}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-border/50 bg-white/5 px-4 py-3 text-white transition-all focus:border-accent/50 focus:bg-white/10 focus:outline-none"
            >
              <option value="xp" className="bg-surface">Sort by XP</option>
              <option value="level" className="bg-surface">Sort by Level</option>
              <option value="name" className="bg-surface">Sort by Name</option>
              <option value="achievements" className="bg-surface">Sort by Achievements</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingState text="Loading member portfolios..." />
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <Users className="h-10 w-10 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-white">No members found</h3>
            <p className="mt-2 text-text-muted">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-bold text-text-muted">
              Showing {filteredMembers.length} of {allMembers.length} members
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredMembers.map((member, index) => (
                <Link
                  key={member.id}
                  to={`/portfolio/${member.username}`}
                  className="group relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-surface/50 to-surface/30 p-6 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                  }}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-purple-500/0 to-cyan-500/0 opacity-0 transition-all duration-500 group-hover:from-accent/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 group-hover:opacity-100" />
                  
                  {/* Glow effect */}
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-accent/10 blur-3xl transition-all duration-500 group-hover:bg-accent/20 group-hover:scale-150" />
                  <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition-all duration-500 group-hover:bg-purple-500/20 group-hover:scale-150" />
                  
                  <div className="relative">
                    {/* Avatar */}
                    <div className="mb-4 flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-accent/30 bg-black/50 shadow-lg shadow-accent/20 transition-all duration-300 group-hover:border-accent/60 group-hover:shadow-accent/40 group-hover:scale-110">
                        {member.avatar ? (
                          <img src={member.avatar} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-2xl font-black text-accent">
                            {(member.displayName || member.username)[0].toUpperCase()}
                          </div>
                        )}
                        {/* Online indicator */}
                        <div className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-surface bg-status-success shadow-lg shadow-status-success/50" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-lg font-black text-white transition-colors group-hover:text-accent line-clamp-1">
                          {member.displayName || member.username}
                        </h3>
                        <p className="text-sm font-medium text-text-muted">@{member.username}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {getRoleIcon(member.role)}
                          <span className={`text-xs font-bold uppercase tracking-wider ${getRoleColor(member.role)}`}>
                            {member.role || 'Member'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-white/5 p-2.5 text-center transition-all group-hover:bg-accent/10">
                        <Zap className="mx-auto mb-1 h-4 w-4 text-accent" />
                        <p className="text-sm font-black text-white">{member.level || 1}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Level</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2.5 text-center transition-all group-hover:bg-accent/10">
                        <Trophy className="mx-auto mb-1 h-4 w-4 text-status-warning" />
                        <p className="text-sm font-black text-white">{(member.xp || 0).toLocaleString()}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">XP</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-2.5 text-center transition-all group-hover:bg-accent/10">
                        <Award className="mx-auto mb-1 h-4 w-4 text-status-success" />
                        <p className="text-sm font-black text-white">{member.achievements?.length || 0}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Badges</p>
                      </div>
                    </div>

                    {/* Specializations preview */}
                    {member.specializations && member.specializations.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {member.specializations.slice(0, 3).map((spec, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-gradient-to-r from-accent/10 to-purple-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent border border-accent/20"
                          >
                            {typeof spec === 'string' ? spec : spec.name || spec}
                          </span>
                        ))}
                        {member.specializations.length > 3 && (
                          <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-text-muted">
                            +{member.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* View Portfolio Button */}
                    <div className="flex items-center justify-between rounded-xl border border-border/50 bg-white/5 p-3 transition-all group-hover:border-accent/50 group-hover:bg-accent/10">
                      <span className="text-sm font-bold text-white">View Portfolio</span>
                      <ArrowRight className="h-4 w-4 text-accent transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </SectionWrapper>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </PageContainer>
  );
}
