import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export function CollapsibleNavCategory({ 
  label, 
  icon: Icon, 
  children, 
  defaultOpen = false,
  className 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("space-y-1", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-base",
          "text-text-muted hover:text-text hover:bg-surface",
          "min-h-[44px]"
        )}
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" />}
        <span className="flex-1 text-left text-badge font-medium">{label}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-base" />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-base" />
        )}
      </button>
      {isOpen && (
        <div className="pl-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

export function NavCategoryItem({ 
  label, 
  icon: Icon, 
  to, 
  isActive = false,
  onClick,
  className 
}) {
  return (
    <a
      href={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-base",
        "min-h-[44px]",
        isActive 
          ? "bg-accent/10 text-accent font-medium shadow-[inset_2px_0_0_0_var(--color-accent-0)] border-l-2 border-accent"
          : "text-text-muted hover:text-text hover:bg-surface hover:border-l-2 hover:border-border-100",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="text-badge">{label}</span>
    </a>
  );
}
