import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Sparkles, BarChart, Target, Users, BookOpen, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function AIVentureAssistant() {
  const [messages] = useState([
    { role: 'ai', content: "Hello! I'm your AI Venture Assistant. I can help you draft business plans, run SWOT analyses, structure pitch decks, or suggest hiring strategies. What would you like to work on today?" }
  ]);

  const suggestions = [
    { label: 'Generate SWOT Analysis', icon: BarChart },
    { label: 'Draft Pitch Deck', icon: BookOpen },
    { label: 'Analyze Competitors', icon: Target },
    { label: 'Hiring Recommendations', icon: Users }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="AI Venture Assistant"
        description="Your dedicated AI advisor for startup growth and business strategy."
      />
      
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-16rem)]">
         {/* Sidebar Actions */}
         <div className="w-full lg:w-64 space-y-4 shrink-0">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Tools</h3>
            {suggestions.map(s => (
               <button key={s.label} className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left group">
                  <s.icon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-white font-medium">{s.label}</span>
               </button>
            ))}
         </div>

         {/* Chat Interface */}
         <Card className="flex-1 bg-surface/50 border-border flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 bg-purple-500/5 pointer-events-none"></div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 custom-scrollbar">
               {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-purple-500/20 text-purple-400' : 'bg-accent/20 text-accent'}`}>
                        {msg.role === 'ai' ? <Sparkles className="w-5 h-5" /> : 'U'}
                     </div>
                     <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'ai' ? 'bg-black/40 border border-purple-500/30 text-white/90' : 'bg-accent/20 border border-accent/30 text-white'}`}>
                        {msg.content}
                     </div>
                  </div>
               ))}
            </div>

            <div className="p-4 border-t border-border/50 bg-surface relative z-10">
               <div className="relative">
                  <input 
                     type="text" 
                     placeholder="Ask for strategic advice, market research, or business models..." 
                     className="w-full bg-black/40 border border-border rounded-xl pl-4 pr-12 py-4 text-white outline-none focus:border-purple-500"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                     <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </Card>
      </div>
    </PageContainer>
  );
}
