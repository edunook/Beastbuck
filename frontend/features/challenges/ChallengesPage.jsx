import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Plus, 
  Clock, 
  Users, 
  Target, 
  Brain, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Upload, 
  BarChart, 
  X, 
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  Medal,
  Award,
  Play,
  Flame,
  Zap,
  Lock,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  ArrowRight,
  Sparkles,
  Crown,
  Gem,
  Shield,
  Swords,
  Flame as Fire,
  Coins,
  Award as TrophyIcon
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { LoadingState } from '@frontend/components/ui/UIElements';
import Button from '@frontend/components/ui/Button';
import { ChallengeService } from '@services/firestore/challenges';
import { CHALLENGE_TYPES, CHALLENGE_STATUS, CHALLENGE_CATEGORIES } from '@shared/constants/challenges';
import { cn } from '@shared/lib/utils';

const animations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.6); }
  }

  @keyframes progressFill {
    from { width: 0%; }
    to { width: var(--progress-width); }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }

  .animate-scale-in {
    animation: scaleIn 0.4s ease-out forwards;
  }

  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
  }

  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .animate-progress {
    animation: progressFill 1s ease-out forwards;
  }

  .animate-slide-in {
    animation: slideIn 0.4s ease-out forwards;
  }

  .animate-bounce {
    animation: bounce 0.5s ease-in-out;
  }

  .glass {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .glass-dark {
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(30px);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .glass-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .gradient-border {
    position: relative;
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(147, 51, 234, 0.1));
  }

  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.5), rgba(147, 51, 234, 0.5));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  .text-gradient {
    background: linear-gradient(135deg, #00f0ff 0%, #9333ea 50%, #00f0ff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .scrollbar-hide::-webkit-scrollbar-track {
    background: transparent;
  }

  .scrollbar-hide::-webkit-scrollbar-thumb {
    background: transparent;
  }
`;

const TYPE_ICONS = {
  mcq_quiz: Brain,
  image_upload: ImageIcon,
  video_upload: Video,
  text_essay: FileText,
  file_upload: Upload,
  poll_voting: BarChart,
};

const DIFFICULTY_CONFIG = {
  easy: { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', label: 'Easy' },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', label: 'Medium' },
  hard: { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', label: 'Hard' },
  expert: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30', label: 'Expert' },
};

const STATUS_CONFIG = {
  DRAFT: { 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-500/15', 
    border: 'border-yellow-500/30',
    icon: Lock,
    label: 'Draft'
  },
  ACTIVE: { 
    color: 'text-green-400', 
    bg: 'bg-green-500/15', 
    border: 'border-green-500/30',
    icon: Flame,
    label: 'Active'
  },
  CLOSED: { 
    color: 'text-gray-400', 
    bg: 'bg-gray-500/15', 
    border: 'border-gray-500/30',
    icon: CheckCircle,
    label: 'Closed'
  },
  ARCHIVED: { 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/15', 
    border: 'border-purple-500/30',
    icon: Award,
    label: 'Archived'
  },
};

function ChallengeCard({ challenge, index, onParticipate, isCreator, userProgress }) {
  const typeIcon = TYPE_ICONS[challenge.type] || Target;
  const Icon = typeIcon;
  const typeConfig = Object.values(CHALLENGE_TYPES).find(t => t.id === challenge.type);
  const statusConfig = STATUS_CONFIG[challenge.status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = statusConfig.icon;
  
  const difficulty = challenge.difficulty || 'medium';
  const difficultyConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
  
  const isJoined = userProgress?.[challenge.id]?.joined;
  const progress = userProgress?.[challenge.id]?.progress || 0;
  const isCompleted = userProgress?.[challenge.id]?.completed;
  const hasParticipated = isCompleted; // Since users can only participate once
  const submittedAt = userProgress?.[challenge.id]?.submittedAt;
  
  const getTimeRemaining = () => {
    if (!challenge.deadline) return null;
    const now = new Date();
    const deadline = new Date(challenge.deadline);
    const diff = deadline - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d left`;
    if (hours > 0) return `${hours}h left`;
    return 'Soon';
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl glass-card transition-all duration-500",
        "hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-1",
        "animate-fade-in-up",
        challenge.status === CHALLENGE_STATUS.ACTIVE && "gradient-border"
      )}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Card Background Gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5"
      )} />
      
      {/* Status Banner */}
      <div className={cn(
        "absolute top-0 right-0 px-2 sm:px-3 py-1 sm:py-2 rounded-bl-xl sm:rounded-bl-2xl border-l border-b z-10",
        statusConfig.bg, statusConfig.border
      )}>
        <div className="flex items-center gap-1 sm:gap-1.5">
          <StatusIcon className={cn("h-3 w-3 sm:h-3.5 sm:w-3.5", statusConfig.color)} />
          <span className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-wider", statusConfig.color)}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative p-4 sm:p-5 md:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Type Icon */}
            <div className={cn(
              "flex-shrink-0 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 transition-all duration-300",
              "group-hover:scale-110 group-hover:rotate-3",
              challenge.status === CHALLENGE_STATUS.ACTIVE 
                ? "bg-gradient-to-br from-accent/20 to-cyan-500/20" 
                : "bg-white/5"
            )}>
              <Icon className={cn(
                "h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 transition-colors",
                challenge.status === CHALLENGE_STATUS.ACTIVE ? "text-accent" : "text-text-muted"
              )} />
            </div>
            
            {/* Title and Category */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold border",
                  difficultyConfig.bg, difficultyConfig.border, difficultyConfig.color
                )}>
                  {difficultyConfig.label}
                </span>
                {challenge.category && (
                  <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] sm:text-xs text-text-muted">
                    {challenge.category}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white line-clamp-2 group-hover:text-gradient transition-all duration-300">
                {challenge.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 sm:mb-5 text-xs sm:text-sm text-text-muted line-clamp-2 leading-relaxed">
          {challenge.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
          {/* Participants */}
          <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white/5 p-2 sm:p-3 border border-white/5">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent flex-shrink-0" />
            <div>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{challenge.participantCount || 0}</p>
              <p className="text-[10px] sm:text-xs text-text-muted">Participants</p>
            </div>
          </div>
          
          {/* Points */}
          {challenge.points && (
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white/5 p-2 sm:p-3 border border-white/5">
              <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{challenge.points}</p>
                <p className="text-[10px] sm:text-xs text-text-muted">Points</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar (if joined and not completed) */}
        {isJoined && !isCompleted && (
          <div className="mb-4 sm:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-xs font-bold text-accent">Your Progress</span>
              <span className="text-[10px] sm:text-xs font-bold text-white">{progress}%</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-accent to-cyan-400 rounded-full animate-progress"
                style={{ '--progress-width': `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submission Info (if participated) */}
        {hasParticipated && submittedAt && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 rounded-lg sm:rounded-xl bg-green-500/10 border border-green-500/20 p-2 sm:p-3">
            <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-green-400">Submitted</p>
              <p className="text-[10px] sm:text-xs text-text-muted truncate">
                {new Date(submittedAt).toLocaleDateString()} at {new Date(submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        )}

        {/* Time Remaining (if not participated) */}
        {!hasParticipated && timeRemaining && (
          <div className={cn(
            "flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 rounded-lg sm:rounded-xl p-2 sm:p-3 border",
            timeRemaining === 'Expired' 
              ? "bg-red-500/10 border-red-500/20" 
              : "bg-white/5 border-white/10"
          )}>
            <Clock className={cn(
              "h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0",
              timeRemaining === 'Expired' ? "text-red-400" : "text-text-muted"
            )} />
            <span className={cn(
              "text-xs sm:text-sm font-medium",
              timeRemaining === 'Expired' ? "text-red-400" : "text-text-muted"
            )}>
              {timeRemaining}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isCreator ? (
            <Link
              to={`/challenges/${challenge.id}/responses`}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">View Responses</span>
              <span className="sm:hidden">Responses</span>
            </Link>
          ) : hasParticipated ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-green-500/20 border border-green-500/30 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-green-400 cursor-default">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Participated</span>
              <span className="sm:hidden">Done</span>
            </div>
          ) : challenge.status === CHALLENGE_STATUS.ACTIVE ? (
            <Button
              onClick={() => onParticipate(challenge)}
              className="flex-1 text-xs sm:text-sm"
            >
              <Play className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Join Challenge</span>
              <span className="sm:hidden">Join</span>
            </Button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-bold text-text-muted">
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{challenge.status === CHALLENGE_STATUS.CLOSED ? 'Ended' : 'Not Available'}</span>
              <span className="sm:hidden">{challenge.status === CHALLENGE_STATUS.CLOSED ? 'Ended' : 'Closed'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Glow Effect */}
      <div className={cn(
        "absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        "bg-gradient-to-t from-accent/5 via-transparent to-transparent"
      )} />
    </div>
  );
}

function CreateChallengeModal({ isOpen, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, roleData } = useAuth();

  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    category: 'General',
    difficulty: 'medium',
    timeLimit: '',
    points: 100,
    deadline: '',
    // Quiz specific
    questions: [],
    // Upload specific
    theme: '',
    topic: '',
    wordLimit: '',
    acceptedFormats: '',
    // Poll specific
    options: [],
    allowMultiple: false,
    passingScore: 70,
  });

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type || !formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const creator = {
        uid: user?.uid,
        name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
        username: roleData?.username || user?.displayName || '',
      };
      await onSubmit(formData, creator);
      onClose();
      setFormData({
        type: '',
        title: '',
        description: '',
        category: 'General',
        difficulty: 'medium',
        timeLimit: '',
        points: 100,
        deadline: '',
        questions: [],
        theme: '',
        topic: '',
        wordLimit: '',
        acceptedFormats: '',
        options: [],
        allowMultiple: false,
        passingScore: 70,
      });
      setStep(1);
      setSelectedType(null);
    } catch (err) {
      console.error('Create failed:', err);
      setError('Failed to create challenge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        choices: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
      }]
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-3 sm:p-4">
      <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl glass-card p-4 sm:p-6 md:p-8 animate-scale-in max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors z-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent to-cyan-500 flex-shrink-0">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Create Challenge</h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {step === 1 ? 'Choose your challenge type' : 'Configure challenge details'}
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-3 sm:mt-4">
            <div className={cn(
              "flex-1 h-1 rounded-full transition-all duration-300",
              step === 1 ? "bg-accent" : "bg-accent/30"
            )} />
            <div className={cn(
              "flex-1 h-1 rounded-full transition-all duration-300",
              step === 2 ? "bg-accent" : "bg-white/10"
            )} />
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-3 sm:px-4 py-2 sm:py-3 animate-slide-in">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-red-400">{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Object.values(CHALLENGE_TYPES).map((type) => {
              const Icon = TYPE_ICONS[type.id];
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    updateField('type', type.id);
                    setStep(2);
                  }}
                  className={cn(
                    "group p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02]",
                    "hover:border-accent/50 hover:bg-white/5 hover:shadow-lg hover:shadow-accent/10",
                    selectedType === type.id 
                      ? "border-accent bg-accent/10 shadow-lg shadow-accent/20" 
                      : "border-white/10 bg-white/5"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl mb-3 sm:mb-4 transition-all duration-300",
                    selectedType === type.id 
                      ? "bg-accent/20" 
                      : "bg-white/10 group-hover:bg-accent/10"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6 sm:h-7 sm:w-7 transition-colors",
                      selectedType === type.id ? "text-accent" : "text-text-muted group-hover:text-accent"
                    )} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2">{type.name}</h3>
                  <p className="text-xs sm:text-sm text-text-muted line-clamp-2">{type.description}</p>
                  {selectedType === type.id && (
                    <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-accent text-xs sm:text-sm font-bold">
                      <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Selected
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="md:col-span-2">
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Give your challenge a catchy title"
                  maxLength={100}
                  className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your challenge in detail..."
                  rows={3}
                  maxLength={500}
                  className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all cursor-pointer"
                >
                  {CHALLENGE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => updateField('difficulty', e.target.value)}
                  className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all cursor-pointer"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Points</label>
                <div className="relative">
                  <Coins className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => updateField('points', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Time Limit (minutes)</label>
                <div className="relative">
                  <Clock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => updateField('timeLimit', e.target.value)}
                    min="0"
                    placeholder="No limit"
                    className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => updateField('deadline', e.target.value)}
                    className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Type-specific fields */}
            {formData.type === 'mcq_quiz' && (
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
                  <label className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    Quiz Questions
                  </label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs sm:text-sm font-bold hover:bg-accent/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add Question</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
                {formData.questions.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-text-muted">
                    <Brain className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm">No questions yet. Add your first question!</p>
                  </div>
                ) : (
                  formData.questions.map((q, qIndex) => (
                    <div key={qIndex} className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 p-3 sm:p-5 last:mb-0">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-accent/20 text-accent font-bold text-xs sm:text-sm flex-shrink-0">
                          {qIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          placeholder="Enter your question"
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 ml-8 sm:ml-10">
                        {q.choices.map((choice, cIndex) => (
                          <div key={cIndex} className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === cIndex}
                              onChange={() => updateQuestion(qIndex, 'correctAnswer', cIndex)}
                              className="accent-accent flex-shrink-0"
                            />
                            <input
                              type="text"
                              value={choice}
                              onChange={(e) => {
                                const newChoices = [...q.choices];
                                newChoices[cIndex] = e.target.value;
                                updateQuestion(qIndex, 'choices', newChoices);
                              }}
                              placeholder={`Choice ${cIndex + 1}`}
                              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                            />
                            {q.correctAnswer === cIndex && (
                              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {formData.type === 'poll_voting' && (
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
                  <label className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    Poll Options
                  </label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs sm:text-sm font-bold hover:bg-accent/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Add Option</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                </div>
                {formData.options.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-text-muted">
                    <BarChart className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-xs sm:text-sm">No options yet. Add your first option!</p>
                  </div>
                ) : (
                  formData.options.map((option, index) => (
                    <div key={index} className="mb-2 sm:mb-3 last:mb-0">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[index] = e.target.value;
                          updateField('options', newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                      />
                    </div>
                  ))
                )}
                <label className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowMultiple}
                    onChange={(e) => updateField('allowMultiple', e.target.checked)}
                    className="accent-accent w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                  />
                  <span className="text-xs sm:text-sm text-text-muted">Allow multiple selections</span>
                </label>
              </div>
            )}

            {formData.type === 'text_essay' && (
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <label className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-3 sm:mb-4">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  Essay Details
                </label>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Topic</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => updateField('topic', e.target.value)}
                      placeholder="Essay topic or prompt"
                      className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Word Limit (optional)</label>
                    <input
                      type="number"
                      value={formData.wordLimit}
                      onChange={(e) => updateField('wordLimit', e.target.value)}
                      min="0"
                      placeholder="No limit"
                      className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {(formData.type === 'image_upload' || formData.type === 'video_upload') && (
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <label className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-3 sm:mb-4">
                  {formData.type === 'image_upload' ? (
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  ) : (
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  )}
                  {formData.type === 'image_upload' ? 'Image' : 'Video'} Challenge Details
                </label>
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Theme</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => updateField('theme', e.target.value)}
                    placeholder="Challenge theme or subject"
                    className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {formData.type === 'file_upload' && (
              <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                <label className="text-sm sm:text-base font-bold text-white flex items-center gap-2 mb-3 sm:mb-4">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  File Upload Details
                </label>
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-white">Accepted Formats</label>
                  <input
                    type="text"
                    value={formData.acceptedFormats}
                    onChange={(e) => updateField('acceptedFormats', e.target.value)}
                    placeholder="e.g., .pdf, .doc, .zip, .jpg"
                    className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1 text-xs sm:text-sm"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 text-xs sm:text-sm"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Create Challenge</span>
                    <span className="sm:hidden">Create</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ParticipationModal({ isOpen, onClose, challenge, onSubmit, hasParticipated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseData, setResponseData] = useState({});
  const { user, roleData } = useAuth();

  if (!isOpen || !challenge) return null;

  // If user has already participated, show a message instead of the form
  if (hasParticipated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-3 sm:p-4">
        <div className="relative w-full max-w-md rounded-2xl sm:rounded-3xl glass-card p-6 sm:p-8 animate-scale-in">
          <button
            onClick={onClose}
            className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 border border-green-500/30">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-400" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Already Participated</h2>
            <p className="text-sm sm:text-base text-text-muted mb-6">
              You have already submitted your response for this challenge. Each member can only participate once in a challenge.
            </p>
            <Button
              onClick={onClose}
              className="w-full text-sm sm:text-base"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userData = {
        uid: user?.uid,
        name: roleData?.displayName || roleData?.username || user?.displayName || 'Member',
        username: roleData?.username || user?.displayName || '',
      };
      await onSubmit(challenge.id, userData, responseData);
      onClose();
      setResponseData({});
    } catch (err) {
      console.error('Submit failed:', err);
      setError('Failed to submit response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const typeIcon = TYPE_ICONS[challenge.type] || Target;
  const Icon = typeIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-3 sm:p-4">
      <div className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl glass-card p-4 sm:p-6 md:p-8 animate-scale-in max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 sm:right-4 top-3 sm:top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors z-10"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent to-cyan-500 flex-shrink-0">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white line-clamp-2">{challenge.title}</h2>
              <p className="text-xs sm:text-sm text-text-muted line-clamp-2">{challenge.description}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 rounded-xl bg-red-500/10 border border-red-500/20 px-3 sm:px-4 py-2 sm:py-3 animate-slide-in">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
            <span className="text-xs sm:text-sm text-red-400">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {challenge.type === 'mcq_quiz' && challenge.questions && (
            <div className="space-y-4 sm:space-y-6">
              {challenge.questions.map((q, qIndex) => (
                <div key={qIndex} className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <span className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-accent/20 text-accent font-bold text-xs sm:text-sm flex-shrink-0">
                      {qIndex + 1}
                    </span>
                    <p className="text-sm sm:text-base font-bold text-white flex-1">{q.question}</p>
                  </div>
                  <div className="space-y-2 sm:space-y-3 ml-8 sm:ml-11">
                    {q.choices.map((choice, cIndex) => (
                      <label
                        key={cIndex}
                        className={cn(
                          "flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer transition-all",
                          responseData[qIndex] === cIndex
                            ? "border-accent bg-accent/10"
                            : "border-white/10 hover:border-accent/50 hover:bg-white/5"
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={responseData[qIndex] === cIndex}
                          onChange={() => {
                            setResponseData(prev => ({ ...prev, [qIndex]: cIndex }));
                          }}
                          className="accent-accent flex-shrink-0"
                        />
                        <span className="text-xs sm:text-sm text-white">{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {challenge.type === 'text_essay' && (
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <label className="mb-3 sm:mb-4 block text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Your Response
              </label>
              <textarea
                value={responseData.text || ''}
                onChange={(e) => setResponseData({ text: e.target.value })}
                placeholder="Write your response here..."
                rows={6}
                className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                required
              />
            </div>
          )}

          {challenge.type === 'poll_voting' && challenge.options && (
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <label className="mb-3 sm:mb-4 block text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <BarChart className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Select Your {challenge.allowMultiple ? 'Options' : 'Option'}
              </label>
              <div className="space-y-2 sm:space-y-3">
                {challenge.options.map((option, index) => (
                  <label
                    key={index}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl border-2 px-3 sm:px-4 py-2 sm:py-3 cursor-pointer transition-all",
                      challenge.allowMultiple
                        ? (responseData.selected || []).includes(index)
                          ? "border-accent bg-accent/10"
                          : "border-white/10 hover:border-accent/50 hover:bg-white/5"
                        : responseData.selected === index
                        ? "border-accent bg-accent/10"
                        : "border-white/10 hover:border-accent/50 hover:bg-white/5"
                    )}
                  >
                    <input
                      type={challenge.allowMultiple ? "checkbox" : "radio"}
                      name="poll"
                      checked={challenge.allowMultiple
                        ? (responseData.selected || []).includes(index)
                        : responseData.selected === index}
                      onChange={() => {
                        if (challenge.allowMultiple) {
                          const selected = responseData.selected || [];
                          setResponseData({
                            selected: selected.includes(index)
                              ? selected.filter(i => i !== index)
                              : [...selected, index]
                          });
                        } else {
                          setResponseData({ selected: index });
                        }
                      }}
                      className="accent-accent flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-white">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(challenge.type === 'image_upload' || challenge.type === 'video_upload' || challenge.type === 'file_upload') && (
            <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <label className="mb-3 sm:mb-4 block text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                Upload Your {challenge.type === 'image_upload' ? 'Image' : challenge.type === 'video_upload' ? 'Video' : 'File'}
              </label>
              <div className="rounded-xl sm:rounded-2xl border-2 border-dashed border-white/20 p-6 sm:p-8 text-center hover:border-accent/50 transition-colors">
                <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3 text-text-muted" />
                <p className="text-xs sm:text-sm font-medium text-white mb-1 sm:mb-2">
                  Drag and drop or click to upload
                </p>
                <p className="text-[10px] sm:text-xs text-text-muted">
                  {challenge.type === 'image_upload' ? 'PNG, JPG, GIF up to 10MB' : 
                   challenge.type === 'video_upload' ? 'MP4, MOV up to 100MB' : 
                   'Any file up to 50MB'}
                </p>
                <input
                  type="file"
                  accept={challenge.type === 'image_upload' ? 'image/*' : challenge.type === 'video_upload' ? 'video/*' : '*/*'}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setResponseData({ file: file.name });
                    }
                  }}
                  className="mt-3 sm:mt-4"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 sm:gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 text-xs sm:text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Submit Response</span>
                  <span className="sm:hidden">Submit</span>
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const { user, roleData } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showParticipate, setShowParticipate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    loadChallenges();
    loadUserProgress();
  }, [filter, categoryFilter, sortBy, user?.uid]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await ChallengeService.getCommunityChallenges(
        filter !== 'all' ? { status: filter } : {}
      );
      
      let filtered = data;
      
      // Filter by category
      if (categoryFilter !== 'all') {
        filtered = filtered.filter(c => c.category === categoryFilter);
      }
      
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(c => 
          c.title?.toLowerCase().includes(query) || 
          c.description?.toLowerCase().includes(query)
        );
      }
      
      // Sort
      filtered = filtered.sort((a, b) => {
        switch (sortBy) {
          case 'newest': {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          }
          case 'oldest': {
            const aTimeOld = a.createdAt?.toMillis?.() || 0;
            const bTimeOld = b.createdAt?.toMillis?.() || 0;
            return aTimeOld - bTimeOld;
          }
          case 'participants':
            return (b.participantCount || 0) - (a.participantCount || 0);
          case 'points':
            return (b.points || 0) - (a.points || 0);
          case 'deadline': {
            const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
            const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
            return aDeadline - bDeadline;
          }
          default:
            return 0;
        }
      });
      
      setChallenges(filtered);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    if (!user?.uid) return;
    
    try {
      // Load user's challenge responses to track participation
      const responses = await ChallengeService.getUserChallengeResponses(user.uid);
      
      const progressMap = {};
      responses.forEach(response => {
        progressMap[response.challengeId] = {
          joined: true,
          completed: true,
          progress: 100,
          submittedAt: response.submittedAt,
          responseData: response.responseData
        };
      });
      
      setUserProgress(progressMap);
    } catch (err) {
      console.error('Failed to load user progress:', err);
      setUserProgress({});
    }
  };

  const handleCreate = async (formData, creator) => {
    const challengeData = {
      ...formData,
      status: CHALLENGE_STATUS.ACTIVE,
    };
    await ChallengeService.createCommunityChallenge(challengeData, creator);
    await ChallengeService.publishChallenge((await ChallengeService.getCommunityChallenges({ creatorId: creator.uid }))[0]?.id);
    loadChallenges();
  };

  const handleParticipate = async (challengeId, userData, responseData) => {
    // The service now handles the duplicate check, but we keep the frontend check for better UX
    try {
      await ChallengeService.submitChallengeResponse(challengeId, userData.uid, userData, responseData);
      loadChallenges();
      loadUserProgress(); // Reload progress to show completed state
    } catch (err) {
      if (err.message.includes('already participated')) {
        alert('You have already participated in this challenge. Each member can only participate once.');
      } else {
        console.error('Participation failed:', err);
        alert('Failed to submit response. Please try again.');
      }
    }
  };

  const canCreate = roleData?.membershipStatus === 'approved' || roleData?.role === 'Member' || roleData?.role === 'Main CEO' || roleData?.role === 'Co-CEO';

  const activeCount = challenges.filter(c => c.status === CHALLENGE_STATUS.ACTIVE).length;
  const completedCount = Object.values(userProgress).filter(p => p.completed).length;
  const totalPoints = challenges.reduce((sum, c) => sum + (c.points || 0), 0);

  return (
    <>
      <style>{animations}</style>
      <PageContainer>
        {/* Premium Hero Section */}
        <div className="relative mb-8 sm:mb-10 overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-accent/15 via-purple-500/10 to-cyan-500/15 p-5 sm:p-6 md:p-8 lg:p-12 animate-fade-in border border-white/10">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-5 left-5 w-40 h-40 sm:w-72 sm:h-72 bg-accent/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-5 right-5 w-48 h-48 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-start gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent to-cyan-500 animate-glow flex-shrink-0">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white flex items-center gap-2 sm:gap-3">
                      <span className="text-gradient">Challenges</span>
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-text-muted mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-2">
                      Compete, achieve, and dominate the leaderboards
                    </p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2">
                    <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{activeCount}</p>
                      <p className="text-[10px] sm:text-xs text-text-muted">Active</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{completedCount}</p>
                      <p className="text-[10px] sm:text-xs text-text-muted">Completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2">
                    <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{totalPoints}</p>
                      <p className="text-[10px] sm:text-xs text-text-muted">Total Points</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {canCreate && (
                <Button
                  onClick={() => setShowCreate(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base shadow-lg shadow-accent/20 hover:shadow-accent/40 transition-all"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Create Challenge</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Status Filters - Scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible">
              {['all', 'ACTIVE', 'CLOSED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    "flex-shrink-0 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all border whitespace-nowrap",
                    filter === status
                      ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                      : "bg-white/5 text-text-muted border-white/10 hover:bg-white/10 hover:border-white/20"
                  )}
                >
                  {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Category and Sort - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CHALLENGE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="participants">Most Participants</option>
                <option value="points">Highest Points</option>
                <option value="deadline">Ending Soon</option>
              </select>
            </div>
          </div>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="flex min-h-64 sm:min-h-80 items-center justify-center">
            <LoadingState text="Loading challenges..." />
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-white/10 p-8 sm:p-12 md:p-16 text-center animate-fade-in">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                <Trophy className="relative h-16 w-16 sm:h-20 sm:w-20 text-text-muted" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">No challenges found</h2>
            <p className="text-sm sm:text-base text-text-muted mb-4 sm:mb-6 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters' : 
               canCreate ? 'Be the first to create a challenge and start the competition!' : 
               'Wait for challenges to be created by community members.'}
            </p>
            {canCreate && !searchQuery && (
              <Button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create First Challenge</span>
                <span className="sm:hidden">Create Challenge</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {challenges.map((challenge, index) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                index={index}
                onParticipate={(c) => {
                  setSelectedChallenge(c);
                  setShowParticipate(true);
                }}
                isCreator={challenge.creatorId === user?.uid}
                userProgress={userProgress}
              />
            ))}
          </div>
        )}
      </PageContainer>

      <CreateChallengeModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
      />

      <ParticipationModal
        isOpen={showParticipate}
        onClose={() => setShowParticipate(false)}
        challenge={selectedChallenge}
        onSubmit={handleParticipate}
        hasParticipated={selectedChallenge && userProgress?.[selectedChallenge.id]?.completed}
      />
    </>
  );
}
