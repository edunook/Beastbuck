import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Sparkles, Copy, RotateCcw, Bot, Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { geminiProvider } from '@frontend/services/ai/providers/gemini';

function SafeAvatar({ ai }) {
  if (!ai) return <Bot className="w-5 h-5 text-accent" />;
  if (ai.avatarUrl) {
    return <img src={ai.avatarUrl} alt={ai.name} className="w-full h-full object-cover rounded-xl" />;
  }
  if (ai.avatar && ai.avatar.length <= 4) {
    return <span className="text-xl">{ai.avatar}</span>;
  }
  return <Bot className="w-5 h-5 text-accent" />;
}

export default function AIChatPage() {
  const { aiId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  // Load AI from Firestore
  useEffect(() => {
    if (!aiId) {
      setError('No AI ID provided.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'custom_ais', aiId));
        if (!snap.exists()) {
          setError('This custom AI could not be found. It may have been deleted.');
          setLoading(false);
          return;
        }
        const data = { id: snap.id, ...snap.data() };
        setAiData(data);
        // Add a greeting message from the AI
        const greeting = data.greeting ||
          `Hi! I'm **${data.name}**. ${data.description ? data.description + ' ' : ''}How can I help you today?`;
        setMessages([{ role: 'ai', text: greeting, id: Date.now() }]);
      } catch (err) {
        console.error('Failed to load AI:', err);
        setError('Failed to load AI data. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [aiId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !aiData) return;

    const userMsg = { role: 'user', text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // Build conversation history for Gemini
    const history = messages
      .filter(m => m.role !== 'ai' || messages.indexOf(m) > 0) // skip greeting
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
    history.push({ role: 'user', content: text });

    try {
      const reply = await geminiProvider.chat({
        messages: history,
        systemPrompt: aiData.systemPrompt || `You are ${aiData.name}. ${aiData.description || ''}`,
      });
      setMessages(prev => [...prev, { role: 'ai', text: reply, id: Date.now() + 1 }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `⚠️ Sorry, I ran into an issue: ${err.message || 'Unknown error'}. Please try again.`,
        id: Date.now() + 1,
        isError: true,
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#0d1117] items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-text-muted text-sm">Loading your AI assistant...</p>
      </div>
    );
  }

  // Error state
  if (error || !aiData) {
    return (
      <div className="flex flex-col h-screen bg-[#0d1117] items-center justify-center gap-4 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h2 className="text-white font-bold text-lg">AI Not Found</h2>
        <p className="text-text-muted text-sm max-w-sm">{error || 'Something went wrong loading this AI.'}</p>
        <button
          onClick={() => navigate('/ai-studio')}
          className="mt-4 bg-accent text-black font-bold px-6 py-2.5 rounded-xl hover:bg-accent/80 transition"
        >
          Back to My AIs
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
        <button
          onClick={() => navigate('/ai-studio')}
          className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition"
          title="Back to My AIs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-accent/20 border border-border flex items-center justify-center overflow-hidden shrink-0">
          <SafeAvatar ai={aiData} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-white text-sm truncate">{aiData.name}</h2>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {aiData.personality || 'AI Assistant'} · {aiData.model || 'Gemini'}
          </p>
        </div>

        {aiData.category && (
          <span className="hidden sm:inline-flex bg-accent/10 text-accent text-[10px] font-bold px-2.5 py-1 rounded-full border border-accent/20">
            {aiData.category}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 rounded-lg bg-accent/20 border border-border flex items-center justify-center overflow-hidden shrink-0 mt-1">
                    <SafeAvatar ai={aiData} />
                  </div>
                )}
                <div>
                  <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent text-black font-medium rounded-tr-md'
                      : msg.isError
                        ? 'bg-red-500/10 text-red-300 rounded-tl-md border border-red-500/20'
                        : 'bg-white/[0.06] text-white rounded-tl-md border border-border/50'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === 'ai' && !msg.isError && (
                    <div className="flex gap-2 mt-2 ml-1">
                      <button
                        onClick={() => copyMessage(msg.text)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Sending indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-border flex items-center justify-center shrink-0 mt-1">
                  <SafeAvatar ai={aiData} />
                </div>
                <div className="bg-white/[0.06] text-white rounded-2xl rounded-tl-md border border-border/50 px-5 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-sm text-text-muted">{aiData.name} is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Message ${aiData.name}...`}
            disabled={sending}
            className="flex-1 bg-surface border border-border rounded-xl px-5 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-accent transition disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-accent text-black p-3 rounded-xl hover:bg-accent/80 transition shadow-[0_0_12px_rgba(208,255,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-text-muted mt-2 max-w-3xl mx-auto">
          {aiData.name} uses your custom system prompt — responses are AI-generated.
        </p>
      </div>
    </div>
  );
}
