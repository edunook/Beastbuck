import { PageContainer } from '../../components/layout/LayoutWrappers';
import { Play, Volume2, Maximize, MessageSquare, Heart, Share2, Bookmark, UserPlus } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function MoviePlayer() {
  useParams();

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto">
        <div className="aspect-video bg-black rounded-xl overflow-hidden relative group border border-border shadow-2xl mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="w-20 h-20 text-white/20" />
          </div>
          
          {/* Fake Video Controls */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-full bg-white/20 h-1 rounded-full mb-4 cursor-pointer">
              <div className="bg-accent h-1 rounded-full w-1/3"></div>
            </div>
            <div className="flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <button><Play className="w-5 h-5 hover:text-accent" /></button>
                <button><Volume2 className="w-5 h-5 hover:text-accent" /></button>
                <span className="text-xs font-mono">01:23 / 04:20</span>
              </div>
              <div>
                <button><Maximize className="w-5 h-5 hover:text-accent" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <span className="bg-white/10 text-text-muted text-xs px-2 py-1 rounded font-bold uppercase">Comedy Skit</span>
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded font-bold uppercase">Members Only</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Office Space Parody: The DevOps Edit</h1>
            <p className="text-text-muted text-sm mb-6">12,402 views · Oct 12, 2026</p>
            
            <div className="flex items-center justify-between border-y border-border/50 py-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface border border-border"></div>
                <div>
                  <h3 className="font-bold text-white text-sm">Engineering Team</h3>
                  <p className="text-xs text-text-muted">Master Creator · 45K Followers</p>
                </div>
                <button className="ml-4 bg-white text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-white/80 flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Follow
                </button>
              </div>
            </div>

            <div className="bg-surface/40 border border-border rounded-xl p-4 text-sm text-text-muted leading-relaxed">
              When the CI/CD pipeline breaks on a Friday afternoon and nobody wants to claim responsibility. Featuring the entire backend team!
              <br/><br/>
              #comedy #devops #techhumor #office
            </div>
          </div>

          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="bg-surface/40 border border-border rounded-xl p-4 flex justify-around">
              <button className="flex flex-col items-center gap-1 text-white hover:text-accent"><Heart className="w-6 h-6" /><span className="text-xs">4.2K</span></button>
              <button className="flex flex-col items-center gap-1 text-white hover:text-blue-400"><MessageSquare className="w-6 h-6" /><span className="text-xs">128</span></button>
              <button className="flex flex-col items-center gap-1 text-white hover:text-emerald-400"><Bookmark className="w-6 h-6" /><span className="text-xs">Save</span></button>
              <button className="flex flex-col items-center gap-1 text-white hover:text-purple-400"><Share2 className="w-6 h-6" /><span className="text-xs">Share</span></button>
            </div>
            
            <div className="bg-surface/40 border border-border rounded-xl p-4">
              <h3 className="font-bold text-white text-sm mb-4">Up Next</h3>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3 cursor-pointer group">
                    <div className="w-24 h-16 bg-surface rounded-lg shrink-0 border border-border group-hover:border-accent"></div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-accent">Another funny video title goes right here</h4>
                      <p className="text-[10px] text-text-muted mt-1">Creator Name</p>
                    </div>
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
