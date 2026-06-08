import { useEffect, useState } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Filter, Download, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { KnowledgeService } from '../../services/firebase/knowledge';

export default function KnowledgeMap() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      try {
        const articles = await KnowledgeService.getArticles({ limitCount: 20 });
        const newNodes = [];
        const newEdges = [];
        
        let yOffset = 50;
        let xOffset = 50;
        
        // Central node
        newNodes.push({
          id: 'beastbuck-core',
          type: 'default',
          data: { label: 'BeastBuck Core' },
          position: { x: 300, y: 200 },
          style: { background: 'rgba(0, 240, 255, 0.2)', border: '1px solid #00f0ff', color: '#fff', fontWeight: 'bold' }
        });

        articles.forEach((article) => {
           const nodeId = `article-${article.id}`;
           newNodes.push({
             id: nodeId,
             type: 'default',
             data: { label: article.title },
             position: { x: xOffset, y: yOffset },
             style: { background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#fff' }
           });
           
           newEdges.push({
             id: `edge-${article.id}`,
             source: 'beastbuck-core',
             target: nodeId,
             label: 'Includes',
             markerEnd: { type: MarkerType.ArrowClosed },
             animated: true,
             style: { stroke: '#a855f7' }
           });

           xOffset += 200;
           if (xOffset > 600) {
             xOffset = 50;
             yOffset += 100;
           }
        });
        
        if (newNodes.length === 1) {
           newNodes.push({ id: 'empty', type: 'default', data: { label: 'No Articles Yet' }, position: { x: 300, y: 300 }, style: { color: '#fff', background: '#333' }});
        }
        
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error('Failed to load map data', err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge Map"
        description="Visualizing connections across all BeastBuck systems, projects, research, and experts."
        action={
          <div className="flex gap-2">
             <Button variant="secondary" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
             <Button variant="secondary" size="sm"><Download className="w-4 h-4 mr-2" /> Export</Button>
          </div>
        }
      />

      <div className="w-full h-[calc(100vh-16rem)] rounded-2xl border border-border bg-surface/30 overflow-hidden relative">
         <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">Articles</span>
            <span className="px-2 py-1 rounded text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Experts</span>
            <span className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">Projects</span>
            <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">Research</span>
         </div>
         {loading ? (
           <div className="absolute inset-0 flex items-center justify-center bg-surface/50 z-20">
             <Loader2 className="w-8 h-8 animate-spin text-accent" />
           </div>
         ) : null}
         
         <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView
            attributionPosition="bottom-right"
         >
            <MiniMap 
               nodeStrokeColor={(n) => {
                  if (n.id.startsWith('article')) return '#a855f7';
                  if (n.id.startsWith('user')) return '#00f0ff';
                  if (n.id.startsWith('project')) return '#ff9800';
                  return '#666';
               }}
               nodeColor={() => 'rgba(255,255,255,0.1)'}
               maskColor="rgba(0,0,0,0.7)"
               style={{ backgroundColor: '#111', border: '1px solid #333' }}
            />
            <Controls style={{ fill: '#fff' }} className="bg-surface border border-border" />
            <Background color="#333" gap={16} />
         </ReactFlow>
      </div>
    </PageContainer>
  );
}
