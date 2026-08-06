import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { GitBranch, History, RotateCcw, FileText, Clock, CheckCircle } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AIVersionControl() {
  const { user } = useAuth();
  const [selectedVersion, setSelectedVersion] = useState(null);

  const versions = [
    { id: 1, version: 'v2.5.0', date: '2 hours ago', changes: 'Updated prompt structure', type: 'release', author: 'You' },
    { id: 2, version: 'v2.4.0', date: '1 day ago', changes: 'Added new knowledge sources', type: 'release', author: 'Dr. Sarah Chen' },
    { id: 3, version: 'v2.3.0', date: '3 days ago', changes: 'Improved response quality', type: 'release', author: 'You' },
    { id: 4, version: 'v2.2.1', date: '5 days ago', changes: 'Bug fixes', type: 'patch', author: 'Alex Johnson' },
    { id: 5, version: 'v2.2.0', date: '1 week ago', changes: 'Added safety features', type: 'release', author: 'You' },
    { id: 6, version: 'v2.1.0', date: '2 weeks ago', changes: 'Knowledge base update', type: 'release', author: 'Emma Williams' },
  ];

  const drafts = [
    { id: 1, name: 'New persona draft', date: '1 hour ago', author: 'You' },
    { id: 2, name: 'Experimental prompt', date: '3 hours ago', author: 'Dr. Sarah Chen' },
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'release': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'patch': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'draft': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Version Control" 
        description="Manage version history, changes, and drafts for your AI."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-accent" />
              Version History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="p-4 rounded-xl bg-white/5 border border-border hover:border-accent/50 transition-all cursor-pointer"
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-accent" />
                      <span className="font-bold text-white">{version.version}</span>
                      <span className={`px-2 py-1 rounded-full border text-xs font-bold uppercase ${getTypeColor(version.type)}`}>
                        {version.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{version.date}</span>
                    </div>
                  </div>
                  <p className="text-text-soft text-sm mb-2">{version.changes}</p>
                  <p className="text-text-muted text-xs">by {version.author}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {drafts.map((draft) => (
                <div key={draft.id} className="p-4 rounded-xl bg-white/5 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white">{draft.name}</h3>
                    <span className={`px-2 py-1 rounded-full border text-xs font-bold uppercase ${getTypeColor('draft')}`}>
                      Draft
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>{draft.date}</span>
                    <span>by {draft.author}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedVersion && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Version Details: {selectedVersion.version}</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-text-muted">Changes:</span>
                <span className="text-white">{selectedVersion.changes}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-text-muted">Date:</span>
                <span className="text-white">{selectedVersion.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-text-muted">Author:</span>
                <span className="text-white">{selectedVersion.author}</span>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="secondary">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Rollback
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Compare
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
