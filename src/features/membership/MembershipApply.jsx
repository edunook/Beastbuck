import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MembershipService } from '../../services/firebase/membership';
import { Sparkles, ArrowRight, CheckCircle, AlertCircle, Send } from 'lucide-react';

export default function MembershipApply() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    motivation: '',
    skills: '',
    interests: '',
    experience: '',
    portfolioLinks: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    loadExistingApplication();
  }, [user, navigate]);

  const loadExistingApplication = async () => {
    setLoading(true);
    try {
      const application = await MembershipService.getUserApplication(user.uid);
      setExistingApplication(application);
    } catch (err) {
      console.error('Error loading application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await MembershipService.submitApplication(user.uid, formData);
      setSuccess(true);
      await loadExistingApplication();
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (existingApplication?.status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-4">Membership Approved!</h1>
            <p className="text-text-soft mb-8">
              Congratulations! You are now an approved BeastBuck member. You have access to all internal features.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (existingApplication?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-yellow-400" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-4">Application Pending</h1>
            <p className="text-text-soft mb-8">
              Your membership application is under review. We'll notify you once leadership has made a decision.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-lg"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (existingApplication?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-4">Application Rejected</h1>
            <p className="text-text-soft mb-4">
              Your membership application was not approved at this time.
            </p>
            {existingApplication.reviewNotes && (
              <p className="text-text-muted mb-8 italic">
                "{existingApplication.reviewNotes}"
              </p>
            )}
            <button
              onClick={() => {
                setExistingApplication(null);
                setSuccess(false);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-purple-500 text-white font-black text-lg"
            >
              Submit New Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-accent" />
              </div>
            </div>
            <h1 className="text-3xl font-black text-white mb-4">Application Submitted!</h1>
            <p className="text-text-soft mb-8">
              Your membership application has been submitted successfully. Leadership will review it and get back to you soon.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent via-purple-500 to-cyan-500 text-white font-black text-lg"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] animate-pulse delay-1000" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-accent blur-xl opacity-50 animate-pulse" />
              <img src="/logo.png" alt="BeastBuck" className="relative h-16 w-auto" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Membership Application</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Apply for Membership
            </h1>
            <p className="text-text-soft text-lg">
              Join the BeastBuck innovation lab and unlock internal collaboration, projects, research labs, and member-only experiences.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors"
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Why do you want to join BeastBuck? *</label>
              <textarea
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                required
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                placeholder="Tell us about your motivation and what you hope to achieve..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Skills</label>
              <textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                placeholder="What skills do you have? (e.g., coding, design, science, writing...)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Interests</label>
              <textarea
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                placeholder="What are you interested in? (e.g., AI, robotics, game development, art...)"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Experience</label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                placeholder="Any relevant experience or projects you've worked on..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Portfolio Links (Optional)</label>
              <textarea
                value={formData.portfolioLinks}
                onChange={(e) => setFormData({ ...formData, portfolioLinks: e.target.value })}
                rows={2}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:border-accent/50 focus:outline-none transition-colors resize-none"
                placeholder="Links to your portfolio, GitHub, or other work..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="group relative w-full py-4 rounded-2xl bg-gradient-to-r from-accent via-purple-500 to-cyan-500 text-white font-black text-lg overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent via-purple-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Application</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-text-soft hover:text-white transition-colors"
            >
              Cancel and return to dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
