import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { User, Award, BriefcaseBusiness, GraduationCap, MessageSquare, ExternalLink, Code, FileText, Sparkles, Trophy, Star, Zap, Shield, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { UsersService } from '@services/firestore/users';
import { MemberAvatar } from './MessageItem';

export default function MemberProfilesInChat() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchMembers() {
      try {
        setLoading(true);
        const list = await UsersService.getAllMembers();
        if (active) setMembers(list || []);
      } catch (err) {
        console.warn('Failed to load chat member profiles:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchMembers();
    return () => { active = false; };
  }, []);

  return (
    <PageContainer>
      <PageHeader 
        title="Member Profiles in Chat" 
        description="Community member cards with authentic profiles, skills, and portfolio links."
        hero={true}
      />

      {loading ? (
        <div className="flex justify-center items-center py-20 text-white/50 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
          <span>Loading member profiles...</span>
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-20 text-white/50">
          <p>No community members found.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => {
            const memberName = member.displayName || member.username || 'Member';
            const role = member.role || 'Member';
            const photoURL = member.photoURL || member.avatar || '';

            return (
              <Card 
                key={member.id} 
                className="border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 hover:scale-[1.02] backdrop-blur-2xl cursor-pointer group"
              >
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="relative mb-4">
                    <MemberAvatar 
                      photoURL={photoURL} 
                      name={memberName} 
                      size="xl" 
                      className="!h-20 !w-20 border-2 border-accent/50 shadow-lg shadow-accent/20" 
                    />
                    <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-md" />
                  </div>
                  
                  <h3 className="font-bold text-white text-center mb-1 text-lg group-hover:text-accent transition-colors">{memberName}</h3>
                  <p className="text-white/60 text-xs text-center mb-4">{role}</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-4 px-3 py-1.5 rounded-xl bg-gradient-to-r from-accent/20 to-purple-500/20 border border-accent/30 w-full">
                    <Trophy className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-xs font-bold text-accent">Level {member.level || 1}</span>
                    <span className="text-white/40">·</span>
                    <span className="text-xs font-bold text-white">{(member.xp || 0).toLocaleString()} XP</span>
                  </div>
                  
                  {member.specializations && member.specializations.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-white/70 px-3 py-2 rounded-xl bg-white/5 border border-white/10 w-full mb-4 truncate">
                      <Code className="h-4 w-4 text-accent/70 shrink-0" />
                      <span className="truncate">{member.specializations.join(', ')}</span>
                    </div>
                  )}

                  <div className="flex gap-2 w-full mt-auto">
                    <Link to="/chat" className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 border border-accent/40 shadow-lg text-xs">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        Chat
                      </Button>
                    </Link>
                    <Link to={`/profile/${member.id}`} className="flex-1">
                      <Button size="sm" variant="secondary" className="w-full bg-white/10 hover:bg-white/20 border-white/15 text-xs">
                        <User className="h-3.5 w-3.5 mr-1" />
                        Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
