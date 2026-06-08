import { useState } from 'react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { Bot, Smile, Brain, Target, FileText, Paperclip, Eye, Rocket, ChevronRight, ChevronLeft } from 'lucide-react';

const STEPS = [
  { label: 'Identity', icon: Bot },
  { label: 'Welcome', icon: Smile },
  { label: 'Personality', icon: Brain },
  { label: 'Focus', icon: Target },
  { label: 'Instructions', icon: FileText },
  { label: 'Knowledge', icon: Paperclip },
  { label: 'Preview', icon: Eye },
  { label: 'Publish', icon: Rocket },
];

const PERSONALITIES = ['Professional', 'Friendly', 'Funny', 'Teacher', 'Scientist', 'Coach', 'Mentor', 'Creative', 'Leader', 'Motivator', 'Researcher', 'Developer'];
const TONES = ['Formal', 'Casual', 'Friendly', 'Energetic', 'Motivational', 'Technical', 'Simple', 'Beginner Friendly', 'Expert Level'];
const FOCUS_AREAS = ['Physics', 'Chemistry', 'Biology', 'Coding', 'AI', 'Research', 'Business', 'Marketing', 'Startups', 'Leadership', 'Innovation', 'Education', 'Design', 'Writing', 'Math'];

export default function CreateAIWizard() {
  const [step, setStep] = useState(0);
  const [selectedPersonality, setSelectedPersonality] = useState('Professional');
  const [selectedTone, setSelectedTone] = useState('Friendly');
  const [selectedFocus, setSelectedFocus] = useState([]);

  const toggleFocus = (area) => {
    setSelectedFocus(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? 'bg-accent text-black shadow-[0_0_12px_rgba(208,255,0,0.3)]' : 'bg-white/5 text-text-muted border border-border'}`}>
                  {i + 1}
                </div>
                <span className="text-[10px] text-text-muted hidden sm:block">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-white/5 rounded-full h-1">
            <div className="bg-accent h-1 rounded-full transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-surface/40 border border-border rounded-2xl p-8 backdrop-blur-sm min-h-[400px]">
          {/* Step 0: Identity */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Give your AI an identity</h2>
              <p className="text-text-muted">Choose a name, avatar, and short description for your AI assistant.</p>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent transition shrink-0">
                  <Bot className="w-10 h-10 text-text-muted" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">AI Name</label>
                    <input type="text" placeholder="e.g., Physics Guru" className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Short Description</label>
                    <textarea rows={3} placeholder="Describe what this AI does in 1-2 sentences..." className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Welcome Experience</h2>
              <p className="text-text-muted">Design the first impression users get when they start a conversation.</p>
              <div>
                <label className="block text-sm font-bold text-white mb-2">First Message</label>
                <textarea rows={4} placeholder="Hi! I'm your Physics tutor. Ask me anything about mechanics, thermodynamics, or quantum physics!" className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-2">Starter Questions (one per line)</label>
                <textarea rows={4} placeholder="Explain Newton's laws&#10;What is quantum entanglement?&#10;Help me solve a momentum problem" className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none" />
              </div>
            </div>
          )}

          {/* Step 2: Personality */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Personality & Tone</h2>
              <p className="text-text-muted">Choose how your AI communicates.</p>
              <div>
                <label className="block text-sm font-bold text-white mb-3">Personality</label>
                <div className="flex flex-wrap gap-2">
                  {PERSONALITIES.map(p => (
                    <button key={p} onClick={() => setSelectedPersonality(p)} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${selectedPersonality === p ? 'bg-accent text-black shadow-[0_0_12px_rgba(208,255,0,0.2)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-white mb-3">Tone</label>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => (
                    <button key={t} onClick={() => setSelectedTone(t)} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${selectedTone === t ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Focus Areas */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Expertise & Focus Areas</h2>
              <p className="text-text-muted">Select the domains your AI specializes in. You can pick multiple.</p>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREAS.map(area => (
                  <button key={area} onClick={() => toggleFocus(area)} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${selectedFocus.includes(area) ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-white hover:bg-white/10 border border-border'}`}>
                    {area}
                  </button>
                ))}
              </div>
              {selectedFocus.length > 0 && <p className="text-xs text-emerald-400 font-bold">{selectedFocus.length} areas selected</p>}
            </div>
          )}

          {/* Step 4: Instructions */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">System Instructions</h2>
              <p className="text-text-muted">Define the rules, behaviors, and constraints for your AI. This is the most important step.</p>
              <textarea rows={12} placeholder="You are a physics tutor who explains concepts using real-world analogies. Always break down complex topics into simple steps. Use humor when appropriate. Never give direct answers to homework — guide students to find the answer themselves." className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition resize-none font-mono text-sm" />
            </div>
          )}

          {/* Step 5: Knowledge */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Knowledge Sources</h2>
              <p className="text-text-muted">Attach documents, research papers, or notes to make your AI smarter.</p>
              <div className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:bg-white/5 transition cursor-pointer">
                <Paperclip className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-sm font-bold text-white mb-1">Drag files here or click to browse</p>
                <p className="text-xs text-text-muted">PDF, DOCX, TXT, MD — up to 10MB each</p>
              </div>
              <div className="bg-white/5 border border-border rounded-xl p-4">
                <h4 className="text-sm font-bold text-white mb-2">Or link BeastBuck content</h4>
                <div className="flex flex-wrap gap-2">
                  {['Knowledge Articles', 'Research Papers', 'Workspace Notes', 'Course Materials'].map(s => (
                    <button key={s} className="bg-surface border border-border px-3 py-2 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition">{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Preview */}
          {step === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Preview Your AI</h2>
              <p className="text-text-muted">Test a live conversation before publishing.</p>
              <div className="bg-black/30 border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center gap-3 bg-surface/50">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-xl">⚛️</div>
                  <div><h4 className="font-bold text-white text-sm">Physics Guru</h4><p className="text-[10px] text-emerald-400">Online</p></div>
                </div>
                <div className="p-6 space-y-4 min-h-[200px]">
                  <div className="flex justify-start"><div className="bg-white/10 rounded-xl rounded-tl-none p-4 text-sm text-white max-w-[80%]">Hi! I'm your Physics tutor. Ask me anything about mechanics, thermodynamics, or quantum physics! 🔬</div></div>
                </div>
                <div className="p-4 border-t border-border/50 bg-surface/50">
                  <input type="text" placeholder="Test a question..." className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Publish */}
          {step === 7 && (
            <div className="space-y-6 text-center py-8">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(208,255,0,0.15)]">
                <Rocket className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-white">Ready to Launch!</h2>
              <p className="text-text-muted max-w-md mx-auto">Choose who can discover and chat with your AI.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                {[
                  { label: 'Public', desc: 'Anyone on BeastBuck', active: true },
                  { label: 'Members Only', desc: 'Approved members', active: false },
                  { label: 'Private', desc: 'Only you', active: false },
                ].map((v, i) => (
                  <button key={i} className={`flex-1 rounded-xl border p-4 text-left transition ${v.active ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(208,255,0,0.1)]' : 'border-border bg-white/5 hover:bg-white/10'}`}>
                    <h4 className={`font-bold text-sm ${v.active ? 'text-accent' : 'text-white'}`}>{v.label}</h4>
                    <p className="text-[10px] text-text-muted mt-1">{v.desc}</p>
                  </button>
                ))}
              </div>
              <button className="mt-4 bg-accent text-black font-bold px-10 py-3 rounded-xl hover:bg-accent/80 transition shadow-[0_0_20px_rgba(208,255,0,0.2)] text-lg">
                🚀 Publish AI
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white bg-white/10 hover:bg-white/20 transition disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-black bg-accent hover:bg-accent/80 transition">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
