import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Sparkles,
  Copy,
  Bot,
  Loader2,
  AlertCircle,
  Check,
  RotateCcw,
  Info,
  X,
  Code2,
  MessageSquareText,
  Sliders
} from 'lucide-react';
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

// Lightweight Markdown Renderer with Code Copying
function MarkdownText({ text }) {
  if (!text) return null;
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  const handleCopyCode = (codeStr, idx) => {
    navigator.clipboard.writeText(codeStr).catch(() => {});
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  const renderInline = (str) => {
    const parts = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
    let last = 0;
    let m;
    while ((m = regex.exec(str)) !== null) {
      if (m.index > last) parts.push(<span key={last}>{str.slice(last, m.index)}</span>);
      const raw = m[0];
      if (raw.startsWith('`')) {
        parts.push(
          <code key={m.index} className="bg-white/10 text-accent font-mono text-[0.82em] px-1.5 py-0.5 rounded break-all">
            {raw.slice(1, -1)}
          </code>
        );
      } else if (raw.startsWith('**') || raw.startsWith('__')) {
        parts.push(<strong key={m.index} className="font-semibold text-white">{raw.slice(2, -2)}</strong>);
      } else {
        parts.push(<em key={m.index} className="italic text-white/85">{raw.slice(1, -1)}</em>);
      }
      last = m.index + raw.length;
    }
    if (last < str.length) parts.push(<span key={last}>{str.slice(last)}</span>);
    return parts;
  };

  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  let codeBlockCount = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      elements.push(<div key={`space-${i}`} className="h-2" />);
      i++;
      continue;
    }

    if (/^# (.+)/.test(line)) {
      elements.push(<h3 key={i} className="text-base sm:text-lg font-bold text-white mt-3 mb-1.5">{renderInline(line.replace(/^# /, ''))}</h3>);
      i++; continue;
    }
    if (/^## (.+)/.test(line)) {
      elements.push(<h4 key={i} className="text-sm sm:text-base font-bold text-white/90 mt-2.5 mb-1">{renderInline(line.replace(/^## /, ''))}</h4>);
      i++; continue;
    }
    if (/^### (.+)/.test(line)) {
      elements.push(<h5 key={i} className="text-xs sm:text-sm font-semibold text-white/80 mt-2 mb-0.5">{renderInline(line.replace(/^### /, ''))}</h5>);
      i++; continue;
    }

    // Code block ```
    if (line.trim().startsWith('```')) {
      const langMatch = line.trim().match(/^```(\w+)?/);
      const lang = langMatch?.[1] || 'code';
      const codeLines = [];
      const currentBlockIdx = codeBlockCount++;
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const rawCode = codeLines.join('\n');
      elements.push(
        <div key={`code-${i}`} className="relative my-2.5 rounded-xl border border-border/60 bg-[#090d14] overflow-hidden group">
          <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-border/40 text-[11px] text-text-muted">
            <span className="font-mono text-xs text-accent flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5" />
              {lang}
            </span>
            <button
              onClick={() => handleCopyCode(rawCode, currentBlockIdx)}
              className="flex items-center gap-1 hover:text-white transition px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
            >
              {copiedCodeIdx === currentBlockIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCodeIdx === currentBlockIdx ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 overflow-x-auto text-[12px] sm:text-[13px] font-mono text-emerald-300 leading-relaxed scrollbar-thin">
            <code>{rawCode}</code>
          </pre>
        </div>
      );
      i++; continue;
    }

    if (/^[-*] (.+)/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*] (.+)/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="list-none space-y-1.5 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-white/90 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.6)]" />
              <span className="flex-1 min-w-0">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\d+\. (.+)/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. (.+)/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="space-y-1.5 my-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-white/90 leading-relaxed">
              <span className="shrink-0 text-accent font-bold text-xs mt-0.5 w-4 text-right">{idx + 1}.</span>
              <span className="flex-1 min-w-0">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      elements.push(<hr key={`hr-${i}`} className="border-border/40 my-3" />);
      i++; continue;
    }

    elements.push(
      <p key={i} className="text-xs sm:text-sm text-white/90 leading-relaxed break-words">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-1">{elements}</div>;
}

function SafeAvatar({ ai, className = "w-full h-full" }) {
  if (!ai) return <Bot className="w-5 h-5 text-accent" />;
  if (ai.avatarUrl) return <img src={ai.avatarUrl} alt={ai.name} className={`${className} object-cover rounded-xl`} />;
  if (ai.avatar && ai.avatar.length <= 4) return <span className="text-lg sm:text-xl select-none">{ai.avatar}</span>;
  return <Bot className="w-5 h-5 text-accent" />;
}

const CONCISE_SUFFIX = `

RESPONSE STYLE RULES (always follow these):
- LANGUAGE: Always reply in the EXACT same language and script the user wrote in. If the user writes in Urdu (اردو), reply in Urdu. If in Hindi (हिंदी), reply in Hindi. If in Arabic, French, Spanish, etc., match that exactly. Never switch to English unless the user writes in English.
- Keep responses SHORT and focused — 2 to 5 sentences max for simple questions.
- Use bullet points for lists, steps, or comparisons.
- Use **bold** for key terms only.
- Never pad with filler phrases like "Certainly!", "Great question!", or lengthy disclaimers.
- Get straight to the point.`;

export default function AIChatPage() {
  const { aiId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Load AI details
  useEffect(() => {
    if (!aiId) { setError('No AI ID provided.'); setLoading(false); return; }
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
        const greeting = data.greeting || `Hi! I'm **${data.name}**. ${data.description ? data.description + ' ' : ''}How can I help you today?`;
        setMessages([{ role: 'ai', text: greeting, id: Date.now() }]);
      } catch (err) {
        setError('Failed to load AI. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    })();
  }, [aiId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Auto-resize textarea height
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSend = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || sending || !aiData) return;

    setMessages(prev => [...prev, { role: 'user', text, id: Date.now() }]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(true);

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
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleResetChat = () => {
    if (!aiData) return;
    const greeting = aiData.greeting || `Hi! I'm **${aiData.name}**. ${aiData.description ? aiData.description + ' ' : ''}How can I help you today?`;
    setMessages([{ role: 'ai', text: greeting, id: Date.now() }]);
  };

  const copyMessage = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  if (loading) return (
    <div className="flex h-[100dvh] bg-[#070a0f] items-center justify-center flex-col gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        <Bot className="w-5 h-5 text-accent absolute" />
      </div>
      <p className="text-text-muted text-xs sm:text-sm font-medium animate-pulse">Initializing AI Assistant...</p>
    </div>
  );

  if (error || !aiData) return (
    <div className="flex h-[100dvh] bg-[#070a0f] items-center justify-center flex-col gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h2 className="text-white font-bold text-lg sm:text-xl">AI Assistant Unavailable</h2>
      <p className="text-text-muted text-xs sm:text-sm max-w-sm leading-relaxed">{error}</p>
      <button
        onClick={() => navigate('/ai-studio')}
        className="mt-2 bg-accent text-black font-bold px-6 py-2.5 rounded-xl hover:bg-accent/80 transition text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.2)]"
      >
        Back to My AIs
      </button>
    </div>
  );

  const starterPrompts = [
    `What are your main capabilities?`,
    `Explain your primary role & goal`,
    `Give me a quick tip in your field`
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#070a0f] text-white selection:bg-accent/30 overflow-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 border-b border-border/60 bg-[#090d14]/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={() => navigate('/ai-studio')}
            className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition active:scale-95 shrink-0"
            title="Back to AI Studio"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
            <SafeAvatar ai={aiData} />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090d14]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-white text-xs sm:text-sm truncate">{aiData.name}</h1>
              {aiData.category && (
                <span className="hidden md:inline-flex bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-md border border-accent/20">
                  {aiData.category}
                </span>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-400 flex items-center gap-1 truncate">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>{aiData.personality || 'AI Assistant'}</span>
              <span className="text-text-muted hidden sm:inline">• {aiData.model || 'Gemini'}</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition active:scale-95 text-xs font-semibold flex items-center gap-1.5"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">Reset</span>
          </button>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-xl hover:bg-white/10 text-text-muted hover:text-white transition active:scale-95"
            title="View AI System Directive"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
          </button>
        </div>
      </header>

      {/* Main Messages Viewport */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 scrollbar-thin">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div className={`max-w-[92%] sm:max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? '' : 'flex gap-2.5 sm:gap-3 items-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center overflow-hidden shrink-0 mt-0.5 shadow-sm">
                    <SafeAvatar ai={aiData} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {msg.role === 'user' ? (
                    <div className="rounded-2xl rounded-tr-xs px-4 py-2.5 sm:py-3 bg-gradient-to-r from-accent to-[#00c8ff] text-black font-semibold text-xs sm:text-sm leading-relaxed shadow-[0_4px_15px_rgba(0,240,255,0.2)] break-words">
                      {msg.text}
                    </div>
                  ) : (
                    <div className={`rounded-2xl rounded-tl-xs px-4 py-3 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.isError
                        ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                        : 'bg-[#111622] border border-border/60 shadow-md text-white'
                    }`}>
                      <MarkdownText text={msg.text} />
                    </div>
                  )}

                  {/* Actions for AI Message */}
                  {msg.role === 'ai' && !msg.isError && (
                    <div className="flex items-center gap-2 mt-1.5 ml-1">
                      <button
                        onClick={() => copyMessage(msg.text, msg.id)}
                        className="px-2 py-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition flex items-center gap-1 text-[10px] font-medium"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Bouncing Dots */}
          {sending && (
            <div className="flex justify-start items-center gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
                <SafeAvatar ai={aiData} />
              </div>
              <div className="bg-[#111622] border border-border/60 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Starter Prompts Bar (when only greeting is present) */}
      {messages.length === 1 && (
        <div className="px-3 sm:px-6 pb-2 shrink-0">
          <div className="max-w-3xl mx-auto flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
            {starterPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(promptText)}
                className="text-[11px] sm:text-xs bg-white/[0.04] hover:bg-accent/15 border border-border/60 hover:border-accent/40 rounded-full px-3 py-1.5 text-text-soft hover:text-white transition active:scale-95 flex items-center gap-1.5"
              >
                <MessageSquareText className="w-3 h-3 text-accent" />
                <span>{promptText}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Section */}
      <footer className="sticky bottom-0 z-30 border-t border-border/60 bg-[#090d14]/95 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3.5 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-[#111622] border border-border/80 focus-within:border-accent rounded-2xl p-1.5 transition-all shadow-[0_0_20px_rgba(0,0,0,0.4)]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${aiData.name}...`}
              disabled={sending}
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-text-muted focus:outline-none resize-none max-h-32 scrollbar-thin disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="bg-accent text-black p-2.5 sm:p-3 rounded-xl hover:bg-accent/80 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none shrink-0 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
              title="Send message"
            >
              {sending ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
          <p className="text-[10px] text-text-muted text-center mt-1.5 truncate">
            Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-[9px] font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/10 text-[9px] font-mono">Shift + Enter</kbd> for new line
          </p>
        </div>
      </footer>

      {/* Info / System Prompt Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#0d121d] border border-border/80 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center">
                  <SafeAvatar ai={aiData} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">{aiData.name}</h3>
                  <p className="text-[10px] text-accent font-semibold">{aiData.category || 'Custom AI'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  Personality & Tone
                </label>
                <p className="text-xs sm:text-sm text-white bg-white/[0.04] p-2.5 rounded-xl border border-border/40">
                  {aiData.personality || 'Standard'} • {aiData.tone || 'Friendly'}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                  Custom System Directive (Prompt)
                </label>
                <pre className="text-xs font-mono text-emerald-300 bg-black/50 p-3 rounded-xl border border-border/60 whitespace-pre-wrap max-h-52 overflow-y-auto leading-relaxed">
                  {aiData.systemPrompt || 'No custom prompt specified.'}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="bg-accent text-black font-bold text-xs px-5 py-2 rounded-xl hover:bg-accent/80 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
