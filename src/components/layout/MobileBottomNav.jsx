import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, MessageSquare, CheckSquare, Trophy } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: User, label: 'Portfolios', path: '/portfolio' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
];

const ICON_COLORS = {
  Home: 'text-accent',
  User: 'text-purple-400',
  MessageSquare: 'text-cyan-400',
  CheckSquare: 'text-green-400',
  Trophy: 'text-yellow-400',
};

const GLOW_COLORS = {
  Home: 'rgba(0, 240, 255, 0.4)',
  User: 'rgba(168, 85, 247, 0.4)',
  MessageSquare: 'rgba(34, 211, 238, 0.4)',
  CheckSquare: 'rgba(74, 222, 128, 0.4)',
  Trophy: 'rgba(250, 204, 21, 0.4)',
};

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
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden pointer-events-auto" role="navigation" aria-label="Main navigation">
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/10" />
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

        <div className="relative flex items-center justify-around px-1 py-2 pb-safe">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            const colorClass = ICON_COLORS[item.icon.displayName] || 'text-text-muted';
            const glowColor = GLOW_COLORS[item.icon.displayName] || 'rgba(255,255,255,0.2)';

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'group relative flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-2xl transition-all duration-300 min-w-[64px]',
                  active ? 'scale-105' : 'hover:scale-105 active:scale-95'
                )}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 80}ms both`,
                }}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {active && (
                  <div
                    className="absolute inset-0 rounded-2xl opacity-40 blur-md transition-opacity duration-300"
                    style={{ backgroundColor: glowColor }}
                  />
                )}

                <div
                  className={cn(
                    'relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300',
                    active && 'shadow-lg'
                  )}
                  style={active ? { boxShadow: `0 0 20px ${glowColor}` } : undefined}
                >
                  <div
                    className={cn(
                      'absolute inset-0 rounded-2xl transition-all duration-300',
                      active
                        ? 'bg-white/15 scale-100'
                        : 'bg-white/5 scale-90 group-hover:scale-100 group-hover:bg-white/10'
                    )}
                  />
                  <Icon
                    className={cn(
                      'relative h-6 w-6 transition-all duration-300',
                      active ? colorClass : 'text-text-muted'
                    )}
                    style={active ? { filter: `drop-shadow(0 0 6px ${glowColor})` } : undefined}
                  />
                </div>

                <div
                  className="absolute -bottom-0.5 h-1 w-4 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: active ? glowColor : 'transparent',
                    boxShadow: active ? `0 0 8px ${glowColor}` : 'none',
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="h-safe-area-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
