import { useState } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Sparkles, Send, Lightbulb, Film, LayoutTemplate, MessageSquare } from 'lucide-react';

export default function AIFunFlixAssistant() {
  const [messages] = useState([
    { role: 'ai', text: 'Hi! I am your AI Director. I can help you generate funny script ideas, catchy titles, challenge ideas, and YouTube-style thumbnails. What are we creating today?' }
  ]);

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row gap-6 h-[80vh]">
        {/* Quick Tools */}
        <div className="w-full md:w-64 lg:w-72 flex flex-col gap-2">
          <div className="bg-surface/40 border border-border rounded-xl p-4 mb-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-accent" /> AI Tools</h3>
            <div className="space-y-2">
              {[
                { icon: Lightbulb, label: 'Comedy Ideas' },
                { icon: MessageSquare, label: 'Catchy Titles' },
                { icon: LayoutTemplate, label: 'Thumbnail Ideas' },
                { icon: Film, label: 'Script Assistant' }
              ].map((tool, i) => (
                <button key={i} className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors text-left">
                  <tool.icon className="w-4 h-4 text-accent" /> {tool.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 bg-surface/40 border border-border rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/50 bg-surface/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-bold text-white">AI Director</h2>
              <p className="text-xs text-emerald-400">Online</p>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] rounded-xl p-4 text-sm ${msg.role === 'ai' ? 'bg-white/10 text-white rounded-tl-none' : 'bg-accent text-black font-medium rounded-tr-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border/50 bg-surface/80">
            <div className="flex gap-2">
              <input type="text" placeholder="E.g., Give me 5 funny titles for a video about CSS..." className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
              <button className="bg-accent text-black p-2 rounded-lg hover:bg-accent/80 transition-colors">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
