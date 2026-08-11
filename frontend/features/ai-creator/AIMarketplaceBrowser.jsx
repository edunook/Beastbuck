import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import {
  ArrowRight,
  Bot,
  Compass,
  Filter,
  Layers,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Wand2,
  Zap,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import EmptyState from '@frontend/components/ui/EmptyState';
import { SafeImage } from '@frontend/features/creative/CreativityPage';
import { db } from '@services/firebase/config';
import { cn } from '@shared/lib/utils';

const CATEGORIES = ['All', 'Educational', 'Research', 'Coding', 'Business', 'Creative', 'Fun', 'Productivity', 'Science', 'Leadership'];

const marketplaceStyles = `
  .ai-market-shell {
    position: relative;
    overflow: hidden;
    color: #eef7ff;
  }

  .ai-market-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 10% 9%, rgba(0, 245, 255, 0.24), transparent 24rem),
      radial-gradient(circle at 88% 12%, rgba(255, 54, 171, 0.22), transparent 26rem),
      radial-gradient(circle at 78% 84%, rgba(132, 92, 255, 0.25), transparent 30rem),
      radial-gradient(circle at 16% 90%, rgba(30, 255, 188, 0.13), transparent 28rem),
      linear-gradient(135deg, rgba(3, 7, 24, 0.94), rgba(7, 12, 40, 0.96) 42%, rgba(22, 8, 39, 0.97));
    z-index: -1;
  }

  .ai-market-glass {
    border: 1px solid rgba(147, 197, 253, 0.22);
    background:
      linear-gradient(145deg, rgba(21, 28, 64, 0.86), rgba(6, 23, 49, 0.78) 42%, rgba(37, 17, 58, 0.78)),
      radial-gradient(circle at top left, rgba(34, 211, 238, 0.12), transparent 22rem),
      radial-gradient(circle at bottom right, rgba(244, 114, 182, 0.12), transparent 20rem);
    box-shadow: 0 26px 88px rgba(0, 0, 0, 0.34), 0 0 42px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px);
  }

  .ai-market-card {
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }

  .ai-market-card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.38);
    background:
      linear-gradient(145deg, rgba(27, 39, 85, 0.92), rgba(9, 39, 70, 0.82) 42%, rgba(55, 20, 77, 0.84)),
      radial-gradient(circle at 18% 0%, rgba(34, 211, 238, 0.2), transparent 17rem),
      radial-gradient(circle at 92% 100%, rgba(244, 114, 182, 0.18), transparent 17rem);
    box-shadow: 0 26px 78px rgba(15, 23, 42, 0.42), 0 0 34px rgba(34, 211, 238, 0.1), 0 0 0 1px rgba(244, 114, 182, 0.08);
  }

  .ai-market-input {
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(6, 12, 27, 0.62);
    color: #f8fbff;
    transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .ai-market-input:focus {
    border-color: rgba(244, 114, 182, 0.74);
    box-shadow: 0 0 0 4px rgba(244, 114, 182, 0.12), 0 0 24px rgba(34, 211, 238, 0.08);
    outline: none;
  }

  .ai-market-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(103, 232, 249, 0.34) transparent;
  }

  .ai-market-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(34,211,238,0.16), rgba(244,114,182,0.13), rgba(255,255,255,0.06));
    background-size: 220% 100%;
    animation: ai-market-shimmer 1.1s ease-in-out infinite;
  }

  .ai-market-title {
    background: linear-gradient(90deg, #ffffff 0%, #bff9ff 32%, #d7c8ff 62%, #ffc1e2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .ai-market-orb {
    background:
      radial-gradient(circle at 28% 24%, rgba(255,255,255,0.58), transparent 0.9rem),
      conic-gradient(from 140deg, #22d3ee, #8b5cf6, #f472b6, #bef264, #22d3ee);
    box-shadow: 0 18px 42px rgba(34, 211, 238, 0.18), inset 0 1px 0 rgba(255,255,255,0.22);
  }

  @keyframes ai-market-shimmer {
    0% { background-position: 180% 0; }
    100% { background-position: -40% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-market-card,
    .ai-market-input,
    .ai-market-skeleton {
      animation: none !important;
      transition: none !important;
    }

    .ai-market-card:hover {
      transform: none;
    }
  }
`;

function formatNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString() : '0';
}

