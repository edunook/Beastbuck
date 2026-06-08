import { useState } from 'react';
import { Megaphone, Building2 } from 'lucide-react';
import { PageContainer, SectionWrapper } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OrganizationService } from '../../services/firebase/organization';
import { useAuth } from '../auth/AuthContext';

export default function AdminOrganization() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  
  const [announcement, setAnnouncement] = useState({
    title: '',
    content: '',
    pinned: false,
    scheduledFor: '',
    expiresAt: ''
  });

  const publish = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data = {
        title: announcement.title,
        content: announcement.content,
        pinned: announcement.pinned,
        scheduledFor: announcement.scheduledFor ? new Date(announcement.scheduledFor) : null,
        expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt) : null,
      };
      await OrganizationService.publishAnnouncement(data, user.uid);
      setMessage('Announcement published successfully.');
      setAnnouncement({ title: '', content: '', pinned: false, scheduledFor: '', expiresAt: '' });
    } catch (err) {
      console.error(err);
      setMessage('Error publishing announcement.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Admin: Organization OS"
        description="Manage high-level organization structures and broad communications."
        action={<div className="flex h-12 w-12 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent"><Building2 className="h-6 w-6" /></div>}
      />

      <SectionWrapper>
        <Card className="rounded-lg max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-accent" /> Organization Announcements</CardTitle>
            <CardDescription>Broadcast messages to the entire organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {message && <div className="mb-4 rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent">{message}</div>}
            <form onSubmit={publish} className="space-y-4">
              <Input
                placeholder="Announcement Title"
                value={announcement.title}
                onChange={(e) => setAnnouncement(curr => ({ ...curr, title: e.target.value }))}
                required
              />
              <textarea
                placeholder="Content..."
                value={announcement.content}
                onChange={(e) => setAnnouncement(curr => ({ ...curr, content: e.target.value }))}
                required
                rows={4}
                className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={announcement.pinned}
                  onChange={(e) => setAnnouncement(curr => ({ ...curr, pinned: e.target.checked }))}
                  className="rounded border-border bg-white/5 accent-accent"
                />
                <label htmlFor="pinned" className="text-sm font-bold text-white">Pin to top</label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-text-muted">Schedule For (Optional)</span>
                  <Input
                    type="datetime-local"
                    value={announcement.scheduledFor}
                    onChange={(e) => setAnnouncement(curr => ({ ...curr, scheduledFor: e.target.value }))}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase text-text-muted">Expires At (Optional)</span>
                  <Input
                    type="datetime-local"
                    value={announcement.expiresAt}
                    onChange={(e) => setAnnouncement(curr => ({ ...curr, expiresAt: e.target.value }))}
                  />
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={busy}>{busy ? 'Publishing...' : 'Publish Announcement'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </SectionWrapper>
    </PageContainer>
  );
}
