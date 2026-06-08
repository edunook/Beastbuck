import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WorkspaceService } from '../../services/firebase/workspace';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FolderKanban, FileText, FileSignature, StickyNote, BrainCircuit, Users, Loader2 } from 'lucide-react';
import CollaborationManager from './CollaborationManager';
import DocumentEditor from './DocumentEditor';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('documents');
  const [showCollabModal, setShowCollabModal] = useState(false);
  const [activeDocId, setActiveDocId] = useState(null);

  useEffect(() => {
    if (user && id) loadWorkspace();
  }, [user, id]);

  const loadWorkspace = async () => {
    setLoading(true);
    const w = await WorkspaceService.getWorkspace(id);
    if (!w) navigate('/workspace');
    setWorkspace(w);
    setLoading(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  const TABS = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'notebooks', label: 'Notebooks', icon: FileSignature },
    { id: 'whiteboards', label: 'Whiteboards', icon: FolderKanban },
    { id: 'mindmaps', label: 'Mind Maps', icon: BrainCircuit },
  ];

  if (activeDocId) {
    return <DocumentEditor workspaceId={id} docId={activeDocId} onClose={() => setActiveDocId(null)} />;
  }

  return (
    <PageContainer>
      <PageHeader
        title={workspace.name}
        description={workspace.description || 'Digital Workspace'}
        action={
          <Button variant="secondary" onClick={() => setShowCollabModal(true)}>
            <Users className="mr-2 h-4 w-4" /> Share
          </Button>
        }
      />

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface/50 p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              activeTab === tab.id ? 'bg-accent text-black' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="rounded-lg">
        <CardContent className="p-6">
          {activeTab === 'documents' && (
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Documents</h3>
                    <Button onClick={() => setActiveDocId('new')}><PlusCircle className="mr-2 h-4 w-4"/> New Document</Button>
                </div>
                <DocumentList workspaceId={id} onOpenDoc={setActiveDocId} />
             </div>
          )}
          {activeTab === 'notes' && (
              <NotesManager workspaceId={id} />
          )}
          {activeTab === 'notebooks' && (
              <div className="space-y-4">
                  <ResearchNotebookEditor workspaceId={id} notebookId="new" onClose={() => {}} />
              </div>
          )}
          {activeTab === 'whiteboards' && (
              <CanvasBoard workspaceId={id} boardId="new" type="whiteboard" onClose={() => setActiveTab('documents')} />
          )}
          {activeTab === 'mindmaps' && (
              <CanvasBoard workspaceId={id} boardId="new" type="mindmap" onClose={() => setActiveTab('documents')} />
          )}
        </CardContent>
      </Card>

      {showCollabModal && (
        <CollaborationManager workspaceId={id} onClose={() => setShowCollabModal(false)} />
      )}
    </PageContainer>
  );
}

import NotesManager from './NotesManager';
import ResearchNotebookEditor from './ResearchNotebookEditor';
import CanvasBoard from './CanvasBoard';
import { PlusCircle } from 'lucide-react';
function DocumentList({ workspaceId, onOpenDoc }) {
    const [docs, setDocs] = useState([]);
    useEffect(() => {
        WorkspaceService.getDocuments(workspaceId).then(setDocs);
    }, [workspaceId]);

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {docs.map(d => (
                <div key={d.id} onClick={() => onOpenDoc(d.id)} className="cursor-pointer rounded-lg border border-border bg-white/[0.03] p-4 transition hover:border-accent/40">
                    <h4 className="font-bold text-white mb-1">{d.title || 'Untitled Document'}</h4>
                    <p className="text-xs text-text-muted">Last edited: {d.lastEditedAt?.toDate().toLocaleString()}</p>
                </div>
            ))}
            {docs.length === 0 && <p className="text-sm text-text-muted col-span-3">No documents yet.</p>}
        </div>
    )
}
