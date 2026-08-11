import React, { useEffect, useState } from 'react';
import { X, Zap, Plus, Tag, Calendar, User, Target, Award } from 'lucide-react';
import Button from '@frontend/components/ui/Button';
import { TasksService } from '@services/firestore/tasks';
import { UsersService } from '@services/firestore/users';
import { useAuth } from '../../auth/AuthContext';
import { cn } from '@shared/lib/utils';

const TASK_TYPES = [
  { value: 'PERSONAL', label: 'Personal', desc: 'Assigned to one member for individual work', icon: User },
  { value: 'TEAM',     label: 'Team',     desc: 'Multiple members can collaborate together', icon: Target },
  { value: 'GLOBAL',   label: 'Global Mission', desc: 'Open to all members - anyone can accept', icon: Award },
];

const PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const PRIORITY_STYLES = {
  LOW:    { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400' },
  NORMAL: { bg: 'bg-accent/20', border: 'border-accent/30', text: 'text-accent' },
  HIGH:   { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
  URGENT: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
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
    if (!form.title?.trim()) { setError('Title is required.'); return; }
    if (form.type !== 'GLOBAL' && (!form.assigneeIds || form.assigneeIds.length === 0)) {
      setError('Add at least one assignee, or choose Global Mission.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        type: form.type,
        priority: form.priority,
        baseXP: Math.max(0, Number(form.baseXP) || 0),
        assigneeIds: form.type === 'GLOBAL' ? [] : form.assigneeIds,
        tags: form.tags || [],
        dueDate: form.dueDate || null,
        isRecurring: form.isRecurring || false,
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
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white/5 to-white/2 border border-white/10 rounded-3xl shadow-2xl scrollbar-hide">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-xl border-b border-white/10 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-accent to-cyan-500">
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Create Task</h2>
              <p className="text-xs sm:text-sm text-text-muted">Assign work and track progress</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">

          {/* Task Type */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-3">Task Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TASK_TYPES.map(({ value, label, desc, icon: Icon }) => (
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
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all",
                    form.type === value
                      ? "border-accent bg-accent/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  )}
                >
                  <Icon className={cn("h-5 w-5 mb-2", form.type === value ? "text-accent" : "text-text-muted")} />
                  <div className={cn("text-xs sm:text-sm font-bold mb-1", form.type === value ? "text-accent" : "text-white")}>{label}</div>
                  <div className="text-[10px] sm:text-xs text-text-muted">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="What needs to be done?"
              required
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detailed instructions, acceptance criteria, resources..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 text-sm sm:text-base text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 resize-none transition-all scrollbar-hide"
            />
          </div>

          {/* Priority + XP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-2">Priority</label>
              <div className="grid grid-cols-2 gap-2">
                {PRIORITIES.map(p => {
                  const style = PRIORITY_STYLES[p];
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set('priority', p)}
                      className={cn(
                        "py-2 sm:py-2.5 rounded-xl border text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all",
                        form.priority === p
                          ? `${style.bg} ${style.border} ${style.text}`
                          : "border-white/10 bg-white/5 text-text-muted hover:border-white/20"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-yellow-400" /> Base XP Reward
                </div>
              </label>
              <input
                type="number"
                min="0"
                max="10000"
                step="10"
                value={form.baseXP}
                onChange={(e) => set('baseXP', Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 text-sm sm:text-base text-yellow-400 font-bold focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
              />
              <p className="text-[10px] sm:text-xs text-text-muted mt-1">Bonus XP can be added during review.</p>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" /> Due Date (optional)
              </div>
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 py-3 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all [color-scheme:dark]"
            />
          </div>

          {/* Assignees (not for GLOBAL) */}
          {form.type !== 'GLOBAL' && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-3">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Assignees {form.type === 'PERSONAL' && <span className="text-text-muted font-normal">(1 member)</span>}
                </div>
              </label>
              {form.assigneeIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.assigneeIds.map(uid => (
                    <span key={uid} className="flex items-center gap-2 text-xs sm:text-sm bg-accent/20 border border-accent/30 rounded-full px-3 py-1.5 text-accent">
                      <span className="truncate max-w-[160px]" title={uid}>{getMemberLabel(uid)}</span>
                      <button type="button" onClick={() => removeAssignee(uid)} className="text-accent hover:text-white transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-2">
                {loadingMembers ? (
                  <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-muted">
                    Loading members...
                  </div>
                ) : members.length === 0 ? (
                  <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-muted">
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
                        className={cn(
                          "rounded-xl border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-40",
                          selected
                            ? "border-accent bg-accent/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        )}
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
              <p className="text-[10px] sm:text-xs text-text-muted mt-2">
                {form.type === 'PERSONAL' ? 'Personal tasks have exactly one assignee.' : 'Team tasks can have multiple assignees.'}
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-text-muted uppercase tracking-widest mb-3">
              <div className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> Tags (optional)</div>
            </label>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-2 text-xs sm:text-sm bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-text-muted">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400 transition-colors">
                      <X className="h-3 w-3" />
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
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
              />
              <Button type="button" variant="secondary" size="sm" onClick={addTag} disabled={!tagInput.trim()}>Add</Button>
            </div>
          </div>

          {/* Recurring */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isRecurring}
                  onChange={(e) => set('isRecurring', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full bg-white/10 peer-checked:bg-accent transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all peer-checked:translate-x-5" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white">Recurring Mission</div>
                <div className="text-[10px] sm:text-xs text-text-muted">Prepare for future recurring challenges</div>
              </div>
            </label>
            {form.isRecurring && (
              <div className="mt-4 flex gap-2">
                {['DAILY','WEEKLY','MONTHLY'].map(rt => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => set('recurrenceType', rt)}
                    className={cn(
                      "flex-1 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest border transition-all",
                      form.recurrenceType === rt 
                        ? "border-accent text-accent bg-accent/10" 
                        : "border-white/10 text-text-muted hover:border-white/20"
                    )}
                  >
                    {rt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl sm:rounded-2xl px-4 py-3 text-sm sm:text-base text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 sm:gap-4 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1 text-sm sm:text-base">Cancel</Button>
            <Button type="submit" disabled={submitting} className="flex-1 text-sm sm:text-base">
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
