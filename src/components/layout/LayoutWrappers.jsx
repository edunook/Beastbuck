import { cn } from '../../lib/utils';

/**
 * PageContainer ensures main content respects max-widths
 * and aligns properly on massive monitors.
 */
export function PageContainer({ children, className }) {
  return (
    <div className={cn("w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in duration-500", className)}>
      {children}
    </div>
  );
}

/**
 * SectionWrapper is used to group content blocks logically
 * with standard spacing and optional visual backgrounds.
 */
export function SectionWrapper({ children, title, action, className }) {
  return (
    <section className={cn("flex flex-col gap-6 mb-10", className)}>
      {(title || action) && (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {title && <h2 className="text-section-title font-heading font-bold text-white">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </section>
  );
}
