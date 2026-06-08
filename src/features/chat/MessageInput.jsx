import { useState } from 'react';
import { SendHorizonal, X } from 'lucide-react';
import Button from '../../components/ui/Button';

function getUsername(member) {
  return member.username || member.displayName || '';
}

function getMentionQuery(text) {
  const match = text.match(/(^|\s)@([a-z0-9_]*)$/i);
  return match ? match[2].toLowerCase() : null;
}

function getMentionsFromText(text, members) {
  const usernames = new Set(
    [...text.matchAll(/@([a-z0-9_]+)/gi)].map(match => match[1].toLowerCase())
  );

  return members
    .filter(member => usernames.has(getUsername(member).toLowerCase()))
    .map(member => ({
      uid: member.id,
      username: getUsername(member).toLowerCase(),
    }));
}

export function MessageInput({
  disabled,
  readOnlyReason,
  placeholder = 'Message chat...',
  onSend,
  replyTo,
  onCancelReply,
  members = [],
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const mentionQuery = getMentionQuery(text);
  const mentionOptions = mentionQuery === null
    ? []
    : members
      .filter(member => getUsername(member).toLowerCase().includes(mentionQuery))
      .slice(0, 6);

  const submit = async (event) => {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || disabled || readOnlyReason || sending) return;

    setSending(true);
    try {
      await onSend(cleanText, getMentionsFromText(cleanText, members));
      setText('');
    } finally {
      setSending(false);
    }
  };

  const insertMention = (member) => {
    const username = getUsername(member).toLowerCase();
    setText(current => current.replace(/(^|\s)@([a-z0-9_]*)$/i, `$1@${username} `));
  };

  return (
    <form onSubmit={submit} className="border-t border-border bg-surface/90 p-3 backdrop-blur md:p-4">
      {replyTo && (
        <div className="mb-3 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent/10 px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              Replying to {replyTo.senderName || 'Member'}
            </div>
            <p className="line-clamp-2 break-words text-xs leading-5 text-text-soft">
              {replyTo.text}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="rounded-lg p-1 text-text-muted transition hover:bg-white/10 hover:text-white"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {mentionOptions.length > 0 && (
        <div className="mb-3 max-h-48 overflow-y-auto rounded-xl border border-border bg-background p-2 shadow-2xl custom-scrollbar">
          {mentionOptions.map(member => (
            <button
              key={member.id}
              type="button"
              onClick={() => insertMention(member)}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white">@{getUsername(member).toLowerCase()}</span>
                <span className="block truncate text-[10px] uppercase tracking-widest text-text-muted">{member.role}</span>
              </span>
              <span className="text-xs text-accent">Mention</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <label className="sr-only" htmlFor="global-chat-message">Message</label>
        <textarea
          id="global-chat-message"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={readOnlyReason || placeholder}
          rows={1}
          maxLength={1000}
          disabled={disabled || !!readOnlyReason || sending}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-border bg-black/30 px-4 py-3 text-sm text-white placeholder-text-muted outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          type="submit"
          size="md"
          disabled={disabled || !!readOnlyReason || sending || !text.trim()}
          className="h-11 shrink-0 px-4"
          aria-label="Send message"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex justify-end text-[10px] text-text-muted">
        {text.length}/1000
      </div>
    </form>
  );
}
