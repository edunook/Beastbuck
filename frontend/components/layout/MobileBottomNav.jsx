import { useLocation, useNavigate } from 'react-router-dom';
import { Hop as Home, User, MessageSquare, SquareCheck as CheckSquare } from 'lucide-react';
import { cn } from '@shared/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: User, label: 'Portfolios', path: '/portfolio' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden pointer-events-auto"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="absolute inset-0 bg-surface/80 backdrop-blur-glass-lg border-t border-border" />
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="relative flex items-center justify-around px-1 py-2 pb-safe">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={cn(
                'group relative flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-base min-w-[64px] min-h-[44px]',
                active ? 'scale-105' : 'hover:scale-105 active:scale-95'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <div className="absolute inset-0 rounded-2xl opacity-30 blur-md bg-accent transition-opacity duration-base" />
              )}

              <div
                className={cn(
                  'relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-base',
                  active && 'shadow-glow-sm'
                )}
              >
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl transition-all duration-base',
                    active
                      ? 'bg-accent/15 scale-100'
                      : 'bg-surface-100/50 scale-90 group-hover:scale-100 group-hover:bg-surface-100'
                  )}
                />
                <Icon
                  className={cn(
                    'relative h-6 w-6 transition-colors duration-base',
                    active ? 'text-accent' : 'text-text-muted group-hover:text-text'
                  )}
                />
              </div>

              <div
                className={cn(
                  'absolute -bottom-0.5 h-1 w-4 rounded-full transition-all duration-base',
                  active ? 'bg-accent shadow-glow-sm' : 'bg-transparent'
                )}
              />
            </button>
          );
        })}
      </div>

      <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </nav>
  );
}
