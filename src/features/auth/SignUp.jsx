import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../../services/firebase/auth';
import { assignFirstCEO } from '../../services/firebase/executive';
import { Sparkles, Lock, User, ArrowRight, Eye, EyeOff, Zap, Phone, CheckCircle, XCircle, Shield } from 'lucide-react';

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

  // Debounced username check
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
        if (!isAvailable) {
          setUsernameError('Username is already taken');
        } else {
          setUsernameError(null);
        }
      } catch (err) {
        console.error("Error checking username:", err);
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
      
      // Attempt to assign CEO role if this is the first user
      if (userCredential?.user?.uid) {
        const userData = {
          username,
          displayName: username,
          email: userCredential.user.email || phoneNumber,
          phoneNumber,
          createdAt: new Date(),
        };
        
        await assignFirstCEO(userCredential.user.uid, userData);
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[200px]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Glass Card */}
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent via-purple-500 to-cyan-500 rounded-3xl blur opacity-20 animate-gradient-rotate" />
          
          <div className="relative">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-accent blur-xl opacity-50 animate-pulse" />
                <img src="/logo.png" alt="BeastBuck" className="relative h-16 w-auto" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                Create Account
              </h1>
              <p className="text-text-soft text-lg">
                Join the BeastBuck community
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Username Input */}
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${focusedField === 'username' ? 'from-accent/20 to-purple-500/20' : 'from-white/5 to-white/5'} rounded-2xl blur transition-all duration-300`} />
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-white/20">
                  <div className="pl-4 pr-3">
                    <User className={`w-5 h-5 transition-colors ${focusedField === 'username' ? 'text-accent' : 'text-text-muted'}`} />
                  </div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="username"
                    className="flex-1 bg-transparent text-white placeholder:text-text-muted py-4 pr-4 outline-none"
                  />
                  {username && !checkingUsername && (
                    <div className="px-3">
                      {usernameError ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  )}
                </div>
                {username && (
                  <div className={`mt-2 text-xs ml-4 flex items-center gap-2 ${usernameError ? 'text-red-400' : 'text-green-400'}`}>
                    {checkingUsername ? (
                      <>
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Checking availability...</span>
                      </>
                    ) : (
                      <span>{usernameError || 'Username is available!'}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Phone Input */}
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${focusedField === 'phone' ? 'from-accent/20 to-purple-500/20' : 'from-white/5 to-white/5'} rounded-2xl blur transition-all duration-300`} />
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-white/20">
                  <div className="pl-4 pr-3">
                    <Phone className={`w-5 h-5 transition-colors ${focusedField === 'phone' ? 'text-accent' : 'text-text-muted'}`} />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="tel"
                    className="flex-1 bg-transparent text-white placeholder:text-text-muted py-4 pr-4 outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${focusedField === 'password' ? 'from-accent/20 to-purple-500/20' : 'from-white/5 to-white/5'} rounded-2xl blur transition-all duration-300`} />
                <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-white/20">
                  <div className="pl-4 pr-3">
                    <Lock className={`w-5 h-5 transition-colors ${focusedField === 'password' ? 'text-accent' : 'text-text-muted'}`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="new-password"
                    className="flex-1 bg-transparent text-white placeholder:text-text-muted py-4 pr-4 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-4 text-text-muted hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !!usernameError || checkingUsername}
                className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-accent via-purple-500 to-cyan-500 text-white font-black text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-accent via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30" />
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Identity...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-text-soft">
                Already have an account?{' '}
                <Link 
                  to="/signin" 
                  className="text-accent hover:text-cyan-400 font-semibold transition-colors hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Sparkles, label: 'AI-Powered' },
                { icon: Zap, label: 'Fast & Secure' },
                { icon: Shield, label: 'Protected' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-xs text-text-muted">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        @keyframes gradient-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float { animation: float linear infinite; }
        .animate-gradient-rotate { animation: gradient-rotate 3s linear infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
