import { useState, useEffect } from 'react';
import { WorkspaceService } from '@services/firestore/workspace';
import { UsersService } from '@services/firestore/users';
import Button from '@frontend/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@frontend/components/ui/Card';
import { Users, X, Shield, Activity, Trash2, ShieldAlert, Search } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function CollaborationManager({ workspaceId, onClose }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); // members | activity
  const [allUsers, setAllUsers] = useState([]);
  const [selectedInviteUser, setSelectedInviteUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    loadData();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await UsersService.getAllMembers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const m = await WorkspaceService.getMembers(workspaceId);
    setMembers(m);
    
    if (activeTab === 'activity') {
      const a = await WorkspaceService.getActivity(workspaceId);
      setActivity(a);
    }
    setLoading(false);
  };

  const handleRemove = async (userId) => {
    if(!window.confirm("Are you sure you want to remove this member?")) return;
    await WorkspaceService.removeMember(workspaceId, userId);
    await WorkspaceService.logActivity(workspaceId, user.uid, `REMOVED_MEMBER_${userId}`);
    await loadData();
  };

  const handleTransfer = async (userId) => {
    if(!window.confirm("Transfer ownership? You will become an Editor.")) return;
    await WorkspaceService.addMember(workspaceId, userId, 'OWNER');
    await WorkspaceService.addMember(workspaceId, user.uid, 'EDITOR');
    await WorkspaceService.logActivity(workspaceId, user.uid, `TRANSFERRED_OWNERSHIP_TO_${userId}`);
    await loadData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl bg-background border border-border shadow-2xl">
        <CardHeader className="border-b border-border bg-surface/50 p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-accent" /> Manage Collaboration
            </CardTitle>
            <button onClick={onClose} className="text-text-muted hover:text-white transition"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-4 flex gap-4 text-sm font-bold">
             <button onClick={() => { setActiveTab('members'); loadData(); }} className={`${activeTab === 'members' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`}>Members</button>
             <button onClick={() => { setActiveTab('activity'); loadData(); }} className={`${activeTab === 'activity' ? 'text-accent border-b-2 border-accent' : 'text-text-muted'}`}>Activity Log</button>
          </div>
        </CardHeader>
        <CardContent className="p-0 max-h-[60vh] overflow-y-auto">
          {loading ? (
             <div className="p-8 text-center text-text-muted">Loading...</div>
          ) : activeTab === 'members' ? (
            <div className="divide-y divide-border/50">
              {members.map(m => (
                <div key={m.userId} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent font-bold">
                       {m.userId.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white">User {m.userId.substring(0,6)}</p>
                      <p className="text-xs text-text-muted">Joined {m.joinedAt?.toDate().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 text-xs font-bold text-text-muted">
                      {m.role === 'OWNER' && <ShieldAlert className="h-3 w-3 text-status-warning" />}
                      {m.role === 'EDITOR' && <Shield className="h-3 w-3 text-accent" />}
                      {m.role}
                    </span>
                    
                    {/* Simplified actions for phase 1 */}
                    {m.role !== 'OWNER' && (
                       <div className="flex gap-2">
                         <button onClick={() => handleTransfer(m.userId)} className="text-xs text-accent hover:underline">Transfer Ownership</button>
                         <button onClick={() => handleRemove(m.userId)} className="text-xs text-status-danger hover:underline"><Trash2 className="h-4 w-4"/></button>
                       </div>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="p-4 bg-surface/30">
                 <h4 className="text-sm font-bold text-white mb-2">Invite Member</h4>
                 <div className="space-y-3">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                     <input
                       type="text"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       placeholder="Search members by name, username, or email..."
                       className="w-full rounded border border-border bg-black/20 px-3 py-1.5 pl-10 text-sm text-white"
                     />
                   </div>
                   
                   {!loadingUsers && searchQuery && (
                     <div className="max-h-40 overflow-y-auto rounded border border-border bg-black/20">
                       {allUsers.filter(user => {
                         const searchLower = searchQuery.toLowerCase();
                         const displayName = (user.displayName || '').toLowerCase();
                         const username = (user.username || '').toLowerCase();
                         const email = (user.email || '').toLowerCase();
                         return displayName.includes(searchLower) || username.includes(searchLower) || email.includes(searchLower);
                       }).length === 0 ? (
                         <div className="text-center py-3 text-text-muted text-xs">No members found</div>
                       ) : (
                         allUsers.filter(user => {
                           const searchLower = searchQuery.toLowerCase();
                           const displayName = (user.displayName || '').toLowerCase();
                           const username = (user.username || '').toLowerCase();
                           const email = (user.email || '').toLowerCase();
                           return displayName.includes(searchLower) || username.includes(searchLower) || email.includes(searchLower);
                         }).slice(0, 8).map(user => (
                           <div
                             key={user.id}
                             onClick={() => {
                               setSelectedInviteUser(user);
                               setSearchQuery(user.displayName || user.username || '');
                             }}
                             className={`flex items-center gap-2 p-2 cursor-pointer transition-colors hover:bg-white/10 ${
                               selectedInviteUser?.id === user.id ? 'bg-accent/20 border-l-2 border-accent' : ''
                             }`}
                           >
                             <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                               {(user.displayName || user.username || 'M')[0].toUpperCase()}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="font-bold text-white text-xs truncate">{user.displayName || user.username || 'Unknown'}</p>
                               <p className="text-xs text-text-muted truncate">@{user.username || user.email || 'No username'}</p>
                             </div>
                           </div>
                         ))
                       )}
                     </div>
                   )}

                   {selectedInviteUser && (
                     <div className="flex items-center gap-2 p-2 rounded bg-accent/10 border border-accent/30">
                       <div className="h-6 w-6 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                         {(selectedInviteUser.displayName || selectedInviteUser.username || 'M')[0].toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="font-bold text-white text-xs truncate">{selectedInviteUser.displayName || selectedInviteUser.username}</p>
                         <p className="text-xs text-text-muted truncate">{selectedInviteUser.email}</p>
                       </div>
                       <button
                         type="button"
                         onClick={() => setSelectedInviteUser(null)}
                         className="text-text-muted hover:text-white text-xs"
                       >
                         ✕
                       </button>
                     </div>
                   )}

                   <div className="flex gap-2">
                     <select className="rounded border border-border bg-black/20 px-3 py-1.5 text-sm text-white">
                        <option>VIEWER</option>
                        <option>COMMENTER</option>
                        <option>EDITOR</option>
                     </select>
                     <Button size="sm" disabled={!selectedInviteUser} onClick={() => alert('Invite sent! (Feature in development)')}>Invite</Button>
                   </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50 p-4">
               {activity.length === 0 ? (
                  <p className="text-center text-text-muted py-4">No activity yet.</p>
               ) : (
                  activity.map(a => (
                     <div key={a.id} className="py-2 flex items-start gap-3">
                        <Activity className="h-4 w-4 text-text-muted mt-0.5" />
                        <div>
                           <p className="text-sm text-white"><span className="text-accent">{a.userId.substring(0,6)}</span> {a.action.replace(/_/g, ' ').toLowerCase()}</p>
                           <p className="text-xs text-text-muted">{a.timestamp?.toDate().toLocaleString()}</p>
                        </div>
                     </div>
                  ))
               )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
