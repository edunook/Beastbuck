import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Trophy, ArrowRight, Zap, Award } from 'lucide-react';
import { GamificationService } from '../../services/firebase/gamification';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';

export default function PortfolioShowcase() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch top members by XP as the initial showcase set
        const topMembers = await GamificationService.getLeaderboard({ type: 'xp', maxCount: 20 });
        setMembers(topMembers);
      } catch (err) {
        console.error('Failed to load showcase:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Portfolio Showcase"
        description="Discover the top innovators, builders, and scientists in the BeastBuck Ecosystem."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <Sparkles className="h-6 w-6" />
          </div>
        }
      />

      <SectionWrapper>
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <LoadingState text="Loading portfolios..." />
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 text-center">
            <h3 className="text-xl font-bold text-white">No portfolios found</h3>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map(member => (
              <Link 
                key={member.id} 
                to={`/portfolio/${member.username}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-surface/50 p-6 transition-all hover:border-accent/50 hover:bg-surface"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/5 blur-3xl transition-all group-hover:bg-accent/10" />
                
                <div>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-accent/20 bg-black">
                      {member.avatar ? (
                        <img src={member.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-accent">
                          {(member.displayName || member.username)[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white group-hover:text-accent">
                        {member.displayName || member.username}
                      </h3>
                      <p className="text-sm text-text-muted">@{member.username}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-text-muted">
                      <Zap className="h-3 w-3 text-accent" /> Level {member.level || 1}
                    </span>
                    <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-text-muted">
                      <Trophy className="h-3 w-3 text-status-warning" /> {member.xp || 0} XP
                    </span>
                    {member.achievements && (
                      <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold text-text-muted">
                        <Award className="h-3 w-3 text-status-success" /> {member.achievements.length} Badges
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-border/50 pt-4 text-sm font-bold text-accent">
                  View Portfolio
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
