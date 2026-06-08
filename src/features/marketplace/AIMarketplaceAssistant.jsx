import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, TrendingUp, Search, Tag, DollarSign, BarChart3 } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { useAuth } from '../auth/AuthContext';

export default function AIMarketplaceAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Welcome to the Marketplace AI Assistant! I can help you optimize your listings, generate SEO tags, analyze pricing strategies, or discover the perfect templates and services. What would you like to do?',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickTools = [
    { label: 'Optimize Title', icon: Tag, prompt: 'Can you help me generate an SEO-optimized title for my new web template?' },
    { label: 'Pricing Strategy', icon: DollarSign, prompt: 'What is a good pricing strategy for a 1-hour consulting service?' },
    { label: 'Market Demand', icon: TrendingUp, prompt: 'Analyze current market demand for AI-related templates.' },
    { label: 'Find a Creator', icon: Search, prompt: 'Recommend some top creators in the Design category.' },
    { label: 'Competitor Analysis', icon: BarChart3, prompt: 'How can I make my SaaS boilerplate stand out from competitors?' },
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
        content: "That's a great question. Based on current BeastBuck marketplace trends, I would recommend optimizing your listing by highlighting the specific value it brings to early-stage founders. Would you like me to generate some specific SEO tags for it?",
        timestamp: new Date().toISOString()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Marketplace AI Assistant"
        description="Your intelligent co-pilot for optimizing listings, analyzing trends, and growing your creator business."
      />
      
      <div className="grid h-[70vh] gap-6 lg:grid-cols-4">
        {/* Sidebar Tools */}
        <div className="hidden flex-col gap-4 lg:flex">
          <div className="rounded-xl border border-border bg-surface/40 p-5">
            <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-wider text-white">Quick Tools</h3>
            <div className="flex flex-col gap-2">
              {quickTools.map(tool => (
                <button
                  key={tool.label}
                  onClick={() => handleSend(tool.prompt)}
                  disabled={isTyping}
                  className="flex items-center gap-3 rounded-lg border border-border bg-white/5 p-3 text-left transition-all hover:border-accent/50 hover:bg-white/10 disabled:opacity-50"
                >
                  <tool.icon className="h-4 w-4 text-accent" />
                  <span className="text-sm font-bold text-white">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
            <h3 className="mb-2 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-accent">
              <Sparkles className="h-4 w-4" /> Pro Tip
            </h3>
            <p className="text-xs leading-relaxed text-text-soft">
              Paste your listing description here and ask me to optimize it for better search visibility and higher conversion rates!
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
                  
                  <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? "bg-white text-black" : msg.error ? "border border-red-500/30 bg-red-500/10 text-red-200" : "border border-border bg-surface text-white"}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
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
              <div ref={endRef} />
            </div>
          </div>
          
          <div className="border-t border-border bg-surface/80 p-4 backdrop-blur-md">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me to optimize a title, suggest tags, or analyze pricing..."
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
