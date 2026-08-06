import { useAuth } from '../features/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowRight } from 'lucide-react';

export default function MobileDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d1117] text-white">
      <div className="max-w-sm rounded-3xl border-4 border-gray-800 bg-surface p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
          <Smartphone className="h-8 w-8 text-accent" />
        </div>
        <h2 className="text-2xl font-bold">BeastBuck Mobile</h2>
        <p className="mt-4 text-text-muted">Access the BeastBuck ecosystem from your mobile device.</p>
        <div className="mt-6 space-y-3">
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-bold text-background transition hover:bg-cyan-300"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 font-bold text-background transition hover:bg-cyan-300"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="mt-4 text-xs text-text-muted">
          Full mobile app coming soon with offline sync and push notifications.
        </p>
      </div>
    </div>
  );
}
