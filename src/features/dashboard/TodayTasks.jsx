import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { CheckCircle, Clock, AlertCircle, FolderKanban, ExternalLink } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function TodayTasks() {
  const { user } = useAuth();

  const tasks = [
    { id: 1, title: 'Complete research paper', project: 'AI Research', priority: 'High', deadline: 'Today', status: 'In Progress', progress: 60 },
    { id: 2, title: 'Review project proposal', project: 'Dashboard', priority: 'Medium', deadline: 'Tomorrow', status: 'Pending', progress: 0 },
    { id: 3, title: 'Update documentation', project: 'Marketplace', priority: 'Low', deadline: 'This Week', status: 'Pending', progress: 0 },
    { id: 4, title: 'Attend team meeting', project: 'General', priority: 'High', deadline: '2 PM', status: 'Scheduled', progress: 0 },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-red-500/10 border-red-500/30 text-red-400',
      Medium: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      Low: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': 'bg-blue-500/10 text-blue-400',
      Pending: 'bg-gray-500/10 text-gray-400',
      Scheduled: 'bg-purple-500/10 text-purple-400',
      Completed: 'bg-emerald-500/10 text-emerald-400',
    };
    return colors[status] || colors.Pending;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Today's Tasks" 
        description="Live task display with priority, deadline, project, status, progress, quick complete button, quick open button, and drag and drop ordering."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                <Button size="sm" variant="secondary" className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white">{task.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <div className="flex items-center gap-1">
                      <FolderKanban className="h-4 w-4" />
                      <span>{task.project}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{task.deadline}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent to-purple-500"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="secondary">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
