import { useState } from 'react';
import { Brain, Sparkles, TrendingUp, AlertTriangle, Target, BarChart3, Loader2, Shield } from 'lucide-react';
import { IntelligencePanel } from './missionControlUtils';
import { AIService } from '@services/ai/aiService';
import { OrganizationService } from '@services/firestore/organization';
import Button from '@frontend/components/ui/Button';
import AIResponse from '@frontend/components/ai/AIResponse';
import '@frontend/components/ai/AIResponse.css';

const CONFIDENCE_COLORS = {
  HIGH:   { bar: 'bg-status-success', text: 'text-status-success', label: 'High Confidence' },
  MEDIUM: { bar: 'bg-status-warning', text: 'text-status-warning', label: 'Medium Confidence' },
  LOW:    { bar: 'bg-status-danger',  text: 'text-status-danger',  label: 'Low Confidence' },
};

function ConfidencePill({ level = 'MEDIUM' }) {
  const cfg = CONFIDENCE_COLORS[level] || CONFIDENCE_COLORS.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.bar}`} />
      {cfg.label}
    </span>
  );
}

export default function AIInsights() {
  const [phase, setPhase] = useState('idle'); // idle | loading | done | error
  const [insights, setInsights] = useState(null);
  const [rawSummary, setRawSummary] = useState('');

  const generateInsights = async () => {
    setPhase('loading');
    setInsights(null);
    setRawSummary('');
    try {
      const org = await OrganizationService.getOrganization();

      const contextPrompt = `
You are BeastBuck's executive AI analyst. Analyze the following organizational data and provide a JSON response only.

Organizational Snapshot:
- Divisions: ${org.divisions?.length || 0}
- Departments: ${org.departments?.length || 0}
- Labs: ${org.labs?.length || 0}
- Teams: ${org.teams?.length || 0}
- Active Announcements: ${org.announcements?.filter(a => !a.archived)?.length || 0}
- Active Projects: ${org.projects?.filter(p => p.status === 'ACTIVE')?.length || 0}

Respond ONLY with a JSON object in this exact structure, no markdown, no extra text:
{
  "executiveSummary": "2-3 sentence executive summary",
  "risks": [
    { "title": "Risk title", "body": "Risk description", "confidence": "HIGH" }
  ],
  "opportunities": [
    { "title": "Opportunity title", "body": "Description", "confidence": "MEDIUM" }
  ],
  "recommendations": [
    { "title": "Action title", "body": "What to do", "confidence": "HIGH" }
  ],
  "growthPrediction": "Short paragraph about predicted growth trajectory"
}
      `.trim();

      const rawResponse = await AIService.chat({
        providerId: 'gemini',
        mode: 'general',
        messages: [{ role: 'user', content: contextPrompt }],
      });

      // Try to parse JSON from response
      let parsed = null;
      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (parseErr) {
        console.warn('[AIInsights] Failed to parse structured response, using raw.', parseErr);
      }

      if (parsed) {
        setInsights(parsed);
      } else {
        setRawSummary(rawResponse);
      }

      setPhase('done');
    } catch (err) {
      console.error('[AIInsights] Error:', err);
      setPhase('error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-white">AI Executive Insights</h2>
            <p className="text-xs text-text-muted">Real-time AI analysis of organizational health, risks, and opportunities.</p>
          </div>
        </div>
        <Button
          onClick={generateInsights}
          disabled={phase === 'loading'}
          className="shrink-0"
        >
          {phase === 'loading' ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
          ) : (
            <><Sparkles className="mr-2 h-4 w-4" /> {phase === 'done' ? 'Regenerate' : 'Generate Insights'}</>
          )}
        </Button>
      </div>

      {/* Permission notice */}
      <div className="flex items-center gap-2 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3 text-xs text-text-soft">
        <Shield className="h-4 w-4 text-accent shrink-0" />
        These insights are visible only to users with Mission Control access. AI responses are permission-aware.
      </div>

      {/* Loading state */}
      {phase === 'loading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 animate-pulse rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
            <Sparkles className="h-8 w-8 animate-spin" />
          </div>
          <p className="font-bold text-accent animate-pulse">Analyzing organizational data…</p>
          <p className="mt-2 text-xs text-text-muted">Querying AI across members, projects, and structure</p>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="rounded-2xl border border-status-danger/30 bg-status-danger/10 p-6 text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-status-danger" />
          <p className="font-bold text-status-danger">AI analysis failed.</p>
          <p className="mt-1 text-sm text-text-muted">The AI provider may be unavailable. Try again or check provider configuration.</p>
          <Button variant="ghost" className="mt-4" onClick={generateInsights}>Retry</Button>
        </div>
      )}

      {/* Idle */}
      {phase === 'idle' && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <Brain className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <h3 className="text-lg font-bold text-white">No Insights Generated Yet</h3>
          <p className="mt-2 text-sm text-text-muted">Click "Generate Insights" to run an AI analysis of your organization.</p>
        </div>
      )}

      {/* Raw fallback */}
      {phase === 'done' && rawSummary && !insights && (
        <AIResponse
          content={rawSummary}
          title="AI Summary"
          variant="info"
          confidence="MEDIUM"
          showCopy={true}
        />
      )}

      {/* Structured insights */}
      {phase === 'done' && insights && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <AIResponse
            content={insights.executiveSummary}
            title="Executive Summary"
            variant="info"
            confidence="HIGH"
            showCopy={true}
          />

          {/* Risks */}
          {insights.risks?.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <AlertTriangle className="h-5 w-5 text-status-danger" />
                Identified Risks
              </h3>
              {insights.risks.map((r, i) => (
                <AIResponse
                  key={i}
                  content={r.body}
                  title={r.title}
                  variant="danger"
                  confidence={r.confidence}
                  showCopy={true}
                />
              ))}
            </div>
          )}

          {/* Opportunities */}
          {insights.opportunities?.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <TrendingUp className="h-5 w-5 text-status-success" />
                Opportunities
              </h3>
              {insights.opportunities.map((o, i) => (
                <AIResponse
                  key={i}
                  content={o.body}
                  title={o.title}
                  variant="success"
                  confidence={o.confidence}
                  showCopy={true}
                />
              ))}
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations?.length > 0 && (
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 font-bold text-white">
                <Target className="h-5 w-5 text-status-warning" />
                AI Recommendations
              </h3>
              {insights.recommendations.map((rec, i) => (
                <AIResponse
                  key={i}
                  content={rec.body}
                  title={rec.title}
                  variant="warning"
                  confidence={rec.confidence}
                  showCopy={true}
                />
              ))}
            </div>
          )}

          {/* Growth Prediction */}
          {insights.growthPrediction && (
            <AIResponse
              content={insights.growthPrediction}
              title="Growth Prediction"
              variant="info"
              confidence="MEDIUM"
              showCopy={true}
            >
              <div className="mt-4">
                <ConfidencePill level="MEDIUM" />
                <p className="mt-2 text-xs text-text-muted">Predictions are based on available organizational data and may not account for external factors.</p>
              </div>
            </AIResponse>
          )}
        </div>
      )}
    </div>
  );
}
