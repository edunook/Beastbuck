import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../services/firebase/config';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Search, FolderGit, User, ShoppingBag, X, Zap, FlaskConical, Store } from 'lucide-react';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searching, setSearching] = useState(false);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Toggle overlay on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
      setSearch('');
      setResults([]);
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Firestore Search Query
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const queryText = search.toLowerCase();

      try {
        const matched = [];

        // 1. Search Users
        const usersRef = collection(db, 'users');
        const qUsers = query(
          usersRef,
          where('username', '>=', queryText),
          where('username', '<=', queryText + '\uf8ff'),
          limit(5)
        );
        const usersSnap = await getDocs(qUsers);
        usersSnap.forEach(doc => {
          matched.push({
            id: doc.id,
            title: doc.data().displayName || doc.data().username,
            subtitle: `@${doc.data().username}`,
            type: 'user',
            path: `/profile/${doc.id}`,
            icon: User,
          });
        });

        // 2. Search Projects
        const projectsRef = collection(db, 'projects');
        const qProjects = query(
          projectsRef,
          where('title', '>=', search), // Title case usually
          where('title', '<=', search + '\uf8ff'),
          limit(5)
        );
        const projectsSnap = await getDocs(qProjects);
        projectsSnap.forEach(doc => {
          matched.push({
            id: doc.id,
            title: doc.data().title,
            subtitle: doc.data().description || 'No description',
            type: 'project',
            path: `/projects`, // Redirect to unified projects
            icon: FolderGit,
          });
        });

        // 3. Search Products
        const productsRef = collection(db, 'products');
        const qProducts = query(
          productsRef,
          where('title', '>=', search),
          where('title', '<=', search + '\uf8ff'),
          limit(5)
        );
        const productsSnap = await getDocs(qProducts);
        productsSnap.forEach(doc => {
          matched.push({
            id: doc.id,
            title: doc.data().title,
            subtitle: `${doc.data().price || 0} credits`,
            type: 'product',
            path: `/workspace/products/${doc.id}`,
            icon: ShoppingBag,
          });
        });

        // 4. Search Research
        const researchRef = collection(db, 'research');
        const qResearch = query(
          researchRef,
          where('title', '>=', search),
          where('title', '<=', search + '\uf8ff'),
          limit(5)
        );
        const researchSnap = await getDocs(qResearch);
        researchSnap.forEach(doc => {
          matched.push({
            id: doc.id,
            title: doc.data().title,
            subtitle: doc.data().abstract || 'Research paper',
            type: 'research',
            path: `/workspace/research/${doc.id}`,
            icon: FlaskConical,
          });
        });

        // 5. Search Marketplace
        const marketplaceRef = collection(db, 'marketplace');
        const qMarketplace = query(
          marketplaceRef,
          where('title', '>=', search),
          where('title', '<=', search + '\uf8ff'),
          limit(5)
        );
        const marketplaceSnap = await getDocs(qMarketplace);
        marketplaceSnap.forEach(doc => {
          matched.push({
            id: doc.id,
            title: doc.data().title,
            subtitle: doc.data().description || 'Marketplace item',
            type: 'marketplace',
            path: `/marketplace/${doc.id}`,
            icon: Store,
          });
        });

        setResults(matched);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search command failed:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        navigate(results[selectedIndex].path);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-gradient-to-r from-accent to-purple-500 flex items-center justify-center text-background font-black shadow-lg shadow-accent/40 border border-accent/30 hover:scale-110 hover:-translate-y-1 active:scale-95 transition-all duration-300 z-50 cursor-pointer group"
        title="Search Command Menu (Ctrl+K)"
      >
        <Search className="h-5 w-5 text-slate-900 group-hover:rotate-12 transition-transform duration-300" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        ref={containerRef}
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-2xl shadow-accent/20 animate-fade-in-up"
      >
        {/* Search header bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search className="h-5 w-5 text-accent animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search users, projects, products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm font-bold text-white placeholder-text-muted outline-none"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/15 transition-all duration-200"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Results Panel */}
        <div className="max-h-[350px] overflow-y-auto p-3">
          {searching && (
            <div className="py-8 text-center text-sm font-bold text-text-soft flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              Searching data...
            </div>
          )}

          {!searching && !search && (
            <div className="py-8 text-center text-sm font-bold text-text-muted">
              <Zap className="mx-auto mb-2 h-7 w-7 text-accent" />
              <span>Search index is ready. Use arrows and Enter key.</span>
            </div>
          )}

          {!searching && search && results.length === 0 && (
            <div className="py-8 text-center text-sm font-bold text-text-soft">
              No matching records found.
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-1">
              {results.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={item.id + '-' + item.type}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer select-none transition-all duration-200 ${isSelected ? 'bg-gradient-to-r from-accent/15 to-purple-500/15 border border-accent/30 shadow-lg shadow-accent/10 translate-x-1' : 'border border-transparent hover:bg-white/[0.03]'}`}
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-accent/20 border border-accent/40' : 'bg-white/5 border border-white/10'}`}>
                      <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-accent' : 'text-text-soft'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-accent' : 'text-white'}`}>
                        {item.title}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {item.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-soft px-2 py-1 rounded-full bg-white/5 border border-white/10">
                      {item.type}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
