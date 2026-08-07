import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Clock, Image as ExternalLink, ShieldCheck } from 'lucide-react';
import { PageContainer, SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { ChallengeService } from '@services/firestore/challenges';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { formatDate } from '@shared/lib/dateUtils';
import ChallengeSubmissionForm from './ChallengeSubmissionForm';

export default function ChallengeDetail() {
  const { challengeId } = useParams();
  const { user, roleData } = useAuth();
  
  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = hasPermission(roleData?.role, 'canManageOrganization');

  const load = async () => {
    try {
      const [challengeData, submissionsData] = await Promise.all([
        ChallengeService.getChallenge(challengeId),
        ChallengeService.getSubmissions(challengeId)
      ]);
      setChallenge(challengeData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error('Failed to load challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [challengeId]);

  const handleSubmitEntry = async (entryData) => {
    setSubmitting(true);
    try {
      await ChallengeService.submitChallengeEntry(challengeId, user.uid, entryData);
      await load();
      alert('Submission received! Good luck.');
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Failed to submit entry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="mt-20"><LoadingState text="Loading challenge..." /></div>;
  if (!challenge) return <div className="mt-20 text-center text-white">Challenge not found.</div>;

  const userHasSubmitted = submissions.some(s => s.userId === user?.uid);

  return (
    <PageContainer>
      <div className="mb-8">
        <Link to={`/events/${challenge.eventId}`} className="mb-4 inline-block text-sm font-bold text-accent hover:underline">
          &larr; Back to Event
        </Link>
        <PageHeader
          title={challenge.title}
          description={challenge.description}
          action={
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                <Trophy className="h-4 w-4" /> {challenge.rewardXP || 0} XP
              </span>
              {challenge.deadline && (
                <span className="text-xs text-text-muted flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Due: {formatDate(challenge.deadline)}
                </span>
              )}
            </div>
          }
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <SectionWrapper>
            <h2 className="mb-6 font-heading text-xl font-bold text-white">Submissions</h2>
            {submissions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
                <p className="text-lg font-bold text-white">No submissions yet.</p>
                <p className="text-text-muted">Be the first to submit!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {submissions.map(sub => (
                  <div key={sub.id} className={`rounded-2xl border p-6 ${sub.status === 'WINNER' ? 'border-accent/50 bg-accent/5 shadow-[0_0_15px_rgba(0,240,255,0.1)]' : 'border-border/60 bg-surface/30'}`}>
                    <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                          {(sub.user.displayName || sub.user.username || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <Link to={`/members/${sub.userId}`} className="font-bold text-white hover:text-accent">
                            {sub.user.displayName || sub.user.username}
                          </Link>
                          <p className="text-xs text-text-muted">{formatDate(sub.createdAt)}</p>
                        </div>
                      </div>
                      {sub.status === 'WINNER' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-accent">
                          <Trophy className="h-4 w-4" /> Winner
                        </span>
                      )}
                    </div>
                    
                    <p className="whitespace-pre-wrap text-sm text-text-soft">{sub.content}</p>

                    {sub.links?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {sub.links.map((link, i) => (
                          <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-text-muted hover:bg-white/10 hover:text-white transition">
                            <ExternalLink className="h-3 w-3" /> Link {i + 1}
                          </a>
                        ))}
                      </div>
                    )}

                    {sub.media?.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {sub.media.map((file, i) => (
                          <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-black/40">
                            {file.resourceType === 'image' ? (
                              <img src={file.url} alt="Submission" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                            ) : file.resourceType === 'video' ? (
                              <video src={file.url} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center p-2 text-center text-xs text-text-muted">
                                {file.originalName}
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}

                    {isAdmin && sub.status !== 'WINNER' && (
                      <div className="mt-6 border-t border-border/40 pt-4 text-right">
                        <button
                          onClick={async () => {
                            if (!window.confirm('Award this submission as a winner?')) return;
                            try {
                              await ChallengeService.awardWinner(sub.id, { xpAmount: challenge.rewardXP, badgeId: challenge.badgeId, actorId: user.uid });
                              await load();
                            } catch (e) { alert(e.message); }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-4 py-2 text-xs font-bold text-accent transition hover:bg-accent/20"
                        >
                          <ShieldCheck className="h-4 w-4" /> Award Winner
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionWrapper>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {!userHasSubmitted ? (
              <ChallengeSubmissionForm onSubmit={handleSubmitEntry} isSubmitting={submitting} />
            ) : (
              <div className="rounded-2xl border border-status-success/30 bg-status-success/5 p-6 text-center">
                <Trophy className="mx-auto mb-4 h-12 w-12 text-status-success" />
                <h3 className="mb-2 font-heading text-xl font-bold text-white">Entry Submitted!</h3>
                <p className="text-sm text-text-muted">You have successfully entered this challenge. Good luck!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
