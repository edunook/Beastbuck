import { useState } from 'react';
import { Bot, Send, User, Sparkles, BarChart2, ShieldAlert } from 'lucide-react';
import { AIService } from '../../services/ai/aiService';

const AIExecutiveAdvisor = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Greetings, Executive. I am your Strategic AI Advisor. How may I assist you with ecosystem telemetry today?'
    }
  ]);

  const quickTools = [
    { label: "Summarize Performance", icon: BarChart2, color: "text-blue-400" },
    { label: "Predict Growth", icon: Sparkles, color: "text-purple-400" },
    { label: "Analyze Risks", icon: ShieldAlert, color: "text-red-400" },
  ];

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      // Create message array for API format
      const apiMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));
      
      const response = await AIService.chat({ 
        mode: 'project', // Executive/Strategic context fits well under Project mode
        messages: apiMessages 
      });
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response 
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I am experiencing a systems malfunction. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
          AI Executive Advisor
        </h1>
        <p className="text-muted-foreground mt-2">Strategic insights & decision support.</p>
      </div>

      <div className="flex-1 bg-surface/40 border border-white/10 rounded-xl backdrop-blur-md flex flex-col overflow-hidden relative">
        
        {/* Quick Tools Header */}
        <div className="p-4 border-b border-white/10 bg-white/5 flex gap-3 overflow-x-auto">
          {quickTools.map((tool, idx) => (
            <button 
              key={idx}
              onClick={() => setInput(tool.label)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap text-sm"
            >
              <tool.icon className={`w-4 h-4 ${tool.color}`} />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'assistant' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'assistant' 
                  ? 'bg-white/5 border border-white/10 rounded-tl-none' 
                  : 'bg-blue-500/20 border border-blue-500/30 rounded-tr-none'
              }`}>
                <p className="text-sm md:text-base leading-relaxed text-gray-200">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black/20 border-t border-white/10">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about ecosystem performance, risks, or predictions..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-14 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-colors"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIExecutiveAdvisor;
