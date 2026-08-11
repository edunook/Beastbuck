import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '@services/auth/auth';
import { Lock, User, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout, { AuthField } from './AuthLayout';
import Button from '@frontend/components/ui/Button';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.signIn(username, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid username or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Account not found. Please check your username or create an account.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a few minutes before trying again.');
      } else if (err.message?.includes('Too many failed login attempts')) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your workspace">
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-status-danger/10 border border-status-danger/25 text-status-danger text-sm animate-auth-shake"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-5">
        <AuthField
          icon={User}
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
          onFocus={() => setFocusedField('username')}
          onBlur={() => setFocusedField(null)}
          focused={focusedField === 'username'}
          required
          autoComplete="username"
          error={error && !username}
        />

        <AuthField
          icon={Lock}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          focused={focusedField === 'password'}
          required
          autoComplete="current-password"
          error={error && !password}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-accent font-medium hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            ripple
            className="w-full !rounded-2xl !py-4 !text-base !font-black !shadow-[0_4px_24px_rgba(0,240,255,0.25)] hover:!shadow-[0_8px_32px_rgba(0,240,255,0.35)]"
          >
            {!loading && (
              <>
                Sign In
                <ArrowRight className="w-5 h-5" />
              </>
            )}
            {loading && 'Signing in...'}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-border/60 text-center">
        <p className="text-sm text-text-soft">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-accent font-semibold hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
          >
            Create one free
          </Link>
        </p>
      </div>

      {/* Mobile trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 lg:hidden">
        {['Encrypted', 'Secure', 'Fast'].map((badge) => (
          <span key={badge} className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
            {badge}
          </span>
        ))}
      </div>
    </AuthLayout>
  );
}
