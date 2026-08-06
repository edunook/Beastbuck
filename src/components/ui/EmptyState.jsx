import React from 'react';
import { Inbox, Sparkles, Rocket, Film, BookOpen, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from './Button';

const EmptyState = React.memo(function EmptyState({
  icon = Inbox,
  title = 'No data found',
  description = 'There is nothing to display here yet.',
  action = null,
  variant = 'default',
  illustration = null,
  gradient = false,
  compact = false,
  suggestedActions = [],
}) {
  const Icon = icon;

  const iconStyles = {
    default: 'bg-surface text-text-muted',
    warning: 'bg-status-warning/10 text-status-warning',
    error: 'bg-status-danger/10 text-status-danger',
    success: 'bg-status-success/10 text-status-success',
  }[variant];

  const gradientStyles = {
    default: 'bg-gradient-subtle-1',
    warning: 'bg-gradient-subtle-2',
  }[variant];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "py-8 px-4" : "py-16 px-4",
      gradient && gradientStyles
    )}>
      {illustration ? (
        <div className={cn("mb-6 animate-float", compact && "mb-4")}>
          {illustration}
        </div>
      ) : (
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-base hover:scale-110",
          compact && "w-16 h-16 mb-4",
          !compact && "mb-6",
          iconStyles
        )}>
          <Icon className={cn("w-10 h-10", compact && "w-8 h-8")} />
        </div>
      )}
      <h3 className={cn("font-heading font-bold text-text", compact ? "text-lg mb-2" : "text-2xl mb-3")}>{title}</h3>
      <p className={cn("text-description text-text-muted", compact ? "text-sm mb-4 max-w-sm" : "mb-8 max-w-md")}>{description}</p>
      
      {suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {suggestedActions.map((suggestedAction, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              onClick={suggestedAction.onClick}
              className="gap-2"
            >
              {suggestedAction.icon && <suggestedAction.icon className="w-4 h-4" />}
              {suggestedAction.label}
            </Button>
          ))}
        </div>
      )}
      
      {action && <div className="animate-in fade-in slide-in-from-bottom-4 duration-slow">{action}</div>}
    </div>
  );
});

// Pre-configured empty states for common scenarios
export function CreateFirstProject({ onCreate }) {
  return (
    <EmptyState
      icon={Rocket}
      title="Create Your First Project"
      description="Start building something amazing. Create your first project to begin your journey."
      action={onCreate}
      gradient
    />
  );
}

export function CreateFirstVenture({ onCreate }) {
  return (
    <EmptyState
      icon={Sparkles}
      title="Launch Your First Venture"
      description="Turn your ideas into reality. Create your first venture and start building the future."
      action={onCreate}
      gradient
    />
  );
}

export function CreateFirstAI({ onCreate }) {
  return (
    <EmptyState
      icon={Sparkles}
      title="Create Your First AI"
      description="Build intelligent agents that can help you automate tasks and make decisions."
      action={onCreate}
      gradient
    />
  );
}

export function UploadFirstMovie({ onUpload }) {
  return (
    <EmptyState
      icon={Film}
      title="Upload Your First Movie"
      description="Share your creativity with the world. Upload your first movie to FunFlix."
      action={onUpload}
      gradient
    />
  );
}

export function StartResearch({ onStart }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Start Your Research"
      description="Contribute to the knowledge base. Start researching and publish your findings."
      action={onStart}
      gradient
    />
  );
}

export function PublishKnowledge({ onPublish }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="Publish Your Knowledge"
      description="Share your expertise with the community. Publish your first knowledge article."
      action={onPublish}
      gradient
    />
  );
}

export function JoinCommunity({ onJoin }) {
  return (
    <EmptyState
      icon={Users}
      title="Join the Community"
      description="Connect with innovators, creators, and builders. Join the BeastBuck community."
      action={onJoin}
      gradient
    />
  );
}

export function StartCollaboration({ onStart }) {
  return (
    <EmptyState
      icon={Users}
      title="Start Collaborating"
      description="Work together with your team. Start your first collaboration session."
      action={onStart}
      gradient
    />
  );
}

export default EmptyState;
