import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Users, GitCommit, Target, CheckCircle, Clock } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function TeamOverview() {
  const { user } = useAuth();

  const teamMembers = [
    { id: 1, name: 'Dr. Sarah Chen', avatar: '👩‍🔬', status: 'Online', role: 'Lead Researcher' },
    { id: 2, name: 'Alex Johnson', avatar: '👨‍💼', status: 'Online', role: 'Software Engineer' },
    { id: 3, name: 'Emma Williams', avatar: '👩‍💻', status: 'Away', role: 'UI Designer' },
    { id: 4, name: 'James Brown', avatar: '👨‍🚀', status: 'Online', role: 'Backend Developer' },
  ];

  const sprint = {
    name: 'Sprint 24',
    progress: 68,
    deadline: '2024-02-28',
    objectives: ['Complete AI Integration', 'Fix critical bugs', 'Improve performance'],
  };

  const tasks = {
    assigned: 12,
    completed: 8,
    inProgress: 4,
  };

  const commits = [
    { id: 1, user: 'Alex Johnson', message: 'Fixed authentication bug', time: '2 hours ago' },
    { id: 2, user: 'Emma Williams', message: 'Updated dashboard design', time: '4 hours ago' },
    { id: 3, user: 'James Brown', message: 'Added API endpoints', time: '6 hours ago' },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Team Overview" 
        description="Team information including team members online, current sprint, assigned tasks, progress, recent commits, and current objectives."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Team Members Online</h3>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="relative">
                    <div className="text-3xl">{member.avatar}</div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${member.status === 'Online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{member.name}</h3>
                    <p className="text-text-muted text-sm">{member.role}</p>
                  </div>
                  <span className={`text-xs ${member.status === 'Online' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-white text-xl">Current Sprint</h3>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">{sprint.name}</h3>
                <span className="text-text-muted text-sm">{sprint.deadline}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-purple-500"
                  style={{ width: `${sprint.progress}%` }}
                />
              </div>
              <p className="text-accent font-bold">{sprint.progress}% Complete</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-text-muted text-xs">Assigned</p>
                <p className="font-bold text-accent">{tasks.assigned}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-text-muted text-xs">Completed</p>
                <p className="font-bold text-emerald-400">{tasks.completed}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <p className="text-text-muted text-xs">In Progress</p>
                <p className="font-bold text-amber-400">{tasks.inProgress}</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Objectives</h4>
              <ul className="space-y-1">
                {sprint.objectives.map((objective, index) => (
                  <li key={index} className="flex items-center gap-2 text-text-muted text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitCommit className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Recent Commits</h3>
          </div>
          <div className="space-y-3">
            {commits.map((commit) => (
              <div key={commit.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                <div className="text-2xl">👤</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{commit.user}</span>
                    <span className="text-text-muted text-sm">{commit.time}</span>
                  </div>
                  <p className="text-text-muted text-sm">{commit.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
