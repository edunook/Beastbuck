import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, UserCog, Shield, Check, PenLine } from 'lucide-react';
import { AdminService, ADMIN_PERMISSIONS, DEFAULT_ADMIN_ROLES } from '../../services/firebase/admin';
import { useAuth } from '../auth/AuthContext';
import {
  AdminPanel, AdminEmptyState, AdminActionButton, AdminToast, StatusBadge, LoadingRows,
} from './adminUtils';

const PERMISSION_META = {
  canAccessCeoPanel:      { label: 'CEO Panel Access',        desc: 'Access the CEO command panel', icon: '👑' },
  canManageMembers:       { label: 'Manage Members',          desc: 'Approve, suspend, remove users', icon: '👥' },
  canManageRoles:         { label: 'Manage Roles',            desc: 'Create and delete roles', icon: '🛡️' },
  canModerateContent:     { label: 'Moderate Content',        desc: 'Feature, archive, delete content', icon: '📋' },
  canManageGamification:  { label: 'Manage Gamification',     desc: 'Adjust XP and grant badges', icon: '⚡' },
  canManageOrganization:  { label: 'Manage Organization',     desc: 'Manage teams, departments, labs', icon: '🏢' },
  canManageSecurity:      { label: 'Manage Security',         desc: 'Control platform locks', icon: '🔒' },
  canViewAnalytics:       { label: 'View Analytics',          desc: 'Access analytics and reports', icon: '📊' },
};

const EMPTY_DRAFT = { name: '', permissions: [] };

export default function AdminRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const isEditing = Boolean(draft.id);

  const load = async () => {
    setLoading(true);
    try {
      setRoles(await AdminService.getRoles());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const togglePermission = (permission) => {
    setDraft(d => ({
      ...d,
      permissions: d.permissions.includes(permission)
        ? d.permissions.filter(p => p !== permission)
        : [...d.permissions, permission],
    }));
  };

  const save = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      await AdminService.saveRole(draft, user.uid);
      setDraft(EMPTY_DRAFT);
      setToast(isEditing ? `Role "${draft.name}" updated.` : `Role "${draft.name}" created.`);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    await AdminService.deleteRole(role.id, user.uid);
    setToast(`Role "${role.name}" deleted.`);
    await load();
  };

  const startEdit = (role) => {
    setDraft({ ...role, permissions: [...(role.permissions || [])] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDefaultRole = (roleId) => DEFAULT_ADMIN_ROLES.some(r => r.id === roleId);

  return (
    <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
      {/* Create / Edit Panel */}
      <AdminPanel
        title={isEditing ? `Edit Role: ${draft.name}` : 'Create Role'}
        icon={isEditing ? PenLine : Plus}
      >
        <AdminToast message={toast} onClear={() => setToast('')} />
        <div className="space-y-4">
          {/* Role Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-text-muted">Role Name</label>
            <input
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              placeholder="e.g. Moderator, Researcher…"
              className="h-10 w-full rounded-xl border border-border bg-white/5 px-4 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
            />
          </div>

          {/* Permissions */}
          <div>
            <label className="mb-2 block text-xs font-bold text-text-muted">
              Permissions ({draft.permissions.length}/{ADMIN_PERMISSIONS.length})
            </label>
            <div className="space-y-2">
              {ADMIN_PERMISSIONS.map(permission => {
                const meta = PERMISSION_META[permission] || { label: permission, desc: '', icon: '🔑' };
                const isChecked = draft.permissions.includes(permission);
                return (
                  <label
                    key={permission}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                      isChecked
                        ? 'border-accent/30 bg-accent/5'
                        : 'border-border bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                      isChecked ? 'border-accent bg-accent text-background' : 'border-border bg-white/5'
                    }`}>
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => togglePermission(permission)}
                    />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-white">
                        <span>{meta.icon}</span>
                        {meta.label}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">{meta.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              disabled={!draft.name.trim() || saving}
              onClick={save}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-alt py-2.5 text-sm font-bold text-background shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : isEditing ? 'Update Role' : 'Create Role'}
            </button>
            {isEditing && (
              <button
                onClick={() => setDraft(EMPTY_DRAFT)}
                className="rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-bold text-text-soft hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </AdminPanel>

      {/* Roles List */}
      <AdminPanel title="Permission Roles" icon={UserCog}>
        {loading ? <LoadingRows count={4} /> : (
          <div className="space-y-3">
            {roles.length === 0 ? (
              <AdminEmptyState icon={Shield} title="No roles defined" message="Create your first role using the form." />
            ) : roles.map(role => (
              <div
                key={role.id}
                className={`rounded-xl border p-4 transition-all ${
                  draft.id === role.id ? 'border-accent/40 bg-accent/5' : 'border-border bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{role.name}</h3>
                      <p className="text-xs text-text-muted">{role.permissions?.length || 0} permissions</p>
                    </div>
                    {isDefaultRole(role.id) && <StatusBadge variant="accent">Built-in</StatusBadge>}
                  </div>
                  <div className="flex gap-2">
                    <AdminActionButton variant="accent" onClick={() => startEdit(role)} size="sm">
                      <PenLine className="h-3.5 w-3.5" /> Edit
                    </AdminActionButton>
                    {!isDefaultRole(role.id) && (
                      <AdminActionButton variant="danger" onClick={() => deleteRole(role)} size="sm">
                        <Trash2 className="h-3.5 w-3.5" />
                      </AdminActionButton>
                    )}
                  </div>
                </div>
                {role.permissions?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map(p => (
                      <span key={p} className="flex items-center gap-1 rounded-lg bg-accent/10 px-2 py-1 text-[11px] font-bold text-accent">
                        <span>{PERMISSION_META[p]?.icon || '🔑'}</span>
                        {PERMISSION_META[p]?.label || p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-text-muted italic">No permissions assigned</p>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
