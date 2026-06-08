import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { HelpCircle, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const requests = [
  { id: '1', title: 'How to structure Firestore data for massive scale graphs?', author: 'Sarah', tags: ['Database', 'Architecture'], answers: 3, votes: 12, status: 'answered' },
  { id: '2', title: 'Need review on Quantum Algorithm Draft', author: 'Dr. Vance', tags: ['Research', 'Quantum'], answers: 0, votes: 5, status: 'open' },
];

export default function KnowledgeRequests() {
  return (
    <PageContainer>
      <PageHeader
        title="Knowledge Q&A"
        description="Ask questions, request peer reviews, and crowdsource solutions from experts."
        action={
          <Button><HelpCircle className="w-4 h-4 mr-2" /> Ask Question</Button>
        }
      />
      
      <div className="flex gap-2 mb-8">
         <Button variant="secondary" className="bg-accent/10 text-accent border-accent/30">All Questions</Button>
         <Button variant="secondary">Unanswered</Button>
         <Button variant="secondary">My Requests</Button>
      </div>

      <div className="space-y-4">
        {requests.map(req => (
          <Card key={req.id} className="border-border bg-surface/50 hover:border-accent transition-all cursor-pointer">
             <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                <div className="flex md:flex-col items-center gap-2 md:gap-1 text-text-muted shrink-0 w-16 text-center">
                   <div className="flex flex-col items-center">
                      <ChevronUp className="w-5 h-5 hover:text-accent cursor-pointer" />
                      <span className="font-bold text-white text-sm">{req.votes}</span>
                   </div>
                </div>
                
                <div className="flex-1">
                   <h3 className="text-lg font-bold text-white mb-2">{req.title}</h3>
                   <div className="flex flex-wrap gap-2 mb-3">
                      {req.tags.map(tag => (
                         <span key={tag} className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 text-text-muted border border-border">{tag}</span>
                      ))}
                   </div>
                   <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span className="text-accent font-medium">@{req.author}</span>
                      <span>2 hours ago</span>
                   </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                   <div className={`flex flex-col items-center justify-center p-2 rounded-lg border ${req.answers > 0 ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-surface border-border text-text-muted'}`}>
                      <span className="font-bold text-lg leading-none">{req.answers}</span>
                      <span className="text-[10px] uppercase mt-1">Answers</span>
                   </div>
                </div>
             </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
