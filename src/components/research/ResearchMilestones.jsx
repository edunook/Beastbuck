import { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Circle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../features/auth/AuthContext';

const MILESTONES = [
  { id: 'cite-3', label: 'Cite 3 Papers', xp: 50, description: 'Reference at least 3 research papers' },
  { id: 'cite-5', label: 'Cite 5 Papers', xp: 100, description: 'Reference at least 5 research papers' },
  { id: 'save-10', label: 'Save 10 Papers', xp: 75, description: 'Save 10 papers to your notebook' },
  { id: 'write-abstract', label: 'Write Abstract', xp: 30, description: 'Complete a paper abstract' },
  { id: 'peer-review', label: 'Complete Peer Review', xp: 40, description: 'Review 3 peer papers' },
  { id: 'publish', label: 'Publish Research', xp: 200, description: 'Publish your first research paper' },
];

export function ResearchMilestones() {
  const { user } = useAuth();
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    // In production, fetch from Firestore
    const mockCompleted = ['cite-3', 'save-10'];
    setCompletedMilestones(mockCompleted);
    const xp = mockCompleted.reduce((sum, id) => {
      const milestone = MILESTONES.find(m => m.id === id);
      return sum + (milestone?.xp || 0);
    }, 0);
    setTotalXP(xp);
  }, [user?.uid]);

  const isCompleted = (milestoneId) => completedMilestones.includes(milestoneId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Research Milestones
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Total XP Earned</span>
          <span className="font-bold text-accent">{totalXP} XP</span>
        </div>
        <div className="space-y-2">
          {MILESTONES.map(milestone => (
            <div
              key={milestone.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                isCompleted(milestone.id)
                  ? 'border-green-500/40 bg-green-500/10'
                  : 'border-border bg-white/[0.03]'
              }`}
            >
              <div className="mt-0.5">
                {isCompleted(milestone.id) ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <Circle className="h-5 w-5 text-text-muted" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-bold ${isCompleted(milestone.id) ? 'text-green-400' : 'text-white'}`}>
                    {milestone.label}
                  </h4>
                  <span className="text-xs font-bold text-accent">+{milestone.xp} XP</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
