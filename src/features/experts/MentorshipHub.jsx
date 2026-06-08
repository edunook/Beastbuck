import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Award, Video, Target, Users, CalendarClock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const sessions = [
  { id: '1', mentor: 'Alex Rivera', topic: 'System Design Interview Prep', date: 'Today, 4:00 PM', status: 'upcoming', type: '1-on-1' },
  { id: '2', mentor: 'Jordan Lee', topic: 'Data Arch Deep Dive', date: 'Tomorrow, 10:00 AM', status: 'upcoming', type: 'Group' }
];

export default function MentorshipHub() {
  return (
    <PageContainer>
      <PageHeader
        title="Mentorship Hub"
        description="Grow your skills with personalized guidance from BeastBuck experts."
        action={
          <Button><Award className="w-4 h-4 mr-2" /> Find a Mentor</Button>
        }
      />
      
      <div className="grid lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* Upcoming Sessions */}
            <section>
               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><CalendarClock className="w-5 h-5 text-accent" /> Upcoming Sessions</h2>
               <div className="space-y-4">
                  {sessions.map(session => (
                     <Card key={session.id} className="border-border bg-surface/50 hover:border-accent transition-all">
                        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                                 {session.type === '1-on-1' ? <Target className="w-6 h-6 text-accent" /> : <Users className="w-6 h-6 text-accent" />}
                              </div>
                              <div>
                                 <h3 className="font-bold text-white text-lg">{session.topic}</h3>
                                 <p className="text-sm text-text-muted">with {session.mentor} • {session.date}</p>
                              </div>
                           </div>
                           <Button className="shrink-0 bg-accent text-black hover:bg-accent-hover shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                              <Video className="w-4 h-4 mr-2" /> Join Video Room
                           </Button>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </section>

            {/* Recommended Programs */}
            <section>
               <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-purple-400" /> Recommended Programs</h2>
               <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-surface border border-border rounded-xl p-5 hover:border-purple-500 transition-colors cursor-pointer group">
                     <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 mb-3 inline-block">Department Program</span>
                     <h3 className="text-white font-bold mb-1 group-hover:text-purple-400">Engineering Leadership</h3>
                     <p className="text-sm text-text-muted mb-4">6-week cohort led by CTO.</p>
                     <div className="flex items-center text-xs text-purple-400 font-bold">Apply Now <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" /></div>
                  </div>
                  <div className="bg-surface border border-border rounded-xl p-5 hover:border-purple-500 transition-colors cursor-pointer group">
                     <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 mb-3 inline-block">Innovation</span>
                     <h3 className="text-white font-bold mb-1 group-hover:text-purple-400">Zero to Venture</h3>
                     <p className="text-sm text-text-muted mb-4">Mentorship for taking internal ideas to market.</p>
                     <div className="flex items-center text-xs text-purple-400 font-bold">Apply Now <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" /></div>
                  </div>
               </div>
            </section>

         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <Card className="border-border bg-surface/30">
               <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-4 border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                     <span className="text-3xl font-bold text-purple-400">4</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">Active Goals</h3>
                  <p className="text-sm text-text-muted mb-4">You are making great progress towards your Senior Architect milestone.</p>
                  <Button variant="secondary" className="w-full">View Goals Tracking</Button>
               </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 rounded-xl p-6">
               <h3 className="text-accent font-bold mb-2">Become a Mentor</h3>
               <p className="text-sm text-white/80 mb-4">Share your expertise and earn the Master Mentor certification and XP rewards.</p>
               <Button className="w-full bg-accent text-black hover:bg-accent-hover">Apply to Mentor</Button>
            </div>
         </div>
      </div>
    </PageContainer>
  );
}
