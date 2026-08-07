import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { Star, Users, MessageSquare, Heart, Share2, Bookmark } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

export default function AIProfilePage() {
  const { aiId } = useParams();

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="relative rounded-2xl border border-border bg-surface/40 p-8 backdrop-blur-sm overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-3xl bg-white/5 border-2 border-border flex items-center justify-center text-5xl shrink-0 shadow-lg">⚛️</div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h1 className="text-3xl font-bold text-white">Physics Guru</h1>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Verified</span>
              </div>
              <p className="text-text-muted mb-3">Explains physics with humor, real-world examples, and step-by-step guidance. Never gives direct homework answers.</p>
              <div className="flex items-center gap-4 justify-center sm:justify-start text-sm text-text-muted">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> 4.9 (240 reviews)</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> 4.2K chats</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> 892 followers</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 mt-6 justify-center sm:justify-start">
            <Link to={`/ais/${aiId}/chat`} className="bg-accent text-black font-bold px-8 py-3 rounded-xl hover:bg-accent/80 transition shadow-[0_0_20px_rgba(208,255,0,0.15)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Start Chat
            </Link>
            <button className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition flex items-center gap-2"><Heart className="w-4 h-4" /> Follow</button>
            <button className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition flex items-center gap-2"><Bookmark className="w-4 h-4" /> Save</button>
            <button className="bg-white/10 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/20 transition flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-4">About This AI</h3>
              <p className="text-sm text-text-muted leading-relaxed">Physics Guru is an AI tutor specializing in explaining physics concepts through real-world analogies, humor, and step-by-step breakdowns. It covers mechanics, thermodynamics, electromagnetism, quantum physics, and astrophysics.</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Physics', 'Mechanics', 'Quantum', 'Thermodynamics', 'Education'].map(t => (
                  <span key={t} className="bg-white/5 border border-border rounded-full px-3 py-1 text-xs font-bold text-text-muted">{t}</span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-4">Try Asking</h3>
              <div className="space-y-2">
                {['Explain quantum entanglement like I\'m 10', 'What is the difference between speed and velocity?', 'Help me solve a momentum problem'].map((q, i) => (
                  <Link key={i} to={`/ais/${aiId}/chat`} className="block bg-white/5 hover:bg-accent/10 border border-border hover:border-accent/30 rounded-lg px-4 py-3 text-sm text-white transition">
                    "{q}"
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-4">Creator</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface border border-border"></div>
                <div>
                  <p className="font-bold text-white text-sm">Dr. Sarah Chen</p>
                  <p className="text-xs text-text-muted">AI Architect · 12 AIs created</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface/40 p-6 backdrop-blur-sm">
              <h3 className="font-bold text-white mb-4">Reviews</h3>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>
                    </div>
                    <p className="text-xs text-text-muted">"Best physics tutor I've ever used! Explains everything so clearly."</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
