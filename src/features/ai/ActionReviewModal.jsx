import { AlertTriangle, Check, X, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export default function ActionReviewModal({ action, onConfirm, onCancel }) {
  if (!action) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg border-accent/30 bg-background/95 shadow-[0_0_50px_rgba(0,240,255,0.1)]">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent">
              <AlertTriangle className="h-5 w-5" />
            </div>
            AI Action Review
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="mb-4 text-sm text-text-soft">
            The AI has requested to perform the following action on your behalf. Please review the details carefully before confirming.
          </p>

          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">Action Type</h4>
            <p className="mb-4 text-sm font-bold text-accent">{action.action}</p>

            <h4 className="mb-2 text-xs font-bold uppercase tracking-widest text-text-muted">Payload Preview</h4>
            <div className="rounded-lg bg-black/50 p-3">
              <pre className="text-xs text-text-soft whitespace-pre-wrap flex items-start gap-2">
                <Code className="h-4 w-4 text-text-muted shrink-0 mt-0.5" />
                {JSON.stringify(action, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onCancel} className="text-text-muted hover:text-white">
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={onConfirm} className="bg-accent text-black hover:bg-accent/90 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Check className="mr-2 h-4 w-4" /> Confirm & Execute
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