function getFocusList(ai) {
  return Array.isArray(ai?.focusAreas) ? ai.focusAreas.filter(Boolean) : [];
}

function getRating(ai) {
  return typeof ai.avgRating === 'number' && ai.avgRating > 0 ? ai.avgRating.toFixed(1) : '5.0';
}

function Avatar({ ai, className }) {
  return (
    <div className={cn(
      'ai-market-orb relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/25 text-2xl font-black text-slate-950',
      className
    )}>
      {ai.avatarUrl ? (
        <SafeImage src={ai.avatarUrl} alt={ai.name || 'AI avatar'} className="h-full w-full object-cover" />
      ) : (
        ai.emoji || 'AI'
      )}
      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-slate-950 bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.75)]" />
    </div>
  );
}

function MarketplaceSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="ai-market-glass rounded-[1.5rem] p-5">
          <div className="flex items-center gap-4">
            <div className="ai-market-skeleton h-14 w-14 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="ai-market-skeleton h-5 w-2/3 rounded-full" />
              <div className="ai-market-skeleton h-3 w-1/2 rounded-full" />
            </div>
          </div>
          <div className="ai-market-skeleton mt-5 h-20 rounded-2xl" />
          <div className="ai-market-skeleton mt-4 h-11 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/18 via-violet-300/16 to-pink-300/16 text-cyan-50">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-bold text-slate-400">{label}</p>
    </div>
  );
}

