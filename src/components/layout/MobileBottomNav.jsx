import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Briefcase, Users, CheckSquare, Menu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useGlobalStore } from '../../store/useGlobalStore';

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Briefcase, label: 'Portfolio', path: '/portfolios' },
  { icon: Users, label: 'Communities', path: '/communities' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Menu, label: 'Menu', path: '/menu', isDrawerTrigger: true },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleMobileDrawer } = useGlobalStore();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavClick = (item) => {
    if (item.isDrawerTrigger) {
      toggleMobileDrawer();
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-white/10">
        <div className="relative">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/90 backdrop-blur-xl" />
          
          {/* Glow effect */}
          <div className="absolute inset-x-0 -top-20 h-32 bg-gradient-to-t from-accent/5 to-transparent pointer-events-none" />
          
          {/* Navigation items */}
          <div className="relative flex items-center justify-around px-2 py-3 pb-safe">
            {navItems.map((item, index) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "group relative flex items-center justify-center px-3 py-3 rounded-xl transition-all duration-300",
                    active
                      ? "scale-110"
                      : "hover:scale-105"
                  )}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`
                  }}
                  aria-label={item.label}
                >
                  {/* Active indicator glow */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent rounded-xl blur-xl opacity-50" />
                  )}
                  
                  {/* Icon container */}
                  <div className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    active ? "scale-110" : "group-hover:scale-105"
                  )}>
                    <div className={cn(
                      "absolute inset-0 rounded-xl transition-all duration-300",
                      active
                        ? "bg-gradient-to-br from-accent/30 to-purple-500/30 shadow-lg shadow-accent/30"
                        : "bg-white/5 group-hover:bg-white/10"
                    )} />
                    <Icon 
                      className={cn(
                        "relative h-6 w-6 transition-all duration-300",
                        active 
                          ? "text-accent drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" 
                          : "text-text-muted group-hover:text-white"
                      )} 
                    />
                  </div>
                  
                  {/* Active dot indicator */}
                  {active && (
                    <div className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Safe area padding for iPhone */}
          <div className="h-safe-area-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
        </div>
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
