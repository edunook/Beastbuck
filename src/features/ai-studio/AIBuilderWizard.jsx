import { useState } from 'react';
import { Bot, Sparkles, Settings, Upload, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { uploadToPinata } from '../../services/pinata';

const MODELS = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks' },
  { id: 'gpt-3.5', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective for most tasks' },
  { id: 'claude-3', name: 'Claude 3 Opus', description: 'Excellent for analysis and writing' },
  { id: 'claude-2', name: 'Claude 2', description: 'Balanced performance and speed' },
];

const PERSONAS = [
  { id: 'professional', name: 'Professional', description: 'Formal, business-focused tone' },
  { id: 'friendly', name: 'Friendly', description: 'Casual, approachable tone' },
  { id: 'technical', name: 'Technical', description: 'Detailed, expert-level explanations' },
  { id: 'creative', name: 'Creative', description: 'Imaginative, artistic expression' },
  { id: 'educational', name: 'Educational', description: 'Teaching-focused, step-by-step' },
];

export function AIBuilderWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    model: 'gpt-4',
    persona: 'professional',
    systemPrompt: '',
    knowledgeFiles: [],
  });
  const [uploading, setUploading] = useState(false);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadToPinata(file));
      const results = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        knowledgeFiles: [...prev.knowledgeFiles, ...results],
      }));
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      knowledgeFiles: prev.knowledgeFiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    // In production, save to Firestore
    console.log('AI Agent Configuration:', formData);
    alert('AI Agent created successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Create AI Agent</h1>
        <p className="text-text-muted">Build and configure your custom AI assistant</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((stepNum) => (
          <div key={stepNum} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= stepNum
                ? 'border-accent bg-accent text-black'
                : 'border-border text-text-muted'
            }`}>
              {step > stepNum ? <Check className="h-5 w-5" /> : stepNum}
            </div>
            {stepNum < 4 && (
              <div className={`flex-1 h-0.5 mx-2 ${step > stepNum ? 'bg-accent' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 1 && <Bot className="h-5 w-5 text-accent" />}
            {step === 2 && <Sparkles className="h-5 w-5 text-accent" />}
            {step === 3 && <Settings className="h-5 w-5 text-accent" />}
            {step === 4 && <Check className="h-5 w-5 text-accent" />}
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Persona & Behavior'}
            {step === 3 && 'Knowledge Base'}
            {step === 4 && 'Review & Publish'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Agent Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., CodeWizard Pro"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your AI agent does..."
                  rows={3}
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 rounded-xl border border-border bg-white/5 px-3 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Select a category</option>
                  <option value="coding">Coding</option>
                  <option value="writing">Writing</option>
                  <option value="research">Research</option>
                  <option value="creative">Creative</option>
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">AI Model</label>
                <div className="space-y-2">
                  {MODELS.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setFormData({ ...formData, model: model.id })}
                      className={`w-full p-4 rounded-xl border text-left transition ${
                        formData.model === model.id
                          ? 'border-accent/40 bg-accent/10 text-white'
                          : 'border-border bg-white/[0.03] text-text-muted hover:border-border'
                      }`}
                    >
                      <div className="font-bold">{model.name}</div>
                      <div className="text-xs mt-1">{model.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Persona</label>
                <div className="space-y-2">
                  {PERSONAS.map(persona => (
                    <button
                      key={persona.id}
                      onClick={() => setFormData({ ...formData, persona: persona.id })}
                      className={`w-full p-4 rounded-xl border text-left transition ${
                        formData.persona === persona.id
                          ? 'border-accent/40 bg-accent/10 text-white'
                          : 'border-border bg-white/[0.03] text-text-muted hover:border-border'
                      }`}
                    >
                      <div className="font-bold">{persona.name}</div>
                      <div className="text-xs mt-1">{persona.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">System Prompt</label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="Define the AI's behavior and instructions..."
                  rows={6}
                  className="w-full rounded-xl border border-border bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white">Knowledge Base Files</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-accent hover:underline">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Upload Files (PDF, TXT, DOC)'}
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    multiple
                    accept=".pdf,.txt,.doc,.docx"
                  />
                </label>
                {formData.knowledgeFiles.length > 0 && (
                  <div className="space-y-2">
                    {formData.knowledgeFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border bg-white/[0.03]">
                        <span className="text-sm text-white truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-text-muted hover:text-status-danger"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-white/[0.03]">
                <h3 className="font-bold text-white mb-2">{formData.name || 'Untitled Agent'}</h3>
                <p className="text-sm text-text-soft">{formData.description || 'No description'}</p>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Category:</span>
                  <span className="text-white">{formData.category || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Model:</span>
                  <span className="text-white">{MODELS.find(m => m.id === formData.model)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Persona:</span>
                  <span className="text-white">{PERSONAS.find(p => p.id === formData.persona)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Knowledge Files:</span>
                  <span className="text-white">{formData.knowledgeFiles.length} files</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 4 ? (
              <Button onClick={handleNext} disabled={step === 1 && !formData.name}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Check className="mr-2 h-4 w-4" />
                Publish Agent
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
