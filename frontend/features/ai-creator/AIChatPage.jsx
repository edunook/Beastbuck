import { useState } from 'react';
import { Send, Sparkles, ThumbsUp, ThumbsDown, Copy, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function AIChatPage() {
  useParams();
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your Physics tutor. 🔬 Ask me anything about mechanics, thermodynamics, or quantum physics! I'll explain things with real-world analogies and step-by-step breakdowns." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "That's a fantastic question! Let me break it down for you step by step..." }]);
    }, 800);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl border border-border">⚛️</div>
          <div>
            <h2 className="font-bold text-white text-sm">Physics Guru</h2>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Online · Gemini Pro</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-sm shrink-0 mt-1 border border-border">⚛️</div>
                )}
                <div>
                  <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-black font-medium rounded-tr-md' : 'bg-white/[0.06] text-white rounded-tl-md border border-border/50'}`}>
                    {msg.text}
                  </div>
                  {msg.role === 'ai' && (
                    <div className="flex gap-2 mt-2 ml-1">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition"><ThumbsUp className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition"><ThumbsDown className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition"><Copy className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition"><RotateCcw className="w-3.5 h-3.5" /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Starter Questions */}
      {messages.length === 1 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-8 pb-2 w-full">
          <div className="flex flex-wrap gap-2 justify-center">
            {['Explain quantum entanglement', 'What is E=mc²?', 'Help me with momentum'].map((q, i) => (
              <button key={i} onClick={() => { setInput(q); }} className="bg-white/5 hover:bg-accent/10 border border-border hover:border-accent/30 rounded-full px-4 py-2 text-xs font-bold text-white transition">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Physics Guru anything..."
            className="flex-1 bg-surface border border-border rounded-xl px-5 py-3 text-white focus:outline-none focus:border-accent transition"
          />
          <button onClick={handleSend} className="bg-accent text-black p-3 rounded-xl hover:bg-accent/80 transition shadow-[0_0_12px_rgba(208,255,0,0.15)]">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
