import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Brain,
  Code2,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  Mic,
  MicOff,
  Search,
  Send,
  Sparkles,
  Volume2,
  MessageSquare,
  PlusCircle,
  Trash2,
  ChevronRight,
  Zap,
  Target,
  Calendar,
  Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useAI } from './AIProvider';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AI_MODES, AIService } from '../../services/ai/aiService';
import { AIRecommendationsService } from '../../services/ai/aiRecommendations';
import AIMemoryManager from './AIMemoryManager';

const quickPrompts = [
  { mode: 'learning', prompt: 'Create a 5-question quiz about Physics and forces.', icon: GraduationCap, label: 'Quiz Me' },
  { mode: 'experiment', prompt: 'Give me 3 safe science fair ideas for a young inventor.', icon: FlaskConical, label: 'Experiment Ideas' },
  { mode: 'project', prompt: 'Turn my robotics idea into milestones and next steps.', icon: FolderKanban, label: 'Plan a Project' },
  { mode: 'coding', prompt: 'Explain how to debug a React form that will not submit.', icon: Code2, label: 'Debug Help' },
];

const assistantWorkflows = [
  { icon: GraduationCap, title: 'Learning Assistant', desc: 'Quizzes, explanations, study help, and skill ecosystem support.' },
  { icon: FlaskConical, title: 'Experiment Assistant', desc: 'Safe experiment ideas, materials, procedures, and research guidance.' },
  { icon: Code2, title: 'Coding Help', desc: 'Debugging, code explanations, implementation guidance, and review prompts.' },
  { icon: FolderKanban, title: 'Project Help', desc: 'Milestones, risk analysis, task breakdown, and project planning.' },
  { icon: Lightbulb, title: 'Innovation Assistant', desc: 'Invention descriptions, prototype improvement, and discovery documentation.' },
  { icon: Brain, title: 'Research Assistant', desc: 'Summarize findings, generate hypotheses, and organize research logs.' },
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
  const isApprovedMember = roleData?.membershipStatus === 'approved';
  const {
    messages: globalMessages,
    sendMessage: globalSend,
    loading: globalLoading,
    sessions,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
  } = useAI();
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState('general');
  const [providerId, setProviderId] = useState('gemini');
  const [listening, setListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat | history | memory | recommendations
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);

  const providers = useMemo(() => [{ id: 'local', name: 'Local fallback', configured: true }, ...AIService.getProviders()], []);
  const authorName = roleData?.displayName || roleData?.username || user?.displayName || 'Member';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [globalMessages]);

  useEffect(() => {
    if (activeTab === 'recommendations' && user) {
      setRecsLoading(true);
      AIRecommendationsService.getPersonalizedRecommendations(user.uid, roleData)
        .then(setRecommendations)
        .finally(() => setRecsLoading(false));
    }
  }, [activeTab, user]);

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
    { id: 'chat', label: 'AI Chat', icon: Bot },
    { id: 'history', label: 'History', icon: MessageSquare },
    { id: 'memory', label: 'Memory', icon: Brain },
    { id: 'recommendations', label: 'For You', icon: Sparkles },
  ];

  const recIcons = { course: GraduationCap, project: FolderKanban, event: Calendar, team: Users };

  return (
    <PageContainer>
      <PageHeader
        title="BeastBuck AI OS"
        description="Your intelligent assistant — integrated across projects, tasks, research, learning, and organization."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Bot className="h-6 w-6" /></div>}
      />

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-surface/50 p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-bold transition ${
              activeTab === tab.id ? 'bg-accent text-black' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==== CHAT TAB ==== */}
      {activeTab === 'chat' && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <Card className="rounded-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="h-5 w-5 text-accent" />AI Chat</CardTitle>
                <CardDescription>Ask anything. Context-aware across BeastBuck.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Provider & Mode selectors */}
                <div className="grid gap-3 md:grid-cols-2">
                  <select value={providerId} onChange={e => setProviderId(e.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                    {providers.map(p => <option key={p.id} value={p.id}>{p.name}{p.configured ? '' : ' (not configured)'}</option>)}
                  </select>
                  <select value={mode} onChange={e => setMode(e.target.value)} className="h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent">
                    {Object.entries(AI_MODES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}
                  </select>
                </div>

                {/* Messages */}
                <div className="max-h-[36rem] space-y-3 overflow-y-auto rounded-xl border border-border bg-black/20 p-4 custom-scrollbar">
                  {globalMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 opacity-50">
                      <Bot className="mb-4 h-12 w-12 text-accent" />
                      <p className="text-sm text-white">How can I help you today?</p>
                    </div>
                  ) : (
                    globalMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-accent/15 text-white rounded-tr-sm' : 'bg-white/[0.06] text-text-soft rounded-tl-sm'}`}>
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">{msg.role === 'user' ? authorName : 'BeastBuck AI'}</p>
                          <p className="whitespace-pre-wrap text-sm leading-6">{msg.content}</p>
                          {msg.role === 'assistant' && (
                            <button type="button" onClick={() => speak(msg.content)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/80 transition">
                              <Volume2 className="h-3.5 w-3.5" />Speak
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {globalLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Quick prompts */}
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {quickPrompts.map(qp => (
                    <button key={qp.prompt} type="button" onClick={() => { setMode(qp.mode); handleSend(qp.prompt); }}
                      className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] p-3 text-left text-xs font-semibold text-text-soft hover:border-accent/40 hover:text-white transition">
                      <qp.icon className="h-4 w-4 text-accent shrink-0" />
                      {qp.label}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex gap-2">
                  <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask BeastBuck AI..." className="flex-1" />
                  <Button type="button" variant="secondary" onClick={listening ? stopListening : startListening}>
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button type="submit" disabled={globalLoading || !input.trim()}><Send className="mr-2 h-4 w-4" />Send</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Workflows */}
          <aside className="space-y-5">
            <Card className="rounded-lg">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Zap className="h-5 w-5 text-accent" />Assistant Modes</CardTitle></CardHeader>
              <CardContent className="space-y-3 pt-0">
                {assistantWorkflows.map(w => (
                  <div key={w.title} className="rounded-xl border border-border bg-white/[0.03] p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <w.icon className="h-4 w-4 text-accent" />
                      <h4 className="font-bold text-white text-sm">{w.title}</h4>
                    </div>
                    <p className="text-xs leading-5 text-text-muted">{w.desc}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-lg">
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Search className="h-5 w-5 text-accent" />Voice Commands</CardTitle></CardHeader>
              <CardContent className="space-y-2 pt-0 text-sm text-text-soft">
                {['open tasks', 'open projects', 'open experiments'].map(cmd => (
                  <p key={cmd} className="rounded-lg bg-white/[0.03] px-3 py-2 font-mono text-xs">{cmd}</p>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {/* ==== HISTORY TAB ==== */}
      {activeTab === 'history' && (
        <Card className="rounded-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-accent" />Chat History</CardTitle>
              {isApprovedMember && <Button size="sm" onClick={createNewSession}><PlusCircle className="mr-2 h-4 w-4" />New</Button>}
            </div>
            <CardDescription>Revisit, continue, or delete past conversations.</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">No past conversations yet. Start chatting to create one.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id}
                    className={`flex items-center justify-between rounded-xl p-4 transition cursor-pointer ${activeSessionId === s.id ? 'bg-accent/20 border border-accent/30 text-white' : 'bg-white/[0.03] border border-border text-text-soft hover:bg-white/[0.06]'}`}
                    onClick={() => { setActiveSessionId(s.id); setActiveTab('chat'); }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <MessageSquare className="h-4 w-4 shrink-0 text-accent" />
                      <span className="truncate font-bold">{s.title || 'Conversation'}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={e => { e.stopPropagation(); deleteSession(s.id); }} className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-text-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ==== MEMORY TAB ==== */}
      {activeTab === 'memory' && <AIMemoryManager />}

      {/* ==== RECOMMENDATIONS TAB ==== */}
      {activeTab === 'recommendations' && (
        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />Personalized Recommendations</CardTitle>
            <CardDescription>AI-powered suggestions based on your activity, interests, and specializations.</CardDescription>
          </CardHeader>
          <CardContent>
            {recsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Sparkles className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : recommendations.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">No recommendations available yet. Keep using BeastBuck to get personalized suggestions.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec, i) => {
                  const Icon = recIcons[rec.type] || Target;
                  return (
                    <div key={i} className="rounded-2xl border border-border bg-white/[0.03] p-5 hover:border-accent/30 hover:bg-white/[0.05] transition">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent"><Icon className="h-4 w-4" /></div>
                        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">{rec.type}</span>
                      </div>
                      <h4 className="font-bold text-white mb-1">{rec.title}</h4>
                      <p className="text-sm text-text-muted leading-6">{rec.description}</p>
                      <Button size="sm" variant="secondary" className="mt-4 w-full">{rec.actionLabel || 'View'}</Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
