import { useEffect, useState, useMemo } from 'react';
import {
  UserMinus, UserPlus, Users, RefreshCw, Search, ShieldCheck, ChevronDown, X } from 'lucide-react';
import { AdminService } from '@services/firestore/admin';
import { OrganizationService } from '@services/firestore/organization';
import { SPECIALIZATIONS } from '@shared/constants/specializations';
import { ROLES } from '@shared/constants/roles';
import { useAuth } from '../auth/AuthContext';
import {
  AdminPanel, AdminEmptyState, AdminActionButton, AdminToast, StatusBadge, LoadingRows } from './adminUtils';

const ROLE_OPTIONS = [
  { value: ROLES.MAIN_CEO, label: 'Main CEO' },
  { value: ROLES.CO_CEO, label: 'Co-CEO' },
  { value: ROLES.LEADER, label: 'Leader' },
  { value: ROLES.MEMBER, label: 'Member' },
  { value: ROLES.PENDING, label: 'Pending Member' },
];

const FILTER_OPTIONS = ['All', 'Active', 'Suspended', 'Removed', 'Pending'];

function getRoleVariant(role) {
  if (role === ROLES.MAIN_CEO || role === ROLES.CO_CEO) return 'accent';
  if (role === ROLES.LEADER) return 'purple';
  if (role === ROLES.MEMBER) return 'success';
  return 'warning';
}

export default function AdminMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [nextMembers, organization] = await Promise.all([
        AdminService.getMembers(),
        OrganizationService.getOrganization(),
      ]);
      setMembers(nextMembers);
      setDepartments(organization.departments || []);
      setLabs(organization.labs || []);
    } catch (err) {
      console.error('Admin members failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const run = async (action, message) => {
    try {
      await action();
      setToast(message);
      await load();
    } catch (err) {
      setToast('Error: ' + err.message);
    }
  };

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchSearch = !search || [m.displayName, m.username, m.email]
        .join(' ').toLowerCase().includes(search.toLowerCase());
      const matchFilter =
        filter === 'All' ||
        (filter === 'Active' && !m.suspended && !m.removed && m.role !== ROLES.PENDING) ||
        (filter === 'Suspended' && m.suspended) ||
        (filter === 'Removed' && m.removed) ||
        (filter === 'Pending' && m.role === ROLES.PENDING);
      return matchSearch && matchFilter;
    });
  }, [members, search, filter]);

  return (
    <div className="space-y-6">
      <AdminPanel
        title="Member Management"
        icon={Users}
        action={
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-text-soft hover:text-white transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      >
        <AdminToast message={toast} onClear={() => setToast('')} />

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members…"
              className="h-10 w-full rounded-xl border border-border bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-text-muted focus:border-accent/40 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                  filter === f
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-white/5 text-text-muted hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="mb-3 text-xs text-text-muted">
          Showing <span className="font-bold text-white">{filtered.length}</span> of {members.length} members
        </p>

        {/* Member List */}
        {loading ? <LoadingRows count={6} /> : (
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <AdminEmptyState icon={Users} title="No members found" message="Try adjusting your search or filter." />
            ) : filtered.map(member => (
              <div key={member.id} className="rounded-xl border border-border/60 bg-white/[0.02] transition-all hover:border-white/10 hover:bg-white/[0.04]">
                {/* Member Header Row */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-3"
                  onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                >
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent-alt/20 font-heading text-sm font-black text-white">
                    {(member.displayName || member.username || '?')[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{member.displayName || member.username}</span>
                      <StatusBadge variant={getRoleVariant(member.role)}>{member.role}</StatusBadge>
                      {member.suspended && <StatusBadge variant="danger">Suspended</StatusBadge>}
                      {member.removed && <StatusBadge variant="default">Removed</StatusBadge>}
                    </div>
                    <p className="mt-0.5 text-xs text-text-muted">@{member.username} · {member.xp || 0} XP · Lvl {member.level || 1}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    <AdminActionButton
                      variant="success"
                      onClick={(e) => { e.stopPropagation(); run(() => AdminService.approveMember(member.id, user.uid), `${member.displayName || member.username} approved.`); }}
                      title="Approve"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </AdminActionButton>
                    <AdminActionButton
                      variant="danger"
                      onClick={(e) => { e.stopPropagation(); run(() => AdminService.suspendMember(member.id, user.uid), `${member.displayName || member.username} suspended.`); }}
                      title="Suspend"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </AdminActionButton>
                    <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${expandedId === member.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedId === member.id && (
                  <div className="border-t border-border/60 p-3">
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {/* Role Promote */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-text-muted">Promote / Demote</label>
                        <select
                          value={member.role || 'Member'}
                          onChange={(e) => run(() => AdminService.promoteMember(member.id, e.target.value, user.uid), `Role changed to ${e.target.value}.`)}
                          className="h-9 w-full rounded-xl border border-border bg-white/5 px-3 text-xs text-white focus:border-accent/40 focus:outline-none"
                        >
                          {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>

                      {/* Department */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-text-muted">Department</label>
                        <select
                          value={member.departmentId || ''}
                          onChange={(e) => run(() => AdminService.assignDepartment(member.id, e.target.value, user.uid), 'Department assigned.')}
                          className="h-9 w-full rounded-xl border border-border bg-white/5 px-3 text-xs text-white focus:border-accent/40 focus:outline-none"
                        >
                          <option value="">No Department</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>

                      {/* Lab */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-text-muted">Lab</label>
                        <select
                          value={member.labId || ''}
                          onChange={(e) => run(() => AdminService.assignLab(member.id, e.target.value, user.uid), 'Lab assigned.')}
                          className="h-9 w-full rounded-xl border border-border bg-white/5 px-3 text-xs text-white focus:border-accent/40 focus:outline-none"
                        >
                          <option value="">No Lab</option>
                          {labs.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>

                      {/* Specialization */}
                      <div>
                        <label className="mb-1 block text-xs font-bold text-text-muted">Specialization</label>
                        <select
                          onChange={(e) => e.target.value && run(() => AdminService.assignSpecialization(member.id, e.target.value, user.uid), 'Specialization assigned.')}
                          className="h-9 w-full rounded-xl border border-border bg-white/5 px-3 text-xs text-white focus:border-accent/40 focus:outline-none"
                          defaultValue=""
                        >
                          <option value="">Add Specialization</option>
                          {SPECIALIZATIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Danger Actions */}
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-border/40 pt-3">
                      <AdminActionButton variant="success" onClick={() => run(() => AdminService.approveMember(member.id, user.uid), 'Member approved.')}>
                        <UserPlus className="h-3.5 w-3.5" /> Approve
                      </AdminActionButton>
                      <AdminActionButton variant="warning" onClick={() => run(() => AdminService.suspendMember(member.id, user.uid), 'Member suspended.')}>
                        <UserMinus className="h-3.5 w-3.5" /> Suspend
                      </AdminActionButton>
                      <AdminActionButton
                        variant="danger"
                        onClick={() => {
                          if (window.confirm(`Remove ${member.displayName || member.username}? This action cannot be undone.`)) {
                            run(() => AdminService.removeMember(member.id, user.uid), 'Member removed.');
                          }
                        }}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" /> Remove
                      </AdminActionButton>
                      {member.specializations?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {member.specializations.map(s => (
                            <StatusBadge key={s} variant="purple">{s}</StatusBadge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
