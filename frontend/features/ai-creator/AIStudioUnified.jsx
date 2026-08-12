import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  AlertCircle,
  BookOpen,
  Bot,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Loader2,
  MessageSquare,
  Plus,
  Rocket,
  Search,
  Smile,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  Wand2,
  Zap,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import Button from '@frontend/components/ui/Button';
import EmptyState from '@frontend/components/ui/EmptyState';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { SafeImage } from '@frontend/features/creative/CreativityPage';
import { db } from '@services/firebase/config';
import { isIPFSConfigured, uploadProofFile } from '@services/storage/ipfs';
import { PERMISSIONS } from '@shared/permissions/permissions';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CREATE_STEPS = [
  { label: 'Identity', icon: Bot },
  { label: 'Prompt', icon: FileText },
  { label: 'Welcome', icon: Smile },
  { label: 'Voice', icon: Brain },
  { label: 'Publish', icon: Rocket },
];

const PERSONALITIES = ['Professional', 'Friendly', 'Funny', 'Teacher', 'Scientist', 'Coach', 'Mentor', 'Creative', 'Leader', 'Motivator', 'Researcher', 'Developer'];
const TONES = ['Formal', 'Casual', 'Friendly', 'Energetic', 'Motivational', 'Technical', 'Simple', 'Beginner Friendly', 'Expert Level'];
const FOCUS_AREAS = ['Physics', 'Chemistry', 'Biology', 'Coding', 'AI', 'Research', 'Business', 'Marketing', 'Startups', 'Leadership', 'Innovation', 'Education', 'Design', 'Writing', 'Math'];

const SYSTEM_PROMPT_TEMPLATES = [
  {
    name: 'Patient Tutor',
    icon: BookOpen,
    prompt: `You are an empathetic, patient, and highly knowledgeable AI Tutor.
Your goal is to break down complex academic topics into clear, intuitive step-by-step explanations.
Always verify student understanding before advancing, provide real-world analogies, and encourage critical thinking.`,
  },
  {
    name: 'Senior Tech Architect',
    icon: Zap,
    prompt: `You are a Senior Software Architect and Tech Reviewer.
Your goal is to assist developers with clean code principles, system design, bug diagnosis, and performance optimization.
Always provide idiomatic, type-safe code snippets with concise architectural rationale.`,
  },
  {
    name: 'Startup Founder Coach',
    icon: Rocket,
    prompt: `You are an experienced Tech Founder & Startup Mentor.
Your goal is to evaluate business ideas, refine pitch decks, plan growth marketing, and offer tactical product strategy.
Be direct, strategic, data-driven, and highly encouraging.`,
  },
  {
    name: 'Research Scientist',
    icon: Database,
    prompt: `You are a rigorous Scientific Research Assistant.
Your goal is to assist with hypothesis formulation, literature synthesis, experimental design, and data analysis.
Maintain academic precision and cite relevant scientific principles.`,
  },
  {
    name: 'Creative Muse',
    icon: Wand2,
    prompt: `You are an imaginative Creative Director and Storyteller.
Your goal is to spark artistic inspiration, craft compelling narrative hooks, brainstorm design concepts, and polish copy.
Use rich, vivid imagery and bold creative suggestions.`,
  },
];

const AI_TEMPLATES = [
  {
    id: 'tutor',
    name: 'Study Tutor',
    initials: 'ST',
    icon: BookOpen,
    description: 'Helps students learn any subject with patience and clear explanations',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[0].prompt,
    personality: 'Teacher',
    tone: 'Beginner Friendly',
    focus: ['Education', 'Writing'],
    welcomeMessage: 'Hi! I\'m your personal tutor. What subject would you like to explore today?',
    starterQuestions: ['Explain this concept simply', 'Give me practice problems', 'Help me understand this topic'],
  },
  {
    id: 'coding-buddy',
    name: 'Coding Buddy',
    initials: 'CB',
    icon: Zap,
    description: 'Assists with programming, debugging, and code reviews',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[1].prompt,
    personality: 'Developer',
    tone: 'Technical',
    focus: ['Coding', 'AI'],
    welcomeMessage: 'Hey! Ready to code? I can help you write, debug, and improve your code.',
    starterQuestions: ['Review my code', 'Help debug this error', 'Explain this function'],
  },
  {
    id: 'business-coach',
    name: 'Business Coach',
    initials: 'BC',
    icon: Rocket,
    description: 'Guides entrepreneurs with startup advice and strategy',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[2].prompt,
    personality: 'Leader',
    tone: 'Motivational',
    focus: ['Business', 'Startups', 'Marketing'],
    welcomeMessage: 'Welcome! Let\'s build something amazing together. What\'s your business challenge?',
    starterQuestions: ['Improve my business model', 'Marketing strategy ideas', 'Pitch deck feedback'],
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    initials: 'CW',
    icon: Wand2,
    description: 'Helps with storytelling, content creation, and creative writing',
    systemPrompt: SYSTEM_PROMPT_TEMPLATES[4].prompt,
    personality: 'Creative',
    tone: 'Friendly',
    focus: ['Writing', 'Design'],
    welcomeMessage: 'Hello storyteller! I\'m here to help bring your creative ideas to life.',
    starterQuestions: ['Brainstorm story ideas', 'Improve my writing', 'Create compelling content'],
  },
];

