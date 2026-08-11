import { Bot, Sparkles, Copy, Check, Loader2, AlertCircle, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@shared/lib/utils';

const RESPONSE_VARIANTS = {
  default: 'border-white/10 bg-white/[0.03]',
  success: 'border-status-success/20 bg-status-success/5',
  warning: 'border-status-warning/20 bg-status-warning/5',
  danger: 'border-status-danger/20 bg-status-danger/5',
  info: 'border-accent/20 bg-accent/5',
};

const ICON_VARIANTS = {
  default: 'bg-accent/20 text-accent',
  success: 'bg-status-success/20 text-status-success',
  warning: 'bg-status-warning/20 text-status-warning',
  danger: 'bg-status-danger/20 text-status-danger',
  info: 'bg-accent/20 text-accent',
};

const CONFIDENCE_LEVELS = {
  HIGH: { bar: 'bg-status-success', text: 'text-status-success', label: 'High Confidence' },
  MEDIUM: { bar: 'bg-status-warning', text: 'text-status-warning', label: 'Medium Confidence' },
  LOW: { bar: 'bg-status-danger', text: 'text-status-danger', label: 'Low Confidence' },
};

function ConfidencePill({ level = 'MEDIUM' }) {
  const cfg = CONFIDENCE_LEVELS[level] || CONFIDENCE_LEVELS.MEDIUM;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
      cfg.text
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.bar)} />
      {cfg.label}
    </span>
  );
}

function AIResponseIcon({ variant = 'default', size = 'default' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const iconMap = {
    default: Bot,
    success: CheckCircle,
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
  };

  const Icon = iconMap[variant] || Bot;

  return (
    <div className={cn(
      "flex items-center justify-center rounded-xl",
      ICON_VARIANTS[variant],
      size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10'
    )}>
      <Icon className={sizeClasses[size]} />
    </div>
  );
}

// Enhanced text formatter for AI responses
function formatAIResponse(text) {
  if (!text) return '';
  
  // Process the text step by step
  let formatted = text;
  
  // Bold text: **text** or __text__
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
  formatted = formatted.replace(/__(.*?)__/g, '<strong class="text-white font-semibold">$1</strong>');
  
  // Italic text: *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="text-text-soft italic">$1</em>');
  formatted = formatted.replace(/_(.*?)_/g, '<em class="text-text-soft italic">$1</em>');
  
  // Colored text: {color:text}
  const colors = {
    'accent': 'text-accent',
    'success': 'text-status-success', 
    'warning': 'text-status-warning',
    'danger': 'text-status-danger',
    'info': 'text-accent',
    'purple': 'text-purple-400',
    'pink': 'text-pink-400',
    'blue': 'text-blue-400',
    'green': 'text-green-400',
    'yellow': 'text-yellow-400',
  };
  
  Object.entries(colors).forEach(([color, className]) => {
    const regex = new RegExp(`\\{${color}:(.*?)\\}`, 'g');
    formatted = formatted.replace(regex, `<span class="${className} font-medium">$1</span>`);
  });
  
  // Highlight text: ||text||
  formatted = formatted.replace(/\|\|(.*?)\|\|/g, '<mark class="bg-accent/20 text-accent px-1 rounded">$1</mark>');
  
  // Code text: `text`
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-black/30 text-accent px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br />');
  
  return formatted;
}

// Enhanced list formatter
function formatList(text) {
  if (!text) return '';
  
  const lines = text.split('\n');
  return lines.map((line, index) => {
    // Numbered lists: 1. text, 2. text, etc.
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      const [, num, content] = numberedMatch;
      return (
        <div key={index} className="flex gap-3 py-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
            {num}
          </span>
          <span className="flex-1 text-text-soft leading-relaxed" dangerouslySetInnerHTML={{ __html: formatAIResponse(content) }} />
        </div>
      );
    }
    
    // Bullet points: - text or * text
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      const [, content] = bulletMatch;
      return (
        <div key={index} className="flex gap-3 py-2">
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-2"></span>
          <span className="flex-1 text-text-soft leading-relaxed" dangerouslySetInnerHTML={{ __html: formatAIResponse(content) }} />
        </div>
      );
    }
    
    // Regular lines
    if (line.trim()) {
      return <p key={index} className="py-1 text-text-soft leading-relaxed" dangerouslySetInnerHTML={{ __html: formatAIResponse(line) }} />;
    }
    
    return null;
  }).filter(Boolean);
}

export function AIResponse({
  content,
  variant = 'default',
  title,
  confidence,
  loading = false,
  error = null,
  onCopy,
  showCopy = true,
  showIcon = true,
  className,
  children,
  enhanced = false, // Enable enhanced formatting
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (onCopy) onCopy();
  };

  if (loading) {
    return (
      <div className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.03] p-6",
        className
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-white">AI is thinking</p>
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-accent" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
            <p className="text-sm text-text-muted">Generating response...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "rounded-2xl border border-status-danger/30 bg-status-danger/10 p-6",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-status-danger/20 text-status-danger">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-status-danger">AI Response Error</p>
            <p className="mt-1 text-sm text-text-muted">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border p-6 transition-all duration-300",
      RESPONSE_VARIANTS[variant],
      className
    )}>
      {/* Header */}
      {(title || showIcon || confidence || showCopy) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {showIcon && <AIResponseIcon variant={variant} />}
            {title && (
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white">{title}</h4>
                {confidence && <ConfidencePill level={confidence} />}
              </div>
            )}
          </div>
          {showCopy && content && (
            <button
              onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                "border border-white/10 bg-white/5 text-text-muted hover:bg-white/10 hover:text-white"
              )}
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {content && (
        <div className="relative">
          {enhanced ? (
            <div className="space-y-1">
              {formatList(content)}
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-7 text-text-soft">
                {content}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom children */}
      {children && !content && (
        <div className="prose prose-invert prose-sm max-w-none">
          {children}
        </div>
      )}

      {/* AI Badge */}
      <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
        <Sparkles className="h-3 w-3 text-accent" />
        <span>AI-generated response</span>
      </div>
    </div>
  );
}

export function AIResponseList({ responses, className, enhanced = false }) {
  if (!responses || responses.length === 0) return null;

  return (
    <div className={cn("space-y-4", className)}>
      {responses.map((response, index) => (
        <AIResponse
          key={index}
          {...response}
          enhanced={enhanced}
        />
      ))}
    </div>
  );
}

export function AIChatBubble({
  content,
  isUser = false,
  timestamp,
  showTimestamp = false,
  className,
  enhanced = false,
}) {
  return (
    <div className={cn(
      "flex gap-3 max-w-2xl",
      isUser ? "ml-auto flex-row-reverse" : "",
      className
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isUser ? "bg-accent/20 text-accent" : "bg-white/10 text-text-muted"
      )}>
        {isUser ? (
          <Bot className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>
      <div className={cn(
        "flex-1 rounded-2xl px-4 py-3",
        isUser 
          ? "bg-accent/10 border border-accent/20 text-white" 
          : "bg-white/[0.03] border border-white/10 text-text-soft"
      )}>
        {enhanced ? (
          <div className="space-y-1">
            {formatList(content)}
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-6">
            {content}
          </div>
        )}
        {showTimestamp && timestamp && (
          <div className={cn(
            "mt-2 text-xs",
            isUser ? "text-accent/70" : "text-text-muted"
          )}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIResponse;