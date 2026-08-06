import { useState } from 'react';
import { Bot, CheckCircle, AlertTriangle, FileText, RefreshCw, Upload } from 'lucide-react';
import { PageContainer } from '../../components/layout/LayoutWrappers';
import { PageHeader } from '../../components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function AIResearchReviewer() {
  const [reviewing, setReviewing] = useState(false);
  const [reviewResults, setReviewResults] = useState(null);

  const handleReview = () => {
    setReviewing(true);
    setTimeout(() => {
      setReviewResults({
        overallScore: 85,
        checks: [
          { category: 'Grammar', status: 'pass', message: 'No grammar errors found' },
          { category: 'Structure', status: 'pass', message: 'Well-structured document' },
          { category: 'Scientific Quality', status: 'pass', message: 'Sound methodology' },
          { category: 'Duplicate Content', status: 'warning', message: 'Some similar content detected' },
          { category: 'References', status: 'pass', message: 'Properly cited references' },
          { category: 'Bias', status: 'pass', message: 'No significant bias detected' },
          { category: 'Missing Sections', status: 'warning', message: 'Consider adding limitations section' },
          { category: 'Formatting', status: 'pass', message: 'Proper formatting applied' },
        ],
        suggestions: [
          'Add a limitations section to strengthen your research',
          'Consider including more recent references',
          'Expand the methodology section for better reproducibility',
        ],
      });
      setReviewing(false);
    }, 2000);
  };

  const getStatusIcon = (status) => {
    if (status === 'pass') return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  const getStatusColor = (status) => {
    if (status === 'pass') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (status === 'warning') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <PageContainer>
      <PageHeader 
        title="AI Research Reviewer" 
        description="Pre-publish AI checks for grammar, structure, and quality."
        hero={true}
        action={
          <Button onClick={handleReview} disabled={reviewing} className="bg-purple-600 hover:bg-purple-700">
            <Upload className="h-4 w-4 mr-2" />
            {reviewing ? 'Reviewing...' : 'Upload for Review'}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              <span className="text-2xl font-bold text-white">Grammar</span>
            </div>
            <p className="text-text-muted text-sm">Check spelling and grammar</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-purple-400" />
              <span className="text-2xl font-bold text-white">Structure</span>
            </div>
            <p className="text-text-muted text-sm">Analyze document structure</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bot className="h-6 w-6 text-amber-400" />
              <span className="text-2xl font-bold text-white">Quality</span>
            </div>
            <p className="text-text-muted text-sm">Assess scientific quality</p>
          </CardContent>
        </Card>
      </div>

      {reviewResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review Results</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-accent">{reviewResults.overallScore}</span>
                <span className="text-text-muted">/ 100</span>
                <Button onClick={handleReview} size="sm" variant="secondary">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Re-Review
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 mb-6">
              {reviewResults.checks.map((check, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${getStatusColor(check.status)}`}>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <span className="font-bold text-white">{check.category}</span>
                  </div>
                  <span className="text-text-soft text-sm">{check.message}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <h3 className="font-bold text-accent mb-3">Suggestions</h3>
              <ul className="space-y-2">
                {reviewResults.suggestions.map((suggestion, index) => (
                  <li key={index} className="text-text-soft text-sm flex items-start gap-2">
                    <span className="text-accent">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