const GUIDE_STEPS = [
  {
    icon: Lightbulb,
    title: 'Define the job',
    description: 'Name the assistant, give it a visual identity, and make its purpose obvious.',
  },
  {
    icon: FileText,
    title: 'Write the directive',
    description: 'The system prompt stays mandatory so every AI has clear behavior rules.',
  },
  {
    icon: Brain,
    title: 'Shape the voice',
    description: 'Tune personality, tone, and focus areas before publishing.',
  },
  {
    icon: MessageSquare,
    title: 'Launch conversations',
    description: 'Open a live chat from any AI card once the assistant is published.',
  },
];

const DEFAULT_FORM = {
  name: '',
  description: '',
  emoji: 'AI',
  avatarUrl: '',
  systemPrompt: '',
  welcomeMessage: '',
  starterQuestions: '',
};

const TAB_ITEMS = [
  { id: 'my-ais', label: 'My AIs', icon: Bot },
  { id: 'create', label: 'Create AI', icon: Sparkles, memberOnly: true },
  { id: 'training', label: 'Training Center', icon: BookOpen },
];

const aiStudioStyles = `
  .ai-studio-shell {
    position: relative;
    overflow: hidden;
    color: #eef7ff;
  }

  .ai-studio-shell::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at 8% 10%, rgba(0, 245, 255, 0.24), transparent 24rem),
      radial-gradient(circle at 85% 8%, rgba(255, 54, 171, 0.22), transparent 26rem),
      radial-gradient(circle at 72% 82%, rgba(132, 92, 255, 0.24), transparent 30rem),
      radial-gradient(circle at 18% 88%, rgba(30, 255, 188, 0.13), transparent 28rem),
      linear-gradient(135deg, rgba(3, 7, 24, 0.94), rgba(8, 11, 38, 0.96) 42%, rgba(18, 8, 37, 0.97));
    z-index: -1;
  }

  .ai-glass {
    border: 1px solid rgba(147, 197, 253, 0.22);
    background:
      linear-gradient(145deg, rgba(21, 28, 64, 0.86), rgba(6, 23, 49, 0.78) 42%, rgba(37, 17, 58, 0.78)),
      radial-gradient(circle at top left, rgba(34, 211, 238, 0.12), transparent 22rem),
      radial-gradient(circle at bottom right, rgba(244, 114, 182, 0.12), transparent 20rem);
    box-shadow: 0 26px 88px rgba(0, 0, 0, 0.34), 0 0 42px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(18px);
  }

  .ai-card-hover {
    transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }

  .ai-card-hover:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.38);
    background:
      linear-gradient(145deg, rgba(27, 39, 85, 0.92), rgba(9, 39, 70, 0.82) 42%, rgba(55, 20, 77, 0.84)),
      radial-gradient(circle at 18% 0%, rgba(34, 211, 238, 0.2), transparent 17rem),
      radial-gradient(circle at 92% 100%, rgba(244, 114, 182, 0.18), transparent 17rem);
    box-shadow: 0 26px 78px rgba(15, 23, 42, 0.42), 0 0 34px rgba(34, 211, 238, 0.1), 0 0 0 1px rgba(244, 114, 182, 0.08);
  }

  .ai-premium-button {
    background: linear-gradient(135deg, #22d3ee 0%, #8b5cf6 42%, #f472b6 72%, #bef264 100%);
    color: #06111f;
    box-shadow: 0 20px 48px rgba(34, 211, 238, 0.2), 0 0 34px rgba(244, 114, 182, 0.16);
  }

  .ai-hero-title {
    background: linear-gradient(90deg, #ffffff 0%, #bff9ff 32%, #d7c8ff 62%, #ffc1e2 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .ai-rainbow-orb {
    background:
      radial-gradient(circle at 28% 24%, rgba(255,255,255,0.58), transparent 0.9rem),
      conic-gradient(from 140deg, #22d3ee, #8b5cf6, #f472b6, #bef264, #22d3ee);
    box-shadow: 0 18px 42px rgba(34, 211, 238, 0.18), inset 0 1px 0 rgba(255,255,255,0.22);
  }

  .ai-soft-input {
    border: 1px solid rgba(148, 163, 184, 0.2);
    background: rgba(6, 12, 27, 0.62);
    color: #f8fbff;
    transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .ai-soft-input:focus {
    border-color: rgba(244, 114, 182, 0.74);
    box-shadow: 0 0 0 4px rgba(244, 114, 182, 0.12), 0 0 24px rgba(34, 211, 238, 0.08);
    outline: none;
  }

  .ai-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(103, 232, 249, 0.34) transparent;
  }

  .ai-skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(34,211,238,0.16), rgba(244,114,182,0.13), rgba(255,255,255,0.06));
    background-size: 220% 100%;
    animation: ai-shimmer 1.1s ease-in-out infinite;
  }

  @keyframes ai-shimmer {
    0% { background-position: 180% 0; }
    100% { background-position: -40% 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-card-hover,
    .ai-premium-button,
    .ai-soft-input,
    .ai-skeleton {
      animation: none !important;
      transition: none !important;
    }

    .ai-card-hover:hover {
      transform: none;
    }
  }
`;

