import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { cn } from '../../lib/utils';

export function DashboardCard({ title, icon: Icon, value, subtitle, trend, trendUp, className, action, depth = 2 }) {
  return (
    <Card className={cn("overflow-hidden flex flex-col hoverable", className)} depth={depth}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-badge font-medium text-text-muted flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-accent" />}
          {title}
        </CardTitle>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end pt-0">
        <div className="text-metric font-heading font-bold text-text tracking-tight">{value}</div>
        
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-2">
            {trend && (
              <span className={cn("text-badge font-medium px-2 py-1 rounded-full", trendUp ? "bg-status-success/10 text-status-success" : "bg-status-danger/10 text-status-danger")}>
                {trend}
              </span>
            )}
            {subtitle && <span className="text-badge text-text-muted">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
