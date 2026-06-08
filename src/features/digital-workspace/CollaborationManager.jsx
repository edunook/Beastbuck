import { useState, useEffect } from 'react';
import { WorkspaceService } from '../../services/firebase/workspace';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, X, Shield, Activity, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function CollaborationManager({ workspaceId, onClose }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members'); // members | activity

  useEffect(() => {
    loadData();
  }, [workspaceId]);

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
                 <div className="flex gap-2">
                    <input type="text" placeholder="User ID" className="flex-1 rounded border border-border bg-black/20 px-3 py-1.5 text-sm text-white" />
                    <select className="rounded border border-border bg-black/20 px-3 py-1.5 text-sm text-white">
                       <option>VIEWER</option>
                       <option>COMMENTER</option>
                       <option>EDITOR</option>
                    </select>
                    <Button size="sm">Invite</Button>
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
