import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Sparkles, Copy, Bot, Loader2, AlertCircle, Check } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { geminiProvider } from '@frontend/services/ai/providers/gemini';
import { groqProvider } from '@frontend/services/ai/providers/groq';
import { openrouterProvider } from '@frontend/services/ai/providers/openrouter';

// Try providers in order: Gemini → Groq → OpenRouter
async function smartChat({ messages, systemPrompt }) {
  const providers = [geminiProvider, groqProvider, openrouterProvider].filter(p => p.configured);
  if (providers.length === 0) throw new Error('No AI provider configured.');
  let lastError;
  for (const provider of providers) {
    try {
      return await provider.chat({ messages, systemPrompt });
    } catch (err) {
      console.warn(`[${provider.name}] failed:`, err.message);
      lastError = err;
    }
  }
  throw lastError || new Error('All AI providers failed.');
}

// Lightweight markdown renderer — handles bold, italic, code, headers, lists
function MarkdownText({ text }) {
  if (!text) return null;

  const renderInline = (str) => {
    // Bold **text** or __text__
    // Italic *text* or _text_
    // Inline code `code`
    const parts = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
    let last = 0;
    let m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index > last) parts.push(<span key={last}>{str.slice(last, m.index)}</span>);
      const raw = m[0];
      if (raw.startsWith('`')) {
        parts.push(<code key={m.index} className="bg-white/10 text-accent font-mono text-[0.8em] px-1.5 py-0.5 rounded">{raw.slice(1, -1)}</code>);
      } else if (raw.startsWith('**') || raw.startsWith('__')) {
        parts.push(<strong key={m.index} className="font-semibold text-white">{raw.slice(2, -2)}</strong>);
      } else {
        parts.push(<em key={m.index} className="italic text-white/80">{raw.slice(1, -1)}</em>);
      }
      last = m.index + raw.length;
    }
    if (last < str.length) parts.push(<span key={last}>{str.slice(last)}</span>);
    return parts;
  };

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines (add spacing via margin on prev element)
    if (line.trim() === '') { elements.push(<div key={i} className="h-2" />); i++; continue; }

    // H1 # heading
    if (/^# (.+)/.test(line)) {
      elements.push(<h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{renderInline(line.replace(/^# /, ''))}</h3>);
      i++; continue;
    }
    // H2 ## heading
    if (/^## (.+)/.test(line)) {
      elements.push(<h4 key={i} className="text-sm font-bold text-white/90 mt-2 mb-1">{renderInline(line.replace(/^## /, ''))}</h4>);
      i++; continue;
    }
    // H3 ### heading
    if (/^### (.+)/.test(line)) {
      elements.push(<h5 key={i} className="text-sm font-semibold text-white/80 mt-2 mb-0.5">{renderInline(line.replace(/^### /, ''))}</h5>);
      i++; continue;
    }

    // Code block ```
    if (line.trim().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-black/40 border border-border/50 rounded-lg px-4 py-3 my-2 overflow-x-auto">
          <code className="text-[0.78em] text-accent/90 font-mono">{codeLines.join('\n')}</code>
        </pre>
      );
      i++; continue;
    }

    // Bullet list - or *
    if (/^[-*] (.+)/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] (.+)/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      elements.push(
        <ul key={i} className="list-none space-y-1 my-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-white/85">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list 1. 2. etc
    if (/^\d+\. (.+)/.test(line)) {
      const items = [];
      let num = 1;
      while (i < lines.length && /^\d+\. (.+)/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={i} className="space-y-1 my-1.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-white/85">
              <span className="shrink-0 text-accent font-bold text-xs mt-0.5 w-5">{idx + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule ---
    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-border/40 my-2" />);
      i++; continue;
    }

    // Normal paragraph
    elements.push(<p key={i} className="text-sm text-white/85 leading-relaxed">{renderInline(line)}</p>);
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function SafeAvatar({ ai }) {
  if (!ai) return <Bot className="w-5 h-5 text-accent" />;
  if (ai.avatarUrl) return <img src={ai.avatarUrl} alt={ai.name} className="w-full h-full object-cover rounded-xl" />;
  if (ai.avatar && ai.avatar.length <= 4) return <span className="text-xl">{ai.avatar}</span>;
  return <Bot className="w-5 h-5 text-accent" />;
}

// Concise suffix added to every system prompt so responses are short and well-structured
const CONCISE_SUFFIX = `

RESPONSE STYLE RULES (always follow these):
- Keep responses SHORT and focused — 2 to 5 sentences max for simple questions.
- Use bullet points for lists, steps, or comparisons.
- Use **bold** for key terms only.
- Never pad with filler phrases like "Certainly!", "Great question!", or lengthy disclaimers.
- Get straight to the point.`;

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
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (!aiId) { setError('No AI ID provided.'); setLoading(false); return; }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'custom_ais', aiId));
        if (!snap.exists()) { setError('This AI could not be found. It may have been deleted.'); setLoading(false); return; }
        const data = { id: snap.id, ...snap.data() };
        setAiData(data);
        const greeting = data.greeting || `Hi! I'm **${data.name}**. ${data.description ? data.description + ' ' : ''}How can I help you?`;
        setMessages([{ role: 'ai', text: greeting, id: Date.now() }]);
      } catch (err) {
        setError('Failed to load AI. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [aiId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending || !aiData) return;

    setMessages(prev => [...prev, { role: 'user', text, id: Date.now() }]);
    setInput('');
    setSending(true);

    // Only pass last 6 exchanges to keep context tight and tokens low
    const recent = messages.slice(-6);
    const history = recent
      .filter((m, idx) => !(m.role === 'ai' && idx === 0))
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
    history.push({ role: 'user', content: text });

    const systemPrompt = (aiData.systemPrompt || `You are ${aiData.name}. ${aiData.description || ''}`) + CONCISE_SUFFIX;

    try {
      const reply = await smartChat({ messages: history, systemPrompt });
      setMessages(prev => [...prev, { role: 'ai', text: reply, id: Date.now() + 1 }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `⚠️ ${err.message || 'Something went wrong. Please try again.'}`,
        id: Date.now() + 1,
        isError: true,
      }]);
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const copyMessage = async (text, id) => {
    try { await navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); } catch {}
  };

  if (loading) return (
    <div className="flex h-screen bg-[#0d1117] items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-accent animate-spin" />
      <p className="text-text-muted text-sm">Loading AI assistant...</p>
    </div>
  );

  if (error || !aiData) return (
    <div className="flex h-screen bg-[#0d1117] items-center justify-center flex-col gap-4 px-6 text-center">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <h2 className="text-white font-bold text-lg">AI Not Found</h2>
      <p className="text-text-muted text-sm max-w-sm">{error}</p>
      <button onClick={() => navigate('/ai-studio')} className="mt-2 bg-accent text-black font-bold px-6 py-2.5 rounded-xl hover:bg-accent/80 transition">Back to My AIs</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-border bg-surface/80 backdrop-blur-sm shrink-0">
        <button onClick={() => navigate('/ai-studio')} className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition">
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
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex gap-2.5'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-accent/20 border border-border flex items-center justify-center overflow-hidden shrink-0 mt-1">
                    <SafeAvatar ai={aiData} />
                  </div>
                )}
                <div>
                  {msg.role === 'user' ? (
                    <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 bg-accent text-black text-sm font-medium leading-relaxed">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed ${
                      msg.isError
                        ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                        : 'bg-white/[0.05] border border-border/40'
                    }`}>
                      <MarkdownText text={msg.text} />
                    </div>
                  )}

                  {msg.role === 'ai' && !msg.isError && (
                    <button
                      onClick={() => copyMessage(msg.text, msg.id)}
                      className="mt-1.5 ml-1 p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition flex items-center gap-1 text-[10px]"
                      title="Copy"
                    >
                      {copied === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied === msg.id ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-accent/20 border border-border flex items-center justify-center shrink-0 mt-1">
                  <SafeAvatar ai={aiData} />
                </div>
                <div className="bg-white/[0.05] border border-border/40 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-surface/80 backdrop-blur-sm px-4 sm:px-8 py-3.5">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Message ${aiData.name}...`}
            disabled={sending}
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent transition disabled:opacity-60"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-accent text-black p-2.5 rounded-xl hover:bg-accent/80 transition shadow-[0_0_12px_rgba(208,255,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
