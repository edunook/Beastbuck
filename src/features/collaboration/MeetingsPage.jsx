import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Video, Calendar, Bot, CheckSquare, Target, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MeetingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | past | action-items

  return (
    <PageContainer>
      <PageHeader
        title="Meeting Center & AI Assistant"
        description="Schedule, manage, and extract insights from your team meetings."
        action={
          <Button onClick={() => navigate('/meet')}><Video className="w-4 h-4 mr-2" /> Start Video Meeting</Button>
        }
      />
      
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-border mb-6">
         <button 
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'upcoming' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-white'}`}
            onClick={() => setActiveTab('upcoming')}
         >
            <Calendar className="w-4 h-4 inline mr-2" /> Upcoming
         </button>
         <button 
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'past' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-white'}`}
            onClick={() => setActiveTab('past')}
         >
            <Video className="w-4 h-4 inline mr-2" /> Past Meetings
         </button>
         <button 
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'action-items' ? 'border-accent text-accent' : 'border-transparent text-text-muted hover:text-white'}`}
            onClick={() => setActiveTab('action-items')}
         >
            <CheckSquare className="w-4 h-4 inline mr-2" /> Global Action Items
         </button>
      </div>

      {activeTab === 'upcoming' && (
         <div className="text-center py-16 text-text-muted bg-surface/30 border border-border rounded-xl">
            <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-2">No Upcoming Meetings</h3>
            <p className="text-sm mb-6">Schedule your next sync or start one instantly.</p>
            <Button><Calendar className="w-4 h-4 mr-2" /> Schedule Meeting</Button>
         </div>
      )}

      {activeTab === 'past' && (
         <div className="grid gap-4">
            <Card className="border-border bg-surface/50 hover:border-accent/30 transition-colors">
               <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <h3 className="font-bold text-white text-lg mb-1">Q3 Innovation Review</h3>
                     <p className="text-sm text-text-muted flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Yesterday at 2:00 PM • 45 mins • 6 Attendees
                     </p>
                  </div>
                  <div className="flex gap-2">
                     <Button variant="secondary" size="sm" onClick={() => alert("Summary: Reviewed 5 new ventures. Approved project Alpha. Need to follow up on funding for beta.")}>
                        <FileText className="w-4 h-4 mr-2" /> AI Summary
                     </Button>
                     <Button variant="secondary" size="sm">
                        <Target className="w-4 h-4 mr-2" /> Decisions (2)
                     </Button>
                  </div>
               </CardContent>
            </Card>
         </div>
      )}

      {activeTab === 'action-items' && (
         <div className="grid gap-4">
            <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-4">
               <input type="checkbox" className="mt-1 w-4 h-4 rounded border-border bg-black/40 text-accent focus:ring-accent focus:ring-offset-background" />
               <div>
                  <h4 className="font-bold text-white">Draft budget proposal for Project Alpha</h4>
                  <p className="text-xs text-text-muted mt-1">From: Q3 Innovation Review • Assigned to: You</p>
               </div>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-4">
               <input type="checkbox" className="mt-1 w-4 h-4 rounded border-border bg-black/40 text-accent focus:ring-accent focus:ring-offset-background" />
               <div>
                  <h4 className="font-bold text-white">Schedule follow-up with Dev Team</h4>
                  <p className="text-xs text-text-muted mt-1">From: Weekly Standup • Assigned to: You</p>
               </div>
            </div>
         </div>
      )}

      {/* AI Assistant Callout */}
      <div className="mt-8 bg-accent/10 border border-accent/20 rounded-xl p-6 flex items-start gap-4">
         <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-accent" />
         </div>
         <div>
            <h3 className="font-bold text-accent text-lg mb-2">BeastBuck Meeting AI is active</h3>
            <p className="text-sm text-text-muted mb-4">
               The AI automatically joins scheduled meetings to generate summaries, extract decisions, and assign action items. Outputs are stored securely in your workspace.
            </p>
            <div className="flex gap-3">
               <span className="text-xs font-bold text-accent bg-accent/20 px-2 py-1 rounded">Transcripts</span>
               <span className="text-xs font-bold text-accent bg-accent/20 px-2 py-1 rounded">Decisions</span>
               <span className="text-xs font-bold text-accent bg-accent/20 px-2 py-1 rounded">Action Items</span>
            </div>
         </div>
      </div>
    </PageContainer>
  );
}
