import { useState } from 'react';
import { Bot, Sparkles, FileText } from 'lucide-react';
import Button from '@frontend/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import AIResponse from '@frontend/components/ai/AIResponse';
import '@frontend/components/ai/AIResponse.css';

export function AIResearchAssistant({ paperText, onCitationGenerated }) {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!query.trim()) return;
    setLoading(true);
    
    // Simulate AI response - in production, call AI API
    setTimeout(() => {
      const responses = {
        summary: `Based on the paper, here's a summary:\n\n${paperText.substring(0, 200)}...`,
        citation: `APA Citation: Author, A. A. (Year). Title. Journal Name, Volume(Issue), pages.\n\nMLA Citation: Author. "Title." Journal Name, vol. X, no. Y, Year, pp. pages.\n\nChicago Citation: Author. "Title." Journal Name Volume, no. Issue (Year): pages.`,
        analysis: `The paper presents significant findings in the field. Key contributions include:\n\n1. Novel methodology\n2. Comprehensive data analysis\n3. Practical applications`,
      };
      
      const selectedResponse = responses[query.toLowerCase().includes('citation') ? 'citation' : query.toLowerCase().includes('summary') ? 'summary' : 'analysis'];
      setResponse(selectedResponse);
      setLoading(false);
    }, 1500);
  };

  const handleCitationFormat = (format) => {
    const citations = {
      apa: `${paperText.split(' ')[0] || 'Author'} (${new Date().getFullYear()}). Title. Journal, 1(1), 1-10.`,
      mla: `${paperText.split(' ')[0] || 'Author'}. "Title." Journal, vol. 1, no. 1, ${new Date().getFullYear()}, pp. 1-10.`,
      chicago: `${paperText.split(' ')[0] || 'Author'}. "Title." Journal 1, no. 1 (${new Date().getFullYear()}): 1-10.`,
    };
    setResponse(citations[format]);
    if (onCitationGenerated) onCitationGenerated(citations[format]);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-accent" />
          AI Research Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => handleCitationFormat('apa')}>
              APA Citation
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleCitationFormat('mla')}>
              MLA Citation
            </Button>
            <Button size="sm" variant="secondary" onClick={() => handleCitationFormat('chicago')}>
              Chicago Citation
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setQuery('Generate summary'); handleQuery(); }}>
              <Sparkles className="mr-1 h-3 w-3" />
              Summarize
            </Button>
          </div>
        </div>

        {/* Query Input */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Ask AI</p>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about the paper..."
              className="flex-1 rounded-lg border border-border bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-accent"
              onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
            />
            <Button size="sm" onClick={handleQuery} disabled={loading}>
              {loading ? '...' : 'Ask'}
            </Button>
          </div>
        </div>

        {/* Response */}
        {response && (
          <AIResponse
            content={response}
            title="AI Response"
            variant="info"
            confidence="HIGH"
            showCopy={true}
          />
        )}

        {/* Loading State */}
        {loading && (
          <AIResponse
            loading={true}
            title="AI is analyzing..."
          />
        )}
      </CardContent>
    </Card>
  );
}
