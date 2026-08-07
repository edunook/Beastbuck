import { useState, useRef, useEffect } from 'react';
import { 
  Wand2, Languages, SpellCheck, FileText, MessageSquareReply, 
  Lightbulb, X, Loader2, Check, AlertCircle, Sparkles, Brain, Zap
} from 'lucide-react';

const AI_ACTIONS = [
  { id: 'rewrite', label: 'Rewrite', icon: Wand2, description: 'Improve clarity and tone', color: 'purple' },
  { id: 'translate', label: 'Translate', icon: Languages, description: 'Translate to another language', color: 'blue' },
  { id: 'grammar', label: 'Fix Grammar', icon: SpellCheck, description: 'Correct spelling and grammar', color: 'green' },
  { id: 'summarize', label: 'Summarize', icon: FileText, description: 'Create a brief summary', color: 'cyan' },
  { id: 'reply', label: 'Generate Reply', icon: MessageSquareReply, description: 'Suggest a response', color: 'pink' },
  { id: 'explain', label: 'Explain', icon: Lightbulb, description: 'Explain in simple terms', color: 'amber' },
  { id: 'brainstorm', label: 'Brainstorm', icon: Brain, description: 'Generate creative ideas', color: 'violet' },
  { id: 'enhance', label: 'Enhance', icon: Sparkles, description: 'Make it more engaging', color: 'rose' },
];

const getColorClasses = (color) => {
  const colors = {
    purple: 'from-purple-500/20 to-purple-500/10 border-purple-500/30 text-purple-400 hover:from-purple-500/30 hover:to-purple-500/20',
    blue: 'from-blue-500/20 to-blue-500/10 border-blue-500/30 text-blue-400 hover:from-blue-500/30 hover:to-blue-500/20',
    green: 'from-green-500/20 to-green-500/10 border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-green-500/20',
    cyan: 'from-cyan-500/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-cyan-500/20',
    pink: 'from-pink-500/20 to-pink-500/10 border-pink-500/30 text-pink-400 hover:from-pink-500/30 hover:to-pink-500/20',
    amber: 'from-amber-500/20 to-amber-500/10 border-amber-500/30 text-amber-400 hover:from-amber-500/30 hover:to-amber-500/20',
    violet: 'from-violet-500/20 to-violet-500/10 border-violet-500/30 text-violet-400 hover:from-violet-500/30 hover:to-violet-500/20',
    rose: 'from-rose-500/20 to-rose-500/10 border-rose-500/30 text-rose-400 hover:from-rose-500/30 hover:to-rose-500/20',
  };
  return colors[color] || colors.purple;
};

export function AIActionsMenu({ message, onClose, onAction }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [result, setResult] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setResult(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = async (actionId) => {
    setLoading(true);
    setLoadingAction(actionId);
    setResult(null);
    try {
      const response = await onAction?.(message, actionId);
      setResult({ text: response, actionId });
    } catch (error) {
      setResult({ error: 'Action failed. Please try again.' });
    } finally {
      setLoading(false);
      setLoadingAction(null);
      setOpen(false);
    }
  };

  if (!message) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl bg-gradient-to-r from-accent/25 via-accent/15 to-purple-500/15 text-accent border border-accent/40 hover:from-accent/35 hover:via-accent/25 hover:to-purple-500/25 hover:scale-110 transition-all duration-200 active:scale-95 shadow-xl shadow-accent/30 backdrop-blur-xl"
        aria-label="AI actions"
        title="AI Actions"
      >
        <Wand2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 mb-2 w-80 rounded-2xl border border-accent/40 bg-gradient-to-b from-slate-900/98 to-slate-950/98 backdrop-blur-2xl shadow-2xl shadow-accent/30 overflow-hidden z-50 animate-fade-in-up">
          <div className="p-4 border-b border-white/10 bg-gradient-to-r from-accent/15 via-purple-500/10 to-transparent">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-accent animate-pulse" />
                </div>
                <span className="text-sm font-bold text-white">AI Assistant</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-white/50 mt-1">Enhance your message with AI</p>
          </div>

          <div className="p-3 space-y-1.5 max-h-80 overflow-y-auto custom-scrollbar">
            {AI_ACTIONS.map(action => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group border border-transparent hover:border-white/10"
              >
                <div className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${getColorClasses(action.color)} border flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                  {loading && loadingAction === action.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <action.icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">{action.label}</p>
                  <p className="text-[10px] text-white/50">{action.description}</p>
                </div>
                <Zap className="h-3.5 w-3.5 text-white/30 group-hover:text-accent/60 transition-colors" />
              </button>
            ))}
          </div>

          {result && (
            <div className="p-4 border-t border-white/10 bg-gradient-to-r from-accent/10 via-purple-500/5 to-transparent animate-fade-in-up">
              {result.error ? (
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-status-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-status-danger">{result.error}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-status-success" />
                      <span className="text-xs font-bold text-status-success">AI Result</span>
                    </div>
                    <button
                      onClick={() => setResult(null)}
                      className="text-white/50 hover:text-white transition-colors"
                      aria-label="Dismiss result"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed bg-white/5 rounded-lg p-3 border border-white/10">{result.text || result}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
