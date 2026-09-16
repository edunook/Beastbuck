import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Users, Calendar, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';

export function ProjectsWidget() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadProjects = async () => {
      try {
        const { GamificationService } = await import('@services/firestore/gamification');
        const data = await GamificationService.getUserProjects(user.uid);
        if (!cancelled) {
          setProjects(data || []);
        }
      } catch (err) {
        console.warn('ProjectsWidget load error:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProjects();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-text-muted">My Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5 border border-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden h-full border border-blue-500/20 bg-gradient-to-br from-slate-900/90 via-blue-950/15 to-indigo-950/30 backdrop-blur-xl shadow-xl transition-all duration-500 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700" />

      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-300">
          <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <FolderOpen className="h-4 w-4" />
          </div>
          My Projects
        </CardTitle>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors group/link"
        >
          <span>Workspace</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {projects.length === 0 ? (
          <div className="text-center py-6">
            <DynamicEmptyState type="projects" title="No projects yet" subtitle="Kickstart a new project to collaborate with the team!" />
            <Link
              to="/projects"
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-blue-500/25 hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Start Project
            </Link>
          </div>
        ) : (
          projects.slice(0, 3).map((project, index) => (
            <Link
              key={project.id || index}
              to="/projects"
              className="group/item block p-3 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-blue-500/40 hover:bg-blue-500/[0.06] transition-all duration-300 hover:-translate-y-0.5"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 80}ms both` }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-bold text-white truncate group-hover/item:text-blue-300 transition-colors">
                  {project.name || project.title || 'Untitled Project'}
                </h4>
                <span className="text-[10px] font-black text-blue-300 shrink-0 font-mono">
                  {project.progress || 0}%
                </span>
              </div>

              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700"
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>

              <div className="flex items-center gap-3 text-[10px] text-text-muted">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-blue-400" />
                  {project.team || 'Solo'}
                </span>
                {project.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    {project.deadline}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}