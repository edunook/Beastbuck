import { useState } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, CheckCircle, FileText } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ResearchBuilderWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    problemStatement: '',
    objectives: '',
    background: '',
    methodology: '',
    observations: '',
    results: '',
    conclusion: '',
  });

  const steps = [
    { title: 'Category', icon: '📂' },
    { title: 'Title', icon: '📝' },
    { title: 'Problem Statement', icon: '❓' },
    { title: 'Objectives', icon: '🎯' },
    { title: 'Background', icon: '📚' },
    { title: 'Methodology', icon: '🔬' },
    { title: 'Observations', icon: '👁️' },
    { title: 'Results', icon: '📊' },
    { title: 'Conclusion', icon: '✅' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePublish = () => {
    alert('Research published successfully!');
  };

  const getFieldPlaceholder = () => {
    const placeholders = {
      category: 'Select a category (e.g., Physics, Biology, Chemistry, Computer Science)',
      title: 'Enter a descriptive title for your research',
      problemStatement: 'Describe the problem your research addresses',
      objectives: 'List your research objectives',
      background: 'Provide background information and context',
      methodology: 'Describe your research methodology',
      observations: 'Record your observations',
      results: 'Present your results',
      conclusion: 'Summarize your conclusions',
    };
    return placeholders[Object.keys(formData)[currentStep]];
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Research Builder Wizard" 
        description="Create your research step by step with AI assistance!"
        hero={true}
      />

      <Card>
        <CardContent className="p-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center gap-2 shrink-0">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-lg transition-all ${
                    index === currentStep ? 'bg-accent text-black' :
                    index < currentStep ? 'bg-emerald-500 text-white' :
                    'bg-white/10 text-text-muted'
                  }`}
                >
                  {index < currentStep ? <CheckCircle className="h-5 w-5" /> : step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${index < currentStep ? 'bg-emerald-500' : 'bg-white/10'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-3xl">{steps[currentStep].icon}</span>
              {steps[currentStep].title}
            </h2>
            
            {currentStep === 0 ? (
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white focus:border-accent focus:outline-none transition-colors"
              >
                <option value="">Select Category</option>
                <option value="physics">Physics</option>
                <option value="biology">Biology</option>
                <option value="chemistry">Chemistry</option>
                <option value="computer-science">Computer Science</option>
                <option value="environmental">Environmental Science</option>
                <option value="medicine">Medicine</option>
                <option value="engineering">Engineering</option>
              </select>
            ) : (
              <textarea
                value={formData[Object.keys(formData)[currentStep]]}
                onChange={(e) => setFormData({ ...formData, [Object.keys(formData)[currentStep]]: e.target.value })}
                placeholder={getFieldPlaceholder()}
                rows={6}
                className="w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none transition-colors resize-none"
              />
            )}
          </div>

          {/* AI Assistance */}
          <div className="mb-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="font-bold text-accent">AI Assistance</span>
            </div>
            <p className="text-text-soft text-sm">
              Get AI help with writing, grammar, suggestions, and references at every step of your research.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              variant="secondary"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handlePublish} className="bg-emerald-600 hover:bg-emerald-700">
                <FileText className="h-4 w-4 mr-2" />
                Publish Research
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
