import { forwardRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';

const Input = forwardRef(({ 
  className, 
  type = 'text',
  label,
  helperText,
  error,
  success,
  loading,
  icon: Icon,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const stateStyles = {
    default: 'border-border focus:border-accent focus:ring-accent/20',
    error: 'border-status-danger/50 focus:border-status-danger focus:ring-status-danger/20',
    success: 'border-status-success/50 focus:border-status-success focus:ring-status-success/20',
  };

  const currentState = error ? 'error' : success ? 'success' : 'default';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-badge text-text-soft mb-2 font-medium">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border bg-surface px-3 py-2.5 text-description text-text transition-all duration-base",
            "placeholder:text-text-muted focus:outline-none focus:ring-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            Icon && "pl-10",
            (error || success || loading) && "pr-10",
            stateStyles[currentState],
            isFocused && "shadow-glow-sm",
            className
          )}
          ref={ref}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          disabled={loading || props.disabled}
          {...props}
        />
        {(error || success || loading) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
            {error && <X className="w-4 h-4 text-status-danger" />}
            {success && <Check className="w-4 h-4 text-status-success" />}
          </div>
        )}
      </div>
      {(helperText || error) && (
        <p className={cn(
          "mt-2 text-badge",
          error ? "text-status-danger" : "text-text-muted"
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
