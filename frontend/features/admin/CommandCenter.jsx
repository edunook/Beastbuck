import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '@shared/permissions/permissions';
import { ROLES } from '@shared/constants/roles';
import { promoteToCoCEO, removeCoCEO, getExecutives } from '@services/firestore/executive';
import { UsersService } from '@services/firestore/users';
import { Shield, Crown, UserPlus, Trash2, Search } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';

export default function CommandCenter() {
  const { user, roleData } = useAuth();
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionModal, setActionModal] = useState(null);

  useEffect(() => {
    loadExecutives();
  }, []);

  const loadExecutives = async () => {
    setLoading(true);
    try {
      const execs = await getExecutives();
      setExecutives(execs);
    } catch (error) {
      console.error('Error loading executives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteCoCEO = async (targetUid, reason) => {
    if (!user?.uid) return;
    const result = await promoteToCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      await loadExecutives();
      setActionModal(null);
    } else {
      alert(result.error || 'Failed to promote user');
    }
  };

  const handleRemoveCoCEO = async (targetUid, reason) => {
    if (!user?.uid) return;
    const result = await removeCoCEO(user.uid, targetUid, reason);
    if (result.success) {
      await loadExecutives();
      setActionModal(null);
    } else {
      alert(result.error || 'Failed to remove Co-CEO');
    }
  };

  if (!hasPermission(roleData?.role, 'canAccessCeoPanel')) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-text-muted mb-4" />
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-text-muted">Command Center is only accessible to CEO and Co-CEOs.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const mainCeoCount = executives.filter(e => e.role === ROLES.MAIN_CEO || e.role === 'CEO').length || (roleData?.role === ROLES.MAIN_CEO ? 1 : 0);
  const coCeoExecutives = executives.filter(e => e.role === ROLES.CO_CEO || e.role === 'Co-CEO');

  return (
    <PageContainer className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Executive Management</h1>
        <p className="text-text-muted">Manage CEO and Co-CEO roles for platform leadership</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 mb-6 grid-cols-2">
        <Card className="border-purple-500/30 bg-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">CEO</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : mainCeoCount}</p>
              </div>
              <Crown className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">Co-CEOs</p>
                <p className="text-2xl font-bold text-white">{loading ? '...' : coCeoExecutives.length}</p>
              </div>
              <Crown className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Executive Management */}
      <Card className="border-purple-500/30 bg-purple-500/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Crown className="h-5 w-5 text-purple-400" />
            Executive Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coCeoExecutives.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-text-muted">Current Co-CEOs</p>
                {coCeoExecutives.map(executive => (
                  <div key={executive.id || executive.uid || executive.email} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="min-w-0">
                      <p className="font-bold text-white">{executive.displayName || executive.username || executive.email || 'Co-CEO'}</p>
                      <p className="text-xs text-text-muted">{executive.email || executive.id || executive.uid}</p>
                    </div>
                    {roleData?.role === ROLES.MAIN_CEO && (
                      <Button
                        onClick={() => {
                          setSelectedUser(executive);
                          setActionModal('remove');
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={() => setActionModal('promote')}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Promote to Co-CEO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Modal */}
      {actionModal === 'promote' && (
        <PromoteModal
          onClose={() => setActionModal(null)}
          onConfirm={handlePromoteCoCEO}
        />
      )}

      {actionModal === 'remove' && selectedUser && (
        <RemoveModal
          user={selectedUser}
          onClose={() => setActionModal(null)}
          onConfirm={handleRemoveCoCEO}
        />
      )}
    </PageContainer>
  );
}

function PromoteModal({ onClose, onConfirm }) {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoadingMembers(true);
    try {
      const allMembers = await UsersService.getAllMembers();
      setMembers(allMembers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    const displayName = (member.displayName || '').toLowerCase();
    const username = (member.username || '').toLowerCase();
    const email = (member.email || '').toLowerCase();
    return displayName.includes(searchLower) || username.includes(searchLower) || email.includes(searchLower);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember) return;
    setLoading(true);
    await onConfirm(selectedMember.id, reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Promote to Co-CEO</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Select Member</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members by name, username, or email..."
                className="pl-10"
              />
            </div>
          </div>
          
          {loadingMembers ? (
            <div className="text-center py-8 text-text-muted">Loading members...</div>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-white/5">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-text-muted">No members found</div>
              ) : (
                filteredMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-white/10 ${
                      selectedMember?.id === member.id ? 'bg-accent/20 border-l-2 border-accent' : ''
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold">
                      {(member.displayName || member.username || 'M')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{member.displayName || member.username || 'Unknown'}</p>
                      <p className="text-xs text-text-muted truncate">@{member.username || member.email || 'No username'}</p>
                    </div>
                    {member.role && (
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-text-muted">
                        {member.role}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-white mb-2">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you promoting this user?"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedMember}
              className="w-full"
            >
              {loading ? 'Promoting...' : 'Promote'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RemoveModal({ user, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm(user.id, reason);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-slate-950/96 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Remove Co-CEO</h2>
        <p className="text-text-muted mb-6">
          Are you sure you want to remove {user.displayName || user.username} from Co-CEO role?
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Reason (required)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you removing this Co-CEO?"
              rows={3}
              required
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-white transition-colors placeholder:text-text-muted focus:border-cyan-200/40 focus:outline-none"
            />
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="w-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              {loading ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
