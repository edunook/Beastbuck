import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ghost, Lightbulb, ThumbsUp } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { CollaborationService } from '../../services/firebase/collaboration';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export default function BrainstormSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState('NAMED');
  const [newIdea, setNewIdea] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = CollaborationService.subscribeToBrainstorm(id, {
      onSession: (s) => {
        setSession(s);
        setLoading(false);
      },
    });
    return () => unsub();
  }, [id]);

  const submitIdea = async (e) => {
    e.preventDefault();
    if (!newIdea.trim() || !id) return;
    await CollaborationService.addBrainstormIdea(id, {
      text: newIdea.trim(),
      authorId: user.uid,
      authorName: roleData?.displayName || roleData?.username,
      anonymous: mode === 'ANONYMOUS',
    });
    setNewIdea('');
  };

  const ideas = [...(session?.ideas || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  if (loading) {
    return (
      <PageContainer>
        <LoadingState text="Loading brainstorm..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={session?.title || 'Brainstorm'}
        description="Vote, rank, and expand ideas in realtime."
        action={<Lightbulb className="h-8 w-8 text-accent" />}
      />

      <SectionWrapper>
        <form onSubmit={submitIdea} className="flex flex-col gap-3 sm:flex-row">
          <input
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            placeholder="Share an idea..."
            className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-accent"
          />
          <Button type="button" variant="secondary" onClick={() => setMode(mode === 'NAMED' ? 'ANONYMOUS' : 'NAMED')}>
            <Ghost className="mr-2 h-4 w-4" />
            {mode === 'ANONYMOUS' ? 'Anonymous' : 'Named'}
          </Button>
          <Button type="submit">Add</Button>
        </form>
      </SectionWrapper>

      <SectionWrapper>
        <div className="space-y-3">
          {ideas.map(idea => (
            <Card key={idea.id} className="rounded-xl">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-bold text-white">{idea.text}</p>
                  <p className="mt-1 text-xs text-text-muted">{idea.authorName}</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => CollaborationService.voteBrainstormIdea(id, idea.id, user.uid)}
                >
                  <ThumbsUp className="mr-1 h-4 w-4" /> {idea.votes || 0}
                </Button>
              </CardContent>
            </Card>
          ))}
          {ideas.length === 0 && <p className="text-text-muted">No ideas yet.</p>}
        </div>
      </SectionWrapper>

      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
    </PageContainer>
  );
}
