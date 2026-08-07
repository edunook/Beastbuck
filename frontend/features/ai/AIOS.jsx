import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Brain,
  Code2,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  Mic,
  MicOff,
  Send,
  Volume2,
  MessageSquare,
  PlusCircle,
  Trash2,
  ChevronDown,
  X,
  Sparkles,
  Zap,
  Cpu,
  Globe,
  ChevronUp,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PERMISSIONS } from '@shared/permissions/permissions';
import { useAI } from './AIProvider';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { AI_MODES, AIService } from '@services/ai/aiService';
import AIMemoryManager from './AIMemoryManager';
import { cn } from '@shared/lib/utils';

const animations = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-fade-in { animation: fadeIn 0.3s ease-out; }
  .animate-slide-up { animation: slideUp 0.4s ease-out; }
  .animate-pulse { animation: pulse 2s ease-in-out infinite; }
  .glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .glass-dark {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const quickPrompts = [
  { mode: 'learning', prompt: 'Create a 5-question quiz about Physics and forces.', icon: GraduationCap, label: 'Quiz Me', color: 'from-purple-500 to-pink-500' },
  { mode: 'experiment', prompt: 'Give me 3 safe science fair ideas for a young inventor.', icon: FlaskConical, label: 'Experiment Ideas', color: 'from-blue-500 to-cyan-500' },
  { mode: 'project', prompt: 'Turn my robotics idea into milestones and next steps.', icon: FolderKanban, label: 'Plan a Project', color: 'from-green-500 to-emerald-500' },
  { mode: 'coding', prompt: 'Explain how to debug a React form that will not submit.', icon: Code2, label: 'Debug Help', color: 'from-orange-500 to-red-500' },
];

function speechRecognitionFactory() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function supportsSpeech() {
  return Boolean(speechRecognitionFactory());
}

function speak(text) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 900));
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export default function AIOS() {
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);
  const {
    messages: globalMessages,
    sendMessage: globalSend,
    loading: globalLoading,
    sessions,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    providerId: contextProviderId,
    setProviderId: setContextProviderId,
  } = useAI();
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState('general');
  const [providerId, setProviderId] = useState(contextProviderId || 'groq');
  const [listening, setListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const providers = useMemo(() => [
    { id: 'groq', name: 'Groq', icon: Zap, color: 'from-green-500 to-emerald-500' },
    { id: 'openrouter', name: 'OpenRouter', icon: Globe, color: 'from-orange-500 to-red-500' },
    { id: 'gemini', name: 'Gemini', icon: Sparkles, color: 'from-blue-500 to-purple-500' },
  ], []);
  const authorName = roleData?.displayName || roleData?.username || user?.displayName || 'Member';

  const selectedProvider = providers.find(p => p.id === providerId) || providers[0];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [globalMessages]);

  useEffect(() => {
    if (contextProviderId) {
      setProviderId(contextProviderId);
    }
  }, [contextProviderId]);

  useEffect(() => {
    setContextProviderId(providerId);
  }, [providerId, setContextProviderId]);

  const runCommand = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('open tasks')) { navigate('/tasks'); return true; }
    if (lower.includes('open projects')) { navigate('/organization'); return true; }
    if (lower.includes('open experiments')) { navigate('/workspace/experiments'); return true; }
    return false;
  };

  const handleSend = async (overrideText = null) => {
    const text = (overrideText ?? input).trim();
    if (!text || globalLoading) return;
    if (runCommand(text)) { setInput(''); return; }
    setInput('');
    await globalSend(text);
  };

  const startListening = () => {
    if (!supportsSpeech()) return;
    const Recognition = speechRecognitionFactory();
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setInput(transcript);
      runCommand(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const TABS = [
    { id: 'chat', label: 'Chat', icon: Bot },
    { id: 'history', label: 'History', icon: MessageSquare },
    { id: 'memory', label: 'Memory', icon: Brain },
  ];

  return (
    <>
      <style>{animations}</style>
      <PageContainer className="p-0">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/10 glass animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center shadow-lg shadow-accent/25">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white">AI Assistant</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-border/50 hover:bg-white/10 transition-all"
                >
                  <selectedProvider.icon className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-white">{selectedProvider.name}</span>
                  <ChevronDown className="h-4 w-4 text-text-muted" />
                </button>

                {showModelDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-gray-900 border border-border/50 shadow-2xl overflow-hidden z-50 animate-slide-up">
                    {providers.map(provider => (
                      <button
                        key={provider.id}
                        onClick={() => { setProviderId(provider.id); setShowModelDropdown(false); }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-all",
                          providerId === provider.id ? "bg-accent/20" : "hover:bg-white/5"
                        )}
                      >
                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                          <provider.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white">{provider.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* New Chat Button */}
              {isApprovedMember && (
                <Button
                  size="sm"
                  onClick={createNewSession}
                  className="hidden sm:flex h-10 px-4 rounded-xl bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 text-white font-semibold shadow-lg shadow-accent/25"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Chat
                </Button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Desktop */}
            <div className="hidden md:flex flex-col w-64 border-r border-border/10 glass p-4">
              <div className="flex-1 space-y-2 overflow-y-auto">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl transition-all group cursor-pointer",
                      activeSessionId === s.id
                        ? "bg-gradient-to-r from-accent/20 to-purple-600/20 border border-accent/30"
                        : "hover:bg-white/5 border border-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{s.title || 'Conversation'}</p>
                        <p className="text-xs text-text-muted mt-1">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                        className="p-1 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode Selector */}
              <div className="mt-4 pt-4 border-t border-border/10">
                <p className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">AI Mode</p>
                <div className="space-y-1">
                  {Object.entries(AI_MODES).map(([id, item]) => (
                    <button
                      key={id}
                      onClick={() => setMode(id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                        mode === id
                          ? "bg-accent/20 text-accent font-medium"
                          : "text-text-muted hover:text-white hover:bg-white/5"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Mobile Tabs */}
              <div className="flex md:hidden border-b border-border/10 glass">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "text-accent border-b-2 border-accent"
                        : "text-text-muted"
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content based on tab */}
              {activeTab === 'chat' && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {globalMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-accent/25 animate-pulse">
                          <Bot className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">How can I help you?</h3>
                        <p className="text-text-muted text-sm max-w-md text-center mb-8">Ask me anything about projects, tasks, research, or learning.</p>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                          {quickPrompts.map(qp => (
                            <button
                              key={qp.prompt}
                              type="button"
                              onClick={() => { setMode(qp.mode); handleSend(qp.prompt); }}
                              className="group relative overflow-hidden rounded-xl border border-border/30 glass p-4 text-left transition-all hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
                            >
                              <div className={`absolute inset-0 bg-gradient-to-br ${qp.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                              <qp.icon className="h-5 w-5 text-accent mb-2" />
                              <p className="text-sm font-semibold text-white">{qp.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-fade-in">
                        {globalMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-br from-accent to-purple-600 text-white shadow-lg shadow-accent/20'
                                : 'glass text-text-soft border border-border/30'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                                  {msg.role === 'user' ? authorName : 'AI'}
                                </span>
                                {msg.role === 'assistant' && (
                                  <button
                                    type="button"
                                    onClick={() => speak(msg.content)}
                                    className="p-1 rounded-lg hover:bg-white/10 transition"
                                  >
                                    <Volume2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        {globalLoading && (
                          <div className="flex justify-start">
                            <div className="glass border border-border/30 rounded-2xl px-4 py-3 flex gap-2">
                              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                        <div ref={bottomRef} />
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t border-border/10 glass">
                    <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                      <div className="flex-1 relative">
                        <Input
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full h-12 pl-4 pr-12 rounded-xl border border-border/30 bg-white/5 text-white placeholder:text-text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                        />
                        {input && (
                          <button
                            type="button"
                            onClick={() => setInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={listening ? stopListening : startListening}
                        className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${
                          listening
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'glass text-text-muted hover:text-white border border-border/30 hover:border-accent/50'
                        }`}
                      >
                        {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                      </button>
                      <Button
                        type="submit"
                        disabled={globalLoading || !input.trim()}
                        className="h-12 px-6 rounded-xl bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 text-white font-semibold shadow-lg shadow-accent/25"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Send</span>
                      </Button>
                    </form>
                  </div>
                </>
              )}

              {/* History Tab - Mobile */}
              {activeTab === 'history' && (
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Chat History</h2>
                    {isApprovedMember && (
                      <Button
                        size="sm"
                        onClick={createNewSession}
                        className="rounded-xl bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 text-white font-semibold shadow-lg shadow-accent/25"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New
                      </Button>
                    )}
                  </div>

                  {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="h-16 w-16 rounded-2xl glass flex items-center justify-center mb-4">
                        <MessageSquare className="h-8 w-8 text-text-muted" />
                      </div>
                      <p className="text-text-muted text-sm">No past conversations yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map(s => (
                        <div
                          key={s.id}
                          onClick={() => { setActiveSessionId(s.id); setActiveTab('chat'); }}
                          className={cn(
                            "w-full text-left p-4 rounded-xl transition-all group cursor-pointer",
                            activeSessionId === s.id
                              ? "bg-gradient-to-r from-accent/20 to-purple-600/20 border border-accent/30"
                              : "glass border border-border/30 hover:border-accent/50"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{s.title || 'Conversation'}</p>
                              <p className="text-xs text-text-muted mt-1">
                                {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                              className="p-2 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Memory Tab - Mobile */}
              {activeTab === 'memory' && (
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  <AIMemoryManager />
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
