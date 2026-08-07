import React from 'react';
import { 
  Clock, 
  Medal, 
  FlaskConical, 
  FileText, 
  Users, 
  Sparkles,
  Inbox,
  Search,
  AlertCircle,
  Calendar,
  TrendingUp,
  Heart,
  Gift,
} from 'lucide-react';

const emptyStateConfig = {
  activity: {
    icon: Clock,
    title: 'No activity yet',
    subtitle: 'Start exploring to see your adventure log!'
  },
  achievements: {
    icon: Medal,
    title: 'No badges yet',
    subtitle: 'Complete quests and earn XP to unlock awesome badges!'
  },
  experiments: {
    icon: FlaskConical,
    title: 'No experiments yet',
    subtitle: 'Start your first science experiment and discover something cool!'
  },
  tasks: {
    icon: FileText,
    title: 'No tasks yet',
    subtitle: 'Create your first task and begin your adventure!'
  },
  users: {
    icon: Users,
    title: 'No friends yet',
    subtitle: 'Invite friends to join the fun!'
  },
  projects: {
    icon: Sparkles,
    title: 'No projects yet',
    subtitle: 'Start your first project and show off your creativity!'
  },
  search: {
    icon: Search,
    title: 'No results found',
    subtitle: 'Try different words or filters'
  },
  events: {
    icon: Calendar,
    title: 'No events yet',
    subtitle: 'Awesome community events are coming soon!'
  },
  trending: {
    icon: TrendingUp,
    title: 'Nothing trending yet',
    subtitle: 'Be the first to create something amazing!'
  },
  streak: {
    icon: Heart,
    title: 'Start your streak',
    subtitle: 'Log in daily to build your streak and earn awesome rewards!'
  },
  discovery: {
    icon: Gift,
    title: 'New discoveries coming soon!',
    subtitle: 'Check back daily for amazing new content.'
  },
  friends: {
    icon: Users,
    title: 'No activity yet',
    subtitle: 'Connect with friends to see their awesome achievements!'
  },
  generic: {
    icon: Inbox,
    title: 'Nothing here yet',
    subtitle: 'Awesome content is on its way!'
  },
  error: {
    icon: AlertCircle,
    title: 'Oops! Something went wrong',
    subtitle: 'Let\'s try that again!'
  }
};

export function DynamicEmptyState({ 
  type = 'generic', 
  title, 
  subtitle, 
  icon: customIcon,
  className = '',
  action = null 
}) {
  const config = emptyStateConfig[type] || emptyStateConfig.generic;
  const Icon = customIcon || config.icon;
  const displayTitle = title || config.title;
  const displaySubtitle = subtitle || config.subtitle;

  return (
    <div className={`rounded-xl border border-dashed border-white/10 p-6 text-center select-none ${className}`}>
      <div className="relative inline-flex mb-3">
        <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
        <Icon className="relative h-10 w-10 mx-auto text-text-muted" />
      </div>
      <p className="text-sm font-bold text-white mb-1">{displayTitle}</p>
      <p className="text-xs text-text-muted">{displaySubtitle}</p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

export default DynamicEmptyState;
