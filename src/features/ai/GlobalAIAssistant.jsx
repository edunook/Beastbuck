import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minus, MessageSquare, Trash2, PlusCircle } from 'lucide-react';
import { useAI } from './AIProvider';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

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

  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isMinimized]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-accent text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] transition hover:scale-110"
        onClick={toggleMinimize}
      >
        <Bot className="h-6 w-6" />
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-[90] flex h-[600px] max-h-[80vh] w-[400px] max-w-[calc(100vw-3rem)] flex-col border-accent/20 bg-background/95 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 p-4">
        <CardTitle className="flex items-center gap-2 text-sm text-white">
          <Bot className="h-5 w-5 text-accent" />
          BeastBuck AI <span className="text-xs text-text-muted">({mode})</span>
        </CardTitle>
        <div className="flex items-center gap-1 text-text-muted">
          <button onClick={() => setShowHistory(!showHistory)} className="p-1.5 hover:bg-white/10 hover:text-white rounded-md transition" title="Chat History">
            <MessageSquare className="h-4 w-4" />
          </button>
          <button onClick={toggleMinimize} className="p-1.5 hover:bg-white/10 hover:text-white rounded-md transition" title="Minimize">
            <Minus className="h-4 w-4" />
          </button>
          <button onClick={closeAssistant} className="p-1.5 hover:bg-white/10 hover:text-white rounded-md transition" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      {/* BODY */}
      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white">Chat History</h3>
              <Button variant="ghost" size="sm" onClick={() => { createNewSession(); setShowHistory(false); }} className="text-accent hover:text-accent/80 hover:bg-accent/10 px-2 py-1 h-auto text-xs">
                <PlusCircle className="mr-1 h-3 w-3" /> New
              </Button>
            </div>
            {sessions.map(s => (
              <div key={s.id} className={`flex items-center justify-between rounded-lg p-3 text-sm transition ${activeSessionId === s.id ? 'bg-accent/20 text-white border border-accent/30' : 'bg-white/5 text-text-soft hover:bg-white/10 cursor-pointer'}`} onClick={() => { setActiveSessionId(s.id); setShowHistory(false); }}>
                <span className="truncate flex-1">{s.title || 'Conversation'}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }} className="ml-2 p-1 text-text-muted hover:text-status-danger rounded">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-xs text-text-muted text-center mt-8">No past conversations.</p>}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
                  <Bot className="mb-4 h-12 w-12 text-accent" />
                  <p className="text-sm text-white">How can I help you today?</p>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-accent text-black rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white/10 px-4 py-2 text-sm text-white flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* INPUT */}
            <div className="border-t border-white/10 p-3 bg-white/5">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  placeholder="Ask BeastBuck AI..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="flex-1 rounded-full border border-white/10 bg-black/50 px-4 py-2 pr-10 text-sm text-white outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-black disabled:opacity-50 transition hover:bg-accent/90"
                >
                  <Send className="h-3 w-3 ml-0.5" />
                </button>
              </form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
