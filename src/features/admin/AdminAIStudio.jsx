import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { ShieldAlert, CheckCircle2, Trash2, Star as StarIcon, Eye } from 'lucide-react';

export default function AdminAIStudio() {
  return (
    <PageContainer>
      <PageHeader title="AI Studio Administration" description="Approve, feature, moderate, and manage community AIs." />

      <div className="mb-8">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert className="text-yellow-400 w-5 h-5" /> Pending Review</h3>
        <div className="rounded-2xl border border-white/10 bg-surface/40 overflow-hidden backdrop-blur-sm shadow-depth-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted bg-black/20">
                <th className="py-3 px-4 text-caption font-semibold">AI Name</th>
                <th className="py-3 px-4">Creator</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Homework Solver', creator: 'User_42', category: 'Education', reason: 'Policy Violation' },
                { name: 'Roast Bot', creator: 'MemeTeam', category: 'Fun', reason: 'Content Review' },
              ].map((ai, i) => (
                <tr key={i} className="border-b border-border/20 text-white last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold">{ai.name}</td>
                  <td className="py-3 px-4 text-text-muted">{ai.creator}</td>
                  <td className="py-3 px-4 text-text-muted">{ai.category}</td>
                  <td className="py-3 px-4 text-yellow-400">{ai.reason}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition"><Eye className="w-3 h-3" /> Review</button>
                      <button className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition"><CheckCircle2 className="w-3 h-3" /> Approve</button>
                      <button className="bg-red-500/20 text-red-400 hover:bg-red-500/40 px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition"><Trash2 className="w-3 h-3" /> Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><StarIcon className="text-accent w-5 h-5" /> Featured AI Management</h3>
        <div className="rounded-2xl border border-white/10 bg-surface/40 overflow-hidden backdrop-blur-sm shadow-depth-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted bg-black/20">
                <th className="py-3 px-4 text-caption font-semibold">AI Name</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Chats</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Physics Guru ⚛️', rating: 4.9, chats: '42K', featured: true },
                { name: 'Code Reviewer 💻', rating: 4.8, chats: '61K', featured: true },
                { name: 'Meme Lord 😂', rating: 4.3, chats: '89K', featured: false },
              ].map((ai, i) => (
                <tr key={i} className="border-b border-border/20 text-white last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold">{ai.name}</td>
                  <td className="py-3 px-4"><span className="flex items-center gap-1 text-yellow-400"><StarIcon className="w-3 h-3 fill-yellow-400" /> {ai.rating}</span></td>
                  <td className="py-3 px-4">{ai.chats}</td>
                  <td className="py-3 px-4">{ai.featured ? <span className="text-accent text-xs font-bold">✓ Featured</span> : <span className="text-text-muted text-xs">—</span>}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded text-xs font-bold transition">
                      {ai.featured ? 'Unfeature' : 'Feature'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
