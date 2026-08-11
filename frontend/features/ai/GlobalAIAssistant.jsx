import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minus, MessageSquare, Trash2, PlusCircle, Sparkles, Brain, Lightbulb, Target, Rocket } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAI } from './AIProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

const QUICK_PROMPTS = [
  { icon: Lightbulb, label: 'Get Ideas', prompt: 'Give me creative ideas for my next project' },
  { icon: Target, label: 'My Tasks', prompt: 'What are my pending tasks and priorities?' },
  { icon: Rocket, label: 'Learn Skills', prompt: 'Suggest skills I should learn based on my interests' },
  { icon: Brain, label: 'Help Me', prompt: 'I need help with something specific' },
];

export default function GlobalAIAssistant() {
  const {
    isMinimized,
    toggleMinimize,
    closeAssistant,
    mode,
    messages,
    sendMessage,
    loading,
    sessions,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession
  } = useAI();
  const location = useLocation();

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMinimized]);

  // Hide AI assistant entirely on chat page to avoid overlapping with chat input.
  // This must remain after hooks to preserve hook order on route changes.
  if (location.pathname.startsWith('/chat')) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
    setShowQuickPrompts(false);
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
    setShowQuickPrompts(false);
  };

  if (isMinimized) {
    return (
      <div 
        className="group fixed bottom-[6rem] right-4 md:bottom-6 md:right-6 z-[1000] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-accent to-cyan-500 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] active:scale-95"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMinimize();
        }}
        aria-label="Open AI Assistant"
      >
        <Bot className="h-6 w-6 animate-pulse" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
      </div>
    );
  }

  return (
    <Card className="group fixed bottom-[6rem] right-4 md:bottom-6 md:right-6 z-[1001] flex h-[600px] md:h-[650px] max-h-[80vh] md:max-h-[85vh] w-[calc(100vw-2rem)] md:w-[420px] flex-col border-accent/30 bg-gradient-to-br from-background/95 via-background/90 to-background/95 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300">
      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 p-4 bg-gradient-to-r from-accent/10 via-purple-500/10 to-cyan-500/10">
        <CardTitle className="flex items-center gap-3 text-white">
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center border border-accent/30 shadow-lg shadow-accent/30">
            <Bot className="h-5 w-5 text-accent animate-pulse" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent/0 to-purple-500/0 opacity-0 group-hover:from-accent/10 group-hover:to-purple-500/10 transition-all duration-300" />
          </div>
          <div>
            <div className="text-base font-black">BeastBuck AI</div>
            <div className="text-xs font-bold text-accent uppercase tracking-wider">{mode} Mode</div>
          </div>
        </CardTitle>
        <div className="flex items-center gap-1 text-text-muted">
          <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200 hover:scale-110" title="Chat History">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button onClick={toggleMinimize} className="p-2 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200 hover:scale-110" title="Minimize">
            <Minus className="h-4 w-4" />
          </button>
          <button onClick={closeAssistant} className="p-2 hover:bg-white/10 hover:text-white rounded-lg transition-all duration-200 hover:scale-110" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      {/* BODY */}
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                Chat History
              </h3>
              <Button variant="ghost" size="sm" onClick={() => { createNewSession(); setShowHistory(false); }} className="text-accent hover:text-accent/80 hover:bg-accent/10 px-3 py-1.5 h-auto text-xs font-bold">
                <PlusCircle className="mr-1 h-3 w-3" /> New Chat
              </Button>
            </div>
            {sessions.map(s => (
              <div key={s.id} className={`group flex items-center justify-between rounded-xl p-3 text-sm transition-all duration-200 ${activeSessionId === s.id ? 'bg-accent/20 text-white border border-accent/30 shadow-lg shadow-accent/20' : 'bg-white/5 text-text-soft hover:bg-white/10 cursor-pointer hover:border-accent/30 border border-transparent'}`} onClick={() => { setActiveSessionId(s.id); setShowHistory(false); }}>
                <span className="truncate flex-1">{s.title || 'Conversation'}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }} className="ml-2 p-1.5 text-text-muted hover:text-status-danger rounded-lg hover:bg-white/10 transition-all duration-200 opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto mb-3 h-10 w-10 text-text-muted" />
                <p className="text-sm text-text-muted">No past conversations.</p>
                <p className="text-xs text-text-muted mt-1">Start a new chat to begin!</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/30 via-purple-500/30 to-cyan-500/30 blur-2xl animate-pulse" />
                    <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center border border-accent/30 shadow-lg shadow-accent/30">
                      <Bot className="h-8 w-8 text-accent animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-white mb-2">Welcome to BeastBuck AI 🚀</h3>
                  <p className="text-sm text-text-muted mb-6 max-w-[280px]">Your intelligent assistant for projects, experiments, tasks, and creative ideas. I'm here to help you succeed!</p>
                  
                  {showQuickPrompts && (
                    <div className="grid grid-cols-2 gap-2 w-full max-w-[320px]">
                      {QUICK_PROMPTS.map((qp, index) => {
                        const Icon = qp.icon;
                        return (
                          <button
                            key={index}
                            onClick={() => handleQuickPrompt(qp.prompt)}
                            className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-accent/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
                            style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
                          >
                            <div className="relative h-8 w-8 rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center border border-accent/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30">
                              <Icon className="h-4 w-4 text-accent" />
                            </div>
                            <span className="text-xs font-bold text-text-muted group-hover:text-white transition-colors">{qp.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`} style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'user' ? 'bg-gradient-to-r from-accent to-cyan-500 text-black rounded-tr-sm shadow-lg shadow-accent/20 font-medium' : 'bg-white/10 text-white rounded-tl-sm border border-white/10'}`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm text-white flex items-center gap-3 border border-white/10">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-text-muted">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-white/10 p-4 bg-gradient-to-r from-white/5 to-transparent">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                </div>
                <input
                  type="text"
                  placeholder="Ask me anything about BeastBuck... 💡"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 rounded-full border border-white/10 bg-black/50 pl-10 pr-12 py-3 text-sm text-white outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/30 transition-all duration-300 placeholder:text-text-muted/70"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-1 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-accent to-cyan-500 text-black disabled:opacity-50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-accent/30 active:scale-95"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
              <div className="text-center mt-2">
                <button 
                  onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                  className="text-xs text-text-muted hover:text-accent transition-colors font-medium"
                >
                  {showQuickPrompts ? 'Hide' : 'Show'} quick prompts
                </button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out both;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out both;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  );
}
