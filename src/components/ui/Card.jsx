import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Card = forwardRef(({ className, children, depth = 2, hoverable = false, premium = false, glass = false, ...props }, ref) => {
  const depthClasses = {
    1: 'shadow-depth-1 hover:shadow-depth-2',
    2: 'shadow-depth-2 hover:shadow-depth-3',
    3: 'shadow-depth-3 hover:shadow-depth-4',
    4: 'shadow-depth-4 hover:shadow-glow-md',
  };

  return (
    <div
      ref={ref}
      className={cn(
        "bg-surface backdrop-blur-glass-md border border-border rounded-2xl overflow-hidden transition-all duration-base",
        glass && "bg-surface-100 backdrop-blur-glass-lg border-border-100",
        depthClasses[depth],
        hoverable && "hover:-translate-y-1 hover:border-border-100 hover:shadow-glow-sm cursor-pointer",
        premium && "premium-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 border-b border-border", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-heading text-card-title font-bold leading-none tracking-tight text-text", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-description text-text-muted", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
