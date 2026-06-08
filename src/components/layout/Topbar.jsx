import { Menu, Search, User, Users } from 'lucide-react';
import { useGlobalStore } from '../../store/useGlobalStore';
import { useAuth } from '../../features/auth/AuthContext';
import { Input } from '../ui/Input';
import { NotificationBell } from './NotificationBell';

export default function Topbar() {
  const { toggleMobileDrawer, togglePresencePanel } = useGlobalStore();
  const { roleData } = useAuth();

  return (
    <header className="h-16 bg-surface backdrop-blur-glass-md border-b border-border sticky top-0 z-fixed flex items-center justify-between px-4 lg:px-8">
      
      {/* Mobile Menu Toggle & Brand */}
      <div className="flex items-center gap-3 md:hidden">
        <button 
          onClick={toggleMobileDrawer}
          className="p-3 -ml-3 text-text-muted hover:text-text rounded-lg hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Menu className="w-6 h-6" />
        </button>
        <img src="/logo.png" alt="BeastBuck" className="h-8 w-auto" />
      </div>

      {/* Global Search Foundation */}
      <div className="hidden md:flex flex-1 max-w-xl px-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input 
            type="text" 
            placeholder="Search experiments, skills, members..." 
            className="w-full pl-10 bg-surface border-border hover:border-border-100 focus:bg-surface-100 rounded-full h-10"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        <button 
          onClick={togglePresencePanel}
          className="relative p-3 text-text-muted hover:text-text rounded-full hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="Live Presence"
        >
          <Users className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-status-success rounded-full border border-surface"></span>
        </button>
        <NotificationBell />
        
        <div className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-border">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-text leading-none">{roleData?.username || 'Operative'}</div>
            <div className="text-badge text-accent mt-1 leading-none">{roleData?.role || 'Guest'}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-premium-1 p-[2px]">
            <div className="w-full h-full rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
              {roleData?.avatar ? (
                <img src={roleData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-text-muted" />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
