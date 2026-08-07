import { forwardRef, useState } from 'react';
import { cn } from '@shared/lib/utils';

const Button = forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  onError,
  loading = false,
  success = false,
  ripple = false,
  ...props 
}, ref) => {
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const [rippleCoords, setRippleCoords] = useState(null);

  const handleClick = async (e) => {
    setIsError(false);
    setErrorMessage('');
    
    if (ripple) {
      const rect = e.currentTarget.getBoundingClientRect();
      setRippleCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setTimeout(() => setRippleCoords(null), 600);
    }
    
    try {
      if (props.onClick) {
        await props.onClick(e);
      }
    } catch (err) {
      console.error('Button click error:', err);
      setIsError(true);
      setErrorMessage(err.message || 'An error occurred');
      if (onError) {
        onError(err);
      }
    }
  };

  const baseStyles = "inline-flex items-center justify-center rounded-xl font-bold transition-all duration-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-premium-1 text-text shadow-glow-sm hover:shadow-glow-md hover:scale-105 hover:-translate-y-1 active:scale-95 focus:ring-accent",
    secondary: "bg-surface border border-border text-text hover:bg-surface-100 hover:border-border-100 hover:scale-105 hover:-translate-y-1 active:scale-95 focus:ring-text-50",
    danger: "bg-status-danger/10 border border-status-danger/20 text-status-danger hover:bg-status-danger/20 hover:scale-105 hover:-translate-y-1 active:scale-95 focus:ring-status-danger",
    ghost: "text-text-muted hover:text-text hover:bg-surface hover:scale-105 hover:-translate-y-1 active:scale-95 focus:ring-text-50",
    success: "bg-status-success/10 border border-status-success/20 text-status-success hover:bg-status-success/20 hover:scale-105 hover:-translate-y-1 active:scale-95 focus:ring-status-success",
  };

  const sizes = {
    sm: "px-4 py-3 text-sm min-h-[44px]", // Minimum 44px touch target
    md: "px-5 py-2.5 text-base min-h-[44px]", // Minimum 44px touch target
    lg: "px-8 py-3.5 text-lg min-h-[44px]" // Minimum 44px touch target
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], isPressed && "scale-95", success && "border-status-success text-status-success", className)}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => { setIsPressed(false); setRippleCoords(null); }}
      disabled={loading || props.disabled}
      {...props}
    >
      {ripple && rippleCoords && (
        <span
          className="absolute rounded-full bg-white/30 animate-ping"
          style={{
            left: rippleCoords.x,
            top: rippleCoords.y,
            width: '0',
            height: '0',
            animation: 'ripple 600ms ease-out',
          }}
        />
      )}
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      <span className={cn("relative z-10 flex items-center gap-2", loading && "opacity-0")}>
        {success && <span className="text-lg">✓</span>}
        {children}
      </span>
      {isError && (
        <span className="ml-2 text-badge text-status-danger" title={errorMessage}>
          ⚠️
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
