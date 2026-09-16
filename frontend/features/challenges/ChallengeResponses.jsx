import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Clock, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Upload,
  Calendar,
  Award,
  Filter,
  Download,
  Eye,
  X,
  Star,
  BarChart3,
  Crown,
  Sparkles,
  Brain,
  XCircle,
  FileDown,
  ExternalLink,
} from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { LoadingState } from '@frontend/components/ui/UIElements';
import Button from '@frontend/components/ui/Button';
import { ChallengeService } from '@services/firestore/challenges';
import { useAuth } from '../auth/AuthContext';
import { cn } from '@shared/lib/utils';
import toast from 'react-hot-toast';

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

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); }
    50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.6); }
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

  .animate-glow {
    animation: glow 2s ease-in-out infinite;
  }

  .glass-card {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .text-gradient {
    background: linear-gradient(135deg, #00f0ff 0%, #9333ea 50%, #00f0ff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const TYPE_ICONS = {
  mcq_quiz: Brain,
  image_upload: ImageIcon,
  video_upload: Video,
  text_essay: FileText,
  file_upload: Upload,
  poll_voting: BarChart3,
};

// ─── Compute MCQ score from stored responseData + challenge questions ───────
function computeQuizScore(responseData, questions) {
  if (!questions || !questions.length || !responseData) return null;
  let correct = 0;
  const results = questions.map((q, idx) => {
    const userAnswer = responseData[idx] !== undefined
      ? responseData[idx]
      : responseData[String(idx)];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correct++;
    return {
      question: q.question,
      choices: q.choices,
      correctAnswer: q.correctAnswer,
      userAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });
  const score = Math.round((correct / questions.length) * 100);
  return { correct, total: questions.length, score, results };
}

// ─── Full detail view used inside modal ───────────────────────────────────
function ResponsePreviewCard({ response, challenge }) {
  const { responseData } = response;
  const type = challenge?.type;

  if (type === 'image_upload') {
    const imageUrl = responseData?.url || responseData?.imageUrl;
    if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('/'))) {
      return (
        <div className="rounded-xl overflow-hidden border border-white/10">
          <img
            src={imageUrl}
            alt="Submitted image"
            className="w-full max-h-80 object-contain bg-black/30"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="p-3 bg-white/5 flex items-center justify-between">
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-accent" />
              {responseData?.fileName || 'Image submission'}
            </p>
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Open full size
            </a>
          </div>
        </div>
      );
    }
    return (
      <p className="text-sm text-yellow-400">
        ⚠️ Image URL not stored correctly. Raw value: {String(responseData?.url || responseData?.file || 'none')}
      </p>
    );
  }

  if (type === 'video_upload') {
    const videoUrl = responseData?.url || responseData?.videoUrl;
    if (videoUrl && (videoUrl.startsWith('http') || videoUrl.startsWith('/'))) {
      return (
        <div className="rounded-xl overflow-hidden border border-white/10">
          <video src={videoUrl} controls className="w-full max-h-72 bg-black" />
          <div className="p-3 bg-white/5 flex items-center justify-between">
            <p className="text-xs text-text-muted flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-accent" />
              {responseData?.fileName || 'Video submission'}
            </p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-accent flex items-center gap-1 hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Open
            </a>
          </div>
        </div>
      );
    }
    return (
      <p className="text-sm text-yellow-400">
        ⚠️ Video URL not stored correctly. Raw value: {String(responseData?.url || responseData?.file || 'none')}
      </p>
    );
  }

  if (type === 'file_upload') {
    const fileUrl = responseData?.url || responseData?.fileUrl;
    const fileName = responseData?.fileName || responseData?.file || 'File submission';
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/20 flex-shrink-0">
          <FileDown className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{fileName}</p>
          {responseData?.fileSize && (
            <p className="text-xs text-text-muted">{(responseData.fileSize / 1024).toFixed(1)} KB</p>
          )}
        </div>
        {fileUrl && (fileUrl.startsWith('http') || fileUrl.startsWith('/')) ? (
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/30 text-accent text-xs font-bold hover:bg-accent/30 transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </a>
        ) : (
          <span className="text-xs text-yellow-400">No download URL</span>
        )}
      </div>
    );
  }

  if (type === 'text_essay') {
    return (
      <div className="rounded-xl bg-black/30 border border-white/5 p-4">
        <p className="text-xs text-text-muted mb-3 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-accent" />
          Essay Response · {responseData?.text?.length || 0} characters
        </p>
        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">
          {responseData?.text || 'No text provided'}
        </p>
      </div>
    );
  }

  if (type === 'poll_voting') {
    const options = challenge?.options || [];
    const selected = responseData?.selected;
    const selectedArr = Array.isArray(selected)
      ? selected
      : selected !== undefined ? [selected] : [];
    return (
      <div className="space-y-2">
        <p className="text-xs text-text-muted flex items-center gap-1.5 mb-3">
          <BarChart3 className="h-3.5 w-3.5 text-accent" />
          Poll Selection
        </p>
        {options.map((opt, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-sm transition-all',
              selectedArr.includes(idx)
                ? 'border-accent bg-accent/15 text-white font-bold'
                : 'border-white/10 bg-white/5 text-text-muted'
            )}
          >
            {selectedArr.includes(idx)
              ? <CheckCircle className="h-4 w-4 text-accent flex-shrink-0" />
              : <div className="h-4 w-4 rounded-full border-2 border-white/20 flex-shrink-0" />}
            <span>{opt}</span>
            {selectedArr.includes(idx) && (
              <span className="ml-auto text-xs text-accent">Selected</span>
            )}
          </div>
        ))}
        {selectedArr.length === 0 && (
          <p className="text-sm text-yellow-400">No option selected</p>
        )}
      </div>
    );
  }

  if (type === 'mcq_quiz') {
    const quiz = computeQuizScore(responseData, challenge?.questions);
    if (!quiz) {
      return <p className="text-sm text-yellow-400">No quiz data available</p>;
    }
    return (
      <div className="space-y-3">
        {/* Score summary */}
        <div className={cn(
          'flex items-center gap-4 p-4 rounded-xl border',
          quiz.score >= 70
            ? 'bg-green-500/10 border-green-500/30'
            : quiz.score >= 40
            ? 'bg-yellow-500/10 border-yellow-500/30'
            : 'bg-red-500/10 border-red-500/30'
        )}>
          <div className={cn(
            'flex items-center justify-center w-16 h-16 rounded-full border-2',
            quiz.score >= 70
              ? 'bg-green-500/20 border-green-500/30'
              : quiz.score >= 40
              ? 'bg-yellow-500/20 border-yellow-500/30'
              : 'bg-red-500/20 border-red-500/30'
          )}>
            <span className="text-xl font-bold text-white">{quiz.score}%</span>
          </div>
          <div>
            <p className="text-lg font-bold text-white">{quiz.correct} / {quiz.total} Correct</p>
            <p className={cn(
              'text-sm font-bold',
              quiz.score >= 70 ? 'text-green-400' : quiz.score >= 40 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {quiz.score >= 70 ? '✅ Passed' : quiz.score >= 40 ? '⚠️ Average' : '❌ Failed'}
            </p>
          </div>
          <div className="ml-auto">
            <div className="w-24 bg-white/10 rounded-full h-2.5">
              <div
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  quiz.score >= 70 ? 'bg-green-400' : quiz.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                )}
                style={{ width: `${quiz.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Question Breakdown</p>
        {quiz.results.map((r, idx) => (
          <div
            key={idx}
            className={cn(
              'rounded-xl border p-4',
              r.isCorrect
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-red-500/30 bg-red-500/5'
            )}
          >
            <p className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              {r.isCorrect
                ? <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
              Q{idx + 1}: {r.question}
            </p>
            <div className="space-y-1.5 ml-6">
              {r.choices?.map((choice, ci) => (
                <div
                  key={ci}
                  className={cn(
                    'text-xs px-3 py-2 rounded-lg border',
                    ci === r.correctAnswer && ci === r.userAnswer
                      ? 'border-green-500/50 bg-green-500/20 text-green-300 font-bold'
                      : ci === r.correctAnswer
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : ci === r.userAnswer
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-white/5 bg-white/5 text-text-muted'
                  )}
                >
                  {ci === r.correctAnswer && ci === r.userAnswer && '✅ '}
                  {ci === r.correctAnswer && ci !== r.userAnswer && '✓ '}
                  {ci === r.userAnswer && ci !== r.correctAnswer && '✗ '}
                  {choice}
                  {ci === r.userAnswer && ci === r.correctAnswer && ' — Your answer (Correct!)'}
                  {ci === r.userAnswer && ci !== r.correctAnswer && ' — Your answer (Wrong)'}
                  {ci === r.correctAnswer && ci !== r.userAnswer && ' — Correct answer'}
                </div>
              ))}
            </div>
            {r.explanation && (
              <p className="mt-2 ml-6 text-xs text-text-muted italic border-l-2 border-accent/30 pl-3">
                💡 {r.explanation}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Generic fallback
  return (
    <pre className="text-xs text-text-muted whitespace-pre-wrap bg-black/30 p-4 rounded-xl overflow-auto max-h-64 border border-white/5">
      {JSON.stringify(responseData, null, 2)}
    </pre>
  );
}

// ─── Inline thumbnail shown on the list card ──────────────────────────────
function ResponseCardPreview({ response, challenge }) {
  const { responseData } = response;
  const type = challenge?.type;

  if (type === 'image_upload') {
    const url = responseData?.url || responseData?.imageUrl;
    if (url && (url.startsWith('http') || url.startsWith('/'))) {
      return (
        <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
          <img
            src={url}
            alt="preview"
            className="w-full h-36 object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      );
    }
  }

  if (type === 'mcq_quiz') {
    const quiz = computeQuizScore(responseData, challenge?.questions);
    if (quiz) {
      return (
        <div className="mt-3 flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className={cn(
            'flex items-center justify-center w-11 h-11 rounded-full border flex-shrink-0 font-bold text-sm',
            quiz.score >= 70
              ? 'bg-green-500/20 border-green-500/30 text-green-400'
              : quiz.score >= 40
              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400'
              : 'bg-red-500/20 border-red-500/30 text-red-400'
          )}>
            {quiz.score}%
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">
              {quiz.correct}/{quiz.total} correct
            </p>
            <div className="mt-1.5 w-full bg-white/10 rounded-full h-1.5">
              <div
                className={cn(
                  'h-1.5 rounded-full',
                  quiz.score >= 70 ? 'bg-green-400' : quiz.score >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                )}
                style={{ width: `${quiz.score}%` }}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  if (type === 'text_essay') {
    const text = responseData?.text;
    if (text) {
      return (
        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-text-muted line-clamp-2">{text}</p>
        </div>
      );
    }
  }

  if (type === 'poll_voting') {
    const options = challenge?.options || [];
    const sel = responseData?.selected;
    const selArr = Array.isArray(sel) ? sel : sel !== undefined ? [sel] : [];
    return (
      <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10">
        <p className="text-xs text-text-muted">
          <BarChart3 className="h-3 w-3 inline mr-1 text-accent" />
          Selected: {selArr.map(i => options[i] || `Option ${i + 1}`).join(', ') || 'None'}
        </p>
      </div>
    );
  }

  return null;
}

export default function ChallengeResponses() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [winnerId, setWinnerId] = useState(null);
  const [xpAmount, setXpAmount] = useState(100);
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    loadData();
  }, [challengeId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [challengeData, responsesData] = await Promise.all([
        ChallengeService.getCommunityChallenge(challengeId),
        ChallengeService.getChallengeResponses(challengeId)
      ]);
      
      // Check if user is the creator
      if (challengeData && challengeData.creatorId !== user?.uid) {
        setError('You do not have permission to view these responses');
        setChallenge(challengeData);
        setResponses([]);
      } else {
        setChallenge(challengeData);
        setResponses(responsesData);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load challenge responses');
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = responses.filter(response => {
    if (filter === 'all') return true;
    if (filter === 'pending') return response.status === 'PENDING';
    if (filter === 'reviewed') return response.status === 'REVIEWED';
    if (filter === 'accepted') return response.status === 'ACCEPTED';
    if (filter === 'rejected') return response.status === 'REJECTED';
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'REVIEWED': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'ACCEPTED': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'REJECTED': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStats = () => {
    const pending = responses.filter(r => r.status === 'PENDING').length;
    const reviewed = responses.filter(r => r.status === 'REVIEWED').length;
    const accepted = responses.filter(r => r.status === 'ACCEPTED').length;
    const rejected = responses.filter(r => r.status === 'REJECTED').length;

    let avgScore = 0;
    if (challenge?.type === 'mcq_quiz' && challenge?.questions?.length) {
      const quizScores = responses.map(r => computeQuizScore(r.responseData, challenge.questions)?.score || 0);
      avgScore = quizScores.length ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;
    } else {
      const scored = responses.filter(r => r.score !== undefined && r.score > 0);
      avgScore = scored.length ? scored.reduce((sum, r) => sum + r.score, 0) / scored.length : 0;
    }
    
    return { pending, reviewed, accepted, rejected, avgScore };
  };

  const stats = getStats();

  const handleAwardWinner = async (responseId) => {
    if (!window.confirm(`Are you sure you want to award ${xpAmount} XP to this response as the winner?`)) return;
    
    setAwarding(true);
    try {
      const response = responses.find(r => r.id === responseId);
      if (!response) throw new Error('Response not found');
      
      // Use actual quiz score if MCQ challenge, otherwise 100
      let scoreToGrade = 100;
      if (challenge?.type === 'mcq_quiz' && challenge?.questions?.length) {
        const quiz = computeQuizScore(response.responseData, challenge.questions);
        scoreToGrade = quiz?.score ?? 100;
      }

      await ChallengeService.gradeResponse(responseId, scoreToGrade, 1, 'Congratulations! You won this challenge!');
      
      const { GamificationService } = await import('@services/firestore/gamification');
      await GamificationService.awardXP({
        uid: response.userId,
        amount: xpAmount,
        reason: `Challenge Winner: ${challenge.title}`,
        sourceType: 'CHALLENGE_WIN',
        sourceId: challengeId,
        actorId: user.uid,
      });
      
      await ChallengeService.updateCommunityChallenge(challengeId, {
        winnerId: response.userId,
        winnerName: response.userName || response.userUsername,
        winnerResponseId: responseId,
        awardedAt: new Date(),
      });

      // Send personal winner notification to participant
      try {
        const { NotificationsService } = await import('@services/firestore/notifications');
        await NotificationsService.createNotification({
          title: '🏆 Challenge Winner!',
          message: `Congratulations! You won the challenge "${challenge?.title || 'Community Challenge'}" and were awarded ${xpAmount} XP!`,
          type: 'challenge_winner',
          category: 'personal',
          actorName: user?.displayName || user?.name || 'Challenge Host',
          actorAvatar: user?.photoURL || null,
          actorUid: user?.uid,
          targetUid: response.userId,
          link: '/challenges',
          isPublic: false,
          isPrivate: true,
        });

        // Broadcast public notification to community
        await NotificationsService.createNotification({
          title: '🎉 Challenge Winner Announced!',
          message: `${response.userName || response.userUsername || 'A member'} won "${challenge?.title || 'the challenge'}" and earned ${xpAmount} XP!`,
          type: 'challenge_winner',
          category: 'public',
          actorName: user?.displayName || user?.name || 'BeastBuck',
          actorAvatar: user?.photoURL || null,
          actorUid: user?.uid,
          link: '/challenges',
          isPublic: true,
          isPrivate: false,
        });
      } catch (notifErr) {
        console.warn('Could not dispatch winner notification:', notifErr);
      }
      
      setWinnerId(responseId);
      toast.success(`Successfully awarded ${xpAmount} XP to ${response.userName || response.userUsername}!`);
      loadData();
    } catch (err) {
      console.error('Failed to award winner:', err);
      toast.error('Failed to award winner: ' + err.message);
    } finally {
      setAwarding(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{animations}</style>
        <PageContainer>
          <div className="flex min-h-64 items-center justify-center">
            <LoadingState text="Loading responses..." />
          </div>
        </PageContainer>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{animations}</style>
        <PageContainer>
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
                  <AlertCircle className="relative h-20 w-20 text-red-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-text-muted mb-6">{error}</p>
              <Button onClick={() => navigate('/challenges')}>
                Back to Challenges
              </Button>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  if (!challenge) {
    return (
      <>
        <style>{animations}</style>
        <PageContainer>
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-text-muted mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Challenge Not Found</h2>
              <Button onClick={() => navigate('/challenges')}>
                Back to Challenges
              </Button>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  const TypeIcon = TYPE_ICONS[challenge.type] || Trophy;

  return (
    <>
      <style>{animations}</style>
      <PageContainer>
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/challenges" 
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Challenges
          </Link>
          
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-cyan-500 animate-glow">
                <TypeIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-2">
                  <span className="text-gradient">Response</span> Management
                </h1>
                <p className="text-text-muted mt-1">{challenge.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-lg font-bold text-white">{responses.length}</p>
                  <p className="text-xs text-text-muted">Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-text-muted">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-text-muted">Reviewed</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.reviewed}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-xs text-text-muted">Accepted</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.accepted}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <X className="h-4 w-4 text-red-400" />
              <span className="text-xs text-text-muted">Rejected</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.rejected}</p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-text-muted">
                {challenge.type === 'mcq_quiz' ? 'Avg Quiz %' : 'Avg Grade'}
              </span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats.avgScore.toFixed(1)}{challenge.type === 'mcq_quiz' ? '%' : ''}
            </p>
          </div>
        </div>

        {/* Quiz Leaderboard for MCQ type */}
        {challenge.type === 'mcq_quiz' && responses.length > 0 && (
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-accent/10 border border-accent/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="h-6 w-6 text-accent" />
              <h3 className="text-xl font-bold text-white">Quiz Leaderboard</h3>
            </div>
            <div className="space-y-2">
              {[...responses]
                .map(r => ({ ...r, quizScore: computeQuizScore(r.responseData, challenge.questions)?.score || 0 }))
                .sort((a, b) => b.quizScore - a.quizScore)
                .slice(0, 5)
                .map((r, idx) => (
                  <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm flex-shrink-0',
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      idx === 1 ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
                      idx === 2 ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' :
                      'bg-white/10 text-text-muted border border-white/10'
                    )}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </span>
                    <span className="flex-1 text-sm font-bold text-white truncate">{r.userName || r.userUsername || 'Anonymous'}</span>
                    <div className="text-right mr-3">
                      <p className="text-sm font-bold text-white">{r.quizScore}%</p>
                      <p className="text-xs text-text-muted">
                        {computeQuizScore(r.responseData, challenge.questions)?.correct}/{challenge.questions?.length} correct
                      </p>
                    </div>
                    <div className="w-20 flex-shrink-0">
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full',
                            r.quizScore >= 70 ? 'bg-green-400' : r.quizScore >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                          )}
                          style={{ width: `${r.quizScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Winner Selection Panel */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h3 className="text-xl font-bold text-white">Award Winner</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-text-muted mb-2">XP Amount for Winner</label>
              <input
                type="number"
                value={xpAmount}
                onChange={(e) => setXpAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full max-w-xs rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                min="0"
              />
            </div>
            <div className="text-sm text-text-muted">
              <Sparkles className="h-4 w-4 inline mr-1" />
              Select a response below to award as winner
            </div>
          </div>
          {challenge.winnerId && (
            <div className="mt-4 rounded-lg bg-green-500/20 border border-green-500/30 p-3">
              <p className="text-sm font-bold text-green-400">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                Winner: {challenge.winnerName || 'Unknown'} ({xpAmount} XP awarded)
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Filter className="h-5 w-5 text-text-muted" />
          {['all', 'pending', 'reviewed', 'accepted', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-bold transition-all border capitalize",
                filter === status
                  ? "bg-accent text-white border-accent shadow-lg shadow-accent/20"
                  : "bg-white/5 text-text-muted border-white/10 hover:bg-white/10"
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Responses List */}
        {filteredResponses.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-white/10 p-16 text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                <Trophy className="relative h-20 w-20 text-text-muted" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No responses yet</h2>
            <p className="text-text-muted">
              {filter === 'all' 
                ? 'Wait for participants to submit their responses' 
                : `No ${filter} responses found`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResponses.map((response, index) => {
              const quizData = challenge.type === 'mcq_quiz' && challenge.questions?.length
                ? computeQuizScore(response.responseData, challenge.questions)
                : null;

              return (
                <div
                  key={response.id}
                  className="group rounded-2xl glass-card border border-white/10 p-6 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10 transition-all animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-cyan-500/20 text-accent font-bold text-lg border border-accent/30">
                        {(response.userName || response.userUsername || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                          {response.userName || response.userUsername || 'Anonymous'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border",
                            getStatusColor(response.status)
                          )}>
                            {response.status}
                          </span>
                          {response.submittedAt && (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <Calendar className="h-3 w-3" />
                              {new Date(response.submittedAt.seconds * 1000).toLocaleDateString()} at {new Date(response.submittedAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          )}
                          {quizData && (
                            <span className={cn(
                              'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border',
                              quizData.score >= 70
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : quizData.score >= 40
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            )}>
                              <Brain className="h-3 w-3" />
                              {quizData.correct}/{quizData.total} · {quizData.score}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedResponse(response)}
                        className="group-hover:bg-accent/20"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {response.status !== 'ACCEPTED' && !challenge.winnerId && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAwardWinner(response.id)}
                          disabled={awarding}
                          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          {awarding ? 'Awarding...' : 'Award Winner'}
                        </Button>
                      )}
                      {response.id === challenge.winnerResponseId && (
                        <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                          <Crown className="h-4 w-4" />
                          Winner
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rich inline preview */}
                  <ResponseCardPreview response={response} challenge={challenge} />

                  {response.score !== undefined && response.score > 0 && challenge.type !== 'mcq_quiz' && (
                    <div className="mt-4 flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-bold text-white">Grade: {response.score}/100</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedResponse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="relative w-full max-w-3xl rounded-3xl glass-card p-6 md:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedResponse(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-accent/20 to-cyan-500/20 text-accent font-bold text-2xl border border-accent/30">
                    {(selectedResponse.userName || selectedResponse.userUsername || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedResponse.userName || selectedResponse.userUsername || 'Anonymous'}
                    </h2>
                    <p className="text-text-muted">
                      Submitted: {selectedResponse.submittedAt ? new Date(selectedResponse.submittedAt.seconds * 1000).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold border",
                    getStatusColor(selectedResponse.status)
                  )}>
                    {selectedResponse.status}
                  </span>
                  {/* For MCQ: show live computed quiz score badge */}
                  {challenge.type === 'mcq_quiz' && challenge.questions?.length && (() => {
                    const q = computeQuizScore(selectedResponse.responseData, challenge.questions);
                    return q ? (
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold border',
                        q.score >= 70
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : q.score >= 40
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      )}>
                        <Brain className="h-4 w-4" />
                        Quiz: {q.correct}/{q.total} ({q.score}%)
                      </span>
                    ) : null;
                  })()}
                  {selectedResponse.score !== undefined && selectedResponse.score > 0 && challenge.type !== 'mcq_quiz' && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Award className="h-4 w-4" />
                      Grade: {selectedResponse.score}/100
                    </span>
                  )}
                </div>
              </div>

              {/* Type label */}
              <div className="mb-3 flex items-center gap-2">
                <TypeIcon className="h-5 w-5 text-accent" />
                <h3 className="text-base font-bold text-white capitalize">
                  {challenge.type?.replace(/_/g, ' ')} Response
                </h3>
              </div>

              {/* Rich type-specific response view */}
              <div className="rounded-2xl bg-white/5 p-4 sm:p-6 border border-white/10">
                <ResponsePreviewCard response={selectedResponse} challenge={challenge} />
              </div>

              {selectedResponse.feedback && (
                <div className="mt-4 rounded-2xl bg-white/5 p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    Feedback
                  </h3>
                  <p className="text-sm text-text-muted">{selectedResponse.feedback}</p>
                </div>
              )}

              {/* Award winner button inside modal */}
              {selectedResponse.status !== 'ACCEPTED' && !challenge.winnerId && (
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      setSelectedResponse(null);
                      handleAwardWinner(selectedResponse.id);
                    }}
                    disabled={awarding}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Award Winner ({xpAmount} XP)
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}