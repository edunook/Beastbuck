import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  Zap,
  ShieldCheck,
  Megaphone,
  Bell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Radio,
  Plus,
  X,
  CheckCircle2,
  Clock,
  UserCheck,
  Check,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { ROLES } from '@shared/constants/roles';
import { ExecutiveNewsService } from '@services/firestore/executiveNews';

function getReadStorageKey(uid) {
  return `beastbuck_read_headlines_${uid || 'guest'}`;
}

function getStoredReadIds(uid) {
  try {
    const raw = localStorage.getItem(getReadStorageKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveStoredReadIds(uid, ids) {
  try {
    localStorage.setItem(getReadStorageKey(uid), JSON.stringify(ids));
  } catch (err) {
    console.error('Failed to save read headline IDs:', err);
  }
}

export function BeastBuckHeadlinesWidget() {
  const { user, roleData } = useAuth();
  const [news, setNews] = useState([]);
  const [readIds, setReadIds] = useState(() => getStoredReadIds(user?.uid));
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'appointments', 'announcements', 'notifications'
  const [isPaused, setIsPaused] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState(null);

  // Broadcast modal state for Main CEO / Co-CEO
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [isPinned, setIsPinned] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [broadcastError, setBroadcastError] = useState('');

  const isExecutive = useMemo(() => {
    const role = roleData?.role || user?.role;
    return role === ROLES.MAIN_CEO || role === 'Main CEO' || role === ROLES.CO_CEO || role === 'Co-CEO';
  }, [roleData?.role, user?.role]);

  // Sync read IDs on user change
  useEffect(() => {
    setReadIds(getStoredReadIds(user?.uid));
  }, [user?.uid]);

  // Subscribe to live 100% real news
  useEffect(() => {
    const unsubscribe = ExecutiveNewsService.subscribeToTopNews({
      onNews: (items) => {
        setNews(items || []);
        setLoading(false);
      },
      onError: (err) => {
        console.warn('Executive news load error:', err);
        setLoading(false);
      },
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Filter out already read headlines
  const unreadNews = useMemo(() => {
    return news.filter(item => !readIds.includes(item.id));
  }, [news, readIds]);

  // Filtered headlines based on active category tab
  const filteredNews = useMemo(() => {
    if (filter === 'appointments') {
      return unreadNews.filter(
        item => item.type === 'co_ceo_appointment' || item.type === 'ceo_appointment' || item.type === 'leadership_promotion'
      );
    }
    if (filter === 'announcements') {
      return unreadNews.filter(
        item => item.type === 'ceo_announcement' || item.type === 'official_announcement'
      );
    }
    if (filter === 'notifications') {
      return unreadNews.filter(item => item.type === 'system_alert');
    }
    return unreadNews;
  }, [unreadNews, filter]);

  // Ensure current index is within bounds
  useEffect(() => {
    if (currentIndex >= filteredNews.length && filteredNews.length > 0) {
      setCurrentIndex(0);
    }
  }, [filteredNews.length, currentIndex]);

  // Auto-advance ticker every 5 seconds
  useEffect(() => {
    if (filteredNews.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredNews.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [filteredNews.length, isPaused]);

  const handleNext = useCallback(() => {
    if (filteredNews.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredNews.length);
  }, [filteredNews.length]);

  const handlePrev = useCallback(() => {
    if (filteredNews.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredNews.length) % filteredNews.length);
  }, [filteredNews.length]);

  // Mark single item as read (vanishes immediately)
  const handleMarkAsRead = useCallback((headlineId, e) => {
    if (e) e.stopPropagation();
    setReadIds((prev) => {
      const next = Array.from(new Set([...prev, headlineId]));
      saveStoredReadIds(user?.uid, next);
      return next;
    });

    if (selectedHeadline?.id === headlineId) {
      setSelectedHeadline(null);
    }
  }, [user?.uid, selectedHeadline]);

  // Mark all unread items as read (entire widget vanishes immediately)
  const handleMarkAllAsRead = useCallback((e) => {
    if (e) e.stopPropagation();
    const allIds = news.map(item => item.id);
    setReadIds((prev) => {
      const next = Array.from(new Set([...prev, ...allIds]));
      saveStoredReadIds(user?.uid, next);
      return next;
    });
    setSelectedHeadline(null);
  }, [news, user?.uid]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastContent.trim()) {
      setBroadcastError('Please provide both a headline title and statement content.');
      return;
    }

    setBroadcasting(true);
    setBroadcastError('');

    try {
      await ExecutiveNewsService.publishExecutiveHeadline({
        title: broadcastTitle,
        content: broadcastContent,
        user,
        roleData,
        pinned: isPinned,
      });

      setBroadcastSuccess(true);
      setTimeout(() => {
        setShowBroadcastModal(false);
        setBroadcastSuccess(false);
        setBroadcastTitle('');
        setBroadcastContent('');
      }, 1500);
    } catch (err) {
      setBroadcastError(err.message || 'Failed to publish executive headline.');
    } finally {
      setBroadcasting(false);
    }
  };

  // If loading, don't show an empty jarring flicker
  if (loading) {
    return null;
  }

  // If all headlines are read, the widget vanishes completely until something new arrives!
  if (unreadNews.length === 0) {
    return null;
  }

  const activeItem = filteredNews[currentIndex] || filteredNews[0] || unreadNews[0];

  return (
    <div
      className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-purple-950/30 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-cyan-500/40 p-4 sm:p-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Wire Label + Tabs + Actions */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              100% Real BeastBuck Wire
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <ShieldCheck className="h-3 w-3 mr-0.5 inline" /> VERIFIED
              </span>
            </span>
          </div>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-white/5 text-text-muted hover:text-white border border-white/5'
            }`}
          >
            All Wire ({unreadNews.length})
          </button>
          <button
            onClick={() => setFilter('appointments')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              filter === 'appointments'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-white/5 text-text-muted hover:text-white border border-white/5'
            }`}
          >
            <Crown className="h-3 w-3" />
            Co-CEO & Leadership
          </button>
          <button
            onClick={() => setFilter('announcements')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              filter === 'announcements'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'bg-white/5 text-text-muted hover:text-white border border-white/5'
            }`}
          >
            <Megaphone className="h-3 w-3" />
            CEO Dispatches
          </button>
          <button
            onClick={() => setFilter('notifications')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
              filter === 'notifications'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'bg-white/5 text-text-muted hover:text-white border border-white/5'
            }`}
          >
            <Bell className="h-3 w-3" />
            Important Notices
          </button>

          {/* Mark all as read button */}
          <button
            onClick={handleMarkAllAsRead}
            title="Mark all headlines as read and clear wire"
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-text-muted hover:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-all ml-auto sm:ml-1"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mark All as Read</span>
          </button>

          {isExecutive && (
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1 hover:brightness-110 shadow-md transition-all hover:scale-105"
            >
              <Plus className="h-3 w-3" />
              Broadcast Headline
            </button>
          )}
        </div>
      </div>

      {/* Main Spotlight Headline Content */}
      <div className="relative z-10 mt-4">
        {filteredNews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
            <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-cyan-400/60" />
            <h4 className="text-sm font-bold text-white mb-1">All headlines in this tab marked as read</h4>
            <p className="text-xs text-text-muted">Click "All Wire" to see other active headlines or wait for new executive dispatches.</p>
          </div>
        ) : activeItem && (
          <div className="group/card relative rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-cyan-500/[0.03] p-4 sm:p-5 transition-all duration-300 hover:border-cyan-500/40 hover:bg-white/[0.06]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left Column: Badge, Title, Content */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Visual Avatar / Icon Badge */}
                <div className="relative shrink-0">
                  {activeItem.authorPhoto ? (
                    <img
                      src={activeItem.authorPhoto}
                      alt={activeItem.authorName}
                      className="h-12 w-12 rounded-2xl object-cover border border-cyan-400/40 shadow-md"
                    />
                  ) : (
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${activeItem.badgeColor || 'from-cyan-500 to-purple-600'} flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/10`}>
                      {activeItem.type === 'co_ceo_appointment' || activeItem.type === 'ceo_appointment' ? (
                        <Crown className="h-6 w-6 text-slate-950" />
                      ) : activeItem.type === 'ceo_announcement' ? (
                        <Megaphone className="h-6 w-6 text-slate-950" />
                      ) : (
                        <Zap className="h-6 w-6 text-slate-950" />
                      )}
                    </div>
                  )}
                  {activeItem.pinned && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] text-slate-950 font-black">
                      ★
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950 bg-gradient-to-r ${activeItem.badgeColor || 'from-cyan-400 to-blue-500'}`}>
                      {activeItem.badgeText || 'Verified Wire'}
                    </span>
                    <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3 inline" />
                      {activeItem.dateStr}
                    </span>
                    <span className="text-[11px] text-slate-500">·</span>
                    <span className="text-[11px] font-bold text-cyan-300">
                      {activeItem.authorRole || 'Executive Leadership'}
                    </span>
                  </div>

                  <h3
                    onClick={() => setSelectedHeadline(activeItem)}
                    className="text-sm sm:text-base font-black text-white hover:text-cyan-300 transition-colors cursor-pointer line-clamp-1 flex items-center gap-1.5"
                  >
                    {activeItem.title}
                  </h3>

                  <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                    {activeItem.content}
                  </p>
                </div>
              </div>

              {/* Right Column: Interactive Details & Mark as Read */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <button
                  onClick={() => setSelectedHeadline(activeItem)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 text-xs font-bold text-white hover:text-cyan-300 transition-all flex items-center gap-1.5"
                >
                  <span>Full Statement</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                {/* Mark As Read Button for individual item */}
                <button
                  onClick={(e) => handleMarkAsRead(activeItem.id, e)}
                  title="Mark as read (removes from wire)"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/50 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark as Read</span>
                </button>

                {activeItem.username && (
                  <Link
                    to={`/m/${activeItem.username}`}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-text-muted hover:text-white transition-all"
                    title="View Leader Profile"
                  >
                    <UserCheck className="h-4 w-4 text-cyan-400" />
                  </Link>
                )}
              </div>
            </div>

            {/* Progress / Pagination indicator */}
            {filteredNews.length > 1 && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 flex-1 max-w-[200px]">
                  {filteredNews.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'w-6 bg-cyan-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to headline ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-text-muted mr-1">
                    {currentIndex + 1} of {filteredNews.length}
                  </span>
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-text-muted hover:text-white transition-colors"
                    aria-label="Previous headline"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-text-muted hover:text-white transition-colors"
                    aria-label="Next headline"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Statement / Headline Modal */}
      {selectedHeadline && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedHeadline(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-black text-slate-950 bg-gradient-to-r ${selectedHeadline.badgeColor || 'from-cyan-400 to-blue-500'}`}>
                  {selectedHeadline.badgeText || 'Verified Headline'}
                </span>
                <span className="text-xs text-text-muted">{selectedHeadline.dateStr}</span>
              </div>
              <button
                onClick={() => setSelectedHeadline(null)}
                className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-black text-white mb-2 leading-snug">
              {selectedHeadline.title}
            </h3>

            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 mb-4 bg-white/5 p-2.5 rounded-xl border border-white/5">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Broadcast Authority: {selectedHeadline.authorName} ({selectedHeadline.authorRole})</span>
            </div>

            <div className="max-h-60 overflow-y-auto pr-1 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 whitespace-pre-line">
              {selectedHeadline.content}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {selectedHeadline.username && (
                  <Link
                    to={`/m/${selectedHeadline.username}`}
                    onClick={() => setSelectedHeadline(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    <UserCheck className="h-4 w-4" />
                    View Leader Profile
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkAsRead(selectedHeadline.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 transition-all flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark as Read</span>
                </button>
                <button
                  onClick={() => setSelectedHeadline(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Headline Modal for Main CEO / Co-CEO */}
      {showBroadcastModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowBroadcastModal(false)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Broadcast Executive Headline</h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {broadcastSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-white">Headline Broadcast Live!</h4>
                <p className="text-xs text-text-muted">Your executive announcement has been published to all member dashboards.</p>
              </div>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-4">
                {broadcastError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
                    {broadcastError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Headline Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g., Strategic Leadership Announcement: Appointed Co-CEO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-text-muted text-xs focus:border-amber-400 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Official Executive Statement / Details <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Write the full executive announcement, reason, or platform milestone..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-text-muted text-xs focus:border-amber-400 focus:outline-none transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pinHeadline"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-amber-400 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="pinHeadline" className="text-xs font-bold text-slate-300 cursor-pointer">
                    Pin to top of BeastBuck Live Wire
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-text-muted hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:shadow-lg hover:shadow-yellow-400/30 transition-all disabled:opacity-50"
                  >
                    {broadcasting ? 'Publishing...' : 'Publish to Live Wire'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
