import { useState, useEffect } from 'react';
import { Link, FlaskConical, BriefcaseBusiness, Package, Bot, FileText, Funnel } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';

export default function ExperimentConnection() {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = () => {
    // Simulated connection data
    setConnections([
      {
        id: 1,
        type: 'experiment',
        title: 'Chemical Reaction Analysis',
        status: 'active',
        linkedAt: '2024-06-10',
      },
      {
        id: 2,
        type: 'project',
        title: 'AI Model Development',
        status: 'completed',
        linkedAt: '2024-05-20',
      },
      {
        id: 3,
        type: 'product',
        title: 'Solar Panel Prototype',
        status: 'active',
        linkedAt: '2024-06-01',
      },
      {
        id: 4,
        type: 'venture',
        title: 'CleanTech Startup',
        status: 'planning',
        linkedAt: '2024-06-15',
      },
      {
        id: 5,
        type: 'ai',
        title: 'Climate Prediction Model',
        status: 'active',
        linkedAt: '2024-06-05',
      },
      {
        id: 6,
        type: 'marketplace',
        title: 'Research Dataset',
        status: 'published',
        linkedAt: '2024-05-25',
      },
    ]);
  };

  const getTypeInfo = (type) => {
    const types = {
      experiment: { icon: FlaskConical, label: 'Experiment', color: 'purple' },
      project: { icon: BriefcaseBusiness, label: 'Project', color: 'cyan' },
      product: { icon: Package, label: 'Product', color: 'amber' },
      venture: { icon: Funnel, label: 'Venture', color: 'emerald' },
      ai: { icon: Bot, label: 'AI Model', color: 'pink' },
      marketplace: { icon: FileText, label: 'Marketplace Asset', color: 'blue' },
    };
    return types[type] || types.experiment;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'completed': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'published': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'planning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Experiment Connection" 
        description="Link your research to experiments, projects, and more."
        hero={true}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => {
          const typeInfo = getTypeInfo(conn.type);
          const Icon = typeInfo.icon;
          return (
            <Card key={conn.id} className="hover:border-accent/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getStatusColor(conn.status)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{conn.title}</h3>
                    <p className="text-text-muted text-sm mb-2">{typeInfo.label}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full border text-xs font-bold uppercase ${getStatusColor(conn.status)}`}>
                        {conn.status}
                      </span>
                      <span className="text-text-muted text-xs">{conn.linkedAt}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Link className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Connected Ecosystem</h3>
              <p className="text-text-soft text-sm">
                Link your research to experiments, projects, products, ventures, AI models, marketplace assets, 
                knowledge articles, showcase posts, and FunFlix videos for a comprehensive research ecosystem.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
