import { useState, useEffect } from 'react';
import { Search, Loader2, Users, FolderKanban, FlaskConical, Package, Building2 } from 'lucide-react';
import { MissionControlService } from '../../services/firebase/missionControl';
import { Link } from 'react-router-dom';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bb_recent_searches')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await MissionControlService.globalSearch(query);
        setResults(res);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearch = (term) => {
    setQuery(term);
    if (term && !recentSearches.includes(term)) {
      const newRecent = [term, ...recentSearches].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('bb_recent_searches', JSON.stringify(newRecent));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <Users className="h-5 w-5 text-accent" />;
      case 'project': return <FolderKanban className="h-5 w-5 text-purple-400" />;
      case 'experiment': return <FlaskConical className="h-5 w-5 text-green-400" />;
      case 'product': return <Package className="h-5 w-5 text-orange-400" />;
      case 'department': return <Building2 className="h-5 w-5 text-blue-400" />;
      default: return <Search className="h-5 w-5 text-text-muted" />;
    }
  };

  const getLink = (item) => {
    switch (item.type) {
      case 'user': return `/members/${item.id}`;
      case 'project': return `/workspace/projects/${item.id}`;
      case 'experiment': return `/workspace/experiments/${item.id}`;
      case 'product': return `/workspace/products/${item.id}`;
      default: return '#';
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-black text-white">Global Intelligence Search</h2>
        <p className="mt-2 text-text-muted">Search across members, projects, experiments, products, and departments instantly.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-accent" /> : <Search className="h-5 w-5 text-text-muted" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder="Search the entire BeastBuck platform..."
          className="w-full rounded-2xl border-2 border-border/60 bg-black/40 py-4 pl-12 pr-4 text-lg text-white placeholder-text-muted/50 backdrop-blur-xl transition-all focus:border-accent focus:bg-black/60 focus:outline-none focus:ring-4 focus:ring-accent/10"
        />
      </div>

      {!query && recentSearches.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-text-muted">Recent Searches</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => handleSearch(term)}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-text-soft transition-all hover:bg-white/10 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {query.length >= 2 && !loading && results.length === 0 && (
        <div className="py-12 text-center text-text-muted">
          No results found for "{query}".
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((item, i) => (
            <Link
              key={`${item.type}-${item.id}-${i}`}
              to={getLink(item)}
              onClick={() => handleSearch(query)}
              className="flex items-center gap-4 rounded-xl border border-border/40 bg-surface/30 p-4 transition-all hover:border-accent/30 hover:bg-surface/60"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/40">
                {getIcon(item.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white">{item.title}</h4>
                  <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {item.type}
                  </span>
                </div>
                <p className="text-sm text-text-muted">{item.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
