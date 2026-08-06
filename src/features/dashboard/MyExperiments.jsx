import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FlaskConical, Building2, Clock, CheckCircle, FileText, Users, TrendingUp } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function MyExperiments() {
  const { user } = useAuth();

  const experiments = [
    { id: 1, title: 'Neural Network Optimization', lab: 'AI Research Lab', stage: 'Testing', approvalStatus: 'Approved', progress: 75, mentors: ['Dr. Chen', 'Prof. Smith'], files: 12, results: 'Positive' },
    { id: 2, title: 'Quantum Computing Simulation', lab: 'Physics Lab', stage: 'Analysis', approvalStatus: 'Pending', progress: 45, mentors: ['Dr. Watson'], files: 8, results: 'In Progress' },
    { id: 3, title: 'Bioinformatics Analysis', lab: 'Bio Lab', stage: 'Planning', approvalStatus: 'Approved', progress: 20, mentors: ['Dr. Lee', 'Dr. Kim'], files: 5, results: 'Not Started' },
  ];

  const getStageColor = (stage) => {
    const colors = {
      Planning: 'bg-amber-500/10 text-amber-400',
      Testing: 'bg-blue-500/10 text-blue-400',
      Analysis: 'bg-purple-500/10 text-purple-400',
      Completed: 'bg-emerald-500/10 text-emerald-400',
    };
    return colors[stage] || colors.Planning;
  };

  const getApprovalColor = (status) => {
    const colors = {
      Approved: 'bg-emerald-500/10 text-emerald-400',
      Pending: 'bg-amber-500/10 text-amber-400',
      Rejected: 'bg-red-500/10 text-red-400',
    };
    return colors[status] || colors.Pending;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="My Experiments" 
        description="Experiment display with title, lab, stage, approval status, progress, mentors, files, and results."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {experiments.map((experiment) => (
          <Card key={experiment.id} className="hover:border-accent/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getApprovalColor(experiment.approvalStatus)}`}>
                  {experiment.approvalStatus}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{experiment.title}</h3>
              <div className="space-y-2 text-sm text-text-muted mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{experiment.lab}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className={`px-2 py-1 rounded-full ${getStageColor(experiment.stage)}`}>
                    {experiment.stage}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{experiment.mentors.join(', ')}</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-text-muted">Progress</span>
                  <span className="text-accent">{experiment.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent to-cyan-500"
                    style={{ width: `${experiment.progress}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-text-muted">Files</p>
                  <p className="font-bold text-accent">{experiment.files}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <p className="text-text-muted">Results</p>
                  <p className="font-bold text-accent">{experiment.results}</p>
                </div>
                <Button size="sm" variant="secondary" className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>View</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
