import { Users, UserPlus, UserCheck, GitFork, Award, BriefcaseBusiness, GraduationCap, Crown } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function FollowersRecommendations() {
  const followers = [
    { id: 1, name: 'Dr. Sarah Chen', avatar: '👩‍🔬', mutual: 5 },
    { id: 2, name: 'Alex Johnson', avatar: '👨‍💼', mutual: 3 },
    { id: 3, name: 'Emma Williams', avatar: '👩‍💻', mutual: 8 },
  ];

  const following = [
    { id: 1, name: 'James Brown', avatar: '👨‍🚀', mutual: 2 },
    { id: 2, name: 'Lisa Anderson', avatar: '👩‍🏫', mutual: 4 },
  ];

  const mutualConnections = [
    { id: 1, name: 'Michael Scott', avatar: '👨‍💼', mutual: 12 },
    { id: 2, name: 'Dwight Schrute', avatar: '👨‍🌾', mutual: 8 },
  ];

  const suggestedCollaborators = [
    { id: 1, name: 'Dr. Emily Watson', avatar: '👩‍⚕️', recommendedBy: 'Dr. Sarah Chen', role: 'Mentor' },
    { id: 2, name: 'Prof. David Kim', avatar: '👨‍🏫', recommendedBy: 'Department Head', role: 'Research Supervisor' },
    { id: 3, name: 'Jennifer Lee', avatar: '👩‍💻', recommendedBy: 'Team Leader', role: 'Project Lead' },
  ];

  const getRecommenderIcon = (role) => {
    const icons = {
      'Mentor': GraduationCap,
      'Research Supervisor': Award,
      'Project Lead': BriefcaseBusiness,
      'Department Head': Crown,
    };
    return icons[role] || Award;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Followers & Recommendations" 
        description="Followers, following, mutual connections, and suggested collaborators with recommendations from mentors, department heads, CEOs, co-CEOs, team leaders, and research supervisors."
        hero={true}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Followers ({followers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {followers.map((follower) => (
                <div key={follower.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="text-3xl">{follower.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{follower.name}</h3>
                    <p className="text-text-muted text-sm">{follower.mutual} mutual connections</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Following
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-accent" />
              Following ({following.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {following.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="text-3xl">{user.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <p className="text-text-muted text-sm">{user.mutual} mutual connections</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-accent" />
              Mutual Connections ({mutualConnections.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {mutualConnections.map((user) => (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <div className="text-3xl">{user.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <p className="text-text-muted text-sm">{user.mutual} mutual connections</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Suggested Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {suggestedCollaborators.map((collab) => {
                const Icon = getRecommenderIcon(collab.role);
                return (
                  <div key={collab.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                    <div className="text-3xl">{collab.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{collab.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-text-muted">
                        <Icon className="h-4 w-4" />
                        <span>Recommended by {collab.recommendedBy}</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
