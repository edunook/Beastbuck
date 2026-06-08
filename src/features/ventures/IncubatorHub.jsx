import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader, EmptyState } from '../../components/ui/UIElements';
import { BriefcaseBusiness, Trophy, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function IncubatorHub() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load programs from Firebase
    setLoading(false);
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Startup Incubator"
        description="Join programs, compete in challenges, and accelerate your venture."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
            <CardContent className="p-6">
               <BriefcaseBusiness className="w-8 h-8 text-purple-400 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Accelerators</h3>
               <p className="text-sm text-text-muted mb-4">Intensive programs for high-growth potential startups.</p>
               <Button variant="secondary" className="w-full text-purple-400 border-purple-500/30 hover:bg-purple-500/10">Browse Programs</Button>
            </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
            <CardContent className="p-6">
               <Trophy className="w-8 h-8 text-accent mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Competitions</h3>
               <p className="text-sm text-text-muted mb-4">Pitch challenges to secure simulated funding and reputation.</p>
               <Button variant="secondary" className="w-full text-accent border-accent/30 hover:bg-accent/10">View Challenges</Button>
            </CardContent>
         </Card>
         <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
            <CardContent className="p-6">
               <Users className="w-8 h-8 text-green-400 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Cohorts</h3>
               <p className="text-sm text-text-muted mb-4">Join structured learning blocks with peer founders.</p>
               <Button variant="secondary" className="w-full text-green-400 border-green-500/30 hover:bg-green-500/10">Find Cohorts</Button>
            </CardContent>
         </Card>
      </div>

      <h2 className="text-xl font-bold text-white mb-6">Active Programs</h2>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : programs.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Programs Yet"
          description="Incubator programs will be listed here as they become available."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {programs.map(p => (
              <Card key={p.id} className="bg-surface/50 border-border hover:border-accent transition-colors group">
                 <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                    <div>
                       <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-white/5 text-text-muted border border-border">{p.type}</span>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                             p.status === 'Enrolling' ? 'bg-green-500/20 text-green-400 border-green-500/30'
                             : p.status === 'Active' ? 'bg-accent/20 text-accent border-accent/30'
                             : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }`}>
                             {p.status}
                          </span>
                       </div>
                       <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent transition-colors">{p.name}</h3>
                       <p className="text-sm text-text-muted">Duration: {p.duration}</p>
                    </div>
                    <Button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white">
                       View Details <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                 </CardContent>
              </Card>
           ))}
        </div>
      )}
    </PageContainer>
  );
}
