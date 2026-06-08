import { PageContainer } from '../../components/layout/LayoutWrappers';
import { Play, Star, ShieldCheck } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

export default function CreatorProfile() {
  const { username } = useParams();

  return (
    <PageContainer>
      <div className="bg-surface/40 border border-border rounded-xl p-8 mb-8 text-center relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
        <div className="w-24 h-24 rounded-full bg-surface border-4 border-accent mx-auto mb-4 relative z-10 flex items-center justify-center">
          <Star className="text-accent w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-white relative z-10">{username || 'Creator Name'}</h1>
        <p className="text-text-muted mt-1 relative z-10">Comedy Genius · Engineering Team</p>
        <div className="flex justify-center items-center gap-2 mt-3 relative z-10">
          <span className="bg-accent/20 text-accent font-bold px-3 py-1 text-xs rounded-full uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Master Creator
          </span>
        </div>

        <div className="flex justify-center gap-8 mt-8 relative z-10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">45K</p>
            <p className="text-xs text-text-muted">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-text-muted">Movies</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">1.2M</p>
            <p className="text-xs text-text-muted">Total Views</p>
          </div>
        </div>

        <div className="mt-8 relative z-10 flex justify-center gap-4">
          <button className="bg-accent text-black font-bold px-8 py-2 rounded-lg hover:bg-accent/80 transition shadow-[0_0_15px_rgba(208,255,0,0.2)]">Follow</button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Latest Uploads</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Link key={i} to="/funflix/watch/1" className="group block">
            <div className="aspect-video bg-surface rounded-xl mb-3 relative overflow-hidden border border-border group-hover:border-accent transition">
              <Play className="absolute inset-0 m-auto text-white/50 w-12 h-12 group-hover:scale-110 group-hover:text-accent transition-transform" />
            </div>
            <h3 className="text-white font-bold text-sm group-hover:text-accent transition">Comedy Skit Part {i}</h3>
            <p className="text-xs text-text-muted mt-1">12K views · 2 days ago</p>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
