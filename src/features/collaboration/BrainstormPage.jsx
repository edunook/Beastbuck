import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lightbulb, ThumbsUp, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { CollaborationService } from '../../services/realtime/collaboration';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function BrainstormPage() {
  const { id } = useParams();
  const { user, roleData } = useAuth();
  const [session, setSession] = useState(null);
  const [idea, setIdea] = useState('');
  const [anonymous, setAnonymous] = useState(false);
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

  const addIdea = async (e) => {
    e.preventDefault();
    if (!idea.trim()) return;
    await CollaborationService.addBrainstormIdea(id, {
      text: idea.trim(),
      authorId: user.uid,
      authorName: roleData?.displayName || roleData?.username,
      anonymous,
    });
    setIdea('');
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
        description="Idea storming, voting, ranking, and AI-ready innovation scoring."
        action={<Lightbulb className="h-8 w-8 text-accent" />}
      />

      <SectionWrapper>
        <form onSubmit={addIdea} className="flex flex-col gap-3 sm:flex-row">
          <Input value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Share an idea..." className="flex-1" />
          <label className="flex items-center gap-2 text-sm text-text-muted">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            Anonymous
          </label>
          <Button type="submit">Add Idea</Button>
        </form>
      </SectionWrapper>

      <SectionWrapper title="Ideas ranked by votes">
        <div className="space-y-3">
          {ideas.map(item => (
            <Card key={item.id} className="rounded-xl">
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="font-bold text-white">{item.text}</p>
                  <p className="mt-1 text-xs text-text-muted">{item.authorName}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-accent">
                    <Sparkles className="h-3 w-3" /> Innovation score: {item.score || item.votes || 0}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => CollaborationService.voteBrainstormIdea(id, item.id, user.uid)}
                >
                  <ThumbsUp className="mr-1 h-4 w-4" /> {item.votes || 0}
                </Button>
              </CardContent>
            </Card>
          ))}
          {ideas.length === 0 && <p className="text-text-muted">No ideas yet — start the storm!</p>}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}
