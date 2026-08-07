import { useState, useEffect } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Plus, Bot, Users, Star, Sparkles, Loader2, Database, FileText, Upload, CheckCircle2, BookOpen, Smile, Brain, Target, Rocket, ChevronRight, ChevronLeft, Lightbulb, Zap, Wand2, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { ROLES } from '@shared/constants/roles';
import { PERMISSIONS } from '@shared/permissions/permissions';
import EmptyState from '@frontend/components/ui/EmptyState';
import Button from '@frontend/components/ui/Button';

const CREATE_STEPS = [
  { label: 'Identity', icon: Bot },
  { label: 'Welcome', icon: Smile },
  { label: 'Personality', icon: Brain },
  { label: 'Focus', icon: Target },
  { label: 'Publish', icon: Rocket },
];

const PERSONALITIES = ['Professional', 'Friendly', 'Funny', 'Teacher', 'Scientist', 'Coach', 'Mentor', 'Creative', 'Leader', 'Motivator', 'Researcher', 'Developer'];
const TONES = ['Formal', 'Casual', 'Friendly', 'Energetic', 'Motivational', 'Technical', 'Simple', 'Beginner Friendly', 'Expert Level'];
const FOCUS_AREAS = ['Physics', 'Chemistry', 'Biology', 'Coding', 'AI', 'Research', 'Business', 'Marketing', 'Startups', 'Leadership', 'Innovation', 'Education', 'Design', 'Writing', 'Math'];

const AI_TEMPLATES = [
  {
    id: 'tutor',
    name: 'Study Tutor',
    emoji: '📚',
    description: 'Helps students learn any subject with patience and clear explanations',
    personality: 'Teacher',
    tone: 'Beginner Friendly',
    focus: ['Education', 'Writing'],
    welcomeMessage: 'Hi! I\'m your personal tutor. What subject would you like to explore today?',
    starterQuestions: ['Explain this concept simply', 'Give me practice problems', 'Help me understand this topic']
  },
  {
    id: 'coding-buddy',
    name: 'Coding Buddy',
    emoji: '💻',
    description: 'Assists with programming, debugging, and code reviews',
    personality: 'Developer',
    tone: 'Technical',
    focus: ['Coding', 'AI'],
    welcomeMessage: 'Hey! Ready to code? I can help you write, debug, and improve your code.',
    starterQuestions: ['Review my code', 'Help debug this error', 'Explain this function']
  },
  {
    id: 'business-coach',
    name: 'Business Coach',
    emoji: '🚀',
    description: 'Guides entrepreneurs with startup advice and strategy',
    personality: 'Leader',
    tone: 'Motivational',
    focus: ['Business', 'Startups', 'Marketing'],
    welcomeMessage: 'Welcome! Let\'s build something amazing together. What\'s your business challenge?',
    starterQuestions: ['Improve my business model', 'Marketing strategy ideas', 'Pitch deck feedback']
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    emoji: '✨',
    description: 'Helps with storytelling, content creation, and creative writing',
    personality: 'Creative',
    tone: 'Friendly',
    focus: ['Writing', 'Design'],
    welcomeMessage: 'Hello storyteller! I\'m here to help bring your creative ideas to life.',
    starterQuestions: ['Brainstorm story ideas', 'Improve my writing', 'Create compelling content']
  }
];

const GUIDE_STEPS = [
  {
    icon: Lightbulb,
    title: 'Choose Your Purpose',
    description: 'Decide what your AI will help with - tutoring, coding, writing, or something unique.'
  },
  {
    icon: Wand2,
    title: 'Design Personality',
    description: 'Give your AI a character - friendly, professional, funny, or expert.'
  },
  {
    icon: Zap,
    title: 'Add Knowledge',
    description: 'Upload documents and define expertise areas to make your AI smarter.'
  },
  {
    icon: Play,
    title: 'Test & Publish',
    description: 'Chat with your AI, refine its responses, then share it with the world.'
  }
];

