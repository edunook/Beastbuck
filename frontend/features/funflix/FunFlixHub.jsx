import { useState, useEffect, useRef } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { 
  Play, Plus, Check, Info, Volume2, VolumeX, ChevronLeft, ChevronRight, 
  Film, TrendingUp, Award, Users, Star, Search, SlidersHorizontal, 
  Sparkles, Clock, Eye, Edit3, BarChart2, Bot, PlayCircle, Loader2, X, 
  Filter, ArrowRight, ThumbsUp, Home, Trophy, Upload, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '@shared/constants/roles';
import { PERMISSIONS } from '@shared/permissions/permissions';
import EmptyState from '@frontend/components/ui/EmptyState';

const CATEGORIES = [
  { id: 'all', name: 'Home' },
  { id: 'Trending', name: 'Trending' },
  { id: 'Comedy', name: 'Comedy' },
  { id: 'Mini Movies', name: 'Mini Movies' },
  { id: 'Science', name: 'Science' },
  { id: 'Education', name: 'Education' },
  { id: 'Technology', name: 'Tech & AI' },
  { id: 'Animation', name: 'Animation' },
  { id: 'Documentary', name: 'Documentaries' },
  { id: 'Challenges', name: 'Challenges' },
];

const SAMPLE_MOVIES = [
  {
    id: 'demo-1',
    title: 'Cyberpunk Odyssey: Neo Horizon',
    description: 'In a neon-drenched metropolis, a rogue AI developer uncovers a hidden network that holds the secret to human evolution.',
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    duration: '2h 15m',
    category: 'Technology',
    creatorName: 'Alex Mercer',
    views: 342900,
    likes: Array(1420).fill('uid'),
    featured: true,
    createdAt: new Date(),
  },
  {
    id: 'demo-2',
    title: 'The Great AI Standup Special',
    description: 'Hilarious comedy skit series featuring AI avatars bantering about human oddities and everyday technology fails.',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    duration: '45m',
    category: 'Comedy',
    creatorName: 'Sarah Jenkins',
    views: 289100,
    likes: Array(980).fill('uid'),
    featured: true,
    createdAt: new Date(),
  },
  {
    id: 'demo-3',
    title: 'Quantum Leap: Beyond Reality',
    description: 'An experimental mini-movie documenting quantum computing breakdowns and multiversal physics breakthroughs.',
    thumbnail: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=1200&auto=format&fit=crop&q=80',
    duration: '1h 30m',
    category: 'Science',
    creatorName: 'Dr. James Vance',
    views: 198400,
    likes: Array(870).fill('uid'),
    featured: true,
    createdAt: new Date(),
  },
  {
    id: 'demo-4',
    title: 'Shadow Realm: The Forgotten Code',
    description: 'A thrilling action drama where hackers fight control over an encrypted digital underworld.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    duration: '1h 55m',
    category: 'Mini Movies',
    creatorName: 'Marcus Cole',
    views: 512000,
    likes: Array(2340).fill('uid'),
    featured: true,
    createdAt: new Date(),
  },
  {
    id: 'demo-5',
    title: 'Cosmic Dreams 3D Animation',
    description: 'A breathtaking animated journey across surreal galaxies and bioluminescent alien worlds.',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    duration: '28m',
    category: 'Animation',
    creatorName: 'Elena Rostova',
    views: 175600,
    likes: Array(620).fill('uid'),
    featured: false,
    createdAt: new Date(),
  },
  {
    id: 'demo-6',
    title: 'Silicon Valley Founders Untold',
    description: 'In-depth documentary exploring early startup struggles, hackathons, and pivot moments.',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
    duration: '1h 10m',
    category: 'Documentary',
    creatorName: 'David Zhang',
    views: 423000,
    likes: Array(1890).fill('uid'),
    featured: false,
    createdAt: new Date(),
  },
  {
    id: 'demo-7',
    title: 'Neural Networks Decoded',
    description: 'Fast-paced educational masterclass breaking down deep learning models into simple visual concepts.',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    duration: '35m',
    category: 'Education',
    creatorName: 'Tech Academy',
    views: 145000,
    likes: Array(510).fill('uid'),
    featured: false,
    createdAt: new Date(),
  },
  {
    id: 'demo-8',
    title: 'Arcade Legends VR Championship',
    description: 'High-stakes esports compilation showcasing world record speeds and epic virtual clutch plays.',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    duration: '50m',
    category: 'Technology',
    creatorName: 'Pixel Gamer',
    views: 310500,
    likes: Array(1120).fill('uid'),
    featured: false,
    createdAt: new Date(),
  },
  {
    id: 'demo-9',
    title: 'Midnight Laughs: Impromptu Skits',
    description: 'Unscripted comedy shorts that had millions laughing out loud across BeastBuck community hubs.',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80',
    duration: '22m',
    category: 'Comedy',
    creatorName: 'Fun Crew',
    views: 260000,
    likes: Array(940).fill('uid'),
    featured: false,
    createdAt: new Date(),
  },
  {
    id: 'demo-10',
    title: 'Deep Ocean Mysteries 4K',
    description: 'Cinematic exploration of uncharted abyssal trenches and glowing deep-sea organisms.',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80',
    duration: '1h 20m',
    category: 'Documentary',
    creatorName: 'Oceanic Lab',
    views: 389000,
    likes: Array(1650).fill('uid'),
    featured: false,
    createdAt: new Date(),
  }
];

export default function FunFlixHub() {
  const { user, roleData } = useAuth();
  const navigate = useNavigate();
  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Data states
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [top10Movies, setTop10Movies] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [topCreators, setTopCreators] = useState([]);
  const [myMovies, setMyMovies] = useState([]);
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('funflix_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Hero & Modal States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedMovieModal, setSelectedMovieModal] = useState(null);

  const autoPlayRef = useRef(null);

  // Scroll listener for sticky header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Firebase Data with Fallback Samples
  useEffect(() => {
    const fetchFunFlixData = async () => {
      try {
        setLoading(true);

        const featuredQuery = query(
          collection(db, 'funflix_videos'),
          where('featured', '==', true),
          limit(5)
        );
        const featuredSnap = await getDocs(featuredQuery);
        let featuredList = featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const moviesQuery = query(
          collection(db, 'funflix_videos'),
          limit(50)
        );
        const moviesSnap = await getDocs(moviesQuery);
        let allMoviesList = moviesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort by views descending
        allMoviesList.sort((a, b) => (b.views || 0) - (a.views || 0));
        allMoviesList = allMoviesList.slice(0, 24);

        if (allMoviesList.length < 5) {
          allMoviesList = [...allMoviesList, ...SAMPLE_MOVIES];
        }

        if (featuredList.length === 0) {
          featuredList = allMoviesList.slice(0, 4);
        }

        setFeaturedMovies(featuredList);
        setTrendingMovies(allMoviesList);
        setTop10Movies(allMoviesList.slice(0, 10));

        const challengesQuery = query(
          collection(db, 'funflix_challenges'),
          where('status', '==', 'active'),
          limit(6)
        );
        const challengesSnap = await getDocs(challengesQuery);
        const challengesData = challengesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        challengesData.sort((a, b) => {
          const aDate = a.endDate?.toDate?.() || new Date(0);
          const bDate = b.endDate?.toDate?.() || new Date(0);
          return aDate - bDate;
        });
        setChallenges(challengesData);

        const creatorsQuery = query(
          collection(db, 'funflix_creators'),
          limit(20)
        );
        const creatorsSnap = await getDocs(creatorsQuery);
        const creatorsData = creatorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort by totalViews descending
        creatorsData.sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0));
        setTopCreators(creatorsData.slice(0, 8));

        if (user) {
          const myMoviesQuery = query(
            collection(db, 'funflix_videos'),
            where('creatorId', '==', user.uid),
            limit(50)
          );
          const myMoviesSnap = await getDocs(myMoviesQuery);
          const myMoviesData = myMoviesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          myMoviesData.sort((a, b) => {
            const aDate = a.createdAt?.toDate?.() || new Date(0);
            const bDate = b.createdAt?.toDate?.() || new Date(0);
            return bDate - aDate;
          });
          setMyMovies(myMoviesData);
        }
      } catch (error) {
        setFeaturedMovies(SAMPLE_MOVIES.slice(0, 4));
        setTrendingMovies(SAMPLE_MOVIES);
        setTop10Movies(SAMPLE_MOVIES.slice(0, 10));
      } finally {
        setLoading(false);
      }
    };

    fetchFunFlixData();
  }, [user]);

  // Billboard auto advance
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(autoPlayRef.current);
  }, [featuredMovies.length]);

  const toggleWatchlist = (movieId) => {
    let updated;
    if (watchlist.includes(movieId)) {
      updated = watchlist.filter(id => id !== movieId);
    } else {
      updated = [...watchlist, movieId];
    }
    setWatchlist(updated);
    localStorage.setItem('funflix_watchlist', JSON.stringify(updated));
  };

  const filteredMovies = trendingMovies.filter(movie => {
    const matchesCategory = selectedCategory === 'all' || movie.category === selectedCategory || (selectedCategory === 'Trending' && movie.views > 0);
    const matchesSearch = !searchQuery || 
      (movie.title && movie.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.creatorName && movie.creatorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (movie.description && movie.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const heroMovie = featuredMovies[currentSlide] || trendingMovies[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-2xl font-black tracking-widest text-[#E50914] animate-pulse">FUNFLIX</span>
        </div>
      </div>
    );
  }

  return (
    <div id="funflix-root" className="min-h-screen bg-[#141414] text-white font-sans antialiased selection:bg-[#E50914] selection:text-white pb-20 md:pb-8">
      {/* Mobile-First Ultra-Responsive Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 md:px-12 py-2.5 sm:py-3 flex items-center justify-between ${
        isScrolled ? 'bg-[#141414] shadow-md shadow-black/80' : 'bg-gradient-to-b from-black/90 via-black/60 to-transparent'
      }`}>
        {/* Logo & Main Nav */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Back to main app */}
          <Link 
            to="/dashboard" 
            className="p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all shrink-0" 
            title="Back to BeastBuck"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
          <Link to="/funflix" className="flex items-center gap-1 shrink-0 group">
            <span className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-[#E50914] group-hover:scale-105 transition-transform drop-shadow-[0_0_12px_rgba(229,9,20,0.8)]">
              FUNFLIX
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs sm:text-sm font-medium text-gray-300">
            <button 
              onClick={() => { setActiveTab('browse'); setSelectedCategory('all'); }}
              className={`hover:text-white transition ${activeTab === 'browse' && selectedCategory === 'all' ? 'text-white font-bold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setActiveTab('browse'); setSelectedCategory('Trending'); }}
              className={`hover:text-white transition ${selectedCategory === 'Trending' ? 'text-white font-bold' : ''}`}
            >
              New & Popular
            </button>
            <Link to="/funflix/categories" className="hover:text-white transition">Categories</Link>
            <Link to="/funflix/playlists" className="hover:text-white transition">My List ({watchlist.length})</Link>
            <Link to="/funflix/ai" className="hover:text-white transition flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Assistant
            </Link>
            {isApprovedMember && (
              <button 
                onClick={() => setActiveTab('my-movies')}
                className={`hover:text-white transition ${activeTab === 'my-movies' ? 'text-white font-bold' : ''}`}
              >
                My Studio ({myMovies.length})
              </button>
            )}
          </nav>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Expandable Search Input */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-black/90 border border-white/40 rounded-full px-3 py-1 transition-all w-40 sm:w-60">
                <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Titles, creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder:text-gray-500 focus:outline-none w-full"
                />
                <button onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} className="text-gray-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-1.5 text-gray-200 hover:text-white transition" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Member Upload or Apply CTA */}
          {isApprovedMember ? (
            <Link
              to="/funflix/upload"
              className="bg-[#E50914] text-white font-bold px-3 py-1.5 rounded text-xs hover:bg-red-700 transition flex items-center gap-1 shadow-md shadow-red-900/40"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Upload</span>
            </Link>
          ) : (
            <Link
              to="/membership/apply"
              className="bg-amber-400 text-black font-extrabold px-3 py-1 rounded text-xs hover:bg-amber-300 transition flex items-center gap-1 shrink-0"
            >
              <Star className="w-3.5 h-3.5 fill-black" /> Apply
            </Link>
          )}

          {/* User Profile Avatar */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-[#E50914] flex items-center justify-center font-bold text-white text-xs border border-white/20 shrink-0">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* Main Container */}
      {activeTab === 'browse' ? (
        <main>
          {/* Mobile-First Billboard Hero Banner */}
          {heroMovie && (
            <section className="relative w-full pt-16 sm:pt-0 min-h-[460px] sm:h-[75vh] sm:min-h-[520px] max-h-[780px] bg-black overflow-hidden flex flex-col justify-end">
              {/* Background Thumbnail Image */}
              <div className="absolute inset-0">
                <img
                  src={heroMovie.thumbnail || null}
                  alt={heroMovie.title || ''}
                  className="w-full h-full object-cover object-center scale-105"
                />
                {/* Mobile & Desktop Dark Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-black/40" />
              </div>

              {/* Billboard Info Overlay */}
              <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pb-12 sm:pb-20 space-y-3">
                {/* Netflix Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-[#E50914] font-black text-xl tracking-tighter">N</span>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-300">
                    FUNFLIX ORIGINAL
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white drop-shadow-md line-clamp-2 max-w-2xl">
                  {heroMovie.title}
                </h1>

                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-gray-300">
                  <span className="bg-[#E50914] text-white px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> #1 IN MOVIES
                  </span>
                  <span className="text-emerald-400 font-extrabold">98% Match</span>
                  <span className="border border-gray-500 px-1 text-[10px] rounded text-gray-300">HD</span>
                  <span>{heroMovie.duration}</span>
                  <span className="text-cyan-400">By {heroMovie.creatorName}</span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm md:text-base text-gray-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl drop-shadow">
                  {heroMovie.description}
                </p>

                {/* Mobile-Friendly Primary Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <Link
                    to={`/funflix/watch/${heroMovie.id}`}
                    className="bg-white hover:bg-gray-200 text-black font-extrabold px-6 sm:px-8 py-2.5 rounded text-sm sm:text-base flex items-center justify-center gap-2 transition min-w-[130px]"
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" /> Play
                  </Link>

                  <button
                    onClick={() => setSelectedMovieModal(heroMovie)}
                    className="bg-gray-500/70 hover:bg-gray-500/50 text-white font-bold px-5 sm:px-6 py-2.5 rounded text-sm sm:text-base flex items-center justify-center gap-2 backdrop-blur-sm transition"
                  >
                    <Info className="w-5 h-5" /> More Info
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 rounded-full border border-white/30 bg-black/40 text-white flex items-center justify-center hover:bg-white/20 transition ml-auto sm:ml-2"
                    aria-label="Toggle Audio"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Main Rows & Categories Section */}
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 space-y-8 sm:space-y-10 -mt-8 sm:-mt-14 relative z-30">
            {/* Smooth Horizontal Category Scroll Pill Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#E50914]" /> Categories:
              </span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.6)]'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Non-Member Banner Callout */}
            {!isApprovedMember && (
              <div className="bg-gradient-to-r from-red-950/90 via-black to-black border border-[#E50914]/40 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <h3 className="text-sm sm:text-base font-extrabold text-white">Join BeastBuck Creator Ecosystem</h3>
                  </div>
                  <p className="text-xs text-gray-300">
                    Apply for Membership to publish videos, host Watch Parties, earn XP, and access Creator Studio.
                  </p>
                </div>
                <Link
                  to="/membership/apply"
                  className="bg-[#E50914] hover:bg-red-700 text-white font-extrabold px-4 py-2 rounded text-xs shrink-0 transition flex items-center gap-1"
                >
                  Apply Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {/* Filter / Search Results Header */}
            {(selectedCategory !== 'all' || searchQuery) && (
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#E50914]" />
                  Search Results {selectedCategory !== 'all' && `in "${selectedCategory}"`}
                  {searchQuery && ` for "${searchQuery}"`}
                </h2>
                {filteredMovies.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                    {filteredMovies.map(movie => (
                      <MovieCard key={movie.id} movie={movie} onQuickView={setSelectedMovieModal} isSaved={watchlist.includes(movie.id)} onToggleSave={() => toggleWatchlist(movie.id)} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Film}
                    title="No Matching Movies Found"
                    description="Try adjusting your search terms or category filter to discover content."
                  />
                )}
              </div>
            )}

            {/* Netflix Top 10 Row */}
            {top10Movies.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <Top10Row movies={top10Movies} onQuickView={setSelectedMovieModal} />
            )}

            {/* Netflix Content Row 1: Trending Now */}
            {trendingMovies.length > 0 && selectedCategory === 'all' && !searchQuery && (
              <MovieRow 
                title="Trending Now" 
                movies={trendingMovies} 
                onQuickView={setSelectedMovieModal}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlist}
              />
            )}

            {/* Netflix Content Row 2: Tech & Sci-Fi */}
            {selectedCategory === 'all' && !searchQuery && (
              <MovieRow 
                title="Technology & AI Movies" 
                movies={trendingMovies.filter(m => m.category === 'Technology' || m.category === 'Science')} 
                onQuickView={setSelectedMovieModal}
                watchlist={watchlist}
                onToggleWatchlist={toggleWatchlist}
              />
            )}

            {/* Netflix Content Row 4: Top Creators */}
            {topCreators.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" /> Top Directors & Creators
                  </h2>
                  <Link to="/funflix/creator-profiles" className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1">
                    Explore <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {topCreators.map((creator, idx) => (
                    <Link
                      key={creator.id}
                      to={`/funflix/creator/${creator.username || creator.id}`}
                      className="bg-[#1f1f1f] border border-white/10 rounded-lg p-3 text-center hover:border-cyan-400/50 transition group flex flex-col items-center justify-between space-y-2"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-400 group-hover:scale-105 transition overflow-hidden">
                          {creator.avatar && creator.avatar.trim() !== '' ? (
                            <img src={creator.avatar} alt={creator.displayName || 'Avatar'} className="w-full h-full object-cover" />
                          ) : (
                            (creator.displayName || 'C').charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-[#E50914] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="w-full">
                        <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition truncate">
                          {creator.displayName || 'Creator'}
                        </h4>
                        <p className="text-[10px] text-gray-400 truncate">{(creator.totalViews || 0).toLocaleString()} views</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      ) : (
        /* My Studio / My Movies Tab */
        <main className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-20 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <Film className="w-7 h-7 text-[#E50914]" /> My Video Studio
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">Manage, edit, analyze, and publish your videos across FunFlix.</p>
            </div>
            <Link
              to="/funflix/upload"
              className="bg-[#E50914] hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded text-xs sm:text-sm flex items-center gap-2 transition shadow-lg"
            >
              <Plus className="w-4 h-4" /> Upload New Video
            </Link>
          </div>

          <div className="bg-[#1f1f1f] border border-white/10 rounded-lg overflow-hidden shadow-2xl">
            {myMovies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-black/60 text-gray-400 border-b border-white/10 uppercase text-[11px]">
                      <th className="py-3 px-4 font-bold">Movie Title</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold">Visibility</th>
                      <th className="py-3 px-4 font-bold">Published Date</th>
                      <th className="py-3 px-4 font-bold">Views</th>
                      <th className="py-3 px-4 font-bold">Likes</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myMovies.map(movie => (
                      <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-black rounded border border-white/10 overflow-hidden shrink-0">
                              {movie.thumbnail && movie.thumbnail.trim() !== '' && (
                                <img src={movie.thumbnail} alt={movie.title || 'Movie'} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <span className="font-bold text-white line-clamp-1 max-w-[180px]">{movie.title || 'Untitled'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-white/10 text-gray-300 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            {movie.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                            {movie.visibility || 'PUBLIC'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-xs">
                          {movie.createdAt ? new Date(movie.createdAt.toDate?.() || movie.createdAt).toLocaleDateString() : 'Just now'}
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{(movie.views || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {Array.isArray(movie.likes) ? movie.likes.length : Number(movie.likes || 0)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-gray-400">
                            <Link to={`/funflix/watch/${movie.id}`} className="hover:text-white p-1" title="Watch Video">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link to={`/mission-control/funflix`} className="hover:text-amber-400 p-1" title="Analytics">
                              <BarChart2 className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 px-4">
                <EmptyState
                  icon={Film}
                  title="No Video Uploads Yet"
                  description="You haven't published any videos to FunFlix. Start sharing your creations today!"
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Netflix Detail Modal */}
      {selectedMovieModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#181818] border border-white/10 rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 my-6">
            <button
              onClick={() => setSelectedMovieModal(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-white/20"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-video bg-black">
              {selectedMovieModal.thumbnail && selectedMovieModal.thumbnail.trim() !== '' ? (
                <img src={selectedMovieModal.thumbnail} alt={selectedMovieModal.title || 'Movie'} className="w-full h-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30" />
              <div className="absolute bottom-4 left-4 right-4 space-y-2">
                <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow">{selectedMovieModal.title}</h2>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/funflix/watch/${selectedMovieModal.id}`}
                    className="bg-white text-black font-extrabold hover:bg-gray-200 px-5 py-2 rounded text-xs sm:text-sm flex items-center gap-2 transition"
                  >
                    <Play className="w-4 h-4 fill-black ml-0.5" /> Play
                  </Link>
                  <button
                    onClick={() => toggleWatchlist(selectedMovieModal.id)}
                    className="w-8 h-8 rounded-full border border-white/40 bg-black/40 text-white flex items-center justify-center hover:bg-white/20 transition"
                  >
                    {watchlist.includes(selectedMovieModal.id) ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-300">
                <span className="text-emerald-400 font-bold">98% Match</span>
                <span className="border border-gray-600 px-1 text-[10px] rounded">HD</span>
                <span>{selectedMovieModal.duration || 'Short Film'}</span>
                <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[11px]">{selectedMovieModal.category || 'General'}</span>
                <span>Creator: <strong className="text-white">{selectedMovieModal.creatorName || 'Anonymous'}</strong></span>
              </div>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {selectedMovieModal.description || 'No detailed synopsis available for this title.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== FunFlix Mobile Bottom Navigation ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" aria-label="FunFlix mobile navigation">
        {/* Frosted glass background */}
        <div className="absolute inset-0 bg-[#141414]/95 backdrop-blur-xl border-t border-white/10" />
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#E50914]/60 to-transparent" />

        <div className="relative flex items-center justify-around px-1 py-2">
          {[
            { icon: Home, label: 'Home', action: () => { setActiveTab('browse'); setSelectedCategory('all'); } },
            { icon: Search, label: 'Search', action: () => setIsSearchOpen(true) },
            { icon: TrendingUp, label: 'Trending', action: () => { setActiveTab('browse'); setSelectedCategory('Trending'); } },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = 
              (item.label === 'Home' && activeTab === 'browse' && selectedCategory === 'all' && !isSearchOpen) ||
              (item.label === 'Search' && isSearchOpen) ||
              (item.label === 'Trending' && selectedCategory === 'Trending');

            return (
              <button
                key={item.label}
                onClick={() => item.path ? navigate(item.path) : item.action?.()}
                className={`group relative flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-300 min-w-[56px] ${
                  isActive ? 'scale-105' : 'active:scale-95'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-[#E50914]/20 blur-md transition-opacity" />
                )}
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 ${
                  isActive ? 'shadow-lg' : ''
                }`}
                  style={isActive ? { boxShadow: '0 0 16px rgba(229,9,20,0.4)' } : undefined}
                >
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                    isActive ? 'bg-[#E50914]/25 scale-100' : 'bg-white/5 scale-90 group-hover:scale-100 group-hover:bg-white/10'
                  }`} />
                  <Icon className={`relative h-5 w-5 transition-all duration-300 ${
                    isActive ? 'text-[#E50914]' : 'text-gray-400'
                  }`}
                    style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(229,9,20,0.6))' } : undefined}
                  />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#E50914]' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      {/* ===== Custom Scrollbar Styles ===== */}
      <style>{`
        /* Custom Netflix-themed scrollbar for desktop */
        .funflix-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .funflix-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .funflix-scroll::-webkit-scrollbar-thumb {
          background: rgba(229, 9, 20, 0.4);
          border-radius: 999px;
        }
        .funflix-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(229, 9, 20, 0.7);
        }
        /* Firefox */
        .funflix-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(229, 9, 20, 0.4) transparent;
        }

        /* Global page scrollbar for FunFlix */
        html:has(#funflix-root) ::-webkit-scrollbar {
          width: 8px;
        }
        html:has(#funflix-root) ::-webkit-scrollbar-track {
          background: #141414;
        }
        html:has(#funflix-root) ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #E50914 0%, #831010 100%);
          border-radius: 999px;
          border: 2px solid #141414;
        }
        html:has(#funflix-root) ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ff1a25 0%, #E50914 100%);
        }
      `}</style>
    </div>
  );
}

/* Netflix Top 10 Number Cards Row */
function Top10Row({ movies, onQuickView }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      rowRef.current.scrollTo({
        left: dir === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-2 relative group/top10">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-2">
        <span className="text-[#E50914] font-black text-xl sm:text-2xl">TOP 10</span> Movies Today
      </h2>

      <button
        onClick={() => scroll('left')}
        className="hidden sm:flex absolute left-0 top-10 bottom-0 z-30 w-10 bg-black/80 text-white opacity-0 group-hover/top10:opacity-100 items-center justify-center transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="hidden sm:flex absolute right-0 top-10 bottom-0 z-30 w-10 bg-black/80 text-white opacity-0 group-hover/top10:opacity-100 items-center justify-center transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div 
        ref={rowRef} 
        className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 px-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x"
      >
        {movies.map((movie, idx) => (
          <div 
            key={movie.id} 
            className="flex items-end shrink-0 group/card cursor-pointer" 
            onClick={() => onQuickView(movie)}
          >
            {/* Styled Giant Netflix Rank Number */}
            <span className="text-6xl sm:text-8xl md:text-[110px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-gray-200 via-gray-400 to-black select-none font-mono drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] opacity-90 group-hover/card:text-[#E50914] transition-colors -mr-3 sm:-mr-5 z-10">
              {idx + 1}
            </span>

            {/* Poster Card */}
            <div className="w-28 sm:w-36 md:w-44 aspect-[2/3] bg-gray-900 rounded overflow-hidden relative border border-white/10 group-hover/card:scale-105 group-hover/card:z-20 transition-all duration-300 shadow-md">
              {movie.thumbnail && movie.thumbnail.trim() !== '' ? (
                <img src={movie.thumbnail} alt={movie.title || 'Movie'} className="w-full h-full object-cover" />
              ) : null}
              <div className="absolute top-1.5 left-1.5 text-[#E50914] font-black text-xs sm:text-sm drop-shadow">N</div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/50 to-transparent p-1.5">
                <p className="text-[10px] sm:text-xs font-bold text-white truncate">{movie.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* Netflix Standard Horizontal Row */
function MovieRow({ title, movies, onQuickView, watchlist = [], onToggleWatchlist }) {
  const rowRef = useRef(null);

  const scroll = (dir) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      rowRef.current.scrollTo({
        left: dir === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-2 relative group/row">
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">{title}</h2>

      <button
        onClick={() => scroll('left')}
        className="hidden sm:flex absolute left-0 top-8 bottom-0 z-30 w-10 bg-black/80 text-white opacity-0 group-hover/row:opacity-100 items-center justify-center transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="hidden sm:flex absolute right-0 top-8 bottom-0 z-30 w-10 bg-black/80 text-white opacity-0 group-hover/row:opacity-100 items-center justify-center transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div 
        ref={rowRef} 
        className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-2 px-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x"
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onQuickView={onQuickView}
            isSaved={watchlist.includes(movie.id)}
            onToggleSave={() => onToggleWatchlist?.(movie.id)}
          />
        ))}
      </div>
    </section>
  );
}

/* Standard Netflix Movie Card */
function MovieCard({ movie, onQuickView, isSaved = false, onToggleSave }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/funflix/watch/${movie.id}`)}
      className="group relative shrink-0 w-36 sm:w-52 md:w-60 aspect-video bg-gray-900 rounded overflow-hidden border border-white/10 group-hover:border-[#E50914] shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30"
    >
      {movie.thumbnail && movie.thumbnail.trim() !== '' ? (
        <img
          src={movie.thumbnail}
          alt={movie.title || 'Movie'}
          className="w-full h-full object-cover"
        />
      ) : null}

      {/* Netflix N Logo */}
      <span className="absolute top-1.5 left-1.5 text-[#E50914] font-black text-xs sm:text-sm drop-shadow">
        N
      </span>

      <span className="absolute top-1.5 right-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/20">
        {movie.duration || 'Short'}
      </span>

      {/* Hover Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
        <div className="flex justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition border border-white/30"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black flex items-center justify-center shadow">
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black ml-0.5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400">98% Match</span>
            <span className="text-[9px] border border-gray-400 px-1 text-gray-300 rounded">HD</span>
          </div>

          <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
          <p className="text-[10px] text-gray-400 truncate">{movie.creatorName} · {(movie.views || 0).toLocaleString()} views</p>
        </div>
      </div>
    </div>
  );
}
