import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, Target, Flame, Zap, Users, Award, Calendar, CheckCircle, X, FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function ResearchChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionText, setSubmissionText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = () => {
    setChallenges([
      {
        id: 1,
        title: 'Plastic Pollution Solution',
        description: 'Develop and submit a sustainable research model for reducing single-use plastic waste in urban coastal communities using innovative eco-friendly materials.',
        fullDetails: 'Plastic pollution is one of the greatest environmental threats facing marine ecosystems today. This challenge requires participants to outline a practical, scalable, and community-driven approach to plastic reduction. Focus areas include bio-degradable polymer alternatives, smart recycling incentives, or automated waste recovery mechanisms.',
        type: 'weekly',
        xp: 100,
        participants: 234,
        icon: 'â™»ï¸',
        color: 'emerald',
      },
      {
        id: 2,
        title: 'Build an AI Model',
        description: 'Architect a machine learning framework to address real-world challenges in energy grid optimization or climate monitoring.',
        fullDetails: 'Artificial intelligence holds immense promise for solving complex global crises. In this challenge, design or prototype an AI/ML algorithm (e.g. computer vision, time-series forecasting, or NLP) targeted at sustainability or healthcare diagnostics. Provide your methodology, model architecture, and expected outcomes.',
        type: 'monthly',
        xp: 500,
        participants: 156,
        icon: 'ðŸ¤–',
        color: 'purple',
      },
      {
        id: 3,
        title: 'Design a Robot',
        description: 'Design an autonomous robotic helper for hazardous exploration, medical support, or automated farming.',
        fullDetails: 'Robotics enables humans to extend capabilities into dangerous or labor-intensive environments. Create a structural design or schematic for a robot capable of performing high-impact tasks. Include specifications on mobility, power efficiency, sensor suites, and safety protocols.',
        type: 'special',
        xp: 300,
        participants: 89,
        icon: 'ðŸ¦¾',
        color: 'cyan',
      },
      {
        id: 4,
        title: 'Improve Farming',
        description: 'Propose innovative vertical farming or hydroponics technology to maximize food yield while minimizing water consumption.',
        fullDetails: 'Sustainable agriculture is vital to support growing global populations amidst climate volatility. Research and propose methods leveraging IoT soil sensors, precision drip irrigation, or automated vertical crop systems to dramatically reduce water usage and land footprint.',
        type: 'weekly',
        xp: 150,
        participants: 312,
        icon: 'ðŸŒ±',
        color: 'green',
      },
      {
        id: 5,
        title: 'Invent Something Useful',
        description: 'Conceptualize an accessible consumer invention that solves an everyday problem for people with disabilities or limited mobility.',
        fullDetails: 'Inclusive technology makes life significantly better for millions. Present a user-centric invention, product design, or assistive tool designed specifically to improve daily accessibility, communication, or physical independence.',
        type: 'monthly',
        xp: 400,
        participants: 198,
        icon: 'ðŸ’¡',
        color: 'amber',
      },
      {
        id: 6,
        title: 'Space Challenge',
        description: 'Research closed-loop life support systems for long-duration deep space human missions.',
        fullDetails: 'Deep space exploration demands zero-waste closed-loop environmental systems. Formulate research on recycling oxygen, water filtration, or radiation shielding suitable for Martian habitat colonies or lunar space stations.',
        type: 'special',
        xp: 600,
        participants: 145,
        icon: 'ðŸš€',
        color: 'blue',
      },
    ]);
  };

  const handleOpenJoinModal = (challenge) => {
    setSelectedChallenge(challenge);
    setSubmissionText('');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!submissionText.trim()) {
      setError('Please write a brief response before submitting.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setUserChallenges(prev => [...prev, selectedChallenge.id]);
      setSubmitting(false);
      setShowModal(false);
    }, 600);
  };

  const getColorClass = (color) => {
    const colors = {
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      green: 'bg-green-500/20 border-green-500/30 text-green-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    };
    return colors[color] || colors.emerald;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Challenges" 
        description="Complete challenges to earn XP, certificates, and recognition!"
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">Weekly</span>
            </div>
            <p className="text-text-muted text-sm">New challenges every week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">Monthly</span>
            </div>
            <p className="text-text-muted text-sm">Bigger challenges, bigger rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-6 w-6 text-cyan-400" />
              <span className="text-2xl font-bold text-white">Special</span>
            </div>
            <p className="text-text-muted text-sm">Limited-time special events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {challenges.map((challenge) => {
          const isJoined = userChallenges.includes(challenge.id);
          return (
            <Card key={challenge.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{challenge.icon}</span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{challenge.title}</h3>
                        <p className="text-text-muted text-sm line-clamp-2">{challenge.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Award className="h-4 w-4 text-amber-400" />
                        <span>{challenge.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Users className="h-4 w-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${getColorClass(challenge.color)}`}>
                        {challenge.type}
                      </div>
                    </div>
                  </div>

                  {isJoined ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm font-bold">Joined</span>
                    </div>
                  ) : (
                    <Button onClick={() => handleOpenJoinModal(challenge)} size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Join
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rewards Info */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-2">Rewards</h3>
              <p className="text-text-soft text-sm">
                Complete challenges to earn XP, unlock certificates, get featured on the homepage, 
                and earn recognition as a top researcher!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Description & Submission Modal */}
      {showModal && selectedChallenge && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end sm:justify-center sm:items-center bg-black/85 backdrop-blur-md animate-fade-in p-0 sm:p-4 md:p-6">
          <div className="relative w-full max-w-4xl h-[88vh] sm:h-auto max-h-[88vh] sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl glass-card border-t sm:border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex-shrink-0 p-4 sm:p-6 pb-3 sm:pb-4 border-b border-white/10 bg-[#0d1117]/95 backdrop-blur-xl flex items-start justify-between gap-3 z-20">
              <div className="flex items-start gap-3 min-w-0">
                <span className="text-3xl sm:text-4xl">{selectedChallenge.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold border ${getColorClass(selectedChallenge.color)}`}>
                      {selectedChallenge.type}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] sm:text-xs font-bold text-amber-400">
                      <Award className="h-3 w-3" />
                      {selectedChallenge.xp} XP
                    </span>
                  </div>
                  <h2 className="text-base sm:text-xl font-extrabold text-white leading-snug break-words">
                    {selectedChallenge.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-text-muted hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 overscroll-contain">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-400 text-xs sm:text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Full Description Box */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-4 sm:p-6 shadow-inner backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 text-accent font-bold text-xs sm:text-sm uppercase tracking-wider">
                    <FileText className="h-4 w-4 text-accent" />
                    <span>Full Challenge Brief &amp; Research Guidelines</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-gray-200 leading-relaxed font-normal whitespace-pre-wrap break-words">
                    {selectedChallenge.fullDetails || selectedChallenge.description}
                  </p>
                </div>

                {/* Submission Textarea */}
                <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                  <label className="mb-2 block text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Your Research Submission
                  </label>
                  <textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Describe your research proposal, idea, or solution..."
                    rows={4}
                    className="w-full rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base text-white placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none"
                    required
                  />
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="bb-sticky-action-footer flex-shrink-0 sticky bottom-0 z-30 border-t border-white/15 bg-[#0d1117] backdrop-blur-2xl flex items-center gap-3 shadow-[0_-12px_30px_rgba(0,0,0,0.95)]">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold shadow-lg shadow-accent/20"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Submit &amp; Join Challenge</span>
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </PageContainer>
  );
}
