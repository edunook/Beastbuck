import { Link } from 'react-router-dom';
import { ShieldX, Home, LayoutDashboard } from 'lucide-react';
import AuthLayout from './AuthLayout';
import Button from '@frontend/components/ui/Button';

export default function AccessDenied() {
  return (
    <AuthLayout title="Access restricted" subtitle="You don't have permission to view this area">
      <div className="text-center mb-8">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-status-danger/25 bg-status-danger/10">
          <ShieldX className="h-8 w-8 text-status-danger" />
        </div>
        <p className="text-sm leading-relaxed text-text-soft">
          This sector requires elevated permissions. Contact your workspace administrator if you
          believe this is an error.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/dashboard" className="flex-1">
          <Button variant="primary" className="w-full !rounded-2xl !py-3.5">
            <LayoutDashboard className="h-5 w-5" />
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button variant="secondary" className="w-full !rounded-2xl !py-3.5">
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
