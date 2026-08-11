import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthService } from '@services/auth/auth';
import {
  User,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import AuthLayout, { AuthField } from './AuthLayout';
import Button from '@frontend/components/ui/Button';

export default function ForgotPassword() {
  const [step, setStep] = useState('verify');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.verifyRecoveryCredentials(username, phoneNumber);
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Unable to verify your account.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await AuthService.submitPasswordResetRequest(username, phoneNumber, password);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit reset request.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Request received" subtitle="Your password reset is being processed">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-status-success/25 bg-status-success/10">
            <CheckCircle className="h-8 w-8 text-status-success" />
          </div>
          <p className="mb-8 text-sm leading-relaxed text-text-soft">
            We verified your identity for <span className="font-semibold text-text">{username}</span>.
            Your new password will be applied shortly once the request is processed.
          </p>
          <Link to="/signin">
            <Button variant="primary" className="w-full !rounded-2xl !py-4">
              Return to Sign In
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={step === 'verify' ? 'Forgot password?' : 'Set new password'}
      subtitle={
        step === 'verify'
          ? 'Verify your username and phone number to continue'
          : 'Choose a new password for your account'
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-status-danger/25 bg-status-danger/10 p-4 text-sm text-status-danger animate-auth-shake"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'verify' ? (
        <form onSubmit={handleVerify} className="space-y-5">
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
          />

          <AuthField
            icon={Phone}
            label="Phone number"
            type="tel"
            placeholder="Enter your registered phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === 'phone'}
            required
            autoComplete="tel"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              ripple
              className="w-full !rounded-2xl !py-4 !text-base !font-black"
            >
              {!loading && (
                <>
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
              {loading && 'Verifying...'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          <AuthField
            icon={Lock}
            label="New password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter a new password"
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
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />

          <AuthField
            icon={Lock}
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusedField('confirm')}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === 'confirm'}
            required
            autoComplete="new-password"
            error={confirmPassword && password !== confirmPassword}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              ripple
              className="w-full !rounded-2xl !py-4 !text-base !font-black"
            >
              {!loading && (
                <>
                  Submit Reset Request
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
              {loading && 'Submitting...'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep('verify');
                setPassword('');
                setConfirmPassword('');
                setError(null);
              }}
              className="inline-flex items-center justify-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to verification
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 border-t border-border/60 pt-6 text-center">
        <p className="text-sm text-text-soft">
          Remember your password?{' '}
          <Link
            to="/signin"
            className="font-semibold text-accent underline-offset-4 transition-colors hover:text-cyan-300 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
