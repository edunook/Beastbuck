import PresenceBadge from './PresenceBadge';

export default function LivePresenceBar({ editors = [], typingLabel = 'typing' }) {
  if (!editors.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border/50 bg-surface/50 px-4 py-2">
      <span className="text-xs font-bold uppercase text-text-muted">Live</span>
      {editors.map(editor => (
        <span
          key={editor.userId || editor.id}
          className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1 text-xs text-white"
        >
          <PresenceBadge state="collaborating" size="sm" />
          {editor.displayName || editor.userId}
          {editor.isTyping && <span className="text-accent">{typingLabel}…</span>}
        </span>
      ))}
    </div>
  );
}
