import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { GovernanceService } from '@services/firestore/governance';
import { Calendar, Plus, Clock, CheckCircle, Users, Search, X } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { cn } from '@shared/lib/utils';

export default function MeetingCenter() {
  const { user, roleData } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', scheduledFor: '', attendees: [] });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await GovernanceService.getMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Error loading meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    try {
      await GovernanceService.createMeeting(formData, user.uid);
      await loadMeetings();
      setShowModal(false);
      setFormData({ title: '', description: '', scheduledFor: '', attendees: [] });
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingMeeting) return;
    try {
      await GovernanceService.updateMeeting(editingMeeting.id, formData);
      await loadMeetings();
      setShowModal(false);
      setEditingMeeting(null);
      setFormData({ title: '', description: '', scheduledFor: '', attendees: [] });
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('Failed to update meeting');
    }
  };

  const handleComplete = async (meetingId) => {
    const summary = prompt('Enter meeting summary:');
    if (!summary) return;
    try {
      await GovernanceService.completeMeeting(meetingId, summary);
      await loadMeetings();
    } catch (error) {
      console.error('Error completing meeting:', error);
      alert('Failed to complete meeting');
    }
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      scheduledFor: meeting.scheduledFor || '',
      attendees: meeting.attendees || [],
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'COMPLETED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-text-muted bg-white/5 border-border';
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Meeting Center is only accessible to executives.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const filteredMeetings = meetings.filter(m =>
    m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <PageHeader 
        title="Meeting Center" 
        description="Schedule and manage organizational meetings."
        hero={true}
        action={
          <Button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meetings..."
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No meetings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="group relative overflow-hidden rounded-xl border border-border bg-white/[0.02] p-6 transition-all hover:border-purple-500/30 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider", getStatusColor(meeting.status))}>
                          {meeting.status === 'SCHEDULED' ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          <span>{meeting.status}</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-white text-lg mb-2">{meeting.title}</h3>
                      {meeting.description && (
                        <p className="text-text-soft text-sm mb-4">{meeting.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        {meeting.scheduledFor && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(meeting.scheduledFor?.toDate?.() || meeting.scheduledFor).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{meeting.attendees?.length || 0} Attendees</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {meeting.status === 'SCHEDULED' && (
                        <Button
                          onClick={() => openEditModal(meeting)}
                          size="sm"
                          variant="secondary"
                        >
                          Edit
                        </Button>
                      )}
                      {meeting.status === 'SCHEDULED' && (
                        <Button
                          onClick={() => handleComplete(meeting.id)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative max-w-md w-full bg-background border border-border rounded-3xl p-8">
            <button
              onClick={() => {
                setShowModal(false);
                setEditingMeeting(null);
                setFormData({ title: '', description: '', scheduledFor: '', attendees: [] });
              }}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">
              {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
            </h2>

            <form onSubmit={editingMeeting ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter meeting description"
                  rows={3}
                  className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Scheduled For</label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMeeting(null);
                    setFormData({ title: '', description: '', scheduledFor: '', attendees: [] });
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingMeeting ? 'Update' : 'Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
