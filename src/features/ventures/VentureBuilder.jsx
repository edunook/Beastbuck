import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Sparkles, ArrowRight, ArrowLeft, Save, Rocket } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const STEPS = [
  'Vision', 'Problem', 'Solution', 'Market', 'Roadmap', 'Team', 'Launch'
];

export default function VentureBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    mission: '',
    problem: '',
    problemImpact: '',
    solution: '',
    uniqueValue: '',
    targetMarket: '',
    marketSize: '',
    competition: '',
    milestones: '',
    teamRoles: '',
    funding: '',
    launchDate: ''
  });

  return (
    <PageContainer>
      <PageHeader
        title="Venture Builder"
        description="A guided wizard to construct your startup from idea to launch."
      />
      
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-surface -z-10 -translate-y-1/2"></div>
         {STEPS.map((step, idx) => (
            <div key={step} className="flex flex-col items-center gap-2 bg-background px-2">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  idx < currentStep ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(74,222,128,0.5)]' 
                  : idx === currentStep ? 'bg-accent text-black shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                  : 'bg-surface text-text-muted border border-border'
               }`}>
                  {idx + 1}
               </div>
               <span className={`text-xs uppercase font-bold tracking-wider ${idx <= currentStep ? 'text-white' : 'text-text-muted'}`}>{step}</span>
            </div>
         ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Main Wizard Form */}
         <div className="flex-1">
            <Card className="bg-surface/50 border-border h-full">
               <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Step {currentStep + 1}: {STEPS[currentStep]}</h2>
                  
                  {currentStep === 0 && (
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Venture Name</label>
                           <input 
                              type="text" 
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none" 
                              placeholder="Enter venture name..." 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Mission Statement</label>
                           <textarea 
                              value={formData.mission}
                              onChange={(e) => setFormData({...formData, mission: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[100px]" 
                              placeholder="What is the core mission?"
                           ></textarea>
                        </div>
                     </div>
                  )}

                  {currentStep === 1 && (
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Problem Statement</label>
                           <textarea 
                              value={formData.problem}
                              onChange={(e) => setFormData({...formData, problem: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[120px]" 
                              placeholder="What problem are you solving?"
                           ></textarea>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Problem Impact</label>
                           <textarea 
                              value={formData.problemImpact}
                              onChange={(e) => setFormData({...formData, problemImpact: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[100px]" 
                              placeholder="How does this problem affect your target audience?"
                           ></textarea>
                        </div>
                     </div>
                  )}

                  {currentStep === 2 && (
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Solution Description</label>
                           <textarea 
                              value={formData.solution}
                              onChange={(e) => setFormData({...formData, solution: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[120px]" 
                              placeholder="Describe your solution..."
                           ></textarea>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Unique Value Proposition</label>
                           <textarea 
                              value={formData.uniqueValue}
                              onChange={(e) => setFormData({...formData, uniqueValue: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[100px]" 
                              placeholder="What makes your solution unique?"
                           ></textarea>
                        </div>
                     </div>
                  )}

                  {currentStep === 3 && (
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Target Market</label>
                           <textarea 
                              value={formData.targetMarket}
                              onChange={(e) => setFormData({...formData, targetMarket: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[100px]" 
                              placeholder="Who is your target market?"
                           ></textarea>
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Market Size</label>
                           <input 
                              type="text" 
                              value={formData.marketSize}
                              onChange={(e) => setFormData({...formData, marketSize: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none" 
                              placeholder="Estimated market size (e.g., $1B)" 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Competition</label>
                           <textarea 
                              value={formData.competition}
                              onChange={(e) => setFormData({...formData, competition: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[100px]" 
                              placeholder="Who are your main competitors?"
                           ></textarea>
                        </div>
                     </div>
                  )}

                  {currentStep === 4 && (
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Key Milestones</label>
                           <textarea 
                              value={formData.milestones}
                              onChange={(e) => setFormData({...formData, milestones: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[150px]" 
                              placeholder="List your key milestones (one per line)..."
                           ></textarea>
                        </div>
                     </div>
                  )}

                  {currentStep === 5 && (
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Team Roles</label>
                           <textarea 
                              value={formData.teamRoles}
                              onChange={(e) => setFormData({...formData, teamRoles: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none min-h-[150px]" 
                              placeholder="Describe your team structure and roles..."
                           ></textarea>
                        </div>
                     </div>
                  )}

                  {currentStep === 6 && (
                     <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Funding Requirements</label>
                           <input 
                              type="text" 
                              value={formData.funding}
                              onChange={(e) => setFormData({...formData, funding: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none" 
                              placeholder="Funding needed (e.g., $500,000)" 
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold text-white mb-2">Target Launch Date</label>
                           <input 
                              type="date" 
                              value={formData.launchDate}
                              onChange={(e) => setFormData({...formData, launchDate: e.target.value})}
                              className="w-full bg-black/40 border border-border rounded-xl p-3 text-white focus:border-accent outline-none" 
                           />
                        </div>
                     </div>
                  )}

                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-border/50">
                     <Button 
                        variant="secondary" 
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                     >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                     </Button>
                     <div className="flex gap-4">
                        <Button variant="secondary"><Save className="w-4 h-4 mr-2" /> Save Draft</Button>
                        <Button 
                           className="bg-accent text-black hover:bg-accent-hover"
                           onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                        >
                           {currentStep === STEPS.length - 1 ? (
                              <><Rocket className="w-4 h-4 mr-2" /> Launch Venture</>
                           ) : (
                              <>Next Step <ArrowRight className="w-4 h-4 ml-2" /></>
                           )}
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>

         {/* AI Assistant Sidebar */}
         <div className="w-full lg:w-80 space-y-6">
            <Card className="bg-purple-500/10 border-purple-500/30">
               <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                     </div>
                     <h3 className="font-bold text-purple-400">AI Assistant</h3>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed mb-4">
                     Need help drafting your {STEPS[currentStep].toLowerCase()}? I can analyze your initial ideas and generate a professional draft.
                  </p>
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                     Generate Draft
                  </Button>
               </CardContent>
            </Card>
         </div>
      </div>
    </PageContainer>
  );
}
