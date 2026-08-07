import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FileText, Edit, CheckCircle, Users, Quote } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function ResearchSnapshot() {
  const { user } = useAuth();

  const metrics = [
    { id: 'papers', name: 'Research Papers', value: 12, icon: FileText, color: 'purple' },
    { id: 'drafts', name: 'Drafts', value: 5, icon: Edit, color: 'cyan' },
    { id: 'published', name: 'Published', value: 7, icon: CheckCircle, color: 'emerald' },
    { id: 'collaborators', name: 'Collaborators', value: 8, icon: Users, color: 'amber' },
    { id: 'pending', name: 'Pending Reviews', value: 3, icon: Clock, color: 'pink' },
    { id: 'citations', name: 'Citation Count', value: 234, icon: Quote, color: 'red' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Snapshot" 
        description="Research overview including research papers, drafts, published, collaborators, pending reviews, and citation count."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.id}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(metric.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold text-accent">{metric.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
