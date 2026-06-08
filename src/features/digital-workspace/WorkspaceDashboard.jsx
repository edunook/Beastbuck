import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { WorkspaceService } from '../../services/firebase/workspace';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FolderKanban, PlusCircle, LayoutDashboard, Loader2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export default function WorkspaceDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (user) loadWorkspaces();
  }, [user]);

  const loadWorkspaces = async () => {
    setLoading(true);
    const w = await WorkspaceService.getUserWorkspaces(user.uid);
    setWorkspaces(w);
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsCreating(true);
    const id = await WorkspaceService.createWorkspace({
      name: newName,
      description: newDesc,
      ownerId: user.uid,
      type: 'PERSONAL'
    });
    setNewName('');
    setNewDesc('');
    setIsCreating(false);
    navigate(`/workspace/${id}`);
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

  return (
    <PageContainer>
      <PageHeader
        title="Digital Workspace"
        description="Collaborate on documents, brainstorm with whiteboards, and organize your knowledge."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><LayoutDashboard className="h-6 w-6" /></div>}
      />

      <SectionWrapper>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Your Workspaces</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Create New Workspace Card */}
          <Card className="rounded-lg border-dashed border-accent/30 bg-accent/5 hover:bg-accent/10 transition">
            <CardContent className="flex h-full flex-col justify-center p-6 text-center">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <PlusCircle className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white">Create Workspace</h3>
                <Input placeholder="Workspace Name" value={newName} onChange={e => setNewName(e.target.value)} required />
                <Input placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <Button type="submit" disabled={!newName.trim() || isCreating} className="w-full">
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Workspace List */}
          {workspaces.map(w => (
            <Card key={w.id} className="cursor-pointer transition hover:border-accent/40" onClick={() => navigate(`/workspace/${w.id}`)}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FolderKanban className="h-5 w-5 text-accent" />
                  {w.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">{w.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span className="rounded-full bg-white/10 px-2 py-0.5">{w.type}</span>
                  <span>Created {w.createdAt?.toDate().toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}