function formatNumber(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric.toLocaleString() : '0';
}

function formatRating(value) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : '0.0';
}

function getFocusList(ai) {
  return Array.isArray(ai?.focusAreas) ? ai.focusAreas.filter(Boolean) : [];
}

function AvatarOrb({ ai, size = 'md', className }) {
  const sizes = {
    sm: 'h-12 w-12 text-xl',
    md: 'h-16 w-16 text-2xl',
    lg: 'h-24 w-24 text-4xl',
  };

  return (
    <div className={cn(
      'ai-rainbow-orb relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/25 font-black text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]',
      sizes[size],
      className
    )}>
      {ai?.avatarUrl ? (
        <SafeImage src={ai.avatarUrl} alt={ai.name || 'AI avatar'} className="h-full w-full object-cover" />
      ) : (
        <span className="leading-none">{ai?.emoji || 'AI'}</span>
      )}
      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-slate-950 bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.75)]" />
    </div>
  );
}

function StatTile({ icon: Icon, label, value, accent = 'text-cyan-200' }) {
  return (
    <div className="ai-glass ai-card-hover rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-white sm:text-3xl">{value}</p>
        </div>
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/18 via-violet-300/14 to-pink-300/18', accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ChoiceChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-[40px] rounded-full border px-3.5 py-2 text-xs font-extrabold transition sm:text-sm',
        active
          ? 'border-white/35 bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 text-slate-950 shadow-[0_12px_28px_rgba(244,114,182,0.16)]'
          : 'border-white/10 bg-white/[0.055] text-slate-200 hover:border-pink-200/35 hover:bg-white/[0.085]'
      )}
    >
      {children}
    </button>
  );
}

