import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent } from '../../../components/ui/Card';

export function WelcomePanel() {
  const { user, roleData } = useAuth();
  
  return (
    <Card className="bg-gradient-subtle-1 border-white/10 shadow-depth-2 depth={2}" hoverable={true}>
      <CardContent className="p-6 sm:p-8 flex items-center justify-between">
        <div>
          <h2 className="text-hero sm:text-page-title font-heading font-bold text-white mb-2">
            Welcome back, <span className="text-gradient">{roleData?.displayName || roleData?.username || user?.email}</span>
          </h2>
          <p className="text-description text-text-muted">You have 3 active tasks and 2 new announcements today.</p>
        </div>
        <div className="hidden sm:block">
          <div className="px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent font-medium text-badge tracking-wide shadow-glow-1">
            {roleData?.role?.toUpperCase()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
