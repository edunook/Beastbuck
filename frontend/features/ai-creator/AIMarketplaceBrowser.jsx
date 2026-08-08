import { useState, useEffect } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Star, MessageSquare, Sparkles, Search, Loader2, Bot, Plus, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import EmptyState from '@frontend/components/ui/EmptyState';

const CATEGORIES = ['All', 'Educational', 'Research', 'Coding', 'Business', 'Creative', 'Fun', 'Productivity', 'Science', 'Leadership'];

export default function AIMarketplaceBrowser() {
  const [ais, setAis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchMarketplaceAIs = async () => {
      try {
        setLoading(true);
        let aisSnap;
        try {
          const aisQuery = query(
            collection(db, 'custom_ais'),
            orderBy('createdAt', 'desc')
          );
          aisSnap = await getDocs(aisQuery);
        } catch (err) {
          // Fallback query if composite index is not set
          aisSnap = await getDocs(collection(db, 'custom_ais'));
        }

        const list = aisSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAis(list);
      } catch (err) {
        console.error('Failed to load member AIs from Firestore:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplaceAIs();
  }, []);

  // Filter AIs by selected category & search input
  const filteredAIs = ais.filter(ai => {
    let matchesCat = selectedCategory === 'All';
    if (!matchesCat) {
      const catLower = selectedCategory.toLowerCase();
      const personality = (ai.personality || '').toLowerCase();
      const focusAreas = (ai.focusAreas || []).map(f => f.toLowerCase());
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
      const focus = (ai.focusAreas || []).join(' ').toLowerCase();
      matchesSearch = name.includes(q) || desc.includes(q) || creator.includes(q) || focus.includes(q);
    }

    return matchesCat && matchesSearch;
  });

  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Member AI Marketplace</h1>
        <p className="text-text-muted max-w-xl mx-auto text-sm sm:text-base">
          Explore and chat with custom AI assistants built and published by BeastBuck community members.
        </p>
        <div className="mt-6 max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search member AIs by name, creator, or topic..."
            className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accent transition text-sm"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                isActive
                  ? 'bg-accent text-black shadow-[0_0_15px_rgba(208,255,0,0.2)]'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-border'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm">Loading member AIs...</p>
        </div>
      ) : ais.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No Member AIs Created Yet"
          description="Be the first member to build and publish a custom AI assistant for the BeastBuck community!"
          action={
            <Link
              to="/ai-studio"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-black font-bold px-6 py-3 rounded-xl transition shadow-[0_0_20px_rgba(208,255,0,0.15)] text-sm"
            >
              <Plus className="w-4 h-4" />
              Build Member AI
            </Link>
          }
        />
      ) : filteredAIs.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Matching AIs Found"
          description="No member AIs matched your search criteria or category filter."
          action={
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="bg-white/10 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/20 transition text-sm"
            >
              Clear Search & Filters
            </button>
          }
        />
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-accent w-5 h-5" />
              Community AI Assistants ({filteredAIs.length})
            </h2>
            <Link to="/ai-studio" className="text-xs sm:text-sm font-bold text-accent hover:underline flex items-center gap-1">
              <Plus className="w-4 h-4" /> Create Your AI
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredAIs.map((ai) => {
              const categoryBadge = ai.focusAreas?.[0] || ai.personality || 'Member AI';
              const ratingVal = typeof ai.avgRating === 'number' && ai.avgRating > 0 ? ai.avgRating.toFixed(1) : '5.0';

              return (
                <div
                  key={ai.id}
                  className="group rounded-2xl border border-border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:border-accent/50 hover:shadow-[0_0_25px_rgba(208,255,0,0.06)] flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar + Category Tag */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      {ai.avatarUrl ? (
                        <img
                          src={ai.avatarUrl}
                          alt={ai.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-border flex items-center justify-center text-2xl shrink-0">
                          {ai.emoji || '🤖'}
                        </div>
                      )}
                      <span className="bg-white/10 text-text-muted text-[10px] font-bold px-2.5 py-1 rounded-full truncate max-w-[120px]">
                        {categoryBadge}
                      </span>
                    </div>

                    {/* AI Name & Creator */}
                    <h3 className="font-bold text-white text-base group-hover:text-accent transition line-clamp-1">
                      {ai.name}
                    </h3>
                    <p className="text-xs text-text-muted mb-2 flex items-center gap-1">
                      <User className="w-3 h-3 text-accent/70 shrink-0" />
                      <span className="truncate">By {ai.creatorName || 'Member'}</span>
                    </p>

                    {/* Description */}
                    <p className="text-xs text-text-muted line-clamp-2 mb-4 leading-relaxed">
                      {ai.description || 'Custom AI assistant created by member.'}
                    </p>
                  </div>

                  {/* Footer & Actions */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/40 pt-3 mb-3">
                      <span className="flex items-center gap-1 text-white/80">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        {ratingVal}
                      </span>
                      <span className="flex items-center gap-1 text-text-muted">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {ai.totalChats || 0} chats
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/ais/${ai.id}/chat`}
                        className="flex-1 bg-accent/15 hover:bg-accent text-accent hover:text-black font-bold py-2 rounded-xl text-xs text-center transition flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Launch Chat
                      </Link>
                      <Link
                        to={`/ais/${ai.id}`}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-border text-white text-xs font-bold transition flex items-center justify-center"
                        title="View Details"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
