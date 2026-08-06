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
  Play
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { LoadingState } from '../../components/ui/UIElements';
import Button from '../../components/ui/Button';
import { ChallengeService } from '../../services/firebase/challenges';
import { CHALLENGE_TYPES, CHALLENGE_STATUS, CHALLENGE_CATEGORIES } from '../../constants/challenges';
import { cn } from '../../lib/utils';

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

  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .glass-dark {
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.05);
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

function ChallengeCard({ challenge, index, onParticipate, isCreator }) {
  const typeIcon = TYPE_ICONS[challenge.type] || Target;
  const Icon = typeIcon;
  const typeConfig = Object.values(CHALLENGE_TYPES).find(t => t.id === challenge.type);
  
  const statusColors = {
    DRAFT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    ACTIVE: 'bg-green-500/20 text-green-400 border-green-500/30',
    CLOSED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    ARCHIVED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl glass-dark transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:scale-[1.02]",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-accent/20 p-3">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <span className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold border",
                statusColors[challenge.status] || statusColors.DRAFT
              )}>
                {challenge.status}
              </span>
              <h3 className="mt-2 text-lg font-bold text-white line-clamp-2 group-hover:text-accent transition-colors">
                {challenge.title}
              </h3>
            </div>
          </div>
          {isCreator && (
            <Link
              to={`/challenges/${challenge.id}/manage`}
              className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            >
              <Target className="h-4 w-4" />
            </Link>
          )}
        </div>

        <p className="mb-4 text-sm text-text-muted line-clamp-2">
          {challenge.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
            {typeConfig?.name || challenge.type}
          </span>
          {challenge.category && (
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-text-muted">
              {challenge.category}
            </span>
          )}
        </div>

        <div className="mb-4 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {challenge.participantCount || 0} participants
          </span>
          {challenge.points && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-400" />
              {challenge.points} points
            </span>
          )}
          {challenge.deadline && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {new Date(challenge.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {challenge.status === CHALLENGE_STATUS.ACTIVE && (
          <Button
            onClick={() => onParticipate(challenge)}
            className="w-full"
          >
            <Play className="mr-2 h-4 w-4" />
            Participate
          </Button>
        )}
      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl glass-dark p-6 animate-scale-in mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-accent" />
            Create Challenge
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {step === 1 ? 'Select challenge type' : 'Configure your challenge'}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-status-danger/10 border border-status-danger/20 px-4 py-2">
            <AlertCircle className="h-4 w-4 text-status-danger" />
            <span className="text-sm text-status-danger">{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    "p-6 rounded-2xl border-2 text-left transition-all hover:border-accent/50 hover:bg-white/5",
                    selectedType === type.id ? "border-accent bg-accent/10" : "border-border"
                  )}
                >
                  <Icon className="h-8 w-8 mb-3 text-accent" />
                  <h3 className="text-lg font-bold text-white">{type.name}</h3>
                  <p className="mt-1 text-sm text-text-muted">{type.description}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Give your challenge a catchy title"
                maxLength={100}
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-white">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe your challenge..."
                rows={4}
                maxLength={500}
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                >
                  {CHALLENGE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Points</label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => updateField('points', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Time Limit (minutes, optional)</label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => updateField('timeLimit', e.target.value)}
                  min="0"
                  placeholder="No limit"
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Deadline (optional)</label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => updateField('deadline', e.target.value)}
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Type-specific fields */}
            {formData.type === 'mcq_quiz' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">Questions</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="rounded-lg bg-accent px-3 py-1 text-sm font-bold text-white hover:bg-accent/80 transition-colors"
                  >
                    + Add Question
                  </button>
                </div>
                {formData.questions.map((q, qIndex) => (
                  <div key={qIndex} className="rounded-xl border border-border bg-white/5 p-4 space-y-3">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                      placeholder={`Question ${qIndex + 1}`}
                      className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-white placeholder:text-text-muted focus:border-accent outline-none transition-all"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      {q.choices.map((choice, cIndex) => (
                        <div key={cIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={q.correctAnswer === cIndex}
                            onChange={() => updateQuestion(qIndex, 'correctAnswer', cIndex)}
                            className="accent-accent"
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
                            className="flex-1 rounded-lg border border-border bg-white/5 px-3 py-2 text-white placeholder:text-text-muted focus:border-accent outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                      placeholder="Explanation (optional)"
                      className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-white placeholder:text-text-muted focus:border-accent outline-none transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">Passing Score (%)</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => updateField('passingScore', parseInt(e.target.value) || 70)}
                    min="0"
                    max="100"
                    className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {formData.type === 'image_upload' && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Theme</label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => updateField('theme', e.target.value)}
                  placeholder="e.g., Nature, Abstract, Portrait"
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
            )}

            {formData.type === 'video_upload' && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Theme</label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => updateField('theme', e.target.value)}
                  placeholder="e.g., Tutorial, Showcase, Challenge"
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
            )}

            {formData.type === 'text_essay' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => updateField('topic', e.target.value)}
                    placeholder="Essay topic"
                    className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-white">Word Limit</label>
                  <input
                    type="number"
                    value={formData.wordLimit}
                    onChange={(e) => updateField('wordLimit', e.target.value)}
                    placeholder="e.g., 500"
                    className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {formData.type === 'file_upload' && (
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Accepted Formats</label>
                <input
                  type="text"
                  value={formData.acceptedFormats}
                  onChange={(e) => updateField('acceptedFormats', e.target.value)}
                  placeholder="e.g., PDF, DOCX, ZIP"
                  className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>
            )}

            {formData.type === 'poll_voting' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white">Options</label>
                  <button
                    type="button"
                    onClick={addOption}
                    className="rounded-lg bg-accent px-3 py-1 text-sm font-bold text-white hover:bg-accent/80 transition-colors"
                  >
                    + Add Option
                  </button>
                </div>
                {formData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      updateField('options', newOptions);
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-white placeholder:text-text-muted focus:border-accent outline-none transition-all"
                  />
                ))}
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={formData.allowMultiple}
                    onChange={(e) => updateField('allowMultiple', e.target.checked)}
                    className="accent-accent"
                  />
                  Allow multiple selections
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Challenge'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ParticipationModal({ isOpen, onClose, challenge, onSubmit }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseData, setResponseData] = useState({});
  const { user, roleData } = useAuth();

  if (!isOpen || !challenge) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl glass-dark p-6 animate-scale-in mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Play className="h-6 w-6 text-accent" />
            {challenge.title}
          </h2>
          <p className="mt-1 text-sm text-text-muted">{challenge.description}</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-status-danger/10 border border-status-danger/20 px-4 py-2">
            <AlertCircle className="h-4 w-4 text-status-danger" />
            <span className="text-sm text-status-danger">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {challenge.type === 'mcq_quiz' && challenge.questions && (
            <div className="space-y-6">
              {challenge.questions.map((q, qIndex) => (
                <div key={qIndex} className="space-y-3">
                  <p className="text-base font-bold text-white">
                    {qIndex + 1}. {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.choices.map((choice, cIndex) => (
                      <label
                        key={cIndex}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                          responseData[qIndex] === cIndex
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${qIndex}`}
                          checked={responseData[qIndex] === cIndex}
                          onChange={() => {
                            setResponseData(prev => ({ ...prev, [qIndex]: cIndex }));
                          }}
                          className="accent-accent"
                        />
                        <span className="text-white">{choice}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {challenge.type === 'text_essay' && (
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Your Response</label>
              <textarea
                value={responseData.text || ''}
                onChange={(e) => setResponseData({ text: e.target.value })}
                placeholder="Write your response here..."
                rows={8}
                className="w-full rounded-xl border border-border bg-white/5 px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                required
              />
            </div>
          )}

          {challenge.type === 'poll_voting' && challenge.options && (
            <div className="space-y-3">
              {challenge.options.map((option, index) => (
                <label
                  key={index}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 px-4 py-3 cursor-pointer transition-all",
                    challenge.allowMultiple
                      ? (responseData.selected || []).includes(index)
                        ? "border-accent bg-accent/10"
                        : "border-border hover:border-accent/50"
                      : responseData.selected === index
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50"
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
                    className="accent-accent"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          )}

          {(challenge.type === 'image_upload' || challenge.type === 'video_upload' || challenge.type === 'file_upload') && (
            <div>
              <label className="mb-2 block text-sm font-bold text-white">Upload Your {challenge.type === 'image_upload' ? 'Image' : challenge.type === 'video_upload' ? 'Video' : 'File'}</label>
              <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
                <Upload className="mx-auto h-12 w-12 mb-3 text-text-muted" />
                <p className="text-sm font-medium text-white">
                  Drag and drop or click to upload
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
                  className="mt-3"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Response'}
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

  useEffect(() => {
    loadChallenges();
  }, [filter]);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const data = await ChallengeService.getCommunityChallenges(
        filter !== 'all' ? { status: filter } : {}
      );
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
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
    await ChallengeService.submitChallengeResponse(challengeId, userData.uid, userData, responseData);
    loadChallenges();
  };

  const canCreate = roleData?.membershipStatus === 'approved' || roleData?.role === 'Member' || roleData?.role === 'Main CEO' || roleData?.role === 'Co-CEO';

  return (
    <>
      <style>{animations}</style>
      <PageContainer>
        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-purple-500/10 to-pink-500/10 p-8 md:p-12 animate-fade-in">
          <div className="relative z-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                  <Trophy className="h-10 w-10 text-accent animate-pulse" />
                  Challenges
                </h1>
                <p className="text-lg text-text-muted max-w-xl">
                  Compete with fellow members in various challenges. Test your skills, win rewards, and climb the leaderboard!
                </p>
              </div>
              {canCreate && (
                <Button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-6 py-3 text-base"
                >
                  <Plus className="h-5 w-5" />
                  Create Challenge
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {['all', 'ACTIVE', 'CLOSED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-bold transition-all",
                filter === status
                  ? "bg-accent text-white"
                  : "bg-white/5 text-text-muted hover:bg-white/10"
              )}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <LoadingState text="Loading challenges..." />
          </div>
        ) : challenges.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center animate-fade-in">
            <Trophy className="mx-auto mb-4 h-16 w-16 text-text-muted" />
            <h2 className="text-2xl font-bold text-white mb-2">No challenges yet</h2>
            <p className="text-text-muted mb-6">
              {canCreate ? 'Be the first to create a challenge!' : 'Wait for challenges to be created by members.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      />
    </>
  );
}
