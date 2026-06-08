import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function VentureDirectory() {
  return (
    <PageContainer>
      <PageHeader
        title="Venture Directory"
        description="Search, filter, and discover ventures across the organization."
      />
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
         <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
               type="text" 
               placeholder="Search by industry, technology, or department..." 
               className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-accent" 
            />
         </div>
         <div className="flex gap-2">
            <select className="bg-surface border border-border rounded-xl px-4 py-3 text-white outline-none focus:border-accent">
               <option>All Stages</option>
               <option>IDEA</option>
               <option>MVP</option>
               <option>SCALING</option>
            </select>
            <Button variant="secondary" className="px-3"><Filter className="w-5 h-5" /></Button>
            <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
               <button className="p-2 bg-white/10 rounded-lg"><LayoutGrid className="w-4 h-4 text-white" /></button>
               <button className="p-2 hover:bg-white/5 rounded-lg"><List className="w-4 h-4 text-text-muted" /></button>
            </div>
         </div>
      </div>

      <div className="text-center py-20 bg-surface/30 border border-border rounded-2xl border-dashed">
         <p className="text-text-muted">Start searching to discover ventures, or use the filters above.</p>
      </div>
    </PageContainer>
  );
}
