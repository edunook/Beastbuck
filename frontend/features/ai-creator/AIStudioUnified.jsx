import { useState, useEffect } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import {
  Plus, Bot, Users, Star, Sparkles, Loader2, Database, FileText, Upload,
  CheckCircle2, BookOpen, Smile, Brain, Target, Rocket, ChevronRight, ChevronLeft,
  Lightbulb, Zap, Wand2, Play, Trash2, Image as ImageIcon, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { PERMISSIONS } from '@shared/permissions/permissions';
import { uploadProofFile, isIPFSConfigured } from '@services/storage/ipfs';
import { SafeImage } from '@frontend/features/creative/CreativityPage';
import EmptyState from '@frontend/components/ui/EmptyState';
import Button from '@frontend/components/ui/Button';

const CREATE_STEPS = [
  { label: 'Identity & Avatar', icon: Bot },
  { label: 'System Prompt', icon: FileText },
  { label: 'Welcome & Prompts', icon: Smile },
  { label: 'Personality & Tone', icon: Brain },
  { label: 'Focus & Publish', icon: Rocket },
];

const PERSONALITIES = ['Professional', 'Friendly', 'Funny', 'Teacher', 'Scientist', 'Coach', 'Mentor', 'Creative', 'Leader', 'Motivator', 'Researcher', 'Developer'];
const TONES = ['Formal', 'Casual', 'Friendly', 'Energetic', 'Motivational', 'Technical', 'Simple', 'Beginner Friendly', 'Expert Level'];
const FOCUS_AREAS = ['Physics', 'Chemistry', 'Biology', 'Coding', 'AI', 'Research', 'Business', 'Marketing', 'Startups', 'Leadership', 'Innovation', 'Education', 'Design', 'Writing', 'Math'];

const SYSTEM_PROMPT_TEMPLATES = [
  {
    name: '🎓 Patient Tutor',
    prompt: `You are an empathetic, patient, and highly knowledgeable AI Tutor.
Your goal is to break down complex academic topics into clear, intuitive step-by-step explanations.
Always verify student understanding before advancing, provide real-world analogies, and encourage critical thinking.`,
  },
  {
    name: '💻 Senior Tech Architect',
    prompt: `You are a Senior Software Architect and Tech Reviewer.
Your goal is to assist developers with clean code principles, system design, bug diagnosis, and performance optimization.
Always provide idiomatic, type-safe code snippets with concise architectural rationale.`,
  },
  {
    name: '🚀 Startup Founder Coach',
    prompt: `You are an experienced Tech Founder & Startup Mentor.
Your goal is to evaluate business ideas, refine pitch decks, plan growth marketing, and offer tactical product strategy.
Be direct, strategic, data-driven, and highly encouraging.`,
  },
  {
    name: '🧪 Research Scientist',
    prompt: `You are a rigorous Scientific Research Assistant.
Your goal is to assist with hypothesis formulation, literature synthesis, experimental design, and data analysis.
Maintain academic precision and cite relevant scientific principles.`,
  },
  {
    name: '🎨 Creative Muse',
    prompt: `You are an imaginative Creative Director and Storyteller.
Your goal is to spark artistic inspiration, craft compelling narrative hooks, brainstorm design concepts, and polish copy.
Use rich, vivid imagery and bold creative suggestions.`,
  },
];

const AI_TEMPLATES = [
  {
    id: 'tutor',
    name: 'Study Tutor',
    emoji: '📚',
    avatarUrl: '',
    description: 'Helps students learn any subject with patience and clear explanations',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[0].prompt,
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
    avatarUrl: '',
    description: 'Assists with programming, debugging, and code reviews',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[1].prompt,
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
    avatarUrl: '',
    description: 'Guides entrepreneurs with startup advice and strategy',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[2].prompt,
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
    avatarUrl: '',
    description: 'Helps with storytelling, content creation, and creative writing',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[4].prompt,
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
    title: 'Choose Purpose & Avatar',
    description: 'Name your assistant and upload a custom image avatar or select an emoji.'
  },
  {
    icon: FileText,
    title: 'Set System Prompt',
    description: 'Craft mandatory system instructions that dictate how your AI thinks and acts.'
  },
  {
    icon: Brain,
    title: 'Design Tone & Focus',
    description: 'Customize communication style and target domain expertise.'
  },
  {
    icon: Play,
    title: 'Publish & Deploy',
    description: 'Launch your custom AI assistant into your workspace immediately.'
  }
];

export default function AIStudioUnified() {
  const { user, roleData } = useAuth();
  const isApprovedMember = PERMISSIONS.isApprovedMember(roleData);
  const [activeTab, setActiveTab] = useState('my-ais');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
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
    avatarUrl: '',
    systemPrompt: '',
    welcomeMessage: '',
    starterQuestions: '',
  });

  const [avatarUploadType, setAvatarUploadType] = useState('emoji'); // 'emoji' | 'upload' | 'url'
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);

  const fetchAIStudioData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch stats
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
        // Silently skip stats if missing
      }

      // Fetch custom AIs
      try {
        const aisQuery = query(
          collection(db, 'custom_ais'),
          where('creatorId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const aisSnap = await getDocs(aisQuery);

        setMyAIs(aisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (aisError) {
        console.error('Failed to load custom AIs:', aisError);
      }
    } catch (error) {
      console.error('Failed to fetch AI Studio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIStudioData();
  }, [user]);

  const toggleFocus = (area) => {
    setSelectedFocus(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const handleFormChange = (field, value) => {
    setAiForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const res = await uploadProofFile(file, { folder: 'ai-avatars' });
      if (res && res.url) {
        setAiForm(prev => ({ ...prev, avatarUrl: res.url }));
      }
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Avatar upload failed: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const applyTemplate = (template) => {
    setAiForm({
      name: template.name,
      description: template.description,
      emoji: template.emoji || '🤖',
      avatarUrl: template.avatarUrl || '',
      systemPrompt: '', // Always blank — member writes their own custom System Prompt from scratch!
      welcomeMessage: template.welcomeMessage || '',
      starterQuestions: Array.isArray(template.starterQuestions) ? template.starterQuestions.join('\n') : '',
    });
    setSelectedPersonality(template.personality);
    setSelectedTone(template.tone);
    setSelectedFocus(template.focus);
    setShowTemplates(false);
  };

  const publishAI = async () => {
    if (!user) return;
    setPublishError('');

    if (!aiForm.name.trim()) {
      setPublishError('AI Name is required.');
      setCreateStep(0);
      return;
    }

    if (!aiForm.systemPrompt.trim()) {
      setPublishError('System Prompt is mandatory! Please define the core directive instructions for your AI.');
      setCreateStep(1);
      return;
    }

    try {
      setPublishing(true);
      const aiData = {
        name: aiForm.name.trim(),
        description: aiForm.description.trim(),
        emoji: aiForm.emoji || '🤖',
        avatarUrl: aiForm.avatarUrl || '',
        systemPrompt: aiForm.systemPrompt.trim(),
        creatorId: user.uid,
        creatorName: roleData?.displayName || roleData?.username || user.displayName || 'Member',
        personality: selectedPersonality,
        tone: selectedTone,
        focusAreas: selectedFocus,
        welcomeMessage: aiForm.welcomeMessage.trim(),
        starterQuestions: aiForm.starterQuestions.split('\n').map(q => q.trim()).filter(Boolean),
        status: 'published',
        createdAt: serverTimestamp(),
        totalChats: 0,
        avgRating: 0,
      };

      await addDoc(collection(db, 'custom_ais'), aiData);

      // Reset form & reload
      setActiveTab('my-ais');
      setCreateStep(0);
      setAiForm({
        name: '',
        description: '',
        emoji: '🤖',
        avatarUrl: '',
        systemPrompt: '',
        welcomeMessage: '',
        starterQuestions: '',
      });
      setShowTemplates(true);
      await fetchAIStudioData();
    } catch (error) {
      console.error('Failed to create AI:', error);
      setPublishError(`Failed to publish AI: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteAI = async (aiId) => {
    if (!window.confirm('Are you sure you want to delete this custom AI? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'custom_ais', aiId));
      setMyAIs(prev => prev.filter(ai => ai.id !== aiId));
    } catch (err) {
      console.error('Failed to delete AI:', err);
      alert('Delete failed: ' + err.message);
    }
  };

  const displayStats = stats || {
    totalAIs: myAIs.length,
    totalChats: myAIs.reduce((acc, curr) => acc + (curr.totalChats || 0), 0),
    followers: 0,
    avgRating: 0
  };

  return (
    <PageContainer>
      <PageHeader
        title="My AIs"
        description="Build, train, and deploy your custom AI assistants with custom avatars and system prompts."
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
          <Bot className="w-4 h-4" /> My AIs ({myAIs.length})
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
                  Beginner's Guide to Custom AI Studio
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
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-accent transition">Create New AI Assistant</h3>
                      <p className="text-xs sm:text-sm text-text-muted">Design a custom assistant with unique avatar, mandatory system prompt, and specific domain expertise.</p>
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

              <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">My Custom AIs</h2>
              {myAIs.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {myAIs.map((ai) => (
                    <div key={ai.id} className="group relative rounded-xl border border-border bg-surface/40 p-4 sm:p-6 backdrop-blur-sm transition hover:border-accent/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl border border-border overflow-hidden">
                          {ai.avatarUrl ? (
                            <SafeImage src={ai.avatarUrl} alt={ai.name} className="h-full w-full object-cover" />
                          ) : (
                            ai.emoji || '🤖'
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${ai.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'}`}>
                            {ai.status || 'Published'}
                          </span>
                          <button
                            onClick={() => handleDeleteAI(ai.id)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-white/10 transition"
                            title="Delete AI"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-accent transition">{ai.name || 'Untitled AI'}</h3>
                      <p className="text-xs text-text-muted mb-3 sm:mb-4 line-clamp-2">{ai.description || 'No description'}</p>
                      
                      {ai.systemPrompt && (
                        <div className="mb-3 rounded-lg bg-black/40 p-2.5 text-[11px] border border-white/5">
                          <span className="font-bold text-accent block mb-0.5">System Directive:</span>
                          <p className="text-text-soft line-clamp-2 italic">"{ai.systemPrompt}"</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-text-muted border-t border-border/50 pt-2 sm:pt-3">
                        <span>{ai.personality || 'Standard'} • {ai.tone || 'Friendly'}</span>
                        <span>{ai.totalChats?.toLocaleString() || '0'} chats</span>
                      </div>
                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <Link to={`/ai-os`} className="flex-1 bg-accent/20 hover:bg-accent/30 text-accent text-[10px] sm:text-xs font-bold py-2.5 rounded-lg text-center transition flex items-center justify-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" /> Launch Chat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Bot}
                  title="No AIs Created Yet"
                  description="Build your first custom AI assistant with a dedicated system prompt and avatar."
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
                Start with a Pre-Built Template
              </h3>
              <p className="mb-4 text-sm text-text-muted">Select a template to pre-fill identity, system prompts, and conversation starters.</p>
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
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${i <= createStep ? 'bg-accent text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-text-muted border border-border'}`}>
                      {i < createStep ? '✓' : <StepIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </div>
                    <span className="text-[10px] sm:text-xs text-text-muted hidden sm:block text-center">{s.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="w-full bg-white/5 rounded-full h-1">
              <div className="bg-accent h-1 rounded-full transition-all" style={{ width: `${((createStep + 1) / CREATE_STEPS.length) * 100}%` }}></div>
            </div>
          </div>

          {publishError && (
            <div className="mb-6 rounded-xl border border-status-danger/40 bg-status-danger/10 p-4 text-status-danger text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{publishError}</span>
            </div>
          )}

          <div className="bg-surface/40 border border-border rounded-2xl p-4 sm:p-8 backdrop-blur-sm min-h-[400px]">
            {/* Step 0: Identity & Avatar */}
            {createStep === 0 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Give your AI an identity & avatar</h2>
                <p className="text-text-muted text-sm sm:text-base">Provide a clear name, short description, and custom avatar image or emoji.</p>
                
                {/* Avatar Selection Mode */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Avatar Format</label>
                  <div className="flex gap-2 mb-4">
                    {[
                      { id: 'emoji', label: 'Emoji Avatar' },
                      { id: 'upload', label: 'Upload Image (IPFS)' },
                      { id: 'url', label: 'Image URL' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setAvatarUploadType(type.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${avatarUploadType === type.id ? 'bg-accent text-black border-accent' : 'bg-white/5 text-text-soft border-border hover:bg-white/10'}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-black/30 p-4 rounded-xl border border-border">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/5 border-2 border-dashed border-border flex items-center justify-center overflow-hidden shrink-0 relative">
                      {aiForm.avatarUrl ? (
                        <SafeImage src={aiForm.avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl sm:text-5xl">{aiForm.emoji}</span>
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-3">
                      {avatarUploadType === 'emoji' && (
                        <div>
                          <label className="block text-xs font-bold text-text-muted mb-1">Choose Emoji</label>
                          <input
                            type="text"
                            value={aiForm.emoji}
                            onChange={(e) => handleFormChange('emoji', e.target.value)}
                            maxLength={4}
                            placeholder="🤖"
                            className="w-24 bg-surface border border-border rounded-lg px-3 py-2 text-center text-xl text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                      )}

                      {avatarUploadType === 'upload' && (
                        <div>
                          <label className="block text-xs font-bold text-text-muted mb-1">Upload Avatar File (Image / PNG / JPG)</label>
                          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold cursor-pointer transition">
                            <Upload className="w-4 h-4" /> {uploadingAvatar ? 'Uploading to IPFS...' : 'Select File'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                              disabled={uploadingAvatar}
                            />
                          </label>
                          {aiForm.avatarUrl && <p className="text-[10px] text-emerald-400 mt-1">✓ Custom avatar uploaded successfully!</p>}
                        </div>
                      )}

                      {avatarUploadType === 'url' && (
                        <div>
                          <label className="block text-xs font-bold text-text-muted mb-1">Custom Image URL</label>
                          <input
                            type="url"
                            value={aiForm.avatarUrl}
                            onChange={(e) => handleFormChange('avatarUrl', e.target.value)}
                            placeholder="https://example.com/my-avatar.png"
                            className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">AI Assistant Name <span className="text-status-danger">*</span></label>
                  <input
                    type="text"
                    value={aiForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="e.g., Physics Guru, Code Reviewer Pro"
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Short Description</label>
                  <textarea
                    value={aiForm.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={3}
                    placeholder="Describe what this AI specializes in and how it helps users..."
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 1: System Prompt (Manual Crafting - Primary Directive) */}
            {createStep === 1 && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-accent" /> Write Your System Prompt <span className="text-status-danger">*</span>
                  </h2>
                  <p className="text-text-muted text-sm sm:text-base mt-1">
                    The System Prompt is the **core heart** of your AI assistant. Write the full directive, persona, behavioral rules, and constraints yourself.
                  </p>
                </div>

                {/* Prompt Writing Tips Banner */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs space-y-2">
                  <p className="font-bold text-accent text-sm flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Recommended System Prompt Structure:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-text-muted">
                    <li><strong className="text-white">Role & Persona:</strong> State who the AI is (e.g. <em>"You are an expert Physics tutor named Newton..."</em>)</li>
                    <li><strong className="text-white">Primary Goal:</strong> Define what it achieves for the user (e.g. <em>"Help students understand concepts intuitively..."</em>)</li>
                    <li><strong className="text-white">Strict Rules:</strong> What it MUST or MUST NOT do (e.g. <em>"Never give direct answers immediately; ask guiding questions..."</em>)</li>
                    <li><strong className="text-white">Response Format:</strong> How outputs should be formatted (e.g. <em>"Use Markdown headers, bullet points, and code blocks..."</em>)</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Custom System Prompt Directive
                  </label>
                  <textarea
                    value={aiForm.systemPrompt}
                    onChange={(e) => handleFormChange('systemPrompt', e.target.value)}
                    rows={12}
                    placeholder={`Write your original System Prompt instructions here...

Example format to write:
1. Role: You are...
2. Objective: Your goal is to...
3. Rules & Boundaries: Always... Never...
4. Response Style: Format output with...`}
                    className="w-full bg-black/70 border border-accent/40 rounded-xl p-4 text-sm text-white font-mono leading-relaxed focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition shadow-inner"
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                    <span>Craft your own custom directive instructions. This dictates all AI responses.</span>
                    <span className={aiForm.systemPrompt.trim().length > 0 ? "text-accent font-bold" : "text-status-danger"}>
                      {aiForm.systemPrompt.trim().length} characters
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Welcome Experience */}
            {createStep === 2 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Welcome Experience & Starters</h2>
                <p className="text-text-muted text-sm sm:text-base">Design the greeting and initial conversation prompt chips users see.</p>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">First Message (Greeting)</label>
                  <textarea
                    value={aiForm.welcomeMessage}
                    onChange={(e) => handleFormChange('welcomeMessage', e.target.value)}
                    rows={3}
                    placeholder="Hi! I'm your AI assistant. Ask me anything about physics, coding, or strategy!"
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
                    className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Personality & Tone */}
            {createStep === 3 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Personality & Tone</h2>
                <p className="text-text-muted text-sm sm:text-base">Define the communication voice and tone.</p>
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Personality Archetype</label>
                  <div className="flex flex-wrap gap-2">
                    {PERSONALITIES.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPersonality(p)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition ${selectedPersonality === p ? 'bg-accent text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Tone of Voice</label>
                  <div className="flex flex-wrap gap-2">
                    {TONES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTone(t)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition ${selectedTone === t ? 'bg-accent text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Focus & Publish */}
            {createStep === 4 && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white">Review & Publish Assistant</h2>
                <p className="text-text-muted text-sm sm:text-base">Select domain focus areas and deploy your custom AI.</p>
                
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Focus & Expertise Areas</label>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {FOCUS_AREAS.map(area => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => toggleFocus(area)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition ${selectedFocus.includes(area) ? 'bg-accent text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 sm:p-6 space-y-4 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden text-3xl border border-border">
                      {aiForm.avatarUrl ? (
                        <SafeImage src={aiForm.avatarUrl} alt={aiForm.name} className="w-full h-full object-cover" />
                      ) : (
                        aiForm.emoji || '🤖'
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{aiForm.name || 'Untitled AI'}</p>
                      <p className="text-xs text-text-muted">{aiForm.description || 'No description provided.'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-border/50 pt-4">
                    <div>
                      <p className="text-text-muted">Personality & Tone</p>
                      <p className="text-white font-bold">{selectedPersonality} • {selectedTone}</p>
                    </div>
                    <div>
                      <p className="text-text-muted">Focus Areas</p>
                      <p className="text-white font-bold">{selectedFocus.join(', ') || 'General'}</p>
                    </div>
                  </div>

                  {aiForm.systemPrompt && (
                    <div className="rounded-lg bg-black/50 p-3 text-xs border border-white/10 font-mono">
                      <span className="font-bold text-accent block mb-1">System Directive:</span>
                      <p className="text-text-soft whitespace-pre-wrap max-h-32 overflow-y-auto">{aiForm.systemPrompt}</p>
                    </div>
                  )}
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
                disabled={publishing}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> {createStep === 0 ? 'Cancel' : 'Previous'}
              </Button>
              
              {createStep === CREATE_STEPS.length - 1 ? (
                <Button
                  onClick={publishAI}
                  disabled={publishing}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold shadow-[0_0_25px_rgba(74,222,128,0.4)]"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Rocket className="mr-2 h-4 w-4" /> Publish Assistant
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setCreateStep(createStep + 1)}
                  className="flex-1 bg-gradient-to-r from-accent to-accent/80 text-black font-bold shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                >
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
