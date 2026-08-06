import { useState } from 'react';
import { Rocket, CheckCircle, AlertTriangle, Server, Globe, Shield, Zap, Database } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ProductionLaunch() {
  const [deploymentConfirmed, setDeploymentConfirmed] = useState(false);

  const checklist = [
    { id: 'build', name: 'Run npm run build - zero errors', status: 'passed', icon: Zap },
    { id: 'test', name: 'All tests passing', status: 'passed', icon: CheckCircle },
    { id: 'env', name: 'Environment variables configured', status: 'passed', icon: Globe },
    { id: 'security', name: 'Security rules deployed', status: 'passed', icon: Shield },
    { id: 'database', name: 'Database indexes created', status: 'passed', icon: Database },
    { id: 'domain', name: 'Custom domain configured', status: 'pending', icon: Server },
    { id: 'ssl', name: 'SSL certificate active', status: 'pending', icon: Shield },
    { id: 'monitoring', name: 'Monitoring setup', status: 'pending', icon: AlertTriangle },
  ];

  const preLaunchChecks = [
    { id: 'backup', name: 'Backup current production data', status: 'pending' },
    { id: 'rollback', name: 'Rollback plan documented', status: 'pending' },
    { id: 'notify', name: 'Notify team of deployment', status: 'pending' },
    { id: 'maintenance', name: 'Schedule maintenance window', status: 'pending' },
  ];

  const postLaunchChecks = [
    { id: 'verify', name: 'Verify all features working', status: 'pending' },
    { id: 'performance', name: 'Check performance metrics', status: 'pending' },
    { id: 'errors', name: 'Monitor error logs', status: 'pending' },
    { id: 'analytics', name: 'Verify analytics tracking', status: 'pending' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'failed':
        return <CheckCircle className="h-5 w-5 text-red-400" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/10 border-red-500/30';
      case 'pending':
        return 'bg-amber-500/10 border-amber-500/30';
      default:
        return 'bg-amber-500/10 border-amber-500/30';
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Production Launch" 
        description="Confirm final deployment on production servers (Vercel)."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Pre-Launch Checklist</h3>
          </div>
          <div className="space-y-3">
            {checklist.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border ${getStatusClass(item.status)}`}>
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-accent" />
                    <span className="text-white">{item.name}</span>
                  </div>
                  {getStatusIcon(item.status)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Server className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Pre-Launch Actions</h3>
          </div>
          <div className="space-y-3">
            {preLaunchChecks.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border ${getStatusClass(item.status)}`}>
                <span className="text-white">{item.name}</span>
                {getStatusIcon(item.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Post-Launch Verification</h3>
          </div>
          <div className="space-y-3">
            {postLaunchChecks.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border ${getStatusClass(item.status)}`}>
                <span className="text-white">{item.name}</span>
                {getStatusIcon(item.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="font-bold text-white text-xl mb-4">Deployment Steps</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">1.</span>
              <span className="text-white">Run <code className="bg-black/30 px-2 py-1 rounded">npm run build</code></span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">2.</span>
              <span className="text-white">Push to main branch</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">3.</span>
              <span className="text-white">Vercel auto-deploys on push</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">4.</span>
              <span className="text-white">Verify deployment in Vercel dashboard</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
              <span className="text-emerald-400 text-lg">5.</span>
              <span className="text-white">Run post-launch verification checks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <p className="font-bold text-white">Important</p>
        </div>
        <p className="text-text-muted text-sm">
          Ensure all checklist items are marked as passed before confirming deployment. 
          Have a rollback plan ready in case of issues.
        </p>
      </div>

      <Button 
        className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
        onClick={() => setDeploymentConfirmed(!deploymentConfirmed)}
      >
        {deploymentConfirmed ? 'Deployment Confirmed ✓' : 'Confirm Production Deployment'}
      </Button>
    </PageContainer>
  );
}
