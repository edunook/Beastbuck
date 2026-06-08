import { useState } from 'react';
import { Bot, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { AIService } from '../../services/ai/aiService';

/**
 * AIContextButton – a reusable inline AI button for embedding in feature pages.
 * Props:
 *   label       – button text
 *   icon        – lucide icon component (optional)
 *   prompt      – the full prompt string to send to AI
 *   mode        – AI mode (task, project, research, learning, general …)
 *   onResult    – callback(resultText) fired when AI responds
 *   className   – extra tailwind classes on the button
 */
export function AIContextButton({
  label = 'Ask AI',
  icon: Icon = Sparkles,
  prompt,
  mode = 'general',
  onResult,
  className = '',
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [open, setOpen] = useState(false);

  const run = async () => {
    if (!prompt || loading) return;
    if (result) { setOpen(o => !o); return; }
    setLoading(true);
    try {
      const answer = await AIService.chat({
        providerId: 'gemini',
        mode,
        messages: [{ role: 'user', content: prompt }],
      });
      setResult(answer || 'No response.');
      setOpen(true);
      onResult?.(answer);
    } catch (err) {
      setResult(`Error: ${err.message}`);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-accent/20 bg-accent/5 ${className}`}>
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-bold text-accent hover:bg-accent/10 transition rounded-xl disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
        {label}
        {result && !loading && (
          open ? <ChevronUp className="ml-auto h-4 w-4 opacity-60" /> : <ChevronDown className="ml-auto h-4 w-4 opacity-60" />
        )}
      </button>
      {open && result && (
        <div className="border-t border-accent/20 px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-6 text-white">{result}</p>
          <button
            type="button"
            className="mt-2 text-xs text-text-muted hover:text-accent"
            onClick={() => { setResult(''); setOpen(false); }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * AIContextPanel – a group of contextual AI buttons rendered as a panel.
 * Props:
 *   actions – array of { label, icon, prompt, mode, onResult }
 */
export function AIContextPanel({ actions = [], title = 'AI Assistant' }) {
  if (!actions.length) return null;
  return (
    <div className="rounded-2xl border border-accent/15 bg-black/20 p-4 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="h-4 w-4 text-accent" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent">{title}</h3>
      </div>
      {actions.map((action, i) => (
        <AIContextButton key={i} {...action} />
      ))}
    </div>
  );
}
