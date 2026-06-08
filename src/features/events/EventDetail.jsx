import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Users, Target, Clock, ChevronRight } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { LoadingState } from '../../components/ui/UIElements';
import { EventService } from '../../services/firebase/events';
import { ChallengeService } from '../../services/firebase/challenges';
import { useAuth } from '../auth/AuthContext';
import { formatDate } from '../../lib/dateUtils';

export default function EventDetail() {
  const { eventId } = useParams();
  const { user } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [eventData, challengesData, registered] = await Promise.all([
          EventService.getEvent(eventId),
          ChallengeService.getChallenges(eventId),
          EventService.hasJoinedEvent(eventId, user?.uid)
        ]);
        setEvent(eventData);
        setChallenges(challengesData);
        setIsRegistered(registered);
      } catch (err) {
        console.error('Failed to load event details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId, user?.uid]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      if (isRegistered) {
        await EventService.leaveEvent(eventId, user.uid);
        setIsRegistered(false);
      } else {
        await EventService.joinEvent(eventId, user.uid);
        setIsRegistered(true);
      }
    } catch (err) {
      console.error('Failed to toggle registration:', err);
      alert('Action failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="mt-20"><LoadingState text="Loading event details..." /></div>;
  if (!event) return <div className="mt-20 text-center text-white">Event not found.</div>;

  return (
    <PageContainer>
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-border/40 bg-surface/50 p-8 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-text-muted">
            <Calendar className="h-4 w-4" />
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </div>
          <h1 className="mb-4 font-heading text-4xl font-black text-white md:text-6xl">{event.title}</h1>
          <p className="max-w-3xl text-lg text-text-muted">{event.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border/40 pt-8">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Users className="h-5 w-5 text-accent" />
              {event.participantCount || 0} Registered
            </div>
            
            <button
              onClick={handleRegister}
              disabled={registering || event.status === 'COMPLETED'}
              className={`ml-auto flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-all disabled:opacity-50 ${
                isRegistered
                  ? 'border border-status-danger/30 bg-status-danger/10 text-status-danger hover:bg-status-danger/20'
                  : 'bg-accent text-black hover:bg-accent-hover hover:scale-105'
              }`}
            >
              {registering ? 'Processing...' : isRegistered ? 'Leave Event' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>

      <SectionWrapper>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <Target className="h-6 w-6 text-accent" /> Event Challenges
          </h2>
        </div>

        {challenges.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
            <Target className="mx-auto mb-4 h-12 w-12 text-text-muted opacity-50" />
            <p className="text-lg font-bold text-white">No challenges posted yet.</p>
            <p className="text-text-muted">Challenges will appear here when the event begins.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {challenges.map(challenge => (
              <Link
                key={challenge.id}
                to={`/challenges/${challenge.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-surface/30 p-6 transition-all hover:border-accent/40 hover:bg-surface/60"
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
                      {challenge.difficulty || 'General'}
                    </span>
                    <span className="rounded-lg bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                      {challenge.rewardXP || 0} XP
                    </span>
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-bold text-white group-hover:text-accent">
                    {challenge.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-text-muted">
                    {challenge.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
                  <span className="text-xs font-bold text-text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Due {formatDate(challenge.deadline)}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-accent">
                    View Challenge <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </SectionWrapper>
    </PageContainer>
  );
}
