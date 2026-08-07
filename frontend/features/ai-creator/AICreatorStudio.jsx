import { useState, useEffect } from 'react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Plus, Bot, Users, Star, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { useAuth } from '@frontend/features/auth/AuthContext';
import EmptyState from '@frontend/components/ui/EmptyState';

export default function AICreatorStudio() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [myAIs, setMyAIs] = useState([]);

  useEffect(() => {
    const fetchAIStudioData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch AI stats
        const statsQuery = query(
          collection(db, 'ai_studio_stats'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        const statsSnap = await getDocs(statsQuery);
        
        if (!statsSnap.empty) {
          setStats(statsSnap.docs[0].data());
        }

        // Fetch user's AIs
        const aisQuery = query(
          collection(db, 'custom_ais'),
          where('creatorId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const aisSnap = await getDocs(aisQuery);
        
        setMyAIs(aisSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Failed to fetch AI Studio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAIStudioData();
  }, [user]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </PageContainer>
    );
  }

  const displayStats = stats || {
    totalAIs: 0,
    totalChats: 0,
    followers: 0,
    avgRating: 0
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Creator Studio" 
        description="Build, train, and manage your custom AI assistants."
        action={
          <Link 
            to="/ai-studio/create" 
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-black font-bold px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Create AI
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'My AIs', value: displayStats.totalAIs?.toString() || '0', icon: Bot, color: 'text-purple-400' },
          { label: 'Total Chats', value: displayStats.totalChats?.toLocaleString() || '0', icon: Sparkles, color: 'text-accent' },
          { label: 'Followers', value: displayStats.followers?.toLocaleString() || '0', icon: Users, color: 'text-blue-400' },
          { label: 'Avg Rating', value: displayStats.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-yellow-400' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-5 text-center backdrop-blur-sm">
            <s.icon className={`mx-auto mb-2 h-6 w-6 ${s.color}`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <Link to="/ai-studio/create" className="group flex items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface/20 p-8 text-center transition hover:border-accent hover:bg-accent/5">
          <Plus className="h-8 w-8 text-text-muted group-hover:text-accent transition" />
          <div className="text-left">
            <h3 className="text-lg font-bold text-white group-hover:text-accent transition">Create New AI</h3>
            <p className="text-sm text-text-muted">Design a custom assistant with unique personality, expertise, and knowledge.</p>
          </div>
        </Link>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">My AIs</h2>
      {myAIs.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myAIs.map((ai) => (
            <div key={ai.id} className="group rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm transition hover:border-accent/50 hover:shadow-[0_0_20px_rgba(208,255,0,0.05)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-3xl border border-border">
                  {ai.emoji || '🤖'}
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${ai.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-muted'}`}>
                  {ai.status || 'Draft'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent transition">{ai.name || 'Untitled AI'}</h3>
              <p className="text-xs text-text-muted mb-4 line-clamp-2">{ai.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-text-muted border-t border-border/50 pt-3">
                <span>{ai.totalChats?.toLocaleString() || '0'} chats</span>
                {ai.avgRating > 0 && <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-yellow-400" /> {ai.avgRating.toFixed(1)}</span>}
              </div>
              <div className="flex gap-2 mt-4">
                <Link to={`/ais/${ai.id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg text-center transition">View</Link>
                <Link to={`/ai-studio/analytics?aiId=${ai.id}`} className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold py-2 rounded-lg text-center transition">Analytics</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bot}
          title="No AIs Created Yet"
          description="Create your first custom AI assistant to get started."
        />
      )}
    </PageContainer>
  );
}
