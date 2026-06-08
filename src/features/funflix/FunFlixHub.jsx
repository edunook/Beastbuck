import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { TrendingUp, Film, Users, Award, PlayCircle, Loader2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import EmptyState from '../../components/ui/EmptyState';

export default function FunFlixHub() {
  const [loading, setLoading] = useState(true);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [topCreators, setTopCreators] = useState([]);

  useEffect(() => {
    const fetchFunFlixData = async () => {
      try {
        setLoading(true);
        
        // Fetch trending movies
        const moviesQuery = query(
          collection(db, 'funflix_videos'),
          orderBy('views', 'desc'),
          limit(8)
        );
        const moviesSnap = await getDocs(moviesQuery);
        setTrendingMovies(moviesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch active challenges
        const challengesQuery = query(
          collection(db, 'funflix_challenges'),
          where('status', '==', 'active'),
          orderBy('endDate', 'asc'),
          limit(5)
        );
        const challengesSnap = await getDocs(challengesQuery);
        setChallenges(challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch top creators
        const creatorsQuery = query(
          collection(db, 'funflix_creators'),
          orderBy('totalViews', 'desc'),
          limit(5)
        );
        const creatorsSnap = await getDocs(creatorsQuery);
        setTopCreators(creatorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to fetch FunFlix data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunFlixData();
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <PageHeader title="FunFlix Network" description="Comedy, challenges, and creative shorts by the BeastBuck community." />
        <div className="flex gap-4">
          <Link to="/funflix/upload" className="bg-accent text-black font-bold px-6 py-2 rounded-lg hover:bg-accent/80 transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Upload Movie
          </Link>
          <Link to="/funflix/studio" className="bg-white/10 text-white font-bold px-6 py-2 rounded-lg hover:bg-white/20 transition flex items-center gap-2">
            <Film className="w-4 h-4" /> Creator Studio
          </Link>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="text-accent" /> Trending Now</h2>
        {trendingMovies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trendingMovies.map(movie => (
              <Link key={movie.id} to={`/funflix/watch/${movie.id}`} className="group block">
                <div className="aspect-video bg-surface rounded-xl mb-3 relative overflow-hidden border border-border group-hover:border-accent/50 transition">
                  {movie.thumbnail && (
                    <img src={movie.thumbnail} alt={movie.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <PlayCircle className="absolute inset-0 m-auto text-white/50 w-12 h-12 group-hover:scale-110 group-hover:text-accent transition-transform" />
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded">{movie.duration || '0:00'}</span>
                  <span className="absolute top-2 left-2 bg-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded uppercase">{movie.category || 'Video'}</span>
                </div>
                <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-accent transition">{movie.title || 'Untitled'}</h3>
                <p className="text-xs text-text-muted mt-1">{movie.creatorName || 'Unknown'} · {movie.views?.toLocaleString() || '0'} views</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Film}
            title="No Movies Yet"
            description="Be the first to upload a movie to FunFlix!"
          />
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 mb-10">
        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Award className="text-yellow-400" /> Active Challenges</h2>
          {challenges.length > 0 ? (
            <div className="space-y-4">
              {challenges.map(challenge => (
                <div key={challenge.id} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-sm">{challenge.title || 'Challenge'}</h4>
                    <p className="text-xs text-text-muted mt-1">{challenge.entriesCount || 0} Entries · Ends in {challenge.daysRemaining || 0} days</p>
                  </div>
                  <Link to={`/funflix/challenges/${challenge.id}`} className="bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/20">Join</Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No Active Challenges"
              description="Check back soon for new challenges!"
              compact
            />
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Users className="text-blue-400" /> Top Creators</h2>
          {topCreators.length > 0 ? (
            <div className="space-y-4">
              {topCreators.map((creator, i) => (
                <Link key={creator.id} to={`/funflix/creator/${creator.username}`} className="flex items-center gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0 hover:bg-white/5 rounded-lg p-2 transition">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">#{i + 1}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{creator.displayName || 'Creator'}</h4>
                    <p className="text-xs text-text-muted">{creator.badge || 'Creator'} · {creator.totalViews?.toLocaleString() || '0'} views</p>
                  </div>
                  <button className="text-accent text-xs font-bold hover:underline">Follow</button>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No Creators Yet"
              description="Be the first to create content!"
              compact
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
