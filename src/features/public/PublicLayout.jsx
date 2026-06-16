import { Link, Outlet } from 'react-router-dom';
import { BadgeCheck, Menu, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { PublicFooter } from './PublicPages';
import { useAuth } from '../../features/auth/AuthContext';
import { NotificationBell } from '../../components/layout/NotificationBell';

const navItems = [
  ['About', '/about'],
  ['Hall of Fame', '/hall-of-fame'],
  ['Join', '/join'],
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const filteredNavItems = user ? navItems.filter(([label]) => label !== 'Join') : navItems;

  return (
    <main className="min-h-screen bg-background text-white">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="BeastBuck" className="h-10 w-auto" />
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-bold text-text-soft lg:flex">
            {filteredNavItems.map(([label, path]) => <Link key={path} to={path} className="hover:text-white">{label}</Link>)}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            {user && <NotificationBell />}
            {user ? (
              <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-black text-background hover:bg-cyan-300">
                <Sparkles className="h-4 w-4" />
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signin" className="rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15">Sign In</Link>
                <Link to="/join" className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-black text-background hover:bg-cyan-300"><BadgeCheck className="h-4 w-4" />Apply</Link>
              </>
            )}
          </div>
          <button type="button" onClick={() => setOpen(current => !current)} className="rounded-lg p-2 text-text-soft hover:bg-white/5 lg:hidden" aria-label="Open public navigation">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        {open && (
          <div className="border-t border-border bg-surface px-5 py-4 lg:hidden">
            <div className="grid gap-2">
              {user && <NotificationBell />}
              {filteredNavItems.map(([label, path]) => <Link key={path} to={path} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-text-soft hover:bg-white/5 hover:text-white">{label}</Link>)}
              {user ? (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-accent">Go to Dashboard</Link>
              ) : (
                <Link to="/signin" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-accent">Sign In</Link>
              )}
            </div>
          </div>
        )}
      </header>
      <Outlet />
      <PublicFooter />
    </main>
  );
}
