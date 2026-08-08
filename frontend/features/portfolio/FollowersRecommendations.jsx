import { useState, useEffect } from 'react';
import { Users, UserPlus, Award, BriefcaseBusiness, GraduationCap, Crown, Loader2 } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { useAuth } from '@frontend/features/auth/AuthContext';
import EmptyState from '@frontend/components/ui/EmptyState';

export default function FollowersRecommendations() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const usersQuery = query(collection(db, 'users'), limit(20));
        const snap = await getDocs(usersQuery);
        const list = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => u.id !== user?.uid);
        setMembers(list);
      } catch (err) {
        console.error('Failed to load members for recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user?.uid]);

  const followers = members.slice(0, 4);
  const following = members.slice(4, 8);
  const suggestedCollaborators = members.slice(8, 14);

  return (
    <PageContainer>
      <PageHeader 
        title="Followers & Recommendations" 
        description="Connect with registered BeastBuck members, view mutual connections, and collaborate across research and engineering teams."
        hero={true}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-sm">Loading member recommendations...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          {/* Followers Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                <Users className="h-5 w-5 text-accent" />
                Followers ({followers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {followers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No Followers Yet"
                  description="When other members follow your profile, they will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {followers.map((member) => (
                    <div key={`follower-${member.id}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm">
                          {(member.displayName || member.username || 'M')[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{member.displayName || member.username || 'Member'}</h4>
                          <p className="text-xs text-text-muted">{member.role || 'Community Member'}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="secondary" className="text-xs">Follow Back</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Following Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                <UserPlus className="h-5 w-5 text-purple-400" />
                Following ({following.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {following.length === 0 ? (
                <EmptyState
                  icon={UserPlus}
                  title="Not Following Anyone"
                  description="Explore community members and follow creators to stay updated on their work."
                />
              ) : (
                <div className="space-y-3">
                  {following.map((member) => (
                    <div key={`following-${member.id}`} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
                          {(member.displayName || member.username || 'M')[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{member.displayName || member.username || 'Member'}</h4>
                          <p className="text-xs text-text-muted">{member.role || 'Community Member'}</p>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold px-2 py-1 rounded-full bg-emerald-500/10">Following</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggested Collaborators */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-bold text-white">
                <Crown className="h-5 w-5 text-yellow-400" />
                Suggested Collaborators ({suggestedCollaborators.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {suggestedCollaborators.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No Suggested Collaborators"
                  description="As more members join and publish research or projects, collaborator suggestions will appear here."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestedCollaborators.map((collaborator) => (
                    <div key={`collaborator-${collaborator.id}`} className="p-4 rounded-xl bg-white/5 border border-border/50 flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-sm">
                          {(collaborator.displayName || collaborator.username || 'C')[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{collaborator.displayName || collaborator.username || 'Member'}</h4>
                          <p className="text-xs text-text-muted">{collaborator.role || 'Research Contributor'}</p>
                        </div>
                      </div>
                      <Button size="sm" className="w-full text-xs">Connect</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