export default function AIStudioUnified() {
  const { user, roleData } = useAuth();
  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);
  const [activeTab, setActiveTab] = useState('my-ais');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [myAIs, setMyAIs] = useState([]);
  const [createStep, setCreateStep] = useState(0);
  const [selectedPersonality, setSelectedPersonality] = useState('Professional');
  const [selectedTone, setSelectedTone] = useState('Friendly');
  const [selectedFocus, setSelectedFocus] = useState([]);
  const [aiForm, setAiForm] = useState({
    name: '',
    description: '',
    emoji: '🤖',
    welcomeMessage: '',
    starterQuestions: '',
  });
  const [showTemplates, setShowTemplates] = useState(true);

  useEffect(() => {
    const fetchAIStudioData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Try to fetch stats, but don't fail if collection doesn't exist yet
        try {
          const statsQuery = query(
            collection(db, 'ai_studio_stats'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(1)
          );
          const statsSnap = await getDocs(statsQuery);

          if (!statsSnap.empty) {
            setStats(statsSnap.docs[0].data());
          }
        } catch (statsError) {
          // Don't set error, just continue without stats
        }

        // Try to fetch AIs, but don't fail if collection doesn't exist yet
        try {
          const aisQuery = query(
            collection(db, 'custom_ais'),
            where('creatorId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const aisSnap = await getDocs(aisQuery);

          setMyAIs(aisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (aisError) {
          // Don't set error, just continue without AIs
        }
      } catch (error) {
        console.error('Failed to fetch AI Studio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIStudioData();
  }, [user]);

  const toggleFocus = (area) => {
    setSelectedFocus(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const handleFormChange = (field, value) => {
    setAiForm(prev => ({ ...prev, [field]: value }));
  };

  const applyTemplate = (template) => {
    setAiForm({
      name: template.name,
      description: template.description,
      emoji: template.emoji,
      welcomeMessage: template.welcomeMessage,
      starterQuestions: template.starterQuestions.join('\n'),
    });
    setSelectedPersonality(template.personality);
    setSelectedTone(template.tone);
    setSelectedFocus(template.focus);
    setShowTemplates(false);
  };

  const publishAI = async () => {
    if (!user) return;
    try {
      const aiData = {
        name: aiForm.name,
        description: aiForm.description,
        emoji: aiForm.emoji,
        creatorId: user.uid,
        personality: selectedPersonality,
        tone: selectedTone,
        focusAreas: selectedFocus,
        welcomeMessage: aiForm.welcomeMessage,
        starterQuestions: aiForm.starterQuestions.split('\n').filter(q => q.trim()),
        status: 'published',
        createdAt: serverTimestamp(),
        totalChats: 0,
        avgRating: 0,
      };
      await addDoc(collection(db, 'custom_ais'), aiData);
      setActiveTab('my-ais');
      setCreateStep(0);
      setAiForm({
        name: '',
        description: '',
        emoji: '🤖',
        welcomeMessage: '',
        starterQuestions: '',
      });
      setShowTemplates(true);
    } catch (error) {
      console.error('Failed to create AI:', error);
    }
  };

  const displayStats = stats || {
    totalAIs: 0,
    totalChats: 0,
    followers: 0,
    avgRating: 0
  };

  return (
    <PageContainer>
      <PageHeader
        title="My AIs"
        description="Build, train, and manage your custom AI assistants."
        action={
          isApprovedMember ? (
            <Button
              className="bg-gradient-to-r from-accent to-accent/80 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)]"
              onClick={() => setActiveTab('create')}
            >
              <Plus className="mr-2 h-4 w-4" /> Create New AI
            </Button>
          ) : (
            <Link to="/membership/apply">
              <Button className="bg-gradient-to-r from-accent to-accent/80 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                <Star className="mr-2 h-4 w-4" /> Apply for Membership
              </Button>
            </Link>
          )
        }
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-border pb-4">
        <button
          onClick={() => setActiveTab('my-ais')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'my-ais'
              ? 'bg-accent text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" /> My AIs
        </button>
        {isApprovedMember && (
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-accent text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Create AI
          </button>
        )}
        <button
          onClick={() => setActiveTab('training')}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
            activeTab === 'training'
              ? 'bg-accent text-black shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Training Center
        </button>
      </div>

      {activeTab === 'my-ais' ? (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <>
              {/* Beginner Guide Section */}
              <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-4 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-bold text-white">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  Beginner's Guide to AI Studio
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {GUIDE_STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                          <StepIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-white">{step.title}</h4>
                          <p className="mt-1 text-[10px] sm:text-xs leading-4 sm:leading-5 text-text-muted">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-4 mb-6 sm:mb-8">
                {[
                  { label: 'My AIs', value: displayStats.totalAIs?.toString() || '0', icon: Bot, color: 'text-purple-400' },
                  { label: 'Total Chats', value: displayStats.totalChats?.toLocaleString() || '0', icon: Sparkles, color: 'text-accent' },
                  { label: 'Followers', value: displayStats.followers?.toLocaleString() || '0', icon: Users, color: 'text-blue-400' },
                  { label: 'Avg Rating', value: displayStats.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl border border-border bg-surface/40 p-3 sm:p-5 text-center backdrop-blur-sm">
                    <s.icon className={`mx-auto mb-2 h-5 w-5 sm:h-6 sm:w-6 ${s.color}`} />
                    <p className="text-xl sm:text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-[10px] sm:text-xs text-text-muted">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-6 sm:mb-8">
                {isApprovedMember ? (
                  <button
                    onClick={() => setActiveTab('create')}
                    className="group flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full rounded-xl border-2 border-dashed border-border bg-surface/20 p-4 sm:p-8 text-center transition hover:border-accent hover:bg-accent/5"
                  >
                    <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-text-muted group-hover:text-accent transition" />
                    <div className="text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-accent transition">Create New AI</h3>
                      <p className="text-xs sm:text-sm text-text-muted">Design a custom assistant with unique personality, expertise, and knowledge.</p>
                    </div>
                  </button>
                ) : (
                  <Link to="/membership/apply" className="group flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full rounded-xl border-2 border-dashed border-accent/30 bg-accent/5 p-4 sm:p-8 text-center transition hover:border-accent hover:bg-accent/10">
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 text-accent group-hover:text-white transition" />
                    <div className="text-center sm:text-left">
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-accent transition">Apply for Membership</h3>
                      <p className="text-xs sm:text-sm text-text-muted">Unlock AI creation and other premium features.</p>
                    </div>
                  </Link>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">My AIs</h2>
              {myAIs.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myAIs.map((ai) => (
                    <div key={ai.id} className="group rounded-xl border border-border bg-surface/40 p-4 sm:p-6 backdrop-blur-sm transition hover:border-accent/50 hover:shadow-[0_0_20px_rgba(208,255,0,0.05)]">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-white/5 text-2xl sm:text-3xl border border-border">
                          {ai.emoji || '🤖'}
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${ai.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'}`}>
                          {ai.status || 'Draft'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-accent transition">{ai.name || 'Untitled AI'}</h3>
                      <p className="text-xs text-text-muted mb-3 sm:mb-4 line-clamp-2">{ai.description || 'No description'}</p>
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-text-muted border-t border-border/50 pt-2 sm:pt-3">
                        <span>{ai.totalChats?.toLocaleString() || '0'} chats</span>
                        {ai.avgRating > 0 && <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" /> {ai.avgRating.toFixed(1)}</span>}
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <Link to={`/ais/${ai.id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-[10px] sm:text-xs font-bold py-2 rounded-lg text-center transition">View</Link>
                        <button
                          onClick={() => setActiveTab('training')}
                          className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent text-[10px] sm:text-xs font-bold py-2 rounded-lg text-center transition"
                        >
                          Train
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Bot}
                  title="No AIs Created Yet"
                  description="Create your first custom AI assistant to get started."
                  action={
                    <Button onClick={() => setActiveTab('create')}>
                      <Plus className="mr-2 h-4 w-4" /> Create Your First AI
                    </Button>
                  }
                />
              )}
            </>
          )}
        </>
      ) : activeTab === 'create' ? (
        <div className="max-w-4xl mx-auto">
          {/* Template Selection */}
          {showTemplates && createStep === 0 && (
            <div className="mb-8 rounded-xl border border-accent/20 bg-accent/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                <Sparkles className="h-5 w-5 text-accent" />
                Start with a Template
              </h3>
              <p className="mb-4 text-sm text-text-muted">Choose a pre-built template to get started quickly, or create from scratch.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {AI_TEMPLATES.map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="flex items-start gap-3 rounded-xl border border-border bg-white/5 p-4 text-left transition hover:border-accent/50 hover:bg-white/10"
                  >
                    <span className="text-3xl">{template.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white">{template.name}</p>
                      <p className="text-xs text-text-muted">{template.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-text-muted" />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowTemplates(false)}
                className="mt-4 text-sm font-bold text-accent hover:text-white transition"
              >
                Or create from scratch →
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {CREATE_STEPS.map((s, i) => {
                const StepIcon = s.icon;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${i <= createStep ? 'bg-accent text-black shadow-[0_0_12px_rgba(208,255,0,0.3)]' : 'bg-white/5 text-text-muted border border-border'}`}>
                      {i < createStep ? '✓' : <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className="text-[10px] sm:text-xs text-text-muted hidden sm:block">{s.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-white/5 rounded-full h-1">
              <div className="bg-accent h-1 rounded-full transition-all" style={{ width: `${((createStep + 1) / CREATE_STEPS.length) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-surface/40 border border-border rounded-2xl p-4 sm:p-8 backdrop-blur-sm min-h-[400px]">
            {/* Step 0: Identity */}
            {createStep === 0 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Give your AI an identity</h2>
                <p className="text-text-muted text-sm sm:text-base">Choose a name, avatar, and short description for your AI assistant.</p>
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent transition shrink-0">
                    <span className="text-4xl sm:text-5xl">{aiForm.emoji}</span>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">AI Name</label>
                      <input
                        type="text"
                        value={aiForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        placeholder="e.g., Physics Guru"
                        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Short Description</label>
                      <textarea
                        value={aiForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        rows={3}
                        placeholder="Describe what this AI does in 1-2 sentences..."
                        className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Welcome */}
            {createStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome Experience</h2>
                <p className="text-text-muted text-sm sm:text-base">Design the first impression users get when they start a conversation.</p>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">First Message</label>
                  <textarea
                    value={aiForm.welcomeMessage}
                    onChange={(e) => handleFormChange('welcomeMessage', e.target.value)}
                    rows={4}
                    placeholder="Hi! I'm your Physics tutor. Ask me anything about mechanics, thermodynamics, or quantum physics!"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Starter Questions (one per line)</label>
                  <textarea
                    value={aiForm.starterQuestions}
                    onChange={(e) => handleFormChange('starterQuestions', e.target.value)}
                    rows={4}
                    placeholder="Explain Newton's laws&#10;What is quantum entanglement?&#10;Help me solve a momentum problem"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personality */}
            {createStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Personality & Tone</h2>
                <p className="text-text-muted text-sm sm:text-base">Choose how your AI communicates.</p>
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Personality</label>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITIES.map(p => (
                      <button
                        key={p}
                        onClick={() => setSelectedPersonality(p)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition ${selectedPersonality === p ? 'bg-accent text-black shadow-[0_0_12px_rgba(208,255,0,0.2)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Tone</label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition ${selectedTone === t ? 'bg-accent text-black shadow-[0_0_12px_rgba(208,255,0,0.2)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Focus */}
            {createStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Expertise Areas</h2>
                <p className="text-text-muted text-sm sm:text-base">Select the topics your AI specializes in.</p>
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Focus Areas (select multiple)</label>
                  <div className="flex flex-wrap gap-2">
                    {FOCUS_AREAS.map(area => (
                      <button
                        key={area}
                        onClick={() => toggleFocus(area)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition ${selectedFocus.includes(area) ? 'bg-accent text-black shadow-[0_0_12px_rgba(208,255,0,0.2)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Publish */}
            {createStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to Launch!</h2>
                <p className="text-text-muted text-sm sm:text-base">Review your AI configuration and publish it to the marketplace.</p>
                <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{aiForm.emoji}</span>
                    <div>
                      <p className="font-bold text-white text-lg">{aiForm.name}</p>
                      <p className="text-sm text-text-muted">{aiForm.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted">Personality</p>
                      <p className="text-white font-bold">{selectedPersonality}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Tone</p>
                      <p className="text-white font-bold">{selectedTone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-text-muted">Focus Areas</p>
                      <p className="text-white font-bold">{selectedFocus.join(', ') || 'None selected'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 sm:mt-8 flex items-center justify-between gap-4">
              <Button
                variant="secondary"
                onClick={() => {
                  if (createStep === 0) {
                    setShowTemplates(true);
                    setActiveTab('my-ais');
                  } else {
                    setCreateStep(createStep - 1);
                  }
                }}
                className="flex-1"
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {createStep === 0 ? 'Cancel' : 'Previous'}
              </Button>
              {createStep === CREATE_STEPS.length - 1 ? (
                <Button onClick={publishAI} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-[0_0_25px_rgba(74,222,128,0.4)]">
                  <Rocket className="mr-2 h-4 w-4" /> Publish AI
                </Button>
              ) : (
                <Button onClick={() => setCreateStep(createStep + 1)} className="flex-1 bg-gradient-to-r from-accent to-accent/80 text-black shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[
              { label: 'Knowledge Sources', value: '12', icon: Database, color: 'text-purple-400' },
              { label: 'Documents Indexed', value: '45', icon: FileText, color: 'text-blue-400' },
              { label: 'Training Sessions', value: '8', icon: BookOpen, color: 'text-emerald-400' },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
                <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface/40 border border-border rounded-xl p-8 mb-8 backdrop-blur-sm">
            <h3 className="font-bold text-white mb-4">Upload Training Data</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-white/5 transition cursor-pointer">
              <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
              <p className="text-sm font-bold text-white mb-1">Upload PDFs, DOCX, TXT, or Markdown</p>
              <p className="text-xs text-text-muted">Files are processed and indexed for retrieval-augmented generation.</p>
            </div>
          </div>

          <div className="bg-surface/40 border border-border rounded-xl p-6 backdrop-blur-sm">
            <h3 className="font-bold text-white mb-4">Indexed Knowledge</h3>
            <div className="space-y-3">
              {[
                { name: 'Quantum Mechanics 101.pdf', size: '2.4 MB', indexed: true },
                { name: 'Thermodynamics_Notes.md', size: '450 KB', indexed: true },
                { name: 'Research_Paper_2026.pdf', size: '4.1 MB', indexed: true },
                { name: 'Custom_Instructions.txt', size: '12 KB', indexed: true },
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-text-muted" />
                    <div>
                      <p className="text-sm font-bold text-white">{file.name}</p>
                      <p className="text-xs text-text-muted">{file.size}</p>
                    </div>
                  </div>
                  {file.indexed && <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Indexed</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}
