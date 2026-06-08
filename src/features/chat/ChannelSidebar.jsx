import { useState } from 'react';
import { Archive, Hash, Megaphone, Plus, X } from 'lucide-react';
import Button from '../../components/ui/Button';

export function ChannelSidebar({
  rooms,
  activeRoomId,
  canManageChannels,
  onSelectRoom,
  onCreateChannel,
  onArchiveChannel,
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onCreateChannel({ name, description, type });
      setName('');
      setDescription('');
      setType('public');
      setCreating(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-border bg-black/20 md:w-72 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-muted">Channels</h2>
          <p className="text-xs text-text-muted">{rooms.length} active rooms</p>
        </div>
        {canManageChannels && (
          <button
            type="button"
            onClick={() => setCreating(current => !current)}
            className="rounded-lg border border-border bg-white/5 p-2 text-text-soft transition hover:border-accent/40 hover:text-white"
            aria-label={creating ? 'Close channel form' : 'Create channel'}
          >
            {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={submit} className="space-y-3 border-b border-border p-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="channel-name"
            maxLength={40}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-muted focus:border-accent/60"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Description"
            maxLength={120}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none transition placeholder:text-text-muted focus:border-accent/60"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-white outline-none transition focus:border-accent/60"
          >
            <option value="public">Public</option>
            <option value="announcement">Announcement</option>
          </select>
          <Button type="submit" size="sm" className="w-full" disabled={submitting || !name.trim()}>
            Create Channel
          </Button>
        </form>
      )}

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3 custom-scrollbar" aria-label="Chat channels">
        {rooms.map(room => {
          const active = room.id === activeRoomId;
          const announcement = room.type === 'announcement';

          return (
            <div key={room.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectRoom(room.id)}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                  active
                    ? 'border border-accent/30 bg-accent/10 text-white'
                    : 'border border-transparent text-text-soft hover:border-border hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`rounded-lg p-1.5 ${announcement ? 'bg-status-warning/10 text-status-warning' : 'bg-white/5 text-accent'}`}>
                  {announcement ? <Megaphone className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">#{room.name}</span>
                  <span className="block truncate text-xs text-text-muted">{room.description}</span>
                </span>
              </button>
              {canManageChannels && !room.isDefault && (
                <button
                  type="button"
                  onClick={() => onArchiveChannel(room.id)}
                  className="rounded-lg p-2 text-text-muted opacity-0 transition hover:bg-status-danger/10 hover:text-status-danger group-hover:opacity-100"
                  aria-label={`Archive ${room.name}`}
                >
                  <Archive className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
