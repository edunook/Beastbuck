import { useAuth } from '../../auth/AuthContext';
import { Card, CardContent } from '../../../components/ui/Card';
import { Sparkles, Crown, Shield, Users, TrendingUp } from 'lucide-react';

export function WelcomePanel() {
  const { user, roleData } = useAuth();
  
  const getRoleIcon = (role) => {
    if (role === 'Main CEO' || role === 'Co-CEO') return <Crown className="h-5 w-5" />;
    if (role === 'Leader') return <Shield className="h-5 w-5" />;
    return <Users className="h-5 w-5" />;
  };

  const getRoleColor = (role) => {
    if (role === 'Main CEO' || role === 'Co-CEO') return 'text-yellow-400';
    if (role === 'Leader') return 'text-purple-400';
    return 'text-cyan-400';
  };
  
  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-accent/10 via-purple-500/10 to-cyan-500/10 border-accent/30 shadow-2xl shadow-accent/20 backdrop-blur-sm transition-all duration-500 hover:shadow-accent/30 hover:border-accent/50">
      {/* Animated background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-purple-500/0 to-cyan-500/0 opacity-0 transition-all duration-700 group-hover:from-accent/5 group-hover:via-purple-500/5 group-hover:to-cyan-500/5 group-hover:opacity-100" />
      <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-accent/20 blur-3xl transition-all duration-700 group-hover:bg-accent/30 group-hover:scale-150" />
      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl transition-all duration-700 group-hover:bg-purple-500/30 group-hover:scale-150" />
      
      <CardContent className="relative p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center shadow-lg shadow-accent/30 border border-accent/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-accent/50">
                <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              </div>
              <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                {getRoleIcon(roleData?.role)}
                <span className={`text-sm font-bold uppercase tracking-wider ${getRoleColor(roleData?.role)}`}>
                  {roleData?.role || 'Member'}
                </span>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-white mb-3 leading-tight">
              Welcome back, <span className="bg-gradient-to-r from-accent via-purple-400 to-cyan-400 bg-clip-text text-transparent">{roleData?.displayName || roleData?.username || user?.email}</span>
            </h2>
            <p className="text-lg text-text-muted">Your personal command center is ready. Track your progress, manage tasks, and stay connected with the ecosystem.</p>
          </div>
          
          <div className="hidden sm:flex flex-col gap-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-status-success" />
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">XP Progress</p>
                <p className="text-sm font-bold text-white">{roleData?.xp || 0} XP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300">
              <Shield className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Level</p>
                <p className="text-sm font-bold text-white">{roleData?.level || 1}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
