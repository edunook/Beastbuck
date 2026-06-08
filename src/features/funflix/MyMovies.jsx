import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Edit3, Trash2, Eye, BarChart } from 'lucide-react';

export default function MyMovies() {
  return (
    <PageContainer>
      <PageHeader title="My Movies" description="Manage all your uploaded FunFlix content." />
      
      <div className="bg-surface/40 border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border/50 flex gap-4">
          <input type="text" placeholder="Search my movies..." className="bg-surface border border-border rounded-lg px-4 py-2 text-sm text-white w-full max-w-md focus:outline-none focus:border-accent" />
          <select className="bg-surface border border-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none">
            <option>All Visibility</option>
            <option>Public</option>
            <option>Members Only</option>
            <option>Private</option>
          </select>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 text-text-muted">
              <th className="py-3 px-4">Movie</th>
              <th className="py-3 px-4">Visibility</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Views</th>
              <th className="py-3 px-4">Likes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4].map(i => (
              <tr key={i} className="border-b border-border/20 text-white last:border-0 hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-8 bg-surface rounded border border-border shrink-0"></div>
                    <span className="font-bold truncate max-w-[200px]">Comedy Skit {i}</span>
                  </div>
                </td>
                <td className="py-3 px-4"><span className="text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded">Public</span></td>
                <td className="py-3 px-4 text-text-muted">Oct {10+i}, 2026</td>
                <td className="py-3 px-4">{(i * 12.4).toFixed(1)}K</td>
                <td className="py-3 px-4 text-emerald-400">{(i * 1.2).toFixed(1)}K</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2 text-text-muted">
                    <button className="hover:text-accent" title="View"><Eye className="w-4 h-4" /></button>
                    <button className="hover:text-blue-400" title="Edit"><Edit3 className="w-4 h-4" /></button>
                    <button className="hover:text-purple-400" title="Analytics"><BarChart className="w-4 h-4" /></button>
                    <button className="hover:text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
