import { Network, FileText, Users, Award } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export default function KnowledgeAnalytics() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Knowledge Analytics</h2>
          <p className="text-text-muted">Metrics on Knowledge Network growth, engagement, and semantic search usage.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-surface/50 border-border">
          <CardContent className="p-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                   <Network className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-2xl font-bold text-white">45,210</div>
                   <div className="text-xs text-text-muted uppercase">Graph Edges</div>
                </div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-surface/50 border-border">
          <CardContent className="p-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                   <FileText className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-2xl font-bold text-white">8,932</div>
                   <div className="text-xs text-text-muted uppercase">Search Queries</div>
                </div>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-surface/50 border-border">
          <CardContent className="p-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                   <Users className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-2xl font-bold text-white">412</div>
                   <div className="text-xs text-text-muted uppercase">Active Mentorships</div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-surface/50 border-border">
          <CardContent className="p-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                   <Award className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-2xl font-bold text-white">156</div>
                   <div className="text-xs text-text-muted uppercase">Top Contributors</div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="bg-surface border-border">
            <div className="p-6 border-b border-border/50">
               <h3 className="text-lg font-bold text-white">Semantic Search Efficacy</h3>
            </div>
            <div className="p-6 h-64 flex items-center justify-center border-border border-dashed border-2 rounded-xl m-6">
               <span className="text-text-muted text-sm">Chart Placeholder (D3/Recharts)</span>
            </div>
         </Card>
         <Card className="bg-surface border-border">
            <div className="p-6 border-b border-border/50">
               <h3 className="text-lg font-bold text-white">Top Knowledge Categories</h3>
            </div>
            <div className="p-6 h-64 flex items-center justify-center border-border border-dashed border-2 rounded-xl m-6">
               <span className="text-text-muted text-sm">Chart Placeholder (D3/Recharts)</span>
            </div>
         </Card>
      </div>
    </div>
  );
}
