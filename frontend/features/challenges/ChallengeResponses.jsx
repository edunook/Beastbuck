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
  TrendingUp,
  BarChart3,
  Crown,
  Sparkles
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
  mcq_quiz: FileText,
  image_upload: ImageIcon,
  video_upload: Video,
  text_essay: FileText,
  file_upload: Upload,
  poll_voting: BarChart3,
};

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

  const getResponseTypeDisplay = (responseData) => {
    if (!responseData) return 'No data';
    
    if (responseData.selected !== undefined) {
      return `Poll selection: Option ${responseData.selected + 1}`;
    }
    if (responseData.text) {
      return `Text response: ${responseData.text.substring(0, 50)}${responseData.text.length > 50 ? '...' : ''}`;
    }
    if (responseData.file) {
      return `File: ${responseData.file}`;
    }
    if (Array.isArray(responseData)) {
      return `Quiz: ${responseData.length} questions answered`;
    }
    return 'Response submitted';
  };

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
    const avgScore = responses.filter(r => r.score !== undefined).reduce((sum, r) => sum + r.score, 0) / responses.filter(r => r.score !== undefined).length || 0;
    
    return { pending, reviewed, accepted, rejected, avgScore };
  };

  const stats = getStats();

  const handleAwardWinner = async (responseId) => {
    if (!window.confirm(`Are you sure you want to award ${xpAmount} XP to this response as the winner?`)) return;
    
    setAwarding(true);
    try {
      const response = responses.find(r => r.id === responseId);
      if (!response) throw new Error('Response not found');
      
      // Update response as winner
      await ChallengeService.gradeResponse(responseId, 100, 1, 'Congratulations! You won this challenge!');
      
      // Award XP via gamification service
      const { GamificationService } = await import('@services/firestore/gamification');
      await GamificationService.awardXP({
        uid: response.userId,
        amount: xpAmount,
        reason: `Challenge Winner: ${challenge.title}`,
        sourceType: 'CHALLENGE_WIN',
        sourceId: challengeId,
        actorId: user.uid,
      });
      
      // Update challenge with winner info
      await ChallengeService.updateCommunityChallenge(challengeId, {
        winnerId: response.userId,
        winnerName: response.userName || response.userUsername,
        winnerResponseId: responseId,
        awardedAt: new Date(),
      });
      
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
              <span className="text-xs text-text-muted">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.avgScore.toFixed(1)}</p>
          </div>
        </div>

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
            {filteredResponses.map((response, index) => (
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

                <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                  <p className="text-sm text-text-muted">
                    {getResponseTypeDisplay(response.responseData)}
                  </p>
                </div>

                {response.score !== undefined && (
                  <div className="mt-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm font-bold text-white">Score: {response.score}/100</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Response Detail Modal */}
        {selectedResponse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="relative w-full max-w-3xl rounded-3xl glass-card p-6 md:p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedResponse(null)}
                className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

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
                  {selectedResponse.score !== undefined && (
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Award className="h-4 w-4" />
                      Score: {selectedResponse.score}/100
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Response Details
                </h3>
                <pre className="text-sm text-text-muted whitespace-pre-wrap bg-black/30 p-4 rounded-xl overflow-auto max-h-96 border border-white/5">
                  {JSON.stringify(selectedResponse.responseData, null, 2)}
                </pre>
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
            </div>
          </div>
        )}
      </PageContainer>
    </>
  );
}