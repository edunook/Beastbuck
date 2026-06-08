import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Award, Brain, Target, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const experts = [
  {
    id: 'expert-1',
    name: 'Alex Rivera',
    role: 'Chief AI Officer',
    expertiseScore: 9850,
    contributionScore: 4200,
    availability: 'available',
    skills: ['Machine Learning', 'Neural Networks', 'Python'],
    achievements: ['Top Innovator', 'Master Mentor']
  },
  {
    id: 'expert-2',
    name: 'Jordan Lee',
    role: 'Lead Data Scientist',
    expertiseScore: 8400,
    contributionScore: 3150,
    availability: 'busy',
    skills: ['Data Architecture', 'Scala', 'Spark'],
    achievements: ['Top Researcher']
  }
];

export default function ExpertDirectory() {
  return (
    <PageContainer>
      <PageHeader
        title="Expert Directory"
        description="Find and connect with specialized talent across the organization."
        action={
          <div className="flex gap-2">
             <Button variant="secondary" size="sm">Update My Expertise</Button>
          </div>
        }
      />
      
      {/* Search & Filters */}
      <div className="bg-surface/50 border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 mb-8">
         <input type="text" placeholder="Search by skill, name, or achievement..." className="flex-1 bg-black/40 border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-accent" />
         <select className="bg-black/40 border border-border rounded-lg px-4 py-2 text-white outline-none focus:border-accent">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Research</option>
         </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {experts.map(expert => (
          <Card key={expert.id} className="border-border bg-surface/50 hover:border-purple-500 transition-all group">
            <CardContent className="p-6">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400 font-bold text-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        {expert.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="font-bold text-white text-lg">{expert.name}</h3>
                        <p className="text-sm text-text-muted">{expert.role}</p>
                     </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${expert.availability === 'available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'}`}>
                     {expert.availability}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/20 rounded-lg p-3 border border-border/50 text-center">
                     <Brain className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                     <div className="text-lg font-bold text-white">{expert.expertiseScore}</div>
                     <div className="text-[10px] text-text-muted uppercase">Expertise</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3 border border-border/50 text-center">
                     <Target className="w-4 h-4 text-accent mx-auto mb-1" />
                     <div className="text-lg font-bold text-white">{expert.contributionScore}</div>
                     <div className="text-[10px] text-text-muted uppercase">Impact</div>
                  </div>
               </div>

               <div className="mb-6">
                  <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">Verified Skills</p>
                  <div className="flex flex-wrap gap-2">
                     {expert.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 rounded-md text-xs bg-white/5 text-white border border-border/50">{skill}</span>
                     ))}
                  </div>
               </div>

               <div className="flex items-center gap-2 border-t border-border/50 pt-4 mt-auto">
                  <Button variant="secondary" className="flex-1 border-purple-500/30 hover:bg-purple-500/10 text-purple-400">
                     <MessageSquare className="w-4 h-4 mr-2" /> Message
                  </Button>
                  <Button className="flex-1 bg-purple-500 text-white hover:bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                     <Award className="w-4 h-4 mr-2" /> Request Mentor
                  </Button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