function AIStoreCard({ ai, featured = false }) {
  const focusList = getFocusList(ai);
  const categoryBadge = focusList[0] || ai.personality || 'Member AI';

  return (
    <article className={cn(
      'ai-market-glass ai-market-card flex min-w-0 flex-col rounded-[1.5rem] p-5',
      featured && 'bg-gradient-to-br from-cyan-300/16 via-violet-300/14 to-pink-300/12'
    )}>
      <div className="flex items-start justify-between gap-3">
        <Avatar ai={ai} className={featured ? 'h-16 w-16 text-3xl' : ''} />
        <span className="max-w-[9rem] truncate rounded-full border border-pink-200/25 bg-gradient-to-r from-cyan-300/12 via-violet-300/12 to-pink-300/12 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-pink-100">
          {categoryBadge}
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <h3 className={cn('truncate font-black text-white', featured ? 'text-2xl' : 'text-xl')}>
          {ai.name || 'Untitled AI'}
        </h3>
        <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs font-bold text-slate-400">
          <User className="h-3.5 w-3.5 shrink-0 text-cyan-200/80" />
          <span className="truncate">By {ai.creatorName || 'Member'}</span>
        </p>
        <p className={cn('mt-4 text-sm leading-6 text-slate-400', featured ? 'line-clamp-4 min-h-[6rem]' : 'line-clamp-3 min-h-[4.5rem]')}>
          {ai.description || 'Custom AI assistant created by a BeastBuck member.'}
        </p>
      </div>

      <div className="mt-4 flex min-h-[2rem] flex-wrap gap-2">
        {(focusList.length ? focusList.slice(0, 3) : [ai.personality || 'General']).map(area => (
          <span key={area} className="rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[0.68rem] font-bold text-slate-300">
            {area}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-white/85">
          <Star className="h-3.5 w-3.5 fill-lime-200 text-lime-200" />
          {getRating(ai)}
        </span>
        <span className="flex items-center justify-end gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-cyan-200" />
          {formatNumber(ai.totalChats)} chats
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Link
          to={`/ais/${ai.id}/chat`}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 px-4 py-2 text-sm font-black text-slate-950 shadow-[0_16px_36px_rgba(34,211,238,0.14)] transition hover:brightness-110"
        >
          <MessageSquare className="h-4 w-4" />
          Launch Chat
        </Link>
        <Link
          to={`/ais/${ai.id}`}
          className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white transition hover:border-cyan-200/35 hover:bg-white/[0.1]"
          title="View AI details"
        >
          <ArrowRight className="h-4 w-4" />
          <span className="ml-2 sm:sr-only">Details</span>
        </Link>
      </div>
    </article>
  );
}

export default function AIMarketplaceBrowser() {
  const [ais, setAis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchMarketplaceAIs = async () => {
      try {
        setLoadError('');
        setLoading(true);
        let aisSnap;
        try {
          const aisQuery = query(
            collection(db, 'custom_ais'),
            orderBy('createdAt', 'desc')
          );
          aisSnap = await getDocs(aisQuery);
        } catch {
          aisSnap = await getDocs(collection(db, 'custom_ais'));
        }

        const list = aisSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAis(list);
      } catch (err) {
        console.error('Failed to load member AIs from Firestore:', err);
        setLoadError(err.message || 'Failed to load marketplace AIs.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceAIs();
  }, []);

  const stats = useMemo(() => {
    const totalChats = ais.reduce((sum, ai) => sum + (ai.totalChats || 0), 0);
    const creators = new Set(ais.map(ai => ai.creatorId || ai.creatorName).filter(Boolean)).size;
    const categories = new Set(ais.flatMap(ai => getFocusList(ai))).size;

    return {
      assistants: ais.length,
      totalChats,
      creators,
      categories,
    };
  }, [ais]);

  const categoryCounts = useMemo(() => {
    const counts = Object.fromEntries(CATEGORIES.map(category => [category, 0]));
    counts.All = ais.length;

    ais.forEach(ai => {
      const searchable = [
        ai.personality,
        ai.tone,
        ...getFocusList(ai),
      ].join(' ').toLowerCase();

      CATEGORIES.filter(category => category !== 'All').forEach(category => {
        if (searchable.includes(category.toLowerCase())) {
          counts[category] += 1;
        }
      });
    });

    return counts;
  }, [ais]);

  const filteredAIs = useMemo(() => {
    return ais.filter(ai => {
      let matchesCat = selectedCategory === 'All';
      if (!matchesCat) {
        const catLower = selectedCategory.toLowerCase();
        const personality = (ai.personality || '').toLowerCase();
        const focusAreas = getFocusList(ai).map(f => f.toLowerCase());
        const tone = (ai.tone || '').toLowerCase();
        matchesCat = personality.includes(catLower) ||
          focusAreas.some(f => f.includes(catLower)) ||
          tone.includes(catLower);
      }

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (ai.name || '').toLowerCase();
        const desc = (ai.description || '').toLowerCase();
        const creator = (ai.creatorName || '').toLowerCase();
        const focus = getFocusList(ai).join(' ').toLowerCase();
        const personality = (ai.personality || '').toLowerCase();
        matchesSearch = name.includes(q) || desc.includes(q) || creator.includes(q) || focus.includes(q) || personality.includes(q);
      }

      return matchesCat && matchesSearch;
    });
  }, [ais, searchQuery, selectedCategory]);

  const featuredAIs = useMemo(() => {
    return [...ais]
      .sort((a, b) => ((b.avgRating || 0) * 100 + (b.totalChats || 0)) - ((a.avgRating || 0) * 100 + (a.totalChats || 0)))
      .slice(0, 3);
  }, [ais]);

  const topCategorySections = useMemo(() => {
    return CATEGORIES
      .filter(category => category !== 'All' && categoryCounts[category] > 0)
      .slice(0, 4);
  }, [categoryCounts]);

  return (
    <PageContainer className="ai-market-shell max-w-[1760px]">
      <style>{marketplaceStyles}</style>

      <section className="ai-market-glass mb-6 overflow-hidden rounded-[1.75rem] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.28fr)_minmax(300px,0.72fr)] lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200/25 bg-gradient-to-r from-cyan-300/12 via-violet-300/12 to-pink-300/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
              <Compass className="h-3.5 w-3.5" />
              AI Marketplace
            </div>
            <h1 className="ai-market-title max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              Discover member-built AIs in a polished, high-end assistant store.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Browse real community assistants, search by creator or topic, filter by expertise, view details, and launch a chat instantly.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="relative block min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search AIs by name, creator, focus, or personality..."
                  className="ai-market-input min-h-[52px] w-full rounded-2xl pl-12 pr-4 text-sm"
                />
              </label>
              <Link
                to="/ai-studio"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 px-5 py-3 text-sm font-black text-slate-950 shadow-[0_18px_42px_rgba(34,211,238,0.16)] transition hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                Build AI
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            <Metric icon={Bot} label="Assistants" value={formatNumber(stats.assistants)} />
            <Metric icon={MessageSquare} label="Chats" value={formatNumber(stats.totalChats)} />
            <Metric icon={User} label="Creators" value={formatNumber(stats.creators)} />
            <Metric icon={Layers} label="Focus Areas" value={formatNumber(stats.categories)} />
          </div>
        </div>
      </section>

      <section className="ai-market-glass mb-7 rounded-[1.5rem] p-3">
        <div className="ai-market-scroll flex gap-2 overflow-x-auto pb-1">
          <span className="hidden h-11 shrink-0 items-center gap-2 px-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500 sm:inline-flex">
            <Filter className="h-4 w-4" />
            Categories
          </span>
          {CATEGORIES.map(category => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-black transition sm:text-sm',
                  isActive
                    ? 'border-white/35 bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 text-slate-950 shadow-[0_12px_28px_rgba(244,114,182,0.16)]'
                    : 'border-white/10 bg-white/[0.055] text-slate-200 hover:border-pink-200/35 hover:bg-white/[0.085]'
                )}
              >
                <span>{category}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem]', isActive ? 'bg-slate-950/10' : 'bg-white/[0.075] text-slate-400')}>
                  {categoryCounts[category] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <MarketplaceSkeleton />
      ) : loadError ? (
        <div className="ai-market-glass rounded-[1.5rem]">
          <EmptyState
            icon={Zap}
            title="Marketplace could not load"
            description={loadError}
            variant="error"
          />
        </div>
      ) : ais.length === 0 ? (
        <div className="ai-market-glass rounded-[1.5rem]">
          <EmptyState
            icon={Bot}
            title="No Member AIs Created Yet"
            description="Be the first member to build and publish a custom AI assistant for the BeastBuck community."
            action={
              <Link
                to="/ai-studio"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 px-6 py-3 text-sm font-black text-slate-950 shadow-[0_16px_36px_rgba(34,211,238,0.14)] transition hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                Build Member AI
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-9">
          {featuredAIs.length > 0 && selectedCategory === 'All' && !searchQuery.trim() && (
            <section>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-200">Featured discovery</p>
                  <h2 className="text-2xl font-black text-white">High-signal assistants</h2>
                </div>
                <p className="text-sm text-slate-400">Ranked from real rating and chat activity when available.</p>
              </div>
              <div className="grid gap-5 lg:grid-cols-3">
                {featuredAIs.map(ai => (
                  <AIStoreCard key={ai.id} ai={ai} featured />
                ))}
              </div>
            </section>
          )}

          {topCategorySections.length > 0 && selectedCategory === 'All' && !searchQuery.trim() && (
            <section className="ai-market-glass rounded-[1.5rem] p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-200">Browse lanes</p>
                  <h2 className="text-2xl font-black text-white">Popular categories</h2>
                </div>
                <TrendingUp className="h-6 w-6 text-cyan-100" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {topCategorySections.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className="ai-market-card rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/18 via-violet-300/16 to-pink-300/16 text-cyan-50">
                      {category === 'Creative' ? <Wand2 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                    </div>
                    <p className="text-lg font-black text-white">{category}</p>
                    <p className="mt-1 text-sm font-bold text-slate-400">{categoryCounts[category]} assistants</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-200">Marketplace shelf</p>
                <h2 className="text-2xl font-black text-white">
                  {selectedCategory === 'All' ? 'Community AI Assistants' : `${selectedCategory} Assistants`} ({filteredAIs.length})
                </h2>
              </div>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-white transition hover:bg-white/[0.1]"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredAIs.length === 0 ? (
              <div className="ai-market-glass rounded-[1.5rem]">
                <EmptyState
                  icon={Search}
                  title="No Matching AIs Found"
                  description="No member AIs matched your search criteria or category filter."
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                      }}
                      className="inline-flex min-h-[44px] items-center rounded-xl bg-white/[0.08] px-5 py-2.5 text-sm font-black text-white transition hover:bg-white/[0.12]"
                    >
                      Clear Search and Filters
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {filteredAIs.map(ai => (
                  <AIStoreCard key={ai.id} ai={ai} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        {loading ? 'Loading AI marketplace' : `${filteredAIs.length} marketplace assistants visible`}
      </div>
    </PageContainer>
  );
}
