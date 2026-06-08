import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { KnowledgeService } from '../../services/firebase/knowledge';
export default function AdminKnowledge() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    KnowledgeService.getPendingArticles().then(data => {
      setPending(data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Knowledge Administration</h2>
          <p className="text-text-muted">Manage articles, categories, and AI learning paths.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <Card className="bg-surface/50 border-border">
            <CardContent className="p-4">
               <div className="text-text-muted text-sm mb-1">Total Articles</div>
               <div className="text-2xl font-bold text-white">1,248</div>
            </CardContent>
         </Card>
         <Card className="bg-surface/50 border-border">
            <CardContent className="p-4">
               <div className="text-text-muted text-sm mb-1">Pending Review</div>
               <div className="text-2xl font-bold text-orange-400">14</div>
            </CardContent>
         </Card>
         <Card className="bg-surface/50 border-border">
            <CardContent className="p-4">
               <div className="text-text-muted text-sm mb-1">Active Mentors</div>
               <div className="text-2xl font-bold text-green-400">86</div>
            </CardContent>
         </Card>
         <Card className="bg-surface/50 border-border">
            <CardContent className="p-4">
               <div className="text-text-muted text-sm mb-1">AI Curations</div>
               <div className="text-2xl font-bold text-purple-400">3,492</div>
            </CardContent>
         </Card>
      </div>

      <Card className="bg-surface border-border mb-8">
         <div className="p-6 border-b border-border/50">
            <h3 className="text-lg font-bold text-white">Content Moderation Queue</h3>
         </div>
         <div className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-border/50 bg-black/20 text-text-muted text-sm uppercase tracking-wider">
                        <th className="p-4 font-bold">Content Title</th>
                        <th className="p-4 font-bold">Author</th>
                        <th className="p-4 font-bold">Type</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr>
                          <td colSpan="4" className="p-4 text-center">
                             <Loader2 className="w-5 h-5 animate-spin mx-auto text-neutral-500" />
                          </td>
                        </tr>
                     ) : pending.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-8 text-center text-text-muted">No pending articles in the queue.</td>
                        </tr>
                     ) : pending.map(item => (
                        <tr key={item.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                           <td className="p-4 text-white font-medium">{item.title}</td>
                           <td className="p-4 text-text-muted">{item.authorId}</td>
                           <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-accent/20 text-accent font-bold">{item.category || 'Article'}</span></td>
                           <td className="p-4 text-right flex justify-end gap-2">
                              <button className="text-green-400 hover:bg-green-400/20 p-2 rounded transition-colors"><CheckCircle2 className="w-5 h-5" /></button>
                              <button className="text-red-400 hover:bg-red-400/20 p-2 rounded transition-colors"><XCircle className="w-5 h-5" /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </Card>
    </div>
  );
}
