import { useState, useEffect } from 'react';
import { Award, Calendar, Plus, CalendarClock } from 'lucide-react';
import { PageHeader, LoadingState } from '../../components/ui/UIElements';
import { SectionWrapper } from '../../components/layout/LayoutWrappers';
import { EventService } from '../../services/firebase/events';
import { useAuth } from '../auth/AuthContext';
import { formatDate } from '../../lib/dateUtils';

export default function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', startDate: '', endDate: '', status: 'UPCOMING' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await EventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await EventService.createEvent(newEvent, user.uid);
      setNewEvent({ title: '', description: '', startDate: '', endDate: '', status: 'UPCOMING' });
      await load();
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Event Management"
        description="Schedule events, manage challenges, and award winners."
        action={
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <Calendar className="h-6 w-6" />
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionWrapper>
            <h3 className="mb-6 font-heading text-xl font-bold text-white">All Events</h3>
            {loading ? <LoadingState /> : (
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="rounded-xl border border-border/60 bg-surface/30 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-bold text-white">{event.title}</h4>
                      <span className={`rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        event.status === 'LIVE' ? 'bg-status-success/10 text-status-success' : 'bg-white/5 text-text-muted'
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">{event.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs font-bold text-text-muted">
                      <span className="flex items-center gap-1"><CalendarClock className="h-4 w-4" /> {formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
                    </div>
                    
                    {/* Placeholder for future detailed management (e.g. adding challenges, reviewing submissions) */}
                    <div className="mt-4 border-t border-border/40 pt-4 flex gap-2">
                      <button className="rounded-lg bg-accent/10 px-4 py-2 text-xs font-bold text-accent hover:bg-accent/20">
                        Manage Challenges
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionWrapper>
        </div>

        <div className="lg:col-span-1">
          <SectionWrapper>
            <h3 className="mb-6 font-heading text-xl font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-accent" /> Schedule Event
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">Title</label>
                <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">Description</label>
                <textarea required value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-text-soft">Start Date</label>
                  <input required type="datetime-local" value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})} className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-text-soft">End Date</label>
                  <input required type="datetime-local" value={newEvent.endDate} onChange={e => setNewEvent({...newEvent, endDate: e.target.value})} className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
                </div>
              </div>
              <button disabled={creating} type="submit" className="w-full rounded-xl bg-accent px-4 py-3 font-bold text-black hover:bg-accent-hover disabled:opacity-50">
                {creating ? 'Scheduling...' : 'Schedule Event'}
              </button>
            </form>
          </SectionWrapper>
          <SectionWrapper className="mt-8">
            <h3 className="mb-6 font-heading text-xl font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" /> Issue Certificate
            </h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const uid = e.target.userId.value;
              const title = e.target.title.value;
              const desc = e.target.description.value;
              if (!uid || !title) return;
              try {
                const { CertificateService } = await import('../../services/firebase/certificates');
                await CertificateService.issueCertificate({
                  userId: uid,
                  type: 'MANUAL',
                  title,
                  description: desc,
                  actorId: user.uid
                });
                alert('Certificate issued successfully');
                e.target.reset();
              } catch (err) {
                console.error(err);
                alert('Failed to issue certificate');
              }
            }} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">User ID</label>
                <input required name="userId" type="text" className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">Title</label>
                <input required name="title" type="text" className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">Description</label>
                <textarea required name="description" className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <button type="submit" className="w-full rounded-xl border border-accent text-accent px-4 py-3 font-bold hover:bg-accent/10 transition">
                Issue Certificate
              </button>
            </form>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
