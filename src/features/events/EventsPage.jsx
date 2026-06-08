import { useState, useEffect } from 'react';
import { Calendar, Radio, CheckCircle, ChevronRight, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { EventService } from '../../services/firebase/events';
import { formatDate } from '../../lib/dateUtils';

function EventCard({ event }) {
  const isLive = event.status === 'LIVE';
  const isCompleted = event.status === 'COMPLETED';

  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-surface/50 p-6 transition-all hover:border-accent/40 hover:bg-surface/80"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/5 blur-3xl transition-all group-hover:bg-accent/10" />
      
      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
            isLive ? 'bg-status-success/10 text-status-success' : 
            isCompleted ? 'bg-white/5 text-text-muted' : 
            'bg-accent/10 text-accent'
          }`}>
            {isLive && <Radio className="h-3 w-3 animate-pulse" />}
            {isCompleted && <CheckCircle className="h-3 w-3" />}
            {!isLive && !isCompleted && <Calendar className="h-3 w-3" />}
            {event.status}
          </span>
          <span className="text-xs font-bold text-text-muted">
            {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </span>
        </div>
        
        <h3 className="mb-2 font-heading text-xl font-black text-white group-hover:text-accent">
          {event.title}
        </h3>
        <p className="line-clamp-2 text-sm text-text-muted">
          {event.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
        <div className="flex items-center gap-2 text-xs font-bold text-text-muted">
          <Users className="h-4 w-4" />
          <span>{event.participantCount || 0} Registered</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-bold text-accent">
          Details <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await EventService.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const live = events.filter(e => e.status === 'LIVE');
  const upcoming = events.filter(e => e.status === 'UPCOMING' || e.status === 'PUBLISHED');
  const completed = events.filter(e => e.status === 'COMPLETED');

  return (
    <PageContainer>
      <PageHeader
        title="Events & Competitions"
        description="Join hackathons, innovation challenges, and seasonal events."
        action={
          <Link to="/events/create" className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-black font-bold px-4 py-2 rounded-lg transition">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        }
      />

      {loading ? (
        <div className="flex min-h-64 items-center justify-center">
          <LoadingState text="Loading events..." />
        </div>
      ) : (
        <div className="space-y-12">
          {live.length > 0 && (
            <SectionWrapper>
              <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-black text-white">
                <Radio className="h-6 w-6 text-status-success animate-pulse" /> Live Now
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {live.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </SectionWrapper>
          )}

          {upcoming.length > 0 && (
            <SectionWrapper>
              <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-black text-white">
                <Calendar className="h-6 w-6 text-accent" /> Upcoming Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </SectionWrapper>
          )}

          {completed.length > 0 && (
            <SectionWrapper>
              <h2 className="mb-6 flex items-center gap-2 font-heading text-2xl font-black text-white">
                <CheckCircle className="h-6 w-6 text-text-muted" /> Past Events
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-70 transition-opacity hover:opacity-100">
                {completed.map(e => <EventCard key={e.id} event={e} />)}
              </div>
            </SectionWrapper>
          )}

          {events.length === 0 && (
            <div className="py-20 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-text-muted opacity-50" />
              <h3 className="mb-2 text-xl font-bold text-white">No events found</h3>
              <p className="text-text-muted">Check back later for new competitions and hackathons.</p>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
}
