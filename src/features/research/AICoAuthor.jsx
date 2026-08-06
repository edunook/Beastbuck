import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Bot, Sparkles, Send } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Input } from '../../components/ui/Input';

export default function AICoAuthor() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your AI Co-Author. I can help you with:\n\n• Improve writing quality\n• Fix grammar and spelling\n• Suggest new ideas\n• Generate references\n• Create charts and diagrams\n• Improve methodology\n• Detect plagiarism\n• Explain missing sections\n\nHow can I help you with your research today?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { label: 'Improve Writing', prompt: 'Please improve the writing quality of my research' },
    { label: 'Fix Grammar', prompt: 'Check and fix any grammar issues' },
    { label: 'Suggest Ideas', prompt: 'Suggest some new ideas for my research' },
    { label: 'Generate References', prompt: 'Generate relevant references for my topic' },
    { label: 'Improve Methodology', prompt: 'Help me improve my research methodology' },
    { label: 'Check Plagiarism', prompt: 'Check my research for potential plagiarism' },
  ];

  const handleSend = async (text = input) => {
    if (!text.trim() || isTyping) return;
    
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I've analyzed your request. Here are my suggestions:\n\n1. Structure: Consider reorganizing your methodology section for better flow.\n2. Clarity: Some technical terms could benefit from simpler explanations.\n3. References: I found 5 relevant papers that could strengthen your argument.\n\nWould you like me to elaborate on any of these points?",
        timestamp: new Date().toISOString()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Co-Author" 
        description="Your intelligent research assistant for writing and editing."
        hero={true}
      />

      <div className="grid h-[70vh] gap-6 lg:grid-cols-4">
        {/* Sidebar Actions */}
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.prompt)}
                  disabled={isTyping}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white/5 p-3 text-left transition-all hover:border-accent/50 hover:bg-white/10 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-accent" />
                  <span className="text-sm font-bold text-white">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-accent">
              <Bot className="h-4 w-4" />
              AI Capabilities
            </h3>
            <p className="text-xs leading-relaxed text-text-soft">
              Your AI Co-Author can help with writing, grammar, ideas, references, methodology, and plagiarism detection.
            </p>
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface/40 lg:col-span-3">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex flex-col gap-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex max-w-[85%] gap-4 ${msg.role === 'user' ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-lg ${msg.role === 'user' ? "bg-white text-black" : "bg-gradient-to-br from-purple-500 to-accent text-white"}`}>
                    {msg.role === 'user' ? user?.displayName?.charAt(0) || 'U' : <Bot className="h-4 w-4" />}
                  </div>
                  
                  <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? "bg-white text-black" : msg.error ? "border border-red-500/30 bg-red-500/10 text-red-200" : "border border-border bg-surface text-white"}`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex max-w-[85%] gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-accent text-white shadow-lg">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-5 py-4">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-accent"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-border bg-surface/80 p-4 backdrop-blur-md">
            <div className="relative flex items-center">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for writing help, grammar check, or research suggestions..."
                className="w-full rounded-full border border-border bg-background py-3 pl-4 pr-12 text-sm text-white placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-black transition-transform hover:scale-105 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
