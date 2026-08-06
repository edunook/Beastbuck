import { useState } from 'react';
import { FileText, AlertCircle, ShieldAlert, ChevronRight, X, Send } from 'lucide-react';
import { cn } from '../../lib/utils';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const INITIAL_CASES = [
  { id: 'CAS-092', title: 'Bounty Distribution Dispute', status: 'Under Review', type: 'Financial', date: 'Oct 24, 2026', description: 'Dispute over bounty allocation for completed task.' },
  { id: 'CAS-104', title: 'Code of Conduct Violation', status: 'Awaiting Response', type: 'Behavioral', date: 'Oct 26, 2026', description: 'Reported inappropriate behavior in community chat.' }
];

export default function ConflictResolution() {
  const [cases, setCases] = useState(INITIAL_CASES);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [newCase, setNewCase] = useState({ title: '', type: 'Behavioral', description: '' });
  const [messages, setMessages] = useState({});

  const createCase = () => {
    if (!newCase.title || !newCase.description) return;
    const caseId = `CAS-${Date.now().toString().slice(-3)}`;
    const newCaseData = {
      id: caseId,
      title: newCase.title,
      type: newCase.type,
      description: newCase.description,
      status: 'Submitted',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setCases([newCaseData, ...cases]);
    setMessages({ ...messages, [caseId]: [] });
    setNewCase({ title: '', type: 'Behavioral', description: '' });
    setShowCreateForm(false);
  };

  const addMessage = (caseId, content) => {
    if (!content.trim()) return;
    const message = {
      id: `msg-${Date.now()}`,
      content,
      author: 'You',
      timestamp: new Date().toISOString()
    };
    setMessages({
      ...messages,
      [caseId]: [...(messages[caseId] || []), message]
    });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Conflict Resolution" 
        description="A fair, transparent, and neutral ground for mediating disputes within the BeastBuck community."
        action={
          <Button onClick={() => setShowCreateForm(true)}>
            <AlertCircle className="mr-2 h-4 w-4" />
            Open a Case
          </Button>
        }
      />

      {/* Create Case Modal */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Open New Case</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Case Title</label>
              <Input 
                value={newCase.title}
                onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                placeholder="Brief title of the dispute"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Case Type</label>
              <select 
                value={newCase.type}
                onChange={(e) => setNewCase({ ...newCase, type: e.target.value })}
                className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Behavioral">Behavioral</option>
                <option value="Financial">Financial</option>
                <option value="Content">Content</option>
                <option value="Technical">Technical</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">Description</label>
              <textarea
                value={newCase.description}
                onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createCase}>Submit Case</Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-white">My Active Cases</h2>
          
          {cases.length > 0 ? (
            <div className="space-y-4">
              {cases.map((c) => (
                <Card key={c.id} className="border-border">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer" onClick={() => setSelectedCase(selectedCase === c.id ? null : c.id)}>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/5 rounded-lg text-text-muted">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-text-muted">{c.id}</span>
                            <span className="w-1 h-1 bg-border rounded-full"></span>
                            <span className="text-xs text-text-muted">{c.date}</span>
                          </div>
                          <h3 className="font-medium text-white">{c.title}</h3>
                          <p className="text-sm text-text-muted mt-1">{c.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-xs text-text-muted mb-1">{c.type}</span>
                          <span className={cn(
                            "text-xs font-medium px-2.5 py-1 rounded-md",
                            c.status === 'Under Review' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : 
                            c.status === 'Awaiting Response' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                            c.status === 'Resolved' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            "bg-white/10 text-text-muted border border-border"
                          )}>
                            {c.status}
                          </span>
                        </div>
                        <ChevronRight size={20} className={cn("text-text-muted transition-transform", selectedCase === c.id ? "rotate-90" : "")} />
                      </div>
                    </div>

                    {/* Case Details & Messages */}
                    {selectedCase === c.id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-white mb-2">Discussion</h4>
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                            {(messages[c.id] || []).map(msg => (
                              <div key={msg.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
                                  {msg.author.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-bold text-white">{msg.author}</span>
                                    <span className="text-xs text-text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-sm text-text-soft">{msg.content}</p>
                                </div>
                              </div>
                            ))}
                            {(messages[c.id] || []).length === 0 && (
                              <p className="text-sm text-text-muted text-center py-4">No messages yet. Start the discussion.</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Type your message..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addMessage(c.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button size="sm" onClick={(e) => {
                            const input = e.target.parentElement.querySelector('input');
                            if (input?.value) {
                              addMessage(c.id, input.value);
                              input.value = '';
                            }
                          }}>
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-text-muted mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No active cases</h3>
                <p className="text-text-muted text-sm">You don't have any open disputes at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Policy & Guidelines</h2>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-text-muted">
                Before opening a case, please review our community guidelines to understand the mediation process.
              </p>
              
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors">
                    <FileText size={16} /> Code of Conduct
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors">
                    <FileText size={16} /> Mediation Process
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors">
                    <FileText size={16} /> Financial Dispute Rules
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Case Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Total Cases</span>
                <span className="text-sm font-bold text-white">{cases.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Under Review</span>
                <span className="text-sm font-bold text-amber-400">{cases.filter(c => c.status === 'Under Review').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-text-muted">Resolved</span>
                <span className="text-sm font-bold text-emerald-400">{cases.filter(c => c.status === 'Resolved').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
