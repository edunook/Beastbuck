import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '@services/auth/auth';
import { assignFirstCEO } from '@services/firestore/executive';
import {
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Phone,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import AuthLayout, { AuthField } from './AuthLayout';
import Button from '@frontend/components/ui/Button';
import { cn } from '@shared/lib/utils';

export default function SignUp() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const validationError = AuthService.validateUsername(username);
      if (validationError) {
        setUsernameError(validationError);
        return;
      }

      setCheckingUsername(true);
      try {
        const isAvailable = await AuthService.checkUsernameAvailable(username);
        setUsernameError(isAvailable ? null : 'Username is already taken');
      } catch (err) {
        console.error('Error checking username:', err);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (username) checkUser();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (usernameError || checkingUsername) return;

    setLoading(true);
    setError(null);

    try {
      const userCredential = await AuthService.signUp(phoneNumber, password, username);

      if (userCredential?.user?.uid) {
        await assignFirstCEO(userCredential.user.uid, {
          username,
          displayName: username,
          email: userCredential.user.email || phoneNumber,
          phoneNumber,
          createdAt: new Date(),
        });
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const usernameStatus =
    username && !checkingUsername
      ? usernameError
        ? 'error'
        : 'success'
      : null;

  return (
    <AuthLayout title="Create account" subtitle="Join the BeastBuck community">
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-status-danger/10 border border-status-danger/25 text-status-danger text-sm animate-auth-shake"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-5">
        <div className="space-y-2">
          <AuthField
            icon={User}
            label="Username"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === 'username'}
            required
            autoComplete="username"
            error={!!usernameError && !!username}
            trailing={
              username && !checkingUsername ? (
                usernameError ? (
                  <XCircle className="w-5 h-5 text-status-danger" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-status-success" />
                )
              ) : checkingUsername ? (
                <div className="w-5 h-5 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
              ) : null
            }
          />
          {username && !checkingUsername && (
            <p
              className={cn(
                'text-xs pl-1 flex items-center gap-2',
                usernameStatus === 'error' ? 'text-status-danger' : 'text-status-success'
              )}
            >
              {usernameError || 'Username is available!'}
            </p>
          )}
        </div>

        <AuthField
          icon={Phone}
          label="Phone number"
          type="tel"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onFocus={() => setFocusedField('phone')}
          onBlur={() => setFocusedField(null)}
          focused={focusedField === 'phone'}
          required
          autoComplete="tel"
        />

        <AuthField
          icon={Lock}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a secure password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          focused={focusedField === 'password'}
          required
          autoComplete="new-password"
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

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            ripple
            disabled={!!usernameError || checkingUsername}
            className="w-full !rounded-2xl !py-4 !text-base !font-black !shadow-[0_4px_24px_rgba(0,240,255,0.25)] hover:!shadow-[0_8px_32px_rgba(0,240,255,0.35)]"
          >
            {!loading && (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
            {loading && 'Creating account...'}
          </Button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-border/60 text-center">
        <p className="text-sm text-text-soft">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-accent font-semibold hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

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
