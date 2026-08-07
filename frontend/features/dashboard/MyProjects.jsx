import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FolderKanban, Users, Calendar, TrendingUp, FileText, MessageSquare, CheckCircle } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function MyProjects() {
  const { user } = useAuth();

  const projects = [
    { id: 1, name: 'AI Research Platform', team: 'AI Research Team', progress: 75, members: 8, deadline: '2024-03-15', status: 'Active', healthScore: 85 },
    { id: 2, name: 'Dashboard Redesign', team: 'UI/UX Team', progress: 45, members: 5, deadline: '2024-02-28', status: 'Active', healthScore: 72 },
    { id: 3, name: 'Marketplace Integration', team: 'Backend Team', progress: 90, members: 6, deadline: '2024-02-20', status: 'Review', healthScore: 92 },
  ];

  const getStatusColor = (status) => {
    const colors = {
      Active: 'bg-emerald-500/10 text-emerald-400',
      Review: 'bg-amber-500/10 text-amber-400',
      Completed: 'bg-blue-500/10 text-blue-400',
      'On Hold': 'bg-red-500/10 text-red-400',
    };
    return colors[status] || colors.Active;
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <PageContainer>
      <PageHeader 
        title="My Projects" 
        description="Project cards with project name, team, progress, members, deadline, status, health score, quick continue, quick files, quick chat, and quick tasks."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{project.name}</h3>
              <div className="space-y-2 text-sm text-text-muted mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{project.team}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{project.deadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{project.members} members</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-accent">{project.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-purple-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-muted text-sm">Health Score</span>
                <span className={`font-bold ${getHealthColor(project.healthScore)}`}>
                  {project.healthScore}%
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button size="sm" variant="secondary" className="flex flex-col items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Continue</span>
                </Button>
                <Button size="sm" variant="secondary" className="flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Files</span>
                </Button>
                <Button size="sm" variant="secondary" className="flex flex-col items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">Chat</span>
                </Button>
                <Button size="sm" variant="secondary" className="flex flex-col items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Tasks</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
