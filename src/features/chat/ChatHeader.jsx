import { Hash, Megaphone } from 'lucide-react';

export function ChatHeader({ room, memberName, memberRole, canSend }) {
  const announcement = room?.type === 'announcement';

  return (
    <header className="flex flex-col gap-3 border-b border-border bg-surface/80 px-4 py-4 backdrop-blur md:flex-row md:items-center md:justify-between md:px-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
          announcement
            ? 'border-status-warning/25 bg-status-warning/10 text-status-warning'
            : 'border-accent/25 bg-accent/10 text-accent'
        }`}>
          {announcement ? <Megaphone className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
        </div>
        <div>
          <h1 className="font-heading text-xl font-bold text-white">#{room?.name || 'general'}</h1>
          <p className="text-sm text-text-muted">
            {room?.description || 'Realtime BeastBuck team messages'}
          </p>
          {announcement && !canSend && (
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-status-warning">
              Read only for members
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-start rounded-xl border border-border bg-black/20 px-3 py-2 text-xs md:self-auto">
        <span className="max-w-[180px] truncate font-bold text-white">{memberName}</span>
        <span className="rounded-lg bg-accent/10 px-2 py-1 font-bold uppercase tracking-widest text-accent">
          {memberRole}
        </span>
      </div>
    </header>
  );
}
