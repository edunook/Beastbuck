import { useState, useEffect } from 'react';
import { FolderOpen, Users, Calendar, TrendingUp, Flame, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService } from '@services/firestore/gamification';

export function ProjectsWidget() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadProjects = async () => {
      try {
        const data = await GamificationService.getUserProjects(user.uid);
        setProjects(data || []);
      } catch (err) {
        console.log('Projects load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <FolderOpen className="text-blue-400 animate-pulse" />
          My Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <DynamicEmptyState type="projects" title="No projects yet" subtitle="Start your first project to see it here!" />
        ) : (
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group/project p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-blue-500/50 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <FolderOpen className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover/project:text-blue-300 transition-colors">
                      {project.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                      <Users className="text-xs" />
                      <span>{project.team || 'Solo'}</span>
                      <span className="text-white/20">·</span>
                      <Calendar className="text-xs" />
                      <span>{project.deadline || 'No deadline'}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-blue-300">{project.progress || 0}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}