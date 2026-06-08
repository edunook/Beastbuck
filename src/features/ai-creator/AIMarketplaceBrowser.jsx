import { PageContainer } from '../../components/layout/LayoutWrappers';
import { Star, MessageSquare, TrendingUp, Sparkles, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Educational', 'Research', 'Coding', 'Business', 'Creative', 'Fun', 'Productivity', 'Science', 'Leadership'];

const FEATURED_AIS = [
  { id: 'physics', name: 'Physics Guru', emoji: '⚛️', desc: 'Explains physics with humor and real-world analogies.', rating: 4.9, chats: '4.2K', creator: 'Dr. Sarah Chen', category: 'Educational' },
  { id: 'startup', name: 'Startup Coach', emoji: '🚀', desc: 'Guides founders through ideation to pitch.', rating: 4.7, chats: '2.1K', creator: 'Marcus Sterling', category: 'Business' },
  { id: 'code', name: 'Code Reviewer', emoji: '💻', desc: 'Reviews code and suggests best practices.', rating: 4.8, chats: '6.1K', creator: 'Alex Rivera', category: 'Coding' },
  { id: 'chem', name: 'Chemistry Lab', emoji: '🧪', desc: 'Interactive chemistry experiments and explanations.', rating: 4.6, chats: '1.8K', creator: 'Dr. Kim', category: 'Science' },
  { id: 'story', name: 'Story Weaver', emoji: '📖', desc: 'Creates immersive fiction in any genre.', rating: 4.5, chats: '3.4K', creator: 'Luna Park', category: 'Creative' },
  { id: 'meme', name: 'Meme Lord', emoji: '😂', desc: 'Generates the dankest memes and jokes.', rating: 4.3, chats: '8.9K', creator: 'Intern Squad', category: 'Fun' },
  { id: 'research', name: 'Research Analyst', emoji: '🔬', desc: 'Summarizes papers and finds research gaps.', rating: 4.8, chats: '1.2K', creator: 'Prof. Zhang', category: 'Research' },
  { id: 'market', name: 'Marketing Guru', emoji: '📢', desc: 'Creates campaigns, copy, and growth strategies.', rating: 4.4, chats: '2.8K', creator: 'Growth Team', category: 'Business' },
];

export default function AIMarketplaceBrowser() {
  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-3">Discover AI Assistants</h1>
        <p className="text-text-muted max-w-xl mx-auto">Explore community-created AIs built for learning, research, coding, creativity, and fun.</p>
        <div className="mt-6 max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input type="text" placeholder="Search AIs by name, category, or expertise..." className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent transition" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {CATEGORIES.map((cat, i) => (
          <button key={cat} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${i === 0 ? 'bg-accent text-black' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="text-accent" /> Featured</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_AIS.slice(0, 4).map(ai => (
            <Link key={ai.id} to={`/ais/${ai.id}`} className="group rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition hover:border-accent/50 hover:shadow-[0_0_25px_rgba(208,255,0,0.05)]">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-2xl">{ai.emoji}</div>
                <span className="bg-white/5 text-text-muted text-[10px] font-bold px-2 py-0.5 rounded-full">{ai.category}</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-accent transition">{ai.name}</h3>
              <p className="text-xs text-text-muted line-clamp-2 mt-1 mb-3">{ai.desc}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {ai.rating}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {ai.chats}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="text-emerald-400" /> Trending</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_AIS.slice(4).map(ai => (
            <Link key={ai.id} to={`/ais/${ai.id}`} className="group rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition hover:border-accent/50 hover:shadow-[0_0_25px_rgba(208,255,0,0.05)]">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-2xl">{ai.emoji}</div>
                <span className="bg-white/5 text-text-muted text-[10px] font-bold px-2 py-0.5 rounded-full">{ai.category}</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-accent transition">{ai.name}</h3>
              <p className="text-xs text-text-muted line-clamp-2 mt-1 mb-3">{ai.desc}</p>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {ai.rating}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {ai.chats}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
