import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 text-center">
        <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-accent" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-text-muted mb-4">
          The page <code className="bg-background/50 px-2 py-1 rounded text-sm">{location.pathname}</code> does not exist.
        </p>
        <p className="text-text-muted mb-8">
          Please check the URL or navigate to a different page.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-accent text-black font-medium rounded-xl hover:bg-accent/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white/5 text-text font-medium rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
