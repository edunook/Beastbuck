import { useState } from 'react';
import { Bot, Send, Sparkles, History, Search, FileText, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AIService } from '../../services/ai/aiService';

const quickTools = [
  { id: 'historic', label: 'Identify Historic Contributions', icon: History, color: 'text-purple-400' },
  { id: 'hof', label: 'Recommend Hall of Fame Candidates', icon: Search, color: 'text-yellow-400' },
  { id: 'report', label: 'Generate Legacy Report', icon: FileText, color: 'text-blue-400' }
];

export default function AILegacyAdvisor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Greetings. I am the AI Legacy Advisor. I am here to help you preserve knowledge, analyze long-term impact, and curate the history of BeastBuck. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (text) => {
    if (!text.trim() || isLoading) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await AIService.chat(text, 'legacy');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response 
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I encountered an error accessing the historical archives. Please try again later.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-neutral-800/60 bg-neutral-900/30 p-6 flex flex-col backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/20">
            <Bot className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white">Legacy Advisor</h2>
            <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase">AI Assistant V3</p>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <div>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Quick Tools</h3>
            <div className="space-y-2">
              {quickTools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => handleSend(tool.label)}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl bg-black/40 border border-neutral-800/50 hover:bg-neutral-800/80 hover:border-neutral-700 transition-all group text-left"
                >
                  <tool.icon className={cn("w-5 h-5", tool.color)} />
                  <span className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">
                    {tool.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative max-h-screen overflow-hidden">
        {/* Chat Header */}
        <div className="h-16 border-b border-neutral-800/60 bg-black/50 backdrop-blur-md flex items-center px-8 z-10">
          <div className="flex items-center space-x-2 text-sm text-neutral-400">
             <Sparkles className="w-4 h-4 text-purple-400" />
             <span>Context: <strong>Global Legacy & Impact Analysis</strong></span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn(
              "max-w-3xl flex",
              msg.role === 'user' ? "ml-auto" : "mr-auto"
            )}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mr-4 shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}
              <div className={cn(
                "p-5 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-black via-black to-transparent pt-10">
          <div className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(input)}
              placeholder="Ask the Legacy Advisor..."
              className="w-full bg-neutral-900/80 border border-neutral-700/50 text-white rounded-2xl py-4 pl-6 pr-16 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-xl shadow-2xl transition-all placeholder:text-neutral-500"
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center transition-colors"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-xs text-neutral-600 mt-4">
            AI Legacy Advisor can make mistakes. Verify important historical facts.
          </p>
        </div>
      </div>
    </div>
  );
}
