import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Award, Film, Users, Trophy, Star, CheckCircle, Link as LinkIcon, Calendar } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function RichCreatorProfiles() {
  const { user } = useAuth();

  const creators = [
    { 
      id: 1, 
      name: 'Dr. Sarah Chen', 
      avatar: '👩‍🔬', 
      banner: '🔬',
      bio: 'AI Researcher and Science Communicator',
      followers: 12345,
      movies: 45,
      series: 8,
      awards: ['Top Creator', 'Science Champion'],
      achievements: 156,
      playlists: 12,
      uploads: 67,
      level: 'Creative Legend',
      verified: true,
      socialLinks: ['YouTube', 'Twitter']
    },
    { 
      id: 2, 
      name: 'Alex Johnson', 
      avatar: '👨‍💼', 
      banner: '🚀',
      bio: 'Startup Founder and Business Storyteller',
      followers: 8765,
      movies: 32,
      series: 5,
      awards: ['Rising Star'],
      achievements: 89,
      playlists: 8,
      uploads: 45,
      level: 'Top Storyteller',
      verified: true,
      socialLinks: ['LinkedIn', 'Twitter']
    },
  ];

  return (
    <PageContainer>
      <PageHeader 
        title="Rich Creator Profiles" 
        description="Comprehensive creator profiles with banner, avatar, bio, statistics, and achievements."
        hero={true}
      />

      <div className="space-y-6">
        {creators.map((creator) => (
          <Card key={creator.id}>
            <CardContent className="p-0">
              <div className="h-48 bg-gradient-to-r from-purple-900 to-cyan-900 flex items-center justify-center text-6xl">
                {creator.banner}
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-6xl -mt-16 bg-white/10 p-4 rounded-full border-4 border-bg">
                    {creator.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{creator.name}</h2>
                      {creator.verified && <CheckCircle className="h-5 w-5 text-accent" />}
                    </div>
                    <p className="text-text-muted mb-2">{creator.bio}</p>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <span className={`px-2 py-1 rounded-full bg-accent/10 text-accent font-bold`}>
                        {creator.level}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Follow
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                      <Users className="h-4 w-4" />
                      <span>Followers</span>
                    </div>
                    <p className="text-xl font-bold text-white">{creator.followers.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                      <Film className="h-4 w-4" />
                      <span>Movies</span>
                    </div>
                    <p className="text-xl font-bold text-white">{creator.movies}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                      <Award className="h-4 w-4" />
                      <span>Awards</span>
                    </div>
                    <p className="text-xl font-bold text-white">{creator.awards.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5">
                    <div className="flex items-center gap-2 text-text-muted text-sm mb-1">
                      <Trophy className="h-4 w-4" />
                      <span>Achievements</span>
                    </div>
                    <p className="text-xl font-bold text-white">{creator.achievements}</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                  {creator.awards.map((award) => (
                    <span key={award} className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
                      {award}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  {creator.socialLinks.map((link) => (
                    <Button key={link} variant="secondary" size="sm">
                      <LinkIcon className="h-4 w-4 mr-2" />
                      {link}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
