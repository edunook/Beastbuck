import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MovieUploadWizard() {
  return (
    <PageContainer>
      <PageHeader title="Upload Movie" description="Share your creative short, skit, or series episode." />
      
      <div className="max-w-3xl mx-auto bg-surface/40 border border-border rounded-xl p-8 backdrop-blur-sm">
        
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-border -z-10 -translate-y-1/2"></div>
          <div className="bg-accent text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
          <div className="bg-surface border border-border text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
          <div className="bg-surface border border-border text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Video File</label>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-white/5 transition cursor-pointer">
              <UploadCloud className="w-10 h-10 text-text-muted mx-auto mb-2" />
              <p className="text-sm text-white font-bold mb-1">Click to browse or drag and drop</p>
              <p className="text-xs text-text-muted">MP4, WebM up to 2GB</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-white mb-2">Title</label>
            <input type="text" placeholder="Enter a catchy title..." className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">Category</label>
            <select className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent">
              <option>Comedy Skit</option>
              <option>Team Movie</option>
              <option>Challenge Entry</option>
              <option>Mini Series</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-white mb-2">Visibility</label>
            <select className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent">
              <option>Public (Visible to all members)</option>
              <option>Members Only</option>
              <option>Private</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-4">
          <Link to="/funflix/studio" className="px-6 py-2 rounded-lg font-bold text-white bg-white/10 hover:bg-white/20 transition">Cancel</Link>
          <button className="px-6 py-2 rounded-lg font-bold text-black bg-accent hover:bg-accent/80 transition">Next Step</button>
        </div>
      </div>
    </PageContainer>
  );
}
