import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BriefcaseBusiness,
  FlaskConical,
  GraduationCap,
  Loader2,
  Package,
  Search,
  Users,
  FolderKanban,
  Calendar,
  CheckSquare,
  Trophy,
} from 'lucide-react';
import { UniverseService, SEARCH_CATEGORIES } from '@services/firestore/universe';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import EmptyState from '@frontend/components/ui/EmptyState';
import { cn } from '@shared/lib/utils';

const TYPE_ICONS = {
  user: Users,
  project: FolderKanban,
  experiment: FlaskConical,
  product: Package,
  venture: BriefcaseBusiness,
  resource: Package,
  course: GraduationCap,
  lesson: BookOpen,
  community: Users,
  event: Calendar,
  task: CheckSquare,
  challenge: Trophy,
  research: FlaskConical,
  invention: FlaskConical,
  document: BookOpen,
  workspace: FolderKanban,
  article: BookOpen,
};

function ResultIcon({ type }) {
  const Icon = TYPE_ICONS[type] || Search;
  return <Icon className="h-5 w-5 shrink-0 text-accent" />;
}

export default function UnifiedSearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bb_universe_searches')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { results: res, suggestions: sug } = await UniverseService.unifiedSearch(query, {
          category,
          sortBy,
        });
        setResults(res);
        setSuggestions(sug);
      } catch (err) {
        console.error('Unified search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, category, sortBy]);

  const runSearch = (term) => {
    setQuery(term);
    if (term && !recent.includes(term)) {
      const next = [term, ...recent].slice(0, 8);
      setRecent(next);
      localStorage.setItem('bb_universe_searches', JSON.stringify(next));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Unified Search"
        description="Search members, projects, research, ventures, courses, communities, tasks, and more across BeastBuck."
      />

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            <Search className="h-5 w-5 text-text-muted" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
          placeholder="Search everything in BeastBuck..."
          className="w-full rounded-2xl border-2 border-border/60 bg-black/40 py-4 pl-12 pr-4 text-lg text-white placeholder-text-muted/50 backdrop-blur-xl transition-all focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {SEARCH_CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-bold transition',
              category === cat
                ? 'bg-accent/20 text-accent'
                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-xs text-text-muted">Sort</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-border bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="relevance">Relevance</option>
          <option value="title">Title A–Z</option>
          <option value="type">Type</option>
        </select>
      </div>

      {!query && recent.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-text-muted">Recent</p>
          <div className="flex flex-wrap gap-2">
            {recent.map(term => (
              <button
                key={term}
                type="button"
                onClick={() => runSearch(term)}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-text-soft hover:bg-white/10 hover:text-white"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 && query.length >= 2 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-text-muted">Smart suggestions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => runSearch(s)}
                className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 text-sm text-accent hover:bg-accent/10"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {query.length >= 2 && !loading && results.length === 0 && (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try different keywords or browse the categories.`}
            gradient={true}
          />
        )}
        {results.map(item => (
          <Link
            key={`${item.type}-${item.id}`}
            to={item.link || '#'}
            className="flex items-center gap-4 rounded-xl border border-border bg-white/[0.02] p-4 transition hover:border-accent/30 hover:bg-white/5"
          >
            <ResultIcon type={item.type} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-white">{item.title}</p>
              <p className="text-sm text-text-muted">{item.subtitle}</p>
            </div>
            <span className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs font-bold uppercase text-text-muted">
              {item.type}
            </span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
