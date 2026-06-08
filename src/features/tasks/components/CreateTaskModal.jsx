import { useEffect, useState } from 'react';
import { X, Zap, Plus, Tag } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { TasksService } from '../../../services/firebase/tasks';
import { UsersService } from '../../../services/firebase/users';
import { useAuth } from '../../auth/AuthContext';

const TASK_TYPES = [
  { value: 'PERSONAL', label: 'Personal', desc: 'Assigned to one member' },
  { value: 'TEAM',     label: 'Team',     desc: 'Multiple assignees' },
  { value: 'GLOBAL',   label: 'Global Mission', desc: 'Open to all members' },
];

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const PRIORITY_COLORS = {
  LOW:    'border-border/50 text-text-muted',
  NORMAL: 'border-accent/50 text-accent',
  HIGH:   'border-yellow-400/50 text-yellow-400',
  URGENT: 'border-status-danger/50 text-status-danger',
};

const INITIAL = {
  title: '',
  description: '',
  type: 'PERSONAL',
  priority: 'NORMAL',
  baseXP: 50,
  assigneeIds: [],
  tags: [],
  dueDate: '',
  isRecurring: false,
  recurrenceType: 'WEEKLY',
};

export function CreateTaskModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL);
  const [tagInput, setTagInput] = useState('');
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      setLoadingMembers(true);
      try {
        const assignableMembers = await UsersService.getAssignableMembers();
        if (!cancelled) setMembers(assignableMembers);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('Could not load members for assignment.');
      } finally {
        if (!cancelled) setLoadingMembers(false);
      }
    }

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, []);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!t || form.tags.includes(t)) return;
    set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (t) => set('tags', form.tags.filter(x => x !== t));

  const addAssignee = (uid) => {
    if (!uid || form.assigneeIds.includes(uid)) return;
    // For PERSONAL, only allow one assignee
    if (form.type === 'PERSONAL') {
      set('assigneeIds', [uid]);
    } else {
      set('assigneeIds', [...form.assigneeIds, uid]);
    }
  };

  const removeAssignee = (uid) => set('assigneeIds', form.assigneeIds.filter(x => x !== uid));

  const getMemberLabel = (uid) => {
    const member = members.find(m => m.id === uid);
    return member?.displayName || member?.username || uid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (form.type !== 'GLOBAL' && form.assigneeIds.length === 0) {
      setError('Add at least one assignee, or choose Global Mission.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
        priority: form.priority,
        baseXP: Number(form.baseXP),
        assigneeIds: form.type === 'GLOBAL' ? [] : form.assigneeIds,
        tags: form.tags,
        dueDate: form.dueDate || null,
        isRecurring: form.isRecurring,
        recurrenceType: form.isRecurring ? form.recurrenceType : null,
        attachments: [],
      };
      const taskId = await TasksService.createTask(payload, user.uid);
      onCreated?.(taskId);
      onClose?.();
    } catch (err) {
      console.error(err);
      setError('Failed to create task. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-2xl shadow-2xl custom-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-200">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-border/50 p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" />
            <h2 className="font-heading font-bold text-white">Create Task</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* Task Type */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Task Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TASK_TYPES.map(({ value, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    set('type', value);
                    if (value === 'GLOBAL') set('assigneeIds', []);
                    if (value === 'PERSONAL' && form.assigneeIds.length > 1) {
                      set('assigneeIds', [form.assigneeIds[0]]);
                    }
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    form.type === value
                      ? 'border-accent bg-accent/10'
                      : 'border-border/50 bg-black/20 hover:border-border'
                  }`}
                >
                  <div className={`text-xs font-bold mb-0.5 ${form.type === value ? 'text-accent' : 'text-white'}`}>{label}</div>
                  <div className="text-[10px] text-text-muted">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
              Title <span className="text-status-danger">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="What needs to be done?"
              required
              maxLength={100}
              className="w-full bg-black/30 border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detailed instructions, acceptance criteria, resources..."
              rows={4}
              className="w-full bg-black/30 border border-border rounded-xl px-4 py-3 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none transition-all custom-scrollbar"
            />
          </div>

          {/* Priority + XP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Priority</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('priority', p)}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${
                      form.priority === p
                        ? PRIORITY_COLORS[p] + ' bg-white/5'
                        : 'border-border/30 text-text-muted hover:border-border'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-accent" /> Base XP Reward
                </div>
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                step="10"
                value={form.baseXP}
                onChange={(e) => set('baseXP', Number(e.target.value))}
                className="w-full bg-black/30 border border-border rounded-xl px-4 py-2.5 text-sm text-accent font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
              />
              <p className="text-[10px] text-text-muted mt-1">Bonus XP can be added during review.</p>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Due Date (optional)</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              className="w-full bg-black/30 border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Assignees (not for GLOBAL) */}
          {form.type !== 'GLOBAL' && (
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                Assignees {form.type === 'PERSONAL' && <span className="text-text-muted font-normal">(1 member)</span>}
              </label>
              {form.assigneeIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.assigneeIds.map(uid => (
                    <span key={uid} className="flex items-center gap-1.5 text-xs bg-white/10 border border-border/50 rounded-full px-2.5 py-1 text-white">
                      <span className="truncate max-w-[160px]" title={uid}>{getMemberLabel(uid)}</span>
                      <button type="button" onClick={() => removeAssignee(uid)} className="text-text-muted hover:text-status-danger transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {loadingMembers ? (
                  <div className="sm:col-span-2 rounded-xl border border-border/50 bg-black/20 px-3 py-3 text-sm text-text-muted">
                    Loading members...
                  </div>
                ) : members.length === 0 ? (
                  <div className="sm:col-span-2 rounded-xl border border-border/50 bg-black/20 px-3 py-3 text-sm text-text-muted">
                    No members available for assignment.
                  </div>
                ) : (
                  members.map(member => {
                    const selected = form.assigneeIds.includes(member.id);
                    const personalFull = form.type === 'PERSONAL' && form.assigneeIds.length >= 1 && !selected;

                    return (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => selected ? removeAssignee(member.id) : addAssignee(member.id)}
                        disabled={personalFull}
                        className={`rounded-xl border px-3 py-2 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                          selected
                            ? 'border-accent bg-accent/10'
                            : 'border-border/50 bg-black/20 hover:border-border'
                        }`}
                      >
                        <div className="truncate text-sm font-bold text-white">
                          {member.displayName || member.username || 'Member'}
                        </div>
                        <div className="truncate text-[10px] uppercase tracking-widest text-text-muted">
                          {member.role}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              <p className="text-[10px] text-text-muted mt-1">
                {form.type === 'PERSONAL' ? 'Personal tasks have exactly one assignee.' : 'Team tasks can have multiple assignees.'}
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
              <div className="flex items-center gap-1.5"><Tag className="w-3 h-3" /> Tags (optional)</div>
            </label>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-xs bg-white/5 border border-border/50 rounded-full px-2.5 py-1 text-text-muted">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-status-danger transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. design, research..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-black/30 border border-border rounded-xl px-3 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent/50 transition-all"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} disabled={!tagInput.trim()}>Add</Button>
            </div>
          </div>

          {/* Recurring */}
          <div className="bg-black/20 border border-border/50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => set('isRecurring', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 rounded-full bg-white/10 peer-checked:bg-accent transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Recurring Mission</div>
                <div className="text-[10px] text-text-muted">Prepare for future recurring challenges</div>
              </div>
            </label>
            {form.isRecurring && (
              <div className="mt-3 flex gap-2">
                {['DAILY','WEEKLY','MONTHLY'].map(rt => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => set('recurrenceType', rt)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      form.recurrenceType === rt ? 'border-accent text-accent bg-accent/10' : 'border-border/50 text-text-muted hover:border-border'
                    }`}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-status-danger/10 border border-status-danger/20 rounded-xl px-4 py-3 text-sm text-status-danger">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting} className="flex-1">
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
