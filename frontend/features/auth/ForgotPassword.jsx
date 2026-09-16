import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import AuthLayout, { AuthField } from './AuthLayout';
import Button from '@frontend/components/ui/Button';

export default function ForgotPassword() {
  const [step, setStep] = useState('verify'); // 'verify' | 'reset'
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await AuthService.verifyRecoveryCredentials(username, phoneNumber);
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Unable to verify your account with the provided details.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify and try again.');
      return;
    }

    setLoading(true);

    try {
      await AuthService.resetPasswordWithRecovery(username, phoneNumber, password);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToSignIn = () => {
    navigate('/signin', {
      state: {
        username: username.toLowerCase().trim(),
        message: 'Your password has been changed successfully. Please sign in with your new password.',
      },
    });
  };

  if (submitted) {
    return (
      <AuthLayout title="Password Reset Complete" subtitle="Your account credentials have been updated">
        <div className="text-center py-2">
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-status-success/30 bg-status-success/10 shadow-[0_0_30px_rgba(0,255,136,0.2)] animate-pulse">
            <CheckCircle className="h-10 w-10 text-status-success" />
          </div>

          <div className="mb-6 space-y-2">
            <h3 className="text-lg font-bold text-text">Success! Password Changed</h3>
            <p className="text-sm leading-relaxed text-text-soft">
              The password for account <span className="font-semibold text-accent">@{username}</span> has been successfully changed and is active immediately.
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleGoToSignIn}
              ripple
              className="w-full !rounded-2xl !py-4 !text-base !font-black !shadow-[0_4px_24px_rgba(0,240,255,0.25)] hover:!shadow-[0_8px_32px_rgba(0,240,255,0.35)]"
            >
              Sign In With New Password
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={step === 'verify' ? 'Forgot password?' : 'Create new password'}
      subtitle={
        step === 'verify'
          ? 'Enter your username and registered phone number to verify your identity'
          : 'Identity verified. Choose a strong new password for your account'
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
            label="Registered Phone Number"
            type="tel"
            placeholder="e.g. +1234567890 or digits"
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
              className="w-full !rounded-2xl !py-4 !text-base !font-black !shadow-[0_4px_24px_rgba(0,240,255,0.25)] hover:!shadow-[0_8px_32px_rgba(0,240,255,0.35)]"
            >
              {!loading && (
                <>
                  Verify Identity
                  <ArrowRight className="h-5 w-5 ml-1" />
                </>
              )}
              {loading && 'Verifying credentials...'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-5">
          {/* Identity verified pill badge */}
          <div className="flex items-center gap-2.5 rounded-xl border border-status-success/30 bg-status-success/10 px-3.5 py-2 text-xs font-medium text-status-success">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              Verified account: <strong className="font-semibold text-white">@{username}</strong>
            </span>
          </div>

          <AuthField
            icon={KeyRound}
            label="New password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter a new password (min. 6 characters)"
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
            label="Confirm new password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onFocus={() => setFocusedField('confirm')}
            onBlur={() => setFocusedField(null)}
            focused={focusedField === 'confirm'}
            required
            autoComplete="new-password"
            error={Boolean(confirmPassword && password && password !== confirmPassword)}
            trailing={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />

          {password && (
            <div className="text-xs text-text-muted">
              {password.length < 6 ? (
                <span className="text-status-warning">Password must be at least 6 characters</span>
              ) : confirmPassword && password === confirmPassword ? (
                <span className="text-status-success">Passwords match</span>
              ) : confirmPassword && password !== confirmPassword ? (
                <span className="text-status-danger">Passwords do not match</span>
              ) : (
                <span className="text-status-success">Password length is good</span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
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
                  Change Password
                  <ArrowRight className="h-5 w-5 ml-1" />
                </>
              )}
              {loading && 'Updating password...'}
            </Button>

            <button
              type="button"
              onClick={() => {
                setStep('verify');
                setPassword('');
                setConfirmPassword('');
                setError(null);
              }}
              className="inline-flex items-center justify-center gap-2 py-2 text-sm text-text-muted transition-colors hover:text-text"
            >
              <ArrowLeft className="h-4 w-4" />
              Change username or phone number
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

