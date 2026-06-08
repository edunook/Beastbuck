import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Trophy, Clock, Users } from 'lucide-react';

const CHALLENGES = [
  { title: 'The Office Skit Challenge', reward: '1,000 Credits', participants: 45, ends: '2 days' },
  { title: 'Bad Pitch Deck Parody', reward: '500 Credits', participants: 12, ends: '5 days' },
  { title: 'Remote Work Realities', reward: 'Special Badge', participants: 89, ends: '12 days' },
];

export default function FunFlixChallenges() {
  return (
    <PageContainer>
      <PageHeader title="FunFlix Challenges" description="Compete in community challenges, earn credits, and win legendary badges." />
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CHALLENGES.map((challenge, i) => (
          <div key={i} className="group rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm hover:border-accent/50 transition relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-accent text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg">Active</div>
            <Trophy className="w-10 h-10 text-yellow-400 mb-4" />
            <h3 className="font-bold text-white text-lg mb-2">{challenge.title}</h3>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs border-b border-border/50 pb-1">
                <span className="text-text-muted flex items-center gap-1"><Users className="w-3 h-3"/> Participants</span>
                <span className="text-white font-bold">{challenge.participants}</span>
              </div>
              <div className="flex justify-between text-xs border-b border-border/50 pb-1">
                <span className="text-text-muted flex items-center gap-1"><Clock className="w-3 h-3"/> Ends In</span>
                <span className="text-white font-bold">{challenge.ends}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1"><Trophy className="w-3 h-3"/> Reward</span>
                <span className="text-yellow-400 font-bold">{challenge.reward}</span>
              </div>
            </div>

            <button className="w-full bg-white/10 hover:bg-accent hover:text-black text-white text-sm font-bold py-2 rounded-lg transition-colors">
              Submit Entry
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
