import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Rocket, ShieldCheck, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AdminVentures() {
  const pendingApprovals = [
    { id: '1', name: 'NeuroLink Connect', founder: 'Alex R.', type: 'DeepTech', status: 'Pending Review' },
    { id: '2', name: 'EcoGrid Scale', founder: 'Sarah M.', type: 'Clean Energy', status: 'Pending Review' }
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Venture Administration"
        description="Review venture proposals, moderate incubators, and manage public visibility."
      />
      
      <div className="flex flex-col md:flex-row gap-6 mb-8">
         <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
               type="text" 
               placeholder="Search ventures by name or founder..." 
               className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:border-accent" 
            />
         </div>
         <Button variant="secondary" className="px-6"><Filter className="w-5 h-5 mr-2" /> Filters</Button>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Pending Approvals</h2>
      <div className="space-y-4 mb-10">
         {pendingApprovals.map(v => (
            <Card key={v.id} className="bg-surface/50 border-border">
               <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                     <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
                        <Rocket className="w-5 h-5 text-accent" />
                     </div>
                     <div>
                        <div className="font-bold text-white">{v.name}</div>
                        <div className="text-sm text-text-muted">Founder: {v.founder} • {v.type}</div>
                     </div>
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                     <Button className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                        <CheckCircle className="w-4 h-4 mr-2" /> Approve
                     </Button>
                     <Button variant="secondary" className="flex-1 md:flex-none hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50">
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                     </Button>
                  </div>
               </CardContent>
            </Card>
         ))}
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Incubator Program Moderation</h2>
      <Card className="bg-surface/50 border-border border-dashed">
         <CardContent className="p-10 text-center">
            <ShieldCheck className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="font-bold text-white mb-2">Program Administration Console</h3>
            <p className="text-sm text-text-muted mb-6">Manage cohorts, assign mentors, and review graduation criteria.</p>
            <Button variant="secondary">Open Console</Button>
         </CardContent>
      </Card>
    </PageContainer>
  );
}
