import { useState, useEffect } from 'react';
import { Award, Calendar, Plus, CalendarClock, Search } from 'lucide-react';
import { PageHeader, LoadingState } from '@frontend/components/ui/UIElements';
import { SectionWrapper } from '@frontend/components/layout/LayoutWrappers';
import { EventService } from '@services/firestore/events';
import { UsersService } from '@services/firestore/users';
import { useAuth } from '../auth/AuthContext';
import { formatDate } from '@shared/lib/dateUtils';

export default function AdminEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', startDate: '', endDate: '', status: 'UPCOMING' });
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);

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

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const allMembers = await UsersService.getAllMembers();
      setMembers(allMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => { load(); loadMembers(); }, []);

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
              const uid = selectedMember?.id;
              const title = e.target.title.value;
              const desc = e.target.description.value;
              if (!uid || !title) return;
              try {
                const { CertificateService } = await import('@services/firestore/certificates');
                await CertificateService.issueCertificate({
                  userId: uid,
                  type: 'MANUAL',
                  title,
                  description: desc,
                  actorId: user.uid
                });
                alert('Certificate issued successfully');
                setSelectedMember(null);
                e.target.title.value = '';
                e.target.description.value = '';
              } catch (err) {
                console.error(err);
                alert('Failed to issue certificate');
              }
            }} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">Select Member</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members by name, username, or email..."
                    className="w-full rounded-xl border border-border bg-black/20 p-3 pl-10 text-white focus:border-accent focus:outline-none"
                  />
                </div>
              </div>
              
              {!loadingMembers && searchQuery && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-black/20">
                  {members.filter(member => {
                    const searchLower = searchQuery.toLowerCase();
                    const displayName = (member.displayName || '').toLowerCase();
                    const username = (member.username || '').toLowerCase();
                    const email = (member.email || '').toLowerCase();
                    return displayName.includes(searchLower) || username.includes(searchLower) || email.includes(searchLower);
                  }).length === 0 ? (
                    <div className="text-center py-4 text-text-muted text-sm">No members found</div>
                  ) : (
                    members.filter(member => {
                      const searchLower = searchQuery.toLowerCase();
                      const displayName = (member.displayName || '').toLowerCase();
                      const username = (member.username || '').toLowerCase();
                      const email = (member.email || '').toLowerCase();
                      return displayName.includes(searchLower) || username.includes(searchLower) || email.includes(searchLower);
                    }).slice(0, 10).map(member => (
                      <div
                        key={member.id}
                        onClick={() => {
                          setSelectedMember(member);
                          setSearchQuery(member.displayName || member.username || '');
                        }}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-white/10 ${
                          selectedMember?.id === member.id ? 'bg-accent/20 border-l-2 border-accent' : ''
                        }`}
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {(member.displayName || member.username || 'M')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">{member.displayName || member.username || 'Unknown'}</p>
                          <p className="text-xs text-text-muted truncate">@{member.username || member.email || 'No username'}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedMember && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/10 border border-accent/30">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {(selectedMember.displayName || selectedMember.username || 'M')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm truncate">{selectedMember.displayName || selectedMember.username}</p>
                    <p className="text-xs text-text-muted truncate">{selectedMember.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedMember(null)}
                    className="text-text-muted hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">Title</label>
                <input required name="title" type="text" className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-text-soft">Description</label>
                <textarea required name="description" className="w-full rounded-xl border border-border bg-black/20 p-3 text-white focus:border-accent focus:outline-none" />
              </div>
              <button type="submit" disabled={!selectedMember} className="w-full rounded-xl border border-accent text-accent px-4 py-3 font-bold hover:bg-accent/10 transition disabled:opacity-50">
                Issue Certificate
              </button>
            </form>
          </SectionWrapper>
        </div>
      </div>
    </div>
  );
}