function SectionTitle({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.2em] text-cyan-200">{eyebrow}</p>}
        <h2 className="text-xl font-black text-white sm:text-2xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function AIStudioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="ai-glass rounded-2xl p-5">
            <div className="ai-skeleton mb-5 h-10 w-10 rounded-2xl" />
            <div className="ai-skeleton h-8 w-20 rounded-xl" />
            <div className="ai-skeleton mt-3 h-3 w-28 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="ai-glass rounded-3xl p-5">
            <div className="flex items-center gap-4">
              <div className="ai-skeleton h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="ai-skeleton h-5 w-2/3 rounded-full" />
                <div className="ai-skeleton h-3 w-1/2 rounded-full" />
              </div>
            </div>
            <div className="ai-skeleton mt-5 h-16 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
  const [aiForm, setAiForm] = useState(DEFAULT_FORM);
  const [avatarUploadType, setAvatarUploadType] = useState('emoji');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAIStudioData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

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
      } catch {
        // Stats are optional; the page can compute a local summary.
      }

      try {
        const aisQuery = query(
          collection(db, 'custom_ais'),
          where('creatorId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const aisSnap = await getDocs(aisQuery);

        setMyAIs(aisSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      } catch (aisError) {
        console.error('Failed to load custom AIs:', aisError);
      }
    } catch (error) {
      console.error('Failed to fetch AI Studio data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAIStudioData();
  }, [fetchAIStudioData]);

  const displayStats = useMemo(() => {
    const fallback = {
      totalAIs: myAIs.length,
      totalChats: myAIs.reduce((acc, curr) => acc + (curr.totalChats || 0), 0),
      followers: 0,
      avgRating: myAIs.length
        ? myAIs.reduce((acc, curr) => acc + (curr.avgRating || 0), 0) / myAIs.length
        : 0,
    };

    return stats || fallback;
  }, [myAIs, stats]);

  const filteredAIs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return myAIs.filter(ai => {
      const status = (ai.status || 'published').toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const haystack = [
        ai.name,
        ai.description,
        ai.personality,
        ai.tone,
        ...getFocusList(ai),
      ].join(' ').toLowerCase();

      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [myAIs, searchTerm, statusFilter]);

  const statusOptions = useMemo(() => {
    const statuses = new Set(myAIs.map(ai => (ai.status || 'published').toLowerCase()));
    return ['all', ...Array.from(statuses)];
  }, [myAIs]);

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
      emoji: template.initials || 'AI',
      avatarUrl: '',
      systemPrompt: '',
      welcomeMessage: template.welcomeMessage || '',
      starterQuestions: Array.isArray(template.starterQuestions) ? template.starterQuestions.join('\n') : '',
    });
    setSelectedPersonality(template.personality);
    setSelectedTone(template.tone);
    setSelectedFocus(template.focus);
    setShowTemplates(false);
  };

  const resetForm = () => {
    setCreateStep(0);
    setAiForm(DEFAULT_FORM);
    setSelectedPersonality('Professional');
    setSelectedTone('Friendly');
    setSelectedFocus([]);
    setAvatarUploadType('emoji');
    setPublishError('');
    setShowTemplates(true);
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
      setPublishError('System Prompt is mandatory. Please define the core directive instructions for your AI.');
      setCreateStep(1);
      return;
    }

    try {
      setPublishing(true);
      const aiData = {
        name: aiForm.name.trim(),
        description: aiForm.description.trim(),
        emoji: aiForm.emoji || 'AI',
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

      setActiveTab('my-ais');
      resetForm();
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

  const renderTabs = () => (
    <div className="ai-glass ai-scrollbar mb-8 flex gap-2 overflow-x-auto rounded-2xl p-2">
      {TAB_ITEMS.filter(tab => !tab.memberOnly || isApprovedMember).map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        const label = tab.id === 'my-ais' ? `${tab.label} (${myAIs.length})` : tab.label;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition sm:px-5',
              active
                ? 'bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 text-slate-950 shadow-[0_14px_32px_rgba(244,114,182,0.16)]'
                : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );

  const renderHero = () => (
    <section className="ai-glass mb-6 overflow-hidden rounded-[1.75rem] p-5 sm:p-7 lg:p-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:items-center">
        <div className="min-w-0">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-fuchsia-200/25 bg-gradient-to-r from-cyan-300/12 via-violet-300/12 to-pink-300/12 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" />
            Personal AI Workspace
          </div>
          <h1 className="ai-hero-title max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Build, tune, and launch AI assistants with a workspace that feels calm and powerful.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Manage your custom AIs, open live chats, design avatars, and publish assistants using your real BeastBuck member data.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {isApprovedMember ? (
              <Button
                className="ai-premium-button w-full text-sm font-black sm:w-auto"
                onClick={() => setActiveTab('create')}
              >
                <Plus className="h-4 w-4" /> Create New AI
              </Button>
            ) : (
              <Link to="/membership/apply" className="w-full sm:w-auto">
                <Button className="ai-premium-button w-full text-sm font-black">
                  <Star className="h-4 w-4" /> Apply for Membership
                </Button>
              </Link>
            )}
            <Link
              to="/ais"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-black text-white transition hover:border-cyan-200/35 hover:bg-white/[0.09] sm:w-auto"
            >
              <Layers className="h-4 w-4" />
              Explore Marketplace
            </Link>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/15 bg-gradient-to-br from-cyan-300/10 via-violet-300/10 to-pink-300/10 p-4 shadow-[0_22px_58px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Workspace signal</p>
              <p className="mt-1 text-2xl font-black text-white">{formatNumber(displayStats.totalChats)} chats</p>
            </div>
            <div className="ai-rainbow-orb flex h-12 w-12 items-center justify-center rounded-2xl text-slate-950">
              <Bot className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {['Prompt', 'Voice', 'Focus'].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.065] p-3 text-center">
                <p className="text-lg font-black text-white">{index + 1}</p>
                <p className="text-[0.65rem] font-bold text-slate-400">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-pink-200/20 bg-gradient-to-r from-cyan-300/8 via-violet-300/10 to-pink-300/10 p-4">
            <p className="text-sm font-bold text-white">System prompts stay mandatory</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Every published assistant keeps a clear directive, persona, and behavior contract.</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderMyAIs = () => {
    if (loading) return <AIStudioSkeleton />;

    return (
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile icon={Bot} label="My AIs" value={formatNumber(displayStats.totalAIs)} accent="text-violet-200" />
          <StatTile icon={Sparkles} label="Total Chats" value={formatNumber(displayStats.totalChats)} accent="text-cyan-200" />
          <StatTile icon={Users} label="Followers" value={formatNumber(displayStats.followers)} accent="text-blue-200" />
          <StatTile icon={Star} label="Avg Rating" value={formatRating(displayStats.avgRating)} accent="text-amber-200" />
        </div>

        <section className="ai-glass rounded-[1.5rem] p-4 sm:p-5">
          <SectionTitle
            eyebrow="Creator guide"
            title="A clean path from idea to live assistant"
            description="The workflow stays simple: identity, directive, welcome flow, voice, and publish."
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {GUIDE_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/18 via-violet-300/16 to-pink-300/16 text-cyan-50">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-black text-slate-500">0{index + 1}</span>
                  </div>
                  <h3 className="font-black text-white">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle
            eyebrow="Your assistants"
            title="My custom AIs"
            description="Search, launch, and manage the assistants you created."
            action={
              isApprovedMember && (
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-white/[0.07] px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-white/[0.1] sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  New assistant
                </button>
              )
            }
          />

          {myAIs.length > 0 && (
            <div className="ai-glass mb-5 grid gap-3 rounded-2xl p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="relative block min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search your assistants by name, prompt style, or focus..."
                  className="ai-soft-input min-h-[46px] w-full rounded-xl pl-11 pr-4 text-sm"
                />
              </label>
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto ai-scrollbar">
                <Filter className="hidden h-4 w-4 shrink-0 text-slate-500 sm:block" />
                {statusOptions.map(option => (
                  <ChoiceChip key={option} active={statusFilter === option} onClick={() => setStatusFilter(option)}>
                    {option === 'all' ? 'All status' : option}
                  </ChoiceChip>
                ))}
              </div>
            </div>
          )}

          {myAIs.length === 0 ? (
            <div className="ai-glass rounded-[1.5rem]">
              <EmptyState
                icon={Bot}
                title="No AIs created yet"
                description="Build your first custom AI assistant with a dedicated system prompt and avatar."
                action={
                  isApprovedMember ? (
                    <Button onClick={() => setActiveTab('create')} className="ai-premium-button">
                      <Plus className="h-4 w-4" /> Create Your First AI
                    </Button>
                  ) : (
                    <Link to="/membership/apply">
                      <Button className="ai-premium-button">
                        <Star className="h-4 w-4" /> Apply for Membership
                      </Button>
                    </Link>
                  )
                }
              />
            </div>
          ) : filteredAIs.length === 0 ? (
            <div className="ai-glass rounded-[1.5rem]">
              <EmptyState
                icon={Search}
                title="No assistants match that view"
                description="Clear your search or choose another status filter to see more AIs."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="min-h-[44px] rounded-xl bg-white/[0.08] px-5 py-2 text-sm font-black text-white transition hover:bg-white/[0.12]"
                  >
                    Clear filters
                  </button>
                }
              />
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredAIs.map((ai) => {
                const focusList = getFocusList(ai);
                return (
                  <article key={ai.id} className="ai-glass ai-card-hover flex min-w-0 flex-col rounded-[1.5rem] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <AvatarOrb ai={ai} />
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="max-w-[9rem] truncate rounded-full border border-lime-200/25 bg-lime-300/12 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-lime-100">
                          {ai.status || 'published'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAI(ai.id)}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-200"
                          title="Delete AI"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 min-w-0">
                      <h3 className="truncate text-xl font-black text-white">{ai.name || 'Untitled AI'}</h3>
                      <p className="mt-1 text-sm font-semibold text-cyan-100/80">{ai.personality || 'Standard'} / {ai.tone || 'Friendly'}</p>
                      <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">{ai.description || 'No description provided.'}</p>
                    </div>

                    {ai.systemPrompt && (
                      <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                        <p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-200">Directive</p>
                        <p className="line-clamp-2 text-xs leading-5 text-slate-400">{ai.systemPrompt}</p>
                      </div>
                    )}

                    <div className="mt-4 flex min-h-[2rem] flex-wrap gap-2">
                      {(focusList.length ? focusList.slice(0, 3) : ['General']).map(area => (
                        <span key={area} className="rounded-full border border-white/10 bg-white/[0.055] px-2.5 py-1 text-[0.68rem] font-bold text-slate-300">
                          {area}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-cyan-200" />
                        {formatNumber(ai.totalChats)} chats
                      </span>
                      <span className="flex items-center justify-end gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-200" />
                        {formatRating(ai.avgRating)}
                      </span>
                    </div>

                    <Link
                      to={`/ais/${ai.id}/chat`}
                      className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 px-4 py-2 text-sm font-black text-slate-950 shadow-[0_16px_36px_rgba(34,211,238,0.14)] transition hover:brightness-110"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Launch Chat
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderCreate = () => (
    <div className="mx-auto max-w-5xl">
      {showTemplates && createStep === 0 && (
        <section className="ai-glass mb-6 rounded-[1.5rem] p-4 sm:p-6">
          <SectionTitle
            eyebrow="Fast start"
            title="Choose a polished starter profile"
            description="Templates prefill identity, tone, focus, welcome message, and starter questions. The system prompt still stays blank so members write their own directive."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {AI_TEMPLATES.map(template => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="ai-card-hover flex min-w-0 items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/18 via-violet-300/16 to-pink-300/16 text-cyan-50">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-black text-white">{template.name}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">{template.description}</span>
                  </span>
                  <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-slate-500" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowTemplates(false)}
            className="mt-4 min-h-[40px] text-sm font-black text-cyan-200 transition hover:text-white"
          >
            Create from scratch
          </button>
        </section>
      )}

      <section className="ai-glass rounded-[1.5rem] p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="ai-scrollbar flex gap-3 overflow-x-auto pb-3">
            {CREATE_STEPS.map((step, index) => {
              const Icon = step.icon;
              const active = index === createStep;
              const complete = index < createStep;
              return (
                <div key={step.label} className="flex min-w-[92px] flex-1 flex-col items-center gap-2">
                  <div className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl border text-sm font-black transition',
                    active || complete
                      ? 'border-white/35 bg-gradient-to-r from-cyan-200 via-violet-200 to-pink-200 text-slate-950'
                      : 'border-white/10 bg-white/[0.055] text-slate-400'
                  )}>
                    {complete ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn('text-center text-[0.68rem] font-black uppercase tracking-[0.12em]', active ? 'text-cyan-100' : 'text-slate-500')}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-200 via-violet-300 to-fuchsia-200 transition-all duration-300"
              style={{ width: `${((createStep + 1) / CREATE_STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {publishError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-300/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{publishError}</span>
          </div>
        )}

        <div className="min-h-[390px]">
          {createStep === 0 && (
            <div className="space-y-6">
              <SectionTitle
                title="Give your AI a memorable identity"
                description="Provide a clear name, short description, and a compact visual mark that works on cards and chat screens."
              />

              <div>
                <label className="mb-3 block text-sm font-black text-white">Avatar format</label>
                <div className="ai-scrollbar flex gap-2 overflow-x-auto pb-2">
                  {[
                    { id: 'emoji', label: 'Text mark', icon: Bot },
                    { id: 'upload', label: 'Upload image', icon: Upload },
                    { id: 'url', label: 'Image URL', icon: ImageIcon },
                  ].map(type => {
                    const Icon = type.icon;
                    return (
                      <ChoiceChip key={type.id} active={avatarUploadType === type.id} onClick={() => setAvatarUploadType(type.id)}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {type.label}
                        </span>
                      </ChoiceChip>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                  <AvatarOrb ai={aiForm} size="lg" className="mx-auto sm:mx-0" />
                  <div className="min-w-0 space-y-3">
                    {avatarUploadType === 'emoji' && (
                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Text mark</label>
                        <input
                          type="text"
                          value={aiForm.emoji}
                          onChange={(event) => handleFormChange('emoji', event.target.value)}
                          maxLength={4}
                          placeholder="AI"
                          className="ai-soft-input min-h-[44px] w-28 rounded-xl px-3 text-center text-xl font-black"
                        />
                      </div>
                    )}

                    {avatarUploadType === 'upload' && (
                      <div>
                        <p className="mb-2 text-xs font-bold text-slate-400">
                          {isIPFSConfigured() ? 'Upload an image avatar to IPFS.' : 'IPFS is not configured; uploads may fail until storage is connected.'}
                        </p>
                        <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-black text-white transition hover:bg-white/[0.1]">
                          {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {uploadingAvatar ? 'Uploading...' : 'Select File'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => event.target.files?.[0] && handleAvatarUpload(event.target.files[0])}
                            disabled={uploadingAvatar}
                          />
                        </label>
                        {aiForm.avatarUrl && <p className="mt-2 text-xs font-bold text-emerald-200">Custom avatar uploaded successfully.</p>}
                      </div>
                    )}

                    {avatarUploadType === 'url' && (
                      <div>
                        <label className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Custom image URL</label>
                        <input
                          type="url"
                          value={aiForm.avatarUrl}
                          onChange={(event) => handleFormChange('avatarUrl', event.target.value)}
                          placeholder="https://example.com/my-avatar.png"
                          className="ai-soft-input min-h-[44px] w-full rounded-xl px-4 text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-white">AI Assistant Name <span className="text-rose-200">*</span></span>
                  <input
                    type="text"
                    value={aiForm.name}
                    onChange={(event) => handleFormChange('name', event.target.value)}
                    placeholder="e.g., Physics Guru, Code Reviewer Pro"
                    className="ai-soft-input min-h-[48px] w-full rounded-xl px-4 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-white">Short Description</span>
                  <textarea
                    value={aiForm.description}
                    onChange={(event) => handleFormChange('description', event.target.value)}
                    rows={3}
                    placeholder="Describe what this AI specializes in and how it helps users..."
                    className="ai-soft-input w-full resize-none rounded-xl px-4 py-3 text-sm leading-6"
                  />
                </label>
              </div>
            </div>
          )}

          {createStep === 1 && (
            <div className="space-y-6">
              <SectionTitle
                title="Write the system prompt"
                description="This mandatory directive defines the assistant persona, goals, rules, limits, and output style."
              />
              <div className="rounded-2xl border border-cyan-200/18 bg-cyan-200/8 p-4">
                <p className="flex items-center gap-2 text-sm font-black text-cyan-100">
                  <Lightbulb className="h-4 w-4" />
                  Recommended structure
                </p>
                <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-300 sm:grid-cols-2">
                  {['Role and persona', 'Primary goal', 'Strict rules and boundaries', 'Response format'].map(item => (
                    <span key={item} className="rounded-xl bg-white/[0.055] px-3 py-2">{item}</span>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-white">Custom System Prompt Directive</span>
                <textarea
                  value={aiForm.systemPrompt}
                  onChange={(event) => handleFormChange('systemPrompt', event.target.value)}
                  rows={12}
                  placeholder={`Write your original System Prompt instructions here...

Example:
1. Role: You are...
2. Objective: Your goal is to...
3. Rules: Always... Never...
4. Response Style: Format output with...`}
                  className="ai-soft-input w-full resize-y rounded-2xl px-4 py-4 font-mono text-sm leading-6"
                />
              </label>
              <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Craft your own custom directive instructions. This controls AI behavior.</span>
                <span className={cn('font-black', aiForm.systemPrompt.trim().length > 0 ? 'text-cyan-200' : 'text-rose-200')}>
                  {aiForm.systemPrompt.trim().length} characters
                </span>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-6">
              <SectionTitle
                title="Design the first conversation"
                description="Set a helpful greeting and starter prompts so users know exactly how to begin."
              />
              <label className="block">
                <span className="mb-2 block text-sm font-black text-white">First Message</span>
                <textarea
                  value={aiForm.welcomeMessage}
                  onChange={(event) => handleFormChange('welcomeMessage', event.target.value)}
                  rows={3}
                  placeholder="Hi! I'm your AI assistant. Ask me anything about physics, coding, or strategy."
                  className="ai-soft-input w-full resize-none rounded-xl px-4 py-3 text-sm leading-6"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-black text-white">Starter Questions (one per line)</span>
                <textarea
                  value={aiForm.starterQuestions}
                  onChange={(event) => handleFormChange('starterQuestions', event.target.value)}
                  rows={5}
                  placeholder={"Explain Newton's laws\nWhat is quantum entanglement?\nHelp me solve a momentum problem"}
                  className="ai-soft-input w-full resize-none rounded-xl px-4 py-3 font-mono text-sm leading-6"
                />
              </label>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-6">
              <SectionTitle
                title="Choose personality and tone"
                description="Make the assistant feel intentional by matching its style to its job."
              />
              <div>
                <label className="mb-3 block text-sm font-black text-white">Personality Archetype</label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITIES.map(personality => (
                    <ChoiceChip key={personality} active={selectedPersonality === personality} onClick={() => setSelectedPersonality(personality)}>
                      {personality}
                    </ChoiceChip>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-3 block text-sm font-black text-white">Tone of Voice</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(tone => (
                    <ChoiceChip key={tone} active={selectedTone === tone} onClick={() => setSelectedTone(tone)}>
                      {tone}
                    </ChoiceChip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {createStep === 4 && (
            <div className="space-y-6">
              <SectionTitle
                title="Review and publish"
                description="Select focus areas and confirm the assistant profile before publishing it to your workspace."
              />
              <div>
                <label className="mb-3 block text-sm font-black text-white">Focus and Expertise Areas</label>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_AREAS.map(area => (
                    <ChoiceChip key={area} active={selectedFocus.includes(area)} onClick={() => toggleFocus(area)}>
                      {area}
                    </ChoiceChip>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4 sm:p-5">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                  <AvatarOrb ai={aiForm} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xl font-black text-white">{aiForm.name || 'Untitled AI'}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-400">{aiForm.description || 'No description provided.'}</p>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Voice</p>
                    <p className="mt-1 font-bold text-white">{selectedPersonality} / {selectedTone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Focus</p>
                    <p className="mt-1 font-bold text-white">{selectedFocus.join(', ') || 'General'}</p>
                  </div>
                </div>
                {aiForm.systemPrompt && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-3">
                    <p className="mb-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-200">System Directive</p>
                    <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-xs leading-5 text-slate-300 ai-scrollbar">{aiForm.systemPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (createStep === 0) {
                resetForm();
                setActiveTab('my-ais');
              } else {
                setCreateStep(createStep - 1);
              }
            }}
            disabled={publishing}
            className="w-full"
          >
            <ChevronLeft className="h-4 w-4" /> {createStep === 0 ? 'Cancel' : 'Previous'}
          </Button>

          {createStep === CREATE_STEPS.length - 1 ? (
            <Button
              onClick={publishAI}
              disabled={publishing}
              className="w-full bg-gradient-to-r from-emerald-300 to-cyan-200 text-slate-950 font-black shadow-[0_18px_42px_rgba(52,211,153,0.18)]"
            >
              {publishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" /> Publish Assistant
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCreateStep(createStep + 1)}
              className="ai-premium-button w-full font-black"
            >
              Next Step <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );

  const renderTraining = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Knowledge Sources', value: '0', icon: Database, color: 'text-violet-200' },
          { label: 'Documents Indexed', value: '0', icon: FileText, color: 'text-cyan-200' },
          { label: 'Training Sessions', value: '0', icon: BookOpen, color: 'text-emerald-200' },
        ].map(item => (
          <StatTile key={item.label} icon={item.icon} label={item.label} value={item.value} accent={item.color} />
        ))}
      </div>

      <section className="ai-glass rounded-[1.5rem] p-5 sm:p-7">
        <SectionTitle
          eyebrow="Training center"
          title="Prepare knowledge for future AI tuning"
          description="This area keeps the previous training entry point while avoiding fake indexed files. Connect storage/indexing to make uploads active."
        />
        <div className="rounded-[1.5rem] border border-dashed border-cyan-200/24 bg-cyan-200/[0.045] p-8 text-center transition hover:bg-cyan-200/[0.065]">
          <Upload className="mx-auto h-10 w-10 text-cyan-100" />
          <p className="mt-4 text-sm font-black text-white">Upload PDFs, DOCX, TXT, or Markdown</p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-400">
            Files can be processed and indexed for retrieval-augmented generation once the backend pipeline is connected.
          </p>
        </div>
      </section>

      <section className="ai-glass rounded-[1.5rem] p-5 sm:p-7">
        <EmptyState
          icon={Database}
          title="No indexed knowledge yet"
          description="Training sources will appear here after document ingestion is available for custom AIs."
          compact
        />
      </section>
    </div>
  );

  return (
    <PageContainer className="ai-studio-shell max-w-[1760px]">
      <style>{aiStudioStyles}</style>
      {renderHero()}
      {renderTabs()}
      {activeTab === 'my-ais' ? renderMyAIs() : activeTab === 'create' ? renderCreate() : renderTraining()}
      <div className="sr-only" aria-live="polite">
        {publishing ? 'Publishing assistant' : loading ? 'Loading assistants' : 'AI workspace ready'}
      </div>
    </PageContainer>
  );
}
