import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ShieldCheck, Filter, Users, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { cn } from '../../lib/utils';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase/config';

export default function CreatorsHub() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [creators, setCreators] = useState([]);

  const categories = ['All', 'Technology', 'Science', 'Design', 'Business', 'Education'];

  useEffect(() => {
    async function loadCreators() {
      try {
        const snap = await getDocs(query(collection(db, 'creatorProfiles'), orderBy('reputation', 'desc')));
        const fetchedCreators = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            username: data.username || 'user',
            displayName: data.displayName || 'Creator',
            bio: data.bio || 'No bio provided.',
            reputation: data.reputation || 0,
            level: 'Creator', // Default level or derive from reputation
            trustScore: 100, // Default or derive from verified status
            csat: 100, // Default
            verified: data.verified || false,
            skills: data.skills || [],
            metrics: {
              products: data.resources || 0,
              services: 0,
              students: data.followers || 0
            },
            avatarColor: 'from-purple-500 to-accent'
          };
        });
        setCreators(fetchedCreators);
      } catch (error) {
        console.error("Error loading creators:", error);
      }
      setLoading(false);
    }
    loadCreators();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Creators Hub"
        description="Discover top builders, researchers, educators, and innovators in the BeastBuck Ecosystem."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Active Creators" value="1,204" icon={Users} color="text-accent" />
        <StatCard label="Total Resources Published" value="8,405" icon={Star} color="text-yellow-400" />
        <StatCard label="Top Category" value="Technology" icon={TrendingUp} color="text-blue-400" />
        <StatCard label="Avg. Trust Score" value="94%" icon={ShieldCheck} color="text-green-400" />
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors",
                activeCategory === cat 
                  ? "border-accent bg-accent/10 text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)]" 
                  : "border-border bg-surface/50 text-text-muted hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search creators..." 
              className="w-full rounded-xl border border-border bg-surface/40 py-2 pl-9 pr-4 text-sm text-white placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-3 py-2 text-text-soft hover:text-white">
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-12 text-center text-text-muted">Loading creators...</div>
        ) : creators.length === 0 ? (
          <div className="col-span-full py-12 text-center text-text-muted">No creators found.</div>
        ) : (
          creators.map(creator => (
            <CreatorCard key={creator.id} creator={creator} />
          ))
        )}
      </div>
    </PageContainer>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-border bg-surface/40 p-5 backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</p>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <p className="font-heading text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function CreatorCard({ creator }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-surface/40 p-1 transition-all hover:border-accent/50 hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.15)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      
      <div className="relative flex flex-col gap-4 rounded-lg bg-background/80 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-lg font-bold text-white shadow-lg", creator.avatarColor)}>
              {creator.displayName.charAt(0)}
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 font-bold text-white">
                {creator.displayName}
                {creator.verified && <CheckCircle2 className="h-4 w-4 text-blue-400" />}
              </h3>
              <p className="text-sm text-text-muted">@{creator.username}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
              <Sparkles className="h-3 w-3" />
              {creator.level}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-yellow-400">
              <Star className="h-3 w-3 fill-yellow-400" />
              {creator.csat}% CSAT
            </div>
          </div>
        </div>
        
        <p className="line-clamp-2 text-sm text-text-soft">{creator.bio}</p>
        
        <div className="flex flex-wrap gap-2">
          {creator.skills.map(skill => (
            <span key={skill} className="rounded-md border border-border bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {skill}
            </span>
          ))}
        </div>
        
        <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border/50 pt-4">
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-text-muted">Rep</p>
            <p className="font-bold text-white">{creator.reputation.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-text-muted">Assets</p>
            <p className="font-bold text-white">{creator.metrics.products}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold uppercase text-text-muted">Trust</p>
            <p className="font-bold text-green-400">{creator.trustScore}</p>
          </div>
        </div>
        
        <Link 
          to={`/creator/${creator.username}`}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
