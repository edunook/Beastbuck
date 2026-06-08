import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { UploadCloud, BarChart2, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreatorStudio() {
  return (
    <PageContainer>
      <PageHeader title="Creator Studio" description="Manage your FunFlix content, analytics, and collaborations." />
      
      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: 'Total Views', value: '142K', trend: '+12%' },
          { label: 'Total Likes', value: '45K', trend: '+5%' },
          { label: 'Followers', value: '1,204', trend: '+22%' },
          { label: 'Creator Level', value: 'Elite', trend: 'Lvl 4' }
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-4 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-text-muted mb-2">{s.label}</p>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">{s.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface/40 border border-border rounded-xl p-8 text-center border-dashed flex flex-col items-center justify-center">
            <UploadCloud className="w-12 h-12 text-text-muted mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Upload New Video</h3>
            <p className="text-sm text-text-muted mb-6">Drag and drop your short movie, comedy skit, or challenge entry.</p>
            <Link to="/funflix/upload" className="bg-accent text-black font-bold px-6 py-2 rounded-lg hover:bg-accent/80 transition">
              Select File
            </Link>
          </div>

          <div className="bg-surface/40 border border-border rounded-xl p-6">
            <h3 className="font-bold text-white mb-4">Recent Uploads</h3>
            <div className="space-y-4">
              {[
                { title: 'The UI/UX Struggle', status: 'Published', views: '12K', likes: '1.2K' },
                { title: 'Product Launch Parody', status: 'Processing', views: '-', likes: '-' }
              ].map((v, i) => (
                <div key={i} className="flex justify-between items-center border-b border-border/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-10 bg-surface rounded-md border border-border"></div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{v.title}</h4>
                      <span className="text-[10px] text-text-muted">{v.views} views · {v.likes} likes</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${v.status === 'Published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/funflix/my-movies" className="block text-center text-sm font-bold text-accent mt-4 hover:underline">View All Movies →</Link>
          </div>
        </div>

        <div className="space-y-4">
          <Link to="/funflix/analytics" className="flex items-center gap-4 bg-surface/40 border border-border p-4 rounded-xl hover:bg-white/5 transition group">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform"><BarChart2 className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-white text-sm">Detailed Analytics</h4>
              <p className="text-xs text-text-muted">Audience retention & metrics</p>
            </div>
          </Link>
          
          <Link to="/funflix/collaborators" className="flex items-center gap-4 bg-surface/40 border border-border p-4 rounded-xl hover:bg-white/5 transition group">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-white text-sm">Collaborators</h4>
              <p className="text-xs text-text-muted">Manage roles & credits</p>
            </div>
          </Link>

          <Link to="/funflix/settings" className="flex items-center gap-4 bg-surface/40 border border-white/10 p-4 rounded-xl hover:bg-white/5 transition group">
            <div className="w-10 h-10 rounded-lg bg-white/10 text-text-muted flex items-center justify-center group-hover:scale-110 transition-transform"><Settings className="w-5 h-5" /></div>
            <div>
              <h4 className="font-bold text-white text-sm">Channel Settings</h4>
              <p className="text-xs text-text-muted">Profile & Defaults</p>
            </div>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
