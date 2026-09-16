import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, Plus, Check, Info, Volume2, VolumeX, ChevronLeft, ChevronRight, 
  Film, TrendingUp, Award, Users, Star, Search, SlidersHorizontal, 
  Sparkles, Clock, Eye, Edit3, BarChart2, Bot, PlayCircle, Loader2, X, 
  Filter, ArrowRight, ThumbsUp, Home, Trophy, Upload, ArrowLeft, Heart,
  Share2, ChevronDown, CheckCircle2, ShieldCheck, Flame
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { useAuth } from '../auth/AuthContext';
import { PERMISSIONS } from '@shared/permissions/permissions';

// Authentic Netflix Categories
const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'Sci-Fi', name: 'Sci-Fi & AI' },
  { id: 'Action', name: 'Action & Thrillers' },
  { id: 'Comedy', name: 'Comedy' },
  { id: 'Documentary', name: 'Documentaries' },
  { id: 'Drama', name: 'Drama' },
  { id: 'Animation', name: 'Animation' },
  { id: 'Technology', name: 'Tech & Engineering' },
];

// Curated 4K Showcase Library for an always-breathtaking Netflix experience
const CURATED_TITLES = [
  {
    id: 'chrono-rift',
    title: 'Chrono Rift: The Quantum Paradox',
    description: 'When an experimental particle collider tears a rift in spacetime, a team of quantum physicists must race through divergent realities before their timeline collapses permanently.',
    category: 'Sci-Fi',
    duration: '2h 14m',
    year: '2026',
    rating: '16+',
    matchScore: 99,
    isOriginal: true,
    quality: '4K Ultra HD',
    tags: ['Mind-bending', 'Futuristic', 'Suspenseful'],
    cast: 'Dr. Sarah Chen, Michael Vance, Elena Rostova',
    director: 'Christopher Nolan & BeastBuck Studios',
    creatorName: 'Dr. Sarah Chen',
    views: 1845000,
    likes: 142000,
    thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=85&fit=crop',
  },
  {
    id: 'neon-horizon',
    title: 'Neon Horizon 2099',
    description: 'In the towering cyber-megacity of Neo-Kyoto, a rogue synthetic consciousness uncovers a conspiracy that threatens to rewrite human free will forever.',
    category: 'Sci-Fi',
    duration: '1h 58m',
    year: '2026',
    rating: '18+',
    matchScore: 98,
    isOriginal: true,
    quality: '4K Ultra HD',
    tags: ['Cyberpunk', 'Gritty', 'Visually Striking'],
    cast: 'Kenji Sato, Maya Lin, Alex Mercer',
    director: 'Denis Villeneuve & BeastBuck Creative',
    creatorName: 'Alex Mercer',
    views: 1420000,
    likes: 98000,
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&q=85&fit=crop',
  },
  {
    id: 'silicon-hustle',
    title: 'Silicon Hustle: The Founder\'s Code',
    description: 'The electrifying true-to-life drama of four young engineers who built an open-source AI operating system from a garage, defying Wall Street and Big Tech giants.',
    category: 'Drama',
    duration: '2h 05m',
    year: '2025',
    rating: '13+',
    matchScore: 97,
    isOriginal: false,
    quality: 'HD',
    tags: ['Inspiring', 'Fast-Paced', 'Compelling'],
    cast: 'David Zhao, Jessica Morales, Tariq Al-Mansoor',
    director: 'David Fincher',
    creatorName: 'BeastBuck Originals',
    views: 980000,
    likes: 76000,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=85&fit=crop',
  },
  {
    id: 'cosmos-infinite',
    title: 'Cosmos: Beyond the Event Horizon',
    description: 'An awe-inspiring cinematic journey guided by astrophysicists exploring supermassive black holes, dark energy, and the ultimate destiny of our universe.',
    category: 'Documentary',
    duration: '1h 48m',
    year: '2026',
    rating: 'ALL',
    matchScore: 99,
    isOriginal: true,
    quality: '4K Ultra HD',
    tags: ['Mind-Expanding', 'Epic', 'Breathtaking'],
    cast: 'Prof. James Webb, Dr. Althea Sterling',
    director: 'Alastair Fothergill',
    creatorName: 'AstroLab',
    views: 2100000,
    likes: 185000,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=85&fit=crop',
  },
  {
    id: 'shadow-protocol',
    title: 'Shadow Protocol: Zero Day',
    description: 'An elite squad of counter-cyber operatives must stop an autonomous malware hive-mind from hijacking the global power grid before midnight.',
    category: 'Action',
    duration: '1h 52m',
    year: '2025',
    rating: '16+',
    matchScore: 96,
    isOriginal: true,
    quality: '4K Ultra HD',
    tags: ['High-Octane', 'Tech-Thriller', 'Action'],
    cast: 'Marcus Thorne, Samantha Reed, Viktor Brandt',
    director: 'Chad Stahelski',
    creatorName: 'CyberStrike Media',
    views: 1250000,
    likes: 89000,
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85&fit=crop',
  },
  {
    id: 'laugh-protocol',
    title: 'The AI Dating Disaster',
    description: 'When an engineer creates an hyper-intelligent matchmaking AI that accidentally matches everyone with their polar opposites, hilarity and chaos ensue across San Francisco.',
    category: 'Comedy',
    duration: '1h 36m',
    year: '2026',
    rating: '13+',
    matchScore: 95,
    isOriginal: true,
    quality: 'HD',
    tags: ['Hilarious', 'Romantic', 'Feel-Good'],
    cast: 'Emma Stone-Williams, Ben Schwartz, Lily Zhang',
    director: 'Taika Waititi',
    creatorName: 'FunFlix Comedy',
    views: 890000,
    likes: 64000,
    thumbnail: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1920&q=85&fit=crop',
  },
  {
    id: 'deep-ocean',
    title: 'Abyssal Light: Secrets of the Trench',
    description: 'Submersibles venture into the Mariana Trench to document bioluminescent leviathans and deep-sea volcanic ecosystems never before captured on camera.',
    category: 'Documentary',
    duration: '1h 42m',
    year: '2025',
    rating: 'ALL',
    matchScore: 98,
    isOriginal: false,
    quality: '4K Ultra HD',
    tags: ['Mesmerizing', 'Nature', 'Atmospheric'],
    cast: 'Dr. Sylvia Earle, David Attenborough',
    director: 'James Cameron',
    creatorName: 'Oceania Lab',
    views: 1670000,
    likes: 121000,
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=85&fit=crop',
  },
  {
    id: 'neural-dreams',
    title: 'Neural Dreams: The Painter of Memories',
    description: 'An emotional animated masterpiece exploring a memory archivist who reconstructs lost human experiences in a digital afterlife.',
    category: 'Animation',
    duration: '1h 45m',
    year: '2026',
    rating: 'ALL',
    matchScore: 97,
    isOriginal: true,
    quality: '4K Ultra HD',
    tags: ['Emotional', 'Artistic', 'Heartfelt'],
    cast: 'Makoto Shinkai Animation Studio',
    director: 'Makoto Shinkai',
    creatorName: 'Studio Ghibli & BeastBuck',
    views: 1530000,
    likes: 139000,
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=85&fit=crop',
  },
  {
    id: 'tokyo-drift-ai',
    title: 'HyperDrive: Midnight Tokyo',
    description: 'High-stakes underground electric hypercar street racing powered by custom autonomous telemetry and adrenaline-pumping speed.',
    category: 'Action',
    duration: '1h 49m',
    year: '2025',
    rating: '16+',
    matchScore: 96,
    isOriginal: false,
    quality: 'HD',
    tags: ['Fast-Paced', 'Cars', 'Adrenaline'],
    cast: 'Takeshi Kitano, Brian O\'Conner Jr.',
    director: 'Justin Lin',
    creatorName: 'Apex Racing',
    views: 1120000,
    likes: 85000,
    thumbnail: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=85&fit=crop',
  },
  {
    id: 'superconductor-dawn',
    title: 'Room Temperature: The Energy Revolution',
    description: 'The inside documentary of the race to discover room-temperature superconductivity, changing levitation, fusion power, and space exploration forever.',
    category: 'Technology',
    duration: '1h 38m',
    year: '2026',
    rating: 'ALL',
    matchScore: 98,
    isOriginal: true,
    quality: '4K Ultra HD',
    tags: ['Groundbreaking', 'Science', 'Inspirational'],
    cast: 'Nobel Laureates & Quantum Physicists',
    director: 'BeastBuck Science Lab',
    creatorName: 'Quantum Media',
    views: 1340000,
    likes: 92000,
    thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1920&q=85&fit=crop',
    poster: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&q=85&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1920&q=85&fit=crop',
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

  // Firestore + Curated Video States
  const [firestoreMovies, setFirestoreMovies] = useState([]);
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
  const [heroIndex, setHeroIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [likedMovies, setLikedMovies] = useState(new Set());
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Scroll listener for sticky Netflix header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Firestore Videos and blend with Curated Titles
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, 'funflix_videos'), limit(50));
        const snap = await getDocs(q);
        const dbMovies = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            description: data.description || '',
            category: data.category || 'General',
            duration: data.duration ? `${data.duration}m` : 'Short',
            year: data.createdAt?.toDate ? String(data.createdAt.toDate().getFullYear()) : '2026',
            rating: data.rating || '13+',
            matchScore: 96,
            quality: 'HD',
            tags: data.tags || ['Community Creation', 'Trending'],
            creatorName: data.creatorName || data.creatorUsername || 'Creator',
            views: data.views || 0,
            likes: Array.isArray(data.likes) ? data.likes.length : Number(data.likes || 0),
            thumbnail: data.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80',
            poster: data.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
            backdrop: data.thumbnail || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80',
          };
        });

        setFirestoreMovies(dbMovies);

        if (user?.uid) {
          const userVideos = dbMovies.filter(m => m.creatorId === user.uid);
          setMyMovies(userVideos);
        }
      } catch (err) {
        console.warn('Firestore FunFlix fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [user?.uid]);

  // Combined Master Movie Catalog
  const allMovies = useMemo(() => {
    // Merge Firestore movies with curated showcase
    return [...firestoreMovies, ...CURATED_TITLES];
  }, [firestoreMovies]);

  // Featured Billboard Slides
  const featuredBillboardList = useMemo(() => {
    return allMovies.slice(0, 5);
  }, [allMovies]);

  const heroMovie = featuredBillboardList[heroIndex] || CURATED_TITLES[0];

  // Auto-rotate Hero Billboard every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % featuredBillboardList.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [featuredBillboardList.length]);

  const toggleWatchlist = useCallback((movieId) => {
    setWatchlist(prev => {
      const exists = prev.includes(movieId);
      const next = exists ? prev.filter(id => id !== movieId) : [...prev, movieId];
      localStorage.setItem('funflix_watchlist', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleLike = useCallback((movieId) => {
    setLikedMovies(prev => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  }, []);

  // Filtered Titles for Active Category & Search
  const filteredCatalog = useMemo(() => {
    return allMovies.filter(movie => {
      const matchCat = selectedCategory === 'all' || movie.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = !searchQuery.trim() || 
        movie.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (movie.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [allMovies, selectedCategory, searchQuery]);

  // Top 10 Ranked List
  const top10List = useMemo(() => {
    return [...allMovies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  }, [allMovies]);

  // Genre Rows
  const sciFiMovies = useMemo(() => allMovies.filter(m => m.category === 'Sci-Fi' || m.tags?.includes('Futuristic')), [allMovies]);
  const actionMovies = useMemo(() => allMovies.filter(m => m.category === 'Action' || m.tags?.includes('Action')), [allMovies]);
  const documentaryMovies = useMemo(() => allMovies.filter(m => m.category === 'Documentary' || m.category === 'Technology'), [allMovies]);
  const comedyMovies = useMemo(() => allMovies.filter(m => m.category === 'Comedy' || m.tags?.includes('Hilarious')), [allMovies]);
  const savedWatchlistMovies = useMemo(() => allMovies.filter(m => watchlist.includes(m.id)), [allMovies, watchlist]);

  return (
    <div id="funflix-root" className="min-h-screen bg-[#141414] text-white font-sans antialiased selection:bg-[#E50914] selection:text-white pb-24 md:pb-12 select-none">
      
      {/* =========================================================================
          AUTHENTIC NETFLIX HEADER
          ========================================================================= */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-8 md:px-12 py-3 sm:py-4 flex items-center justify-between ${
        isScrolled 
          ? 'bg-[#141414]/95 shadow-xl shadow-black/80 backdrop-blur-md' 
          : 'bg-gradient-to-b from-black/90 via-black/50 to-transparent'
      }`}>
        {/* Left: Netflix Red Wordmark & Navigation Tabs */}
        <div className="flex items-center gap-4 sm:gap-8">
          
          {/* Back to AppShell */}
          <Link 
            to="/dashboard" 
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition active:scale-95" 
            title="Return to BeastBuck Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Signature FUNFLIX Logo */}
          <Link to="/funflix" className="flex items-center gap-1 group">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#E50914] drop-shadow-[0_0_15px_rgba(229,9,20,0.7)] group-hover:scale-105 transition-transform duration-200">
              FUNFLIX
            </span>
          </Link>

          {/* Netflix Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-gray-300">
            <button 
              onClick={() => { setActiveTab('browse'); setSelectedCategory('all'); }}
              className={`hover:text-white transition ${activeTab === 'browse' && selectedCategory === 'all' ? 'text-white font-bold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => { setActiveTab('browse'); setSelectedCategory('Sci-Fi'); }}
              className={`hover:text-white transition ${selectedCategory === 'Sci-Fi' ? 'text-white font-bold' : ''}`}
            >
              Series & AI
            </button>
            <button 
              onClick={() => { setActiveTab('browse'); setSelectedCategory('Action'); }}
              className={`hover:text-white transition ${selectedCategory === 'Action' ? 'text-white font-bold' : ''}`}
            >
              Films
            </button>
            <button 
              onClick={() => { setActiveTab('browse'); setSelectedCategory('Documentary'); }}
              className={`hover:text-white transition ${selectedCategory === 'Documentary' ? 'text-white font-bold' : ''}`}
            >
              New & Popular
            </button>
            <button 
              onClick={() => { setActiveTab('browse'); setSelectedCategory('all'); }}
              className="hover:text-white transition"
            >
              My List ({watchlist.length})
            </button>
            {isApprovedMember && (
              <button 
                onClick={() => setActiveTab('my-studio')}
                className={`hover:text-white transition flex items-center gap-1.5 ${activeTab === 'my-studio' ? 'text-white font-bold' : ''}`}
              >
                <Film className="w-3.5 h-3.5 text-[#E50914]" /> Creator Studio
              </button>
            )}
          </nav>
        </div>

        {/* Right: Expandable Search, Watchlist, Upload CTA & Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Netflix Smooth Expandable Search Bar */}
          <div className="relative flex items-center">
            {isSearchOpen ? (
              <div className="flex items-center bg-black/90 border border-white/40 rounded-full px-3 py-1.5 transition-all w-48 sm:w-64 animate-fade-in">
                <Search className="w-3.5 h-3.5 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Titles, creators, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder:text-gray-500 focus:outline-none w-full"
                />
                <button 
                  onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} 
                  className="text-gray-400 hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)} 
                className="p-1.5 text-gray-300 hover:text-white transition" 
                aria-label="Search FunFlix"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Upload Button for Creators */}
          {isApprovedMember && (
            <Link
              to="/funflix/upload"
              className="hidden sm:flex items-center gap-1.5 bg-[#E50914] hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded text-xs transition active:scale-95 shadow-md shadow-red-900/40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Video</span>
            </Link>
          )}

          {/* Netflix Signature Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(prev => !prev)}
              className="flex items-center gap-1.5 group p-0.5 rounded focus:outline-none"
              aria-label="Profile menu"
            >
              <div className="w-8 h-8 rounded bg-gradient-to-br from-red-600 to-indigo-700 flex items-center justify-center font-black text-white text-xs border border-white/20 shadow-md group-hover:border-white transition">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'B'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div 
                className="absolute right-0 mt-2 w-48 rounded-xl border border-white/15 bg-[#181818]/95 backdrop-blur-xl shadow-2xl py-2 z-50 animate-fade-in"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user?.displayName || 'BeastBuck Member'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user?.email || 'Active Streamer'}</p>
                </div>
                <button
                  onClick={() => { setActiveTab('my-studio'); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                >
                  <Film className="w-3.5 h-3.5 text-[#E50914]" /> Creator Studio
                </button>
                <Link
                  to="/funflix/playlists"
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" /> Watchlist ({watchlist.length})
                </Link>
                <Link
                  to="/funflix/ai"
                  className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" /> AI Movie Assistant
                </Link>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* =========================================================================
          MAIN BROWSE VIEW
          ========================================================================= */}
      {activeTab === 'browse' ? (
        <main>
          
          {/* =========================================================================
              NETFLIX CINEMATIC BILLBOARD HERO
              ========================================================================= */}
          {heroMovie && (
            <section className="relative w-full h-[78vh] sm:h-[84vh] min-h-[520px] max-h-[820px] bg-black overflow-hidden flex flex-col justify-end">
              
              {/* Full-bleed 4K Backdrop Wallpaper */}
              <div className="absolute inset-0 z-0">
                <img
                  src={heroMovie.backdrop || heroMovie.thumbnail}
                  alt={heroMovie.title}
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
                />
                
                {/* Netflix Multi-layer Vignette Shadows */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-black/30" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#141414] to-transparent" />
              </div>

              {/* Billboard Metadata & Play Controls */}
              <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 pb-16 sm:pb-24 space-y-3.5">
                
                {/* Netflix Original Emblem */}
                <div className="flex items-center gap-2">
                  <span className="text-[#E50914] font-black text-2xl tracking-tighter">N</span>
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-gray-200 drop-shadow">
                    FUNFLIX ORIGINAL
                  </span>
                </div>

                {/* Cinematic Title */}
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] line-clamp-2 max-w-3xl">
                  {heroMovie.title}
                </h1>

                {/* Meta Row Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold text-gray-200 drop-shadow">
                  <span className="bg-[#E50914] text-white px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 shadow-sm">
                    <TrendingUp className="w-3 h-3" /> TOP 10
                  </span>
                  <span className="text-emerald-400 font-extrabold">{heroMovie.matchScore}% Match</span>
                  <span className="border border-white/40 px-1.5 py-0.5 text-[10px] rounded text-white bg-black/40">
                    {heroMovie.rating}
                  </span>
                  <span>{heroMovie.duration}</span>
                  <span className="border border-white/30 px-1.5 py-0.5 text-[9px] rounded text-white font-mono bg-black/40">
                    {heroMovie.quality}
                  </span>
                  <span className="text-cyan-300 font-medium">Dir. {heroMovie.creatorName}</span>
                </div>

                {/* Synopsis */}
                <p className="text-xs sm:text-sm md:text-base text-gray-200/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {heroMovie.description}
                </p>

                {/* Netflix Authentic Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to={`/funflix/watch/${heroMovie.id}`}
                    className="bg-white hover:bg-gray-200 text-black font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-md text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                    <span>Play</span>
                  </Link>

                  <button
                    onClick={() => setSelectedMovie(heroMovie)}
                    className="bg-white/20 hover:bg-white/30 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-md text-sm sm:text-base flex items-center justify-center gap-2.5 backdrop-blur-md transition-all active:scale-95 border border-white/10"
                  >
                    <Info className="w-5 h-5" />
                    <span>More Info</span>
                  </button>

                  <button
                    onClick={() => toggleWatchlist(heroMovie.id)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/30 bg-black/40 hover:bg-white/20 text-white flex items-center justify-center transition active:scale-95"
                    aria-label="Add to Watchlist"
                    title={watchlist.includes(heroMovie.id) ? 'In My List' : 'Add to My List'}
                  >
                    {watchlist.includes(heroMovie.id) ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                  </button>

                  {/* Audio Mute/Unmute & Age Flag */}
                  <div className="ml-auto flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition active:scale-95"
                      aria-label="Toggle Sound"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                    </button>

                    <div className="border-l-2 border-white bg-black/40 px-3 py-1 text-xs font-bold text-gray-200">
                      {heroMovie.rating}
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* =========================================================================
              MAIN CONTENT ROWS & CATEGORIES
              ========================================================================= */}
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 space-y-8 sm:space-y-12 -mt-10 sm:-mt-16 relative z-30">
            
            {/* Netflix Category Subheader Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-white text-black font-extrabold shadow-lg shadow-white/10'
                      : 'bg-[#222]/80 text-gray-300 hover:bg-white/20 hover:text-white border border-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Filtered Search / Category Grid View */}
            {(selectedCategory !== 'all' || searchQuery.trim()) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#E50914]" />
                    <span>{searchQuery ? `Results for "${searchQuery}"` : selectedCategory}</span>
                  </h2>
                  <span className="text-xs text-gray-400">{filteredCatalog.length} titles</span>
                </div>

                {filteredCatalog.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 pt-2">
                    {filteredCatalog.map(movie => (
                      <NetflixMovieCard
                        key={movie.id}
                        movie={movie}
                        onQuickView={setSelectedMovie}
                        isSaved={watchlist.includes(movie.id)}
                        onToggleSave={() => toggleWatchlist(movie.id)}
                        isLiked={likedMovies.has(movie.id)}
                        onToggleLike={() => toggleLike(movie.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-white mb-1">No matching titles found</h3>
                    <p className="text-xs text-gray-400">Try searching with a different keyword or category.</p>
                  </div>
                )}
              </div>
            )}

            {/* Netflix Content Rows (Only shown when not searching and category is 'All') */}
            {selectedCategory === 'all' && !searchQuery.trim() && (
              <>
                {/* Netflix Authentic Top 10 Number Cards Row */}
                <Top10Row 
                  movies={top10List} 
                  onQuickView={setSelectedMovie}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                  likedMovies={likedMovies}
                  onToggleLike={toggleLike}
                />

                {/* Netflix Row: Trending Now */}
                <NetflixRow 
                  title="Trending Now" 
                  movies={allMovies} 
                  onQuickView={setSelectedMovie}
                  watchlist={watchlist}
                  onToggleWatchlist={toggleWatchlist}
                  likedMovies={likedMovies}
                  onToggleLike={toggleLike}
                />

                {/* Netflix Row: Sci-Fi & Artificial Intelligence */}
                {sciFiMovies.length > 0 && (
                  <NetflixRow 
                    title="Sci-Fi & Cyberpunk Hits" 
                    movies={sciFiMovies} 
                    onQuickView={setSelectedMovie}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                    likedMovies={likedMovies}
                    onToggleLike={toggleLike}
                  />
                )}

                {/* Netflix Row: Action & High-Octane */}
                {actionMovies.length > 0 && (
                  <NetflixRow 
                    title="Action & Adrenaline" 
                    movies={actionMovies} 
                    onQuickView={setSelectedMovie}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                    likedMovies={likedMovies}
                    onToggleLike={toggleLike}
                  />
                )}

                {/* Netflix Row: Award-Winning Documentaries */}
                {documentaryMovies.length > 0 && (
                  <NetflixRow 
                    title="Award-Winning Science & Discoveries" 
                    movies={documentaryMovies} 
                    onQuickView={setSelectedMovie}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                    likedMovies={likedMovies}
                    onToggleLike={toggleLike}
                  />
                )}

                {/* Netflix Row: Comedy & Lighthearted */}
                {comedyMovies.length > 0 && (
                  <NetflixRow 
                    title="Comedies & Feel-Good Shorts" 
                    movies={comedyMovies} 
                    onQuickView={setSelectedMovie}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                    likedMovies={likedMovies}
                    onToggleLike={toggleLike}
                  />
                )}

                {/* Netflix Row: User Watchlist */}
                {savedWatchlistMovies.length > 0 && (
                  <NetflixRow 
                    title="My List" 
                    movies={savedWatchlistMovies} 
                    onQuickView={setSelectedMovie}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                    likedMovies={likedMovies}
                    onToggleLike={toggleLike}
                  />
                )}
              </>
            )}

          </div>

        </main>
      ) : (
        /* =========================================================================
            CREATOR STUDIO TAB
            ========================================================================= */
        <main className="max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 py-24 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                <Film className="w-8 h-8 text-[#E50914]" /> Creator Studio
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">Publish, analyze, and manage your FunFlix video creations.</p>
            </div>
            
            <Link
              to="/funflix/upload"
              className="bg-[#E50914] hover:bg-red-700 text-white font-extrabold px-5 py-2.5 rounded text-xs sm:text-sm flex items-center gap-2 transition shadow-lg"
            >
              <Upload className="w-4 h-4" /> Upload New Title
            </Link>
          </div>

          <div className="bg-[#181818] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {myMovies.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-black/60 text-gray-400 border-b border-white/10 uppercase text-[11px]">
                      <th className="py-3.5 px-4 font-bold">Title</th>
                      <th className="py-3.5 px-4 font-bold">Category</th>
                      <th className="py-3.5 px-4 font-bold">Views</th>
                      <th className="py-3.5 px-4 font-bold">Likes</th>
                      <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myMovies.map(movie => (
                      <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={movie.thumbnail} alt={movie.title} className="w-14 h-9 object-cover rounded border border-white/10" />
                            <span className="font-bold text-white line-clamp-1">{movie.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{movie.category}</td>
                        <td className="py-3 px-4 font-bold text-white">{movie.views.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-emerald-400">{movie.likes}</td>
                        <td className="py-3 px-4 text-right">
                          <Link to={`/funflix/watch/${movie.id}`} className="p-1 text-gray-300 hover:text-white" title="Watch">
                            <Play className="w-4 h-4 inline" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 px-4 text-center">
                <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Published Videos</h3>
                <p className="text-xs text-gray-400 mb-4">Start publishing your creations to the FunFlix community.</p>
                <Link
                  to="/funflix/upload"
                  className="bg-[#E50914] text-white font-bold px-4 py-2 rounded text-xs hover:bg-red-700 transition"
                >
                  Publish Video
                </Link>
              </div>
            )}
          </div>
        </main>
      )}

      {/* =========================================================================
          NETFLIX AUTHENTIC "MORE INFO" MODAL
          ========================================================================= */}
      {selectedMovie && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setSelectedMovie(null)}
        >
          <div 
            className="bg-[#181818] border border-white/15 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl relative my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Cross Button */}
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition border border-white/20 active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Hero Banner */}
            <div className="relative aspect-video w-full bg-black overflow-hidden">
              <img 
                src={selectedMovie.backdrop || selectedMovie.thumbnail} 
                alt={selectedMovie.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/30 to-transparent" />

              {/* Title & Action Buttons Overlay */}
              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#E50914] font-black text-xl">N</span>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-300">FUNFLIX ORIGINAL</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">
                  {selectedMovie.title}
                </h2>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/funflix/watch/${selectedMovie.id}`}
                    className="bg-white hover:bg-gray-200 text-black font-extrabold px-6 py-2 rounded-md text-sm flex items-center gap-2 transition"
                  >
                    <Play className="w-4 h-4 fill-black ml-0.5" /> Play
                  </Link>

                  <button
                    onClick={() => toggleWatchlist(selectedMovie.id)}
                    className="w-9 h-9 rounded-full border border-white/40 bg-black/50 hover:bg-white/20 text-white flex items-center justify-center transition"
                    title={watchlist.includes(selectedMovie.id) ? 'Remove from My List' : 'Add to My List'}
                  >
                    {watchlist.includes(selectedMovie.id) ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => toggleLike(selectedMovie.id)}
                    className="w-9 h-9 rounded-full border border-white/40 bg-black/50 hover:bg-white/20 text-white flex items-center justify-center transition"
                    title="Like"
                  >
                    <ThumbsUp className={`w-4 h-4 ${likedMovies.has(selectedMovie.id) ? 'text-[#E50914] fill-[#E50914]' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body: Two Column Netflix Layout */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left Column: Metadata & Synopsis */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-300">
                    <span className="text-emerald-400 font-extrabold">{selectedMovie.matchScore}% Match</span>
                    <span>{selectedMovie.year}</span>
                    <span className="border border-white/40 px-1 text-[10px] rounded text-white bg-black/40">
                      {selectedMovie.rating}
                    </span>
                    <span>{selectedMovie.duration}</span>
                    <span className="border border-white/30 px-1 text-[9px] rounded font-mono text-white">
                      {selectedMovie.quality}
                    </span>
                  </div>

                  <p className="text-sm text-gray-200 leading-relaxed">
                    {selectedMovie.description}
                  </p>
                </div>

                {/* Right Column: Cast, Genres, Mood */}
                <div className="text-xs space-y-2 text-gray-400 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                  {selectedMovie.cast && (
                    <p><span className="text-gray-500">Cast:</span> <span className="text-gray-200">{selectedMovie.cast}</span></p>
                  )}
                  {selectedMovie.director && (
                    <p><span className="text-gray-500">Director:</span> <span className="text-gray-200">{selectedMovie.director}</span></p>
                  )}
                  <p><span className="text-gray-500">Genre:</span> <span className="text-gray-200">{selectedMovie.category}</span></p>
                  {selectedMovie.tags && (
                    <p><span className="text-gray-500">Tags:</span> <span className="text-gray-200">{selectedMovie.tags.join(', ')}</span></p>
                  )}
                </div>
              </div>

              {/* Netflix "More Like This" Grid */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-white">More Like This</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allMovies
                    .filter(m => m.id !== selectedMovie.id)
                    .slice(0, 6)
                    .map(sim => (
                      <div 
                        key={sim.id}
                        onClick={() => setSelectedMovie(sim)}
                        className="bg-[#222] rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition cursor-pointer group"
                      >
                        <div className="aspect-video relative">
                          <img src={sim.thumbnail} alt={sim.title} className="w-full h-full object-cover" />
                          <span className="absolute top-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                            {sim.duration}
                          </span>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold text-[10px]">{sim.matchScore}% Match</span>
                            <span className="border border-white/30 text-[9px] px-1 rounded text-gray-300">{sim.rating}</span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-[#E50914] transition">{sim.title}</h4>
                          <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight">{sim.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* =========================================================================
   NETFLIX TOP 10 NUMBER ROW WITH 3D METALLIC NUMBERS
   ========================================================================= */
function Top10Row({ movies, onQuickView, watchlist, onToggleWatchlist, likedMovies, onToggleLike }) {
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
      <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
        <span className="text-[#E50914] font-black">TOP 10</span> Movies in BeastBuck Today
      </h2>

      {/* Row Paddle Left */}
      <button
        onClick={() => scroll('left')}
        className="hidden sm:flex absolute left-0 top-10 bottom-0 z-30 w-12 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover/top10:opacity-100 items-center justify-center transition-opacity backdrop-blur-sm"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Row Paddle Right */}
      <button
        onClick={() => scroll('right')}
        className="hidden sm:flex absolute right-0 top-10 bottom-0 z-30 w-12 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover/top10:opacity-100 items-center justify-center transition-opacity backdrop-blur-sm"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div 
        ref={rowRef} 
        className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-4 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x"
      >
        {movies.map((movie, idx) => (
          <div 
            key={movie.id} 
            className="flex items-end shrink-0 group/card cursor-pointer relative"
            onClick={() => onQuickView(movie)}
          >
            {/* Netflix 3D Stylized Metallic Number */}
            <span className="text-7xl sm:text-9xl md:text-[120px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-gray-200 via-gray-500 to-black select-none font-mono drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] opacity-95 group-hover/card:text-[#E50914] transition-colors -mr-4 sm:-mr-6 z-10">
              {idx + 1}
            </span>

            {/* Vertical Movie Poster Card */}
            <div className="w-28 sm:w-36 md:w-44 aspect-[2/3] bg-zinc-900 rounded-lg overflow-hidden relative border border-white/10 group-hover/card:scale-105 group-hover/card:z-20 transition-all duration-300 shadow-xl">
              <img src={movie.poster || movie.thumbnail} alt={movie.title} className="w-full h-full object-cover" />
              
              {/* N Badge */}
              <span className="absolute top-1.5 left-1.5 text-[#E50914] font-black text-xs drop-shadow">N</span>

              {/* Bottom Gradient Label */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-2">
                <p className="text-[11px] font-bold text-white truncate">{movie.title}</p>
                <p className="text-[9px] text-emerald-400 font-bold">{movie.matchScore}% Match</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   NETFLIX STANDARD HORIZONTAL ROW
   ========================================================================= */
function NetflixRow({ title, movies, onQuickView, watchlist, onToggleWatchlist, likedMovies, onToggleLike }) {
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
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-white flex items-center gap-1.5">
          <span>{title}</span>
          <ChevronRight className="w-4 h-4 text-cyan-400 opacity-0 group-hover/row:opacity-100 transition-opacity" />
        </h2>
      </div>

      {/* Row Paddle Left */}
      <button
        onClick={() => scroll('left')}
        className="hidden sm:flex absolute left-0 top-8 bottom-0 z-30 w-12 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover/row:opacity-100 items-center justify-center transition-opacity backdrop-blur-sm"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      {/* Row Paddle Right */}
      <button
        onClick={() => scroll('right')}
        className="hidden sm:flex absolute right-0 top-8 bottom-0 z-30 w-12 bg-black/70 hover:bg-black/90 text-white opacity-0 group-hover/row:opacity-100 items-center justify-center transition-opacity backdrop-blur-sm"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Horizontal Cards Reel */}
      <div 
        ref={rowRef} 
        className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto py-4 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] touch-pan-x"
      >
        {movies.map((movie) => (
          <NetflixMovieCard
            key={movie.id}
            movie={movie}
            onQuickView={onQuickView}
            isSaved={watchlist.includes(movie.id)}
            onToggleSave={() => onToggleWatchlist?.(movie.id)}
            isLiked={likedMovies.has(movie.id)}
            onToggleLike={() => onToggleLike?.(movie.id)}
          />
        ))}
      </div>
    </section>
  );
}

/* =========================================================================
   NETFLIX EXPANDING HOVER CARD
   ========================================================================= */
function NetflixMovieCard({ movie, onQuickView, isSaved, onToggleSave, isLiked, onToggleLike }) {
  const navigate = useNavigate();

  return (
    <div 
      className="group relative shrink-0 w-40 sm:w-56 md:w-64 aspect-video bg-zinc-900 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 shadow-md cursor-pointer transition-all duration-300 hover:scale-105 hover:z-30 hover:shadow-2xl"
      onClick={() => onQuickView(movie)}
    >
      <img
        src={movie.thumbnail}
        alt={movie.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Netflix N Emblem */}
      <span className="absolute top-1.5 left-1.5 text-[#E50914] font-black text-xs drop-shadow">N</span>

      <span className="absolute top-1.5 right-1.5 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/20">
        {movie.duration}
      </span>

      {/* Hover Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 flex flex-col justify-between">
        
        {/* Top Actions: Add to Watchlist & Like */}
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleLike?.(); }}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition border border-white/20"
            title="Like"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'text-[#E50914] fill-[#E50914]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
            className="w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition border border-white/20"
            title={isSaved ? 'In My List' : 'Add to My List'}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5 text-white" />}
          </button>
        </div>

        {/* Bottom Details & Play CTA */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/funflix/watch/${movie.id}`);
                }}
                className="w-7 h-7 rounded-full bg-white hover:bg-gray-200 text-black flex items-center justify-center shadow-md transition active:scale-95"
                title="Play Video"
              >
                <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
              </button>

              <span className="text-[10px] font-extrabold text-emerald-400">{movie.matchScore}% Match</span>
              <span className="text-[9px] border border-white/40 px-1 text-gray-300 rounded font-mono">{movie.rating}</span>
            </div>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onQuickView(movie); }}
              className="w-6 h-6 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white/20"
              title="More Info"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
          
          <div className="flex items-center gap-1 text-[10px] text-gray-300 truncate">
            {movie.tags ? (
              <span>{movie.tags.slice(0, 2).join(' • ')}</span>
            ) : (
              <span>{movie.category}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
