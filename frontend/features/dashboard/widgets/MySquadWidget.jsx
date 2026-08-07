import { useState, useEffect } from 'react';
import { Users, Waves, MessageSquare, Heart, Handshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { useAuth } from '../../auth/AuthContext';
import { DynamicEmptyState } from '@frontend/components/dashboard/DynamicEmptyStates';
import { GamificationService } from '@services/firestore/gamification';

export function MySquadWidget() {
  const { user } = useAuth();
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadSquad = async () => {
      try {
        const data = await GamificationService.getMySquad(user.uid);
        setSquad(data || []);
      } catch (err) {
        console.log('Squad load failed:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSquad();
  }, [user?.uid]);

  if (loading) {
    return (
      <Card className="h-full border border-white/10 bg-gradient-to-br from-pink-500/5 to-rose-500/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted">My Squad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border border-white/10 bg-gradient-to-br from-pink-500/5 to-rose-500/5 backdrop-blur-sm transition-all duration-500 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/20">
      <CardHeader>
        <CardTitle className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
          <Users className="text-pink-400 animate-pulse" />
          My Squad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {squad.length === 0 ? (
          <DynamicEmptyState type="users" title="No squad members yet" subtitle="Invite members to join your squad!" />
        ) : (
          <div className="space-y-3">
            {squad.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:border-pink-500/50 hover:bg-white/[0.08] transition-all duration-300"
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 100}ms both` }}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/20">
                    <span className="text-sm font-black text-pink-300">{member.initials || '??'}</span>
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${
                    member.online ? 'bg-status-success animate-pulse' : 'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{member.name || '???'}</p>
                  <p className="text-xs text-text-muted">{member.activity || 'Exploring'}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-yellow-400 transition-all duration-200" title="Wave">
                    <Waves className="text-xs" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-pink-400 transition-all duration-200" title="Cheer">
                    <Heart className="text-xs" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-blue-400 transition-all duration-200" title="Chat">
                    <MessageSquare className="text-xs" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}