import { Database, Image as ImageIcon, Film, FileText, FlaskConical, Bot, HardDrive } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';

export default function StorageSettings() {

  const storageData = {
    totalUsed: '2.5 GB',
    totalLimit: '10 GB',
    percentage: 25,
    breakdown: [
      { id: 'images', name: 'Images', used: '1.2 GB', icon: ImageIcon, color: 'purple' },
      { id: 'videos', name: 'Videos', used: '800 MB', icon: Film, color: 'cyan' },
      { id: 'documents', name: 'Documents', used: '300 MB', icon: FileText, color: 'emerald' },
      { id: 'research', name: 'Research Files', used: '150 MB', icon: FlaskConical, color: 'amber' },
      { id: 'ai', name: 'AI Knowledge Files', used: '50 MB', icon: Bot, color: 'pink' },
    ],
  };

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Storage Settings" 
        description="Storage display including storage used, images, videos, documents, research files, and AI knowledge files."
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <HardDrive className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Storage Overview</h3>
          </div>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">{storageData.totalUsed} of {storageData.totalLimit} used</span>
              <span className="text-accent font-bold">{storageData.percentage}%</span>
            </div>
            <div className="h-4 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-purple-500"
                style={{ width: `${storageData.percentage}%` }}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storageData.breakdown.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="p-4 rounded-xl bg-white/5">
                  <div className={`p-3 rounded-xl ${getColorClass(item.color)} mb-3`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{item.name}</h3>
                  <p className="text-accent font-bold">{item.used}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Storage Tips</h3>
          </div>
          <ul className="space-y-2 text-text-muted">
            <li className="flex items-center gap-2">
              <span className="text-accent">•</span>
              Delete old videos and large files you no longer need
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">•</span>
              Compress images before uploading
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">•</span>
              Clean up temporary AI knowledge files regularly
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">•</span>
              Archive old research documents
            </li>
          </ul>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
