import { useState, useEffect } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Star, Users, MessageSquare, Heart, Share2, Bookmark, Loader2, Bot, ArrowLeft, User } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';

export default function AIProfilePage() {
  const { aiId } = useParams();
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!aiId) {
      setError('Invalid AI ID');
      setLoading(false);
      return;
    }

    const fetchAIDetails = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'custom_ais', aiId));
        if (!snap.exists()) {
          setError('Member AI not found. It may have been removed.');
        } else {
          setAi({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error('Failed to load AI details:', err);
        setError('Failed to load AI profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchAIDetails();
  }, [aiId]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 text-text-muted gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm">Loading AI profile...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !ai) {
    return (
      <PageContainer>
        <div className="max-w-xl mx-auto text-center py-16">
          <Bot className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Member AI Not Found</h2>
          <p className="text-text-muted text-sm mb-6">{error || 'This custom AI could not be located in the marketplace.'}</p>
          <Link
            to="/ais"
            className="inline-flex items-center gap-2 bg-accent text-black font-bold px-6 py-2.5 rounded-xl hover:bg-accent/90 transition text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>
        </div>
      </PageContainer>
    );
  }

  const ratingVal = typeof ai.avgRating === 'number' && ai.avgRating > 0 ? ai.avgRating.toFixed(1) : '5.0';
  const starterQuestions = Array.isArray(ai.starterQuestions) ? ai.starterQuestions : [];
  const focusAreas = Array.isArray(ai.focusAreas) ? ai.focusAreas : [];

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        <Link to="/ais" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent mb-6 font-semibold transition">
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </Link>

        {/* Hero Banner */}
        <div className="relative rounded-2xl border border-border bg-surface/40 p-6 sm:p-8 backdrop-blur-sm overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {ai.avatarUrl ? (
              <img
                src={ai.avatarUrl}
                alt={ai.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-border shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/5 border-2 border-border flex items-center justify-center text-4xl sm:text-5xl shrink-0 shadow-lg">
                {ai.emoji || '🤖'}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{ai.name}</h1>
                <span className="bg-accent/20 text-accent text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Member AI
                </span>
              </div>
              <p className="text-text-muted text-sm mb-3 leading-relaxed">
                {ai.description || 'Custom AI assistant created by a BeastBuck member.'}
              </p>
              <div className="flex items-center gap-4 justify-center sm:justify-start text-xs sm:text-sm text-text-muted">
                <span className="flex items-center gap-1 text-white/90 font-medium">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> {ratingVal}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" /> {ai.totalChats || 0} chats
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4 text-accent/70" /> By {ai.creatorName || 'Member'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 mt-6 justify-center sm:justify-start border-t border-border/40 pt-6">
            <Link
              to={`/ais/${ai.id}/chat`}
              className="bg-accent text-black font-bold px-8 py-3 rounded-xl hover:bg-accent/90 transition shadow-[0_0_20px_rgba(208,255,0,0.15)] flex items-center gap-2 text-sm"
            >
              <MessageSquare className="w-4 h-4" /> Launch Chat
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-3 text-base">About This AI</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {ai.description || 'No detailed description provided.'}
              </p>

              {(ai.personality || ai.tone || focusAreas.length > 0) && (
                <div className="mt-4 pt-4 border-t border-border/40 space-y-2">
                  {ai.personality && (
                    <div className="text-xs text-text-muted">
                      <span className="font-bold text-white">Personality:</span> {ai.personality}
                    </div>
                  )}
                  {ai.tone && (
                    <div className="text-xs text-text-muted">
                      <span className="font-bold text-white">Tone:</span> {ai.tone}
                    </div>
                  )}
                  {focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {focusAreas.map(t => (
                        <span key={t} className="bg-white/5 border border-border rounded-full px-3 py-1 text-xs font-bold text-text-muted">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Starter Questions */}
            {starterQuestions.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
                <h3 className="font-bold text-white mb-4 text-base">Try Asking</h3>
                <div className="space-y-2.5">
                  {starterQuestions.map((q, i) => (
                    <Link
                      key={i}
                      to={`/ais/${ai.id}/chat`}
                      className="block bg-white/5 hover:bg-accent/10 border border-border hover:border-accent/30 rounded-xl px-4 py-3 text-xs sm:text-sm text-white transition"
                    >
                      "{q}"
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Creator Info */}
            <div className="rounded-2xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-3 text-base">Creator Details</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
                  {(ai.creatorName || 'M')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{ai.creatorName || 'Member'}</p>
                  <p className="text-xs text-text-muted">BeastBuck Creator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
