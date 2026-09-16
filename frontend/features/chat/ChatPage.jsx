import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { AlertCircle, X, Pin, MessageSquareReply, Settings, Flag, Image } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ChatService, SUPPORTED_REACTIONS } from '@services/firestore/chat';
import { UsersService } from '@services/firestore/users';
import { hasPermission } from '@shared/permissions/permissions';
import { ChatHeader, VoiceCallOverlay, MemberListModal } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { VoiceRoomBar } from './VoiceRoomBar';
import { ThreadDrawer } from './ThreadDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { ChatNotificationCenter } from './ChatNotifications';
import { MediaHub } from './MediaHub';
import { CelebrationContainer } from './Celebrations';
import { MemberProfileDrawer } from './MemberProfileDrawer';
import { ChatGamesModal } from './ChatGamesModal';

const ChatPage = React.memo(function ChatPage() {
  const { user, roleData } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [members, setMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [voiceParticipants, setVoiceParticipants] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [inVoiceRoom, setInVoiceRoom] = useState(false);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [screenEffect, setScreenEffect] = useState(null);
  const [memberPresence, setMemberPresence] = useState({});
  const [showMemberList, setShowMemberList] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [celebration, setCelebration] = useState(null);
  const [celebrations, setCelebrations] = useState([]);
  const [showMediaHub, setShowMediaHub] = useState(false);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [joinGameSessionId, setJoinGameSessionId] = useState(null);
  const [selectedDrawerMember, setSelectedDrawerMember] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [showAvatarProfile, setShowAvatarProfile] = useState(null);
  const [chatSettings, setChatSettings] = useState({
    fontSize: 'medium',
    reducedMotion: false,
    compactMode: false,
    showCelebrations: true,
  });
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerSrc, setMediaViewerSrc] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messageListRef = useRef(null);

  const memberName = roleData?.displayName || roleData?.username || user?.displayName || 'Member';
  const memberRole = roleData?.role || 'Member';
  const canManageAnnouncements = hasPermission(memberRole, 'canManageAnnouncements') || memberRole === 'Leader' || memberRole === 'Admin';
  const canSendInRoom = !!user;

  // Load chat settings from Firestore on mount
  useEffect(() => {
    if (!user?.uid) return;
    const loadSettings = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('@services/firebase/config');
        const snap = await getDoc(doc(db, 'users', user.uid, 'chatSettings', 'preferences'));
        if (snap.exists()) {
          setChatSettings(prev => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        // ignore permission errors for guest/restricted users
      }
    };
    loadSettings();
  }, [user?.uid]);

  // Save chat settings to Firestore
  const updateChatSettings = useCallback(async (updates) => {
    const next = { ...chatSettings, ...updates };
    setChatSettings(next);
    if (!user?.uid) return;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('@services/firebase/config');
      await setDoc(doc(db, 'users', user.uid, 'chatSettings', 'preferences'), next, { merge: true });
    } catch {
      // ignore write errors
    }
  }, [chatSettings, user?.uid]);

  // Subscribe to messages
  useEffect(() => {
    setLoading(true);
    setError(null);
    const unsubscribe = ChatService.subscribeToRoomMessages('general', {
      onMessages: (nextMessages) => {
        setMessages(nextMessages.filter(message => !message.archived));
        setLoading(false);
      },
      onError: (err) => {
        console.error('Message listener failed:', err);
        setError('Failed to load chat messages.');
        setLoading(false);
      },
    });
    return () => unsubscribe();
  }, []);

  // Load assignable members
  useEffect(() => {
    let cancelled = false;
    async function loadMembers() {
      try {
        const assignableMembers = await UsersService.getAssignableMembers();
        if (!cancelled) setMembers(assignableMembers);
      } catch (err) {
        console.error('Member mention list failed:', err);
      }
    }
    loadMembers();
    return () => { cancelled = true; };
  }, []);

  // Typing indicators
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = ChatService.subscribeToTyping('general', (users) => {
      setTypingUsers(users.filter(u => u.userId !== user.uid));
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Voice room participants
  useEffect(() => {
    if (!inVoiceRoom) return;
    const unsubscribe = ChatService.subscribeToVoiceRoom('general', (participants) => {
      setVoiceParticipants(participants);
    });
    return () => unsubscribe();
  }, [inVoiceRoom]);

  // Pinned messages
  useEffect(() => {
    if (!showPinnedModal) return;
    const unsubscribe = ChatService.subscribeToPinnedMessages('general', (messages) => {
      setPinnedMessages(messages);
    });
    return () => unsubscribe();
  }, [showPinnedModal]);

  // Leave voice room on unmount
  useEffect(() => {
    return () => {
      if (inVoiceRoom && user?.uid) {
        ChatService.leaveVoiceRoom('general', user.uid);
      }
    };
  }, [inVoiceRoom, user?.uid]);

  // Screen effects timeout
  useEffect(() => {
    if (screenEffect) {
      const timer = setTimeout(() => setScreenEffect(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [screenEffect]);

  // Pinned modal escape listener
  useEffect(() => {
    if (!showPinnedModal) return;
    const handleKeyDown = (e) => { if (e.key === 'Escape') setShowPinnedModal(false); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPinnedModal]);

  const allMessages = useMemo(() => {
    const combined = [...messages];
    optimisticMessages.forEach(opt => {
      if (!messages.find(m => m.id === opt.id)) {
        combined.push(opt);
      }
    });
    return combined;
  }, [messages, optimisticMessages]);

  const addNotification = useCallback((notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = {
      id,
      timestamp: Date.now(),
      autoClose: true,
      duration: 5000,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
    return id;
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addCelebration = useCallback((celebrationData) => {
    const id = `celebration-${Date.now()}-${Math.random()}`;
    const newCelebration = {
      id,
      timestamp: Date.now(),
      autoClose: true,
      duration: 8000,
      ...celebrationData,
    };
    setCelebrations(prev => [newCelebration, ...prev].slice(0, 5));
    return id;
  }, []);

  const dismissCelebration = useCallback((id) => {
    setCelebrations(prev => prev.filter(c => c.id !== id));
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        document.getElementById('global-chat-message')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setShowMemberList(true);
      }
      if (e.key === 'Escape') {
        setShowPinnedModal(false);
        setShowPersonalization(false);
        setShowReportModal(false);
        setShowAvatarProfile(null);
        setShowMemberList(false);
        setShowMediaHub(false);
        setShowGamesModal(false);
        setActiveThreadMessage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsRefreshing(false);
      }, 500);
    } catch {
      setIsRefreshing(false);
    }
  }, []);

  const handleSend = async (text, mentions = [], attachments = []) => {
    setError(null);
    const payload = {
      id: `temp-${Date.now()}`,
      roomId: 'general',
      roomType: 'public',
      senderId: user?.uid,
      senderName: memberName,
      senderRole: memberRole,
      text,
      mentions,
      members,
      createdAt: new Date(),
      edited: false,
      deleted: false,
      reactions: {},
      deliveryStatus: navigator.onLine ? 'sending' : 'queued',
      attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type, url: a.url, isVoiceNote: a.isVoiceNote })),
      replyTo: replyTarget ? { messageId: replyTarget.messageId || replyTarget.id, senderName: replyTarget.senderName, text: replyTarget.text } : null,
    };

    setOptimisticMessages(prev => [...prev, payload]);
    setReplyTarget(null);

    try {
      const lowerText = text.toLowerCase();
      if (chatSettings.showCelebrations) {
        if (lowerText.includes('completed') || lowerText.includes('done') || lowerText.includes('finished')) setScreenEffect('confetti');
        if (lowerText.includes('fire') || lowerText.includes('burn') || lowerText.includes('lit')) setScreenEffect('fire');
        if (lowerText.includes('party') || lowerText.includes('celebrate') || lowerText.includes('cheers')) setScreenEffect('party');
      }

      await ChatService.sendMessage({
        roomId: 'general',
        roomType: 'public',
        senderId: user?.uid,
        senderName: memberName,
        senderRole: memberRole,
        text,
        replyTo: payload.replyTo,
        mentions,
        attachments: payload.attachments,
        members,
      });

      setOptimisticMessages(prev => prev.filter(m => m.id !== payload.id));
      if (user?.uid) {
        ChatService.setTypingStatus('general', user.uid, memberName, false);
      }
    } catch (err) {
      console.error('Chat message send failed:', err);
      const message_text = (err?.message || '').toLowerCase();
      if (message_text.includes('permission') || message_text.includes('insufficient')) {
        setError('You do not have permission to send messages. Join as an approved Member to unlock full chat features.');
        setOptimisticMessages(prev => prev.filter(m => m.id !== payload.id));
      } else {
        setOptimisticMessages(prev => prev.map(m => m.id === payload.id ? { ...m, deliveryStatus: 'queued' } : m));
        setError('Message queued. Will retry when connected.');
      }
    }
  };

  const handleScrollToBottom = useCallback(() => {
    messageListRef.current?.scrollTo?.({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, []);

  const handleScroll = useCallback((e) => {
    const el = e.target;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceFromBottom > 300);
  }, []);

  const handleJoinVoiceRoom = useCallback(async () => {
    if (!user?.uid) return;
    try {
      await ChatService.joinVoiceRoom('general', user.uid, memberName);
      setInVoiceRoom(true);
      addNotification({
        type: 'system',
        title: 'Voice Lounge Joined',
        message: `You joined the voice lounge.`,
      });
    } catch (error) {
      console.error('Failed to join voice room:', error);
      setError('Failed to join voice room');
    }
  }, [user?.uid, memberName, addNotification]);

  const handleLeaveVoiceRoom = useCallback(async () => {
    if (!user?.uid) return;
    try {
      await ChatService.leaveVoiceRoom('general', user.uid);
      setInVoiceRoom(false);
      setVoiceParticipants({});
      setIsMuted(false);
    } catch (error) {
      console.error('Failed to leave voice room:', error);
    }
  }, [user?.uid]);

  const handleToggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (user?.uid) {
        ChatService.toggleVoiceMute('general', user.uid, next);
      }
      return next;
    });
  }, [user?.uid]);

  const handleTyping = useCallback((isTyping) => {
    if (!user?.uid || !memberName) return;
    try {
      ChatService.setTypingStatus('general', user.uid, memberName, isTyping);
    } catch {
      // Ignore typing indicator errors
    }
  }, [user?.uid, memberName]);

  const handleFileSelect = useCallback((files) => {
    if (!files?.length) return;
  }, []);

  const handleReply = useCallback((message) => {
    setReplyTarget(message);
    document.getElementById('global-chat-message')?.focus();
  }, []);

  const handleOpenThread = useCallback((message) => {
    setActiveThreadMessage(message);
  }, []);

  const handleToggleReaction = useCallback(async (messageTarget, reactionKey, isUserActive) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId) return;
    try {
      await ChatService.toggleReaction({
        roomId: 'general',
        messageId: msgId,
        reactionKey,
        userId: user.uid,
        hasReacted: isUserActive,
      });
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  }, [user?.uid]);

  const handleTogglePin = useCallback(async (messageTarget) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    const isPinned = typeof messageTarget === 'object' ? !messageTarget?.pinned : true;
    if (!msgId) return;
    try {
      await ChatService.pinMessage('general', msgId, isPinned);
      addNotification({
        type: 'system',
        title: isPinned ? 'Message Pinned' : 'Message Unpinned',
        message: isPinned ? 'Pinned message to top.' : 'Removed pin.',
      });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }, [user?.uid, addNotification]);

  const handleArchiveAnnouncement = useCallback(async (messageTarget) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId) return;
    try {
      await ChatService.updateAnnouncement({ roomId: 'general', messageId: msgId, archived: true });
    } catch (error) {
      console.error('Failed to archive announcement:', error);
    }
  }, [user?.uid]);

  const handleEdit = useCallback(async (messageTarget, newText) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId || !newText?.trim()) return;
    try {
      await ChatService.editMessage('general', msgId, newText.trim());
    } catch (error) {
      console.error('Failed to edit message:', error);
      setError('Failed to edit message');
    }
  }, [user?.uid]);

  const handleDelete = useCallback(async (messageTarget) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId) return;
    try {
      await ChatService.deleteMessage('general', msgId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError('Failed to delete message');
    }
  }, [user?.uid]);

  const handleBookmark = useCallback(async (messageTarget) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    const isBookmarked = typeof messageTarget === 'object' ? !messageTarget?.bookmarked : true;
    if (!msgId) return;
    try {
      await ChatService.bookmarkMessage('general', msgId, isBookmarked);
      addNotification({
        type: 'system',
        title: isBookmarked ? 'Message Bookmarked' : 'Bookmark Removed',
        message: isBookmarked ? 'Saved to your bookmarks.' : 'Removed from bookmarks.',
      });
    } catch (error) {
      console.error('Failed to bookmark message:', error);
    }
  }, [user?.uid, addNotification]);

  const handleReportPrompt = useCallback((messageTarget) => {
    setReportMessage(messageTarget);
    setReportReason('');
    setShowReportModal(true);
  }, []);

  const handleReportSubmit = useCallback(async () => {
    if (!user?.uid || !reportMessage) return;
    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@services/firebase/config');
      await addDoc(collection(db, 'chatReports'), {
        messageId: reportMessage.id,
        messageText: reportMessage.text || '',
        roomId: 'general',
        reportedBy: user.uid,
        reporterName: memberName,
        reason: reportReason.trim() || 'Flagged by user for moderation review',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      addNotification({
        type: 'system',
        title: 'Report Submitted',
        message: 'Thank you. Our moderation team will review this message.',
      });
      setShowReportModal(false);
      setReportMessage(null);
    } catch (error) {
      console.error('Failed to report message:', error);
      setShowReportModal(false);
    }
  }, [user?.uid, reportMessage, memberName, reportReason, addNotification]);

  const handleMediaOpen = useCallback((url) => {
    setMediaViewerSrc(url);
    setShowMediaViewer(true);
  }, []);

  const handleMediaClose = useCallback(() => {
    setShowMediaViewer(false);
    setMediaViewerSrc(null);
  }, []);

  const handleOpenSharedContent = useCallback((content) => {
    if (content?.type === 'game') {
      const sessId = content.sessionId || content.gameSessionId || null;
      console.log('Opening game session:', sessId, 'content:', content);
      if (sessId) {
        setJoinGameSessionId(sessId);
        setShowGamesModal(true);
      } else {
        console.error('No session ID found in game content');
      }
    } else if (content?.url) {
      handleMediaOpen(content.url);
    }
  }, [handleMediaOpen]);

  const voiceParticipantCount = Object.keys(voiceParticipants).length;

  const getFontSizeClass = () => {
    switch (chatSettings.fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  return (
    <div className={`flex h-[calc(100dvh-4rem-5rem)] md:h-[calc(100dvh-4rem)] w-full flex-col p-0 md:p-2 overflow-hidden ${getFontSizeClass()} ${chatSettings.reducedMotion ? 'reduce-motion' : ''}`}>
      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 overflow-hidden rounded-none md:rounded-2xl border-0 md:border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-2xl backdrop-blur-2xl">
        
        {/* Main Conversation Area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatHeader
            memberName={memberName}
            memberRole={memberRole}
            canSend={canSendInRoom}
            onShowPinned={() => setShowPinnedModal(true)}
            onShowMedia={() => setShowMediaHub(true)}
            onShowGames={() => setShowGamesModal(true)}
            onJoinVoice={handleJoinVoiceRoom}
            onLeaveVoice={handleLeaveVoiceRoom}
            inVoiceRoom={inVoiceRoom}
            voiceParticipants={voiceParticipantCount}
            onShowMembers={() => setShowMemberList(true)}
            onShowSettings={() => setShowPersonalization(true)}
          />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

            {error && (
              <div className="mx-2 mt-2 md:mx-3 flex items-start gap-2 rounded-xl border border-status-danger/20 bg-status-danger/10 px-3 py-2 text-xs sm:text-sm text-status-danger animate-fade-in-up">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError(null)} className="p-0.5 text-status-danger hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Achievement Celebration Overlay */}
            {celebration && chatSettings.showCelebrations && (
              <div className="mx-2 mt-2 md:mx-3 animate-fade-in-up">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-status-warning/30 bg-status-warning/10">
                  <div className="text-3xl animate-bounce">{celebration.emoji || '🎉'}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">{celebration.title || 'Achievement Unlocked!'}</h3>
                    <p className="text-[10px] sm:text-xs text-text-muted line-clamp-2">{celebration.description}</p>
                    {celebration.xp && <p className="text-[10px] sm:text-xs font-bold text-status-warning mt-0.5">+{celebration.xp} XP</p>}
                  </div>
                  <button onClick={() => setCelebration(null)} className="p-1 rounded-lg hover:bg-white/10 transition" aria-label="Dismiss celebration">
                    <X className="h-4 w-4 text-text-muted" />
                  </button>
                </div>
              </div>
            )}

            <MessageList
              messages={allMessages}
              loading={loading}
              currentUserId={user?.uid}
              roomName="general"
              isAnnouncementRoom={false}
              canManageAnnouncements={canManageAnnouncements}
              onReply={handleReply}
              onToggleReaction={handleToggleReaction}
              onTogglePin={handleTogglePin}
              onArchiveAnnouncement={handleArchiveAnnouncement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBookmark={handleBookmark}
              onReport={handleReportPrompt}
              senderPresence={memberPresence}
              onShowProfile={(senderId, senderName) => setSelectedDrawerMember({ id: senderId, displayName: senderName, role: 'Member' })}
              onMediaOpen={handleMediaOpen}
              onOpenSharedContent={handleOpenSharedContent}
              compact={chatSettings.compactMode}
              fontSize={chatSettings.fontSize}
              reducedMotion={chatSettings.reducedMotion}
              isRefreshing={isRefreshing}
              onPullToRefresh={handlePullToRefresh}
              showScrollBottom={showScrollBottom}
              onScrollToBottom={handleScrollToBottom}
              onScroll={handleScroll}
              error={error}
              onRetry={handlePullToRefresh}
              ref={messageListRef}
            />

            <MessageInput
              disabled={!user}
              readOnlyReason=""
              placeholder="Message #general..."
              onSend={handleSend}
              onTyping={handleTyping}
              replyTo={replyTarget}
              onCancelReply={() => setReplyTarget(null)}
              members={members}
              onFileSelect={handleFileSelect}
              showSmartReplies={canSendInRoom}
              compact={chatSettings.compactMode}
              fontSize={chatSettings.fontSize}
            />

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="shrink-0 px-3 pb-1.5 text-[10px] sm:text-xs text-text-muted animate-fade-in">
                {typingUsers.map((u, i) => (
                  <span key={u.userId}>
                    {i > 0 && ', '}
                    {u.userName} is typing...
                  </span>
                ))}
              </div>
            )}

            {/* Voice Room Bar */}
            {inVoiceRoom && (
              <VoiceRoomBar
                participants={voiceParticipants}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                onLeave={handleLeaveVoiceRoom}
                currentUserId={user?.uid}
              />
            )}
          </div>
        </div>
      </div>

      {/* Screen Effect Overlay */}
      {screenEffect && chatSettings.showCelebrations && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {screenEffect === 'confetti' && <div className="text-6xl animate-bounce">🎉</div>}
          {screenEffect === 'fire' && <div className="text-6xl animate-pulse">🔥</div>}
          {screenEffect === 'party' && <div className="text-6xl animate-spin">🎊</div>}
        </div>
      )}

      {/* Full-screen Media Viewer Lightbox */}
      {showMediaViewer && mediaViewerSrc && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-fade-in p-4" onClick={handleMediaClose}>
          <button onClick={handleMediaClose} className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition z-50" aria-label="Close media">
            <X className="h-6 w-6 text-white" />
          </button>
          {mediaViewerSrc.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={mediaViewerSrc} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={mediaViewerSrc} alt="Full screen preview" className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}

      {/* Media & Files Hub Modal */}
      {showMediaHub && (
        <MediaHub
          messages={allMessages}
          onClose={() => setShowMediaHub(false)}
          onOpenMedia={(url) => {
            setShowMediaHub(false);
            handleMediaOpen(url);
          }}
        />
      )}

      {/* Notifications Center */}
      <ChatNotificationCenter
        notifications={notifications}
        onClose={(id) => dismissNotification(id)}
        onNotificationClick={(notification) => {
          dismissNotification(notification.id);
        }}
      />

      {/* Celebrations */}
      <CelebrationContainer
        celebrations={celebrations}
        onClose={(id) => dismissCelebration(id)}
        onClaim={() => {}}
      />

      {/* Pinned Messages Modal */}
      {showPinnedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowPinnedModal(false)}>
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-2xl border-white/15 bg-slate-950 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Pinned messages">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Pin className="h-5 w-5 text-amber-400" />
                  <span>Pinned Messages in #general</span>
                </div>
                <button onClick={() => setShowPinnedModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition active:scale-95" aria-label="Close pinned messages">
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh] space-y-3 custom-scrollbar">
              {pinnedMessages.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <Pin className="h-6 w-6 text-white/40" />
                  </div>
                  <p className="text-sm text-white/60">No pinned messages in this channel yet</p>
                </div>
              ) : (
                pinnedMessages.map((msg) => (
                  <div key={msg.id} className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-indigo-400 text-sm">{msg.senderName}</span>
                      <span className="text-xs text-white/40">{msg.createdAt?.toDate?.()?.toLocaleString() || 'Recent'}</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Thread Drawer */}
      {activeThreadMessage && (
        <ThreadDrawer
          message={activeThreadMessage}
          onClose={() => setActiveThreadMessage(null)}
          onReply={(msg, replyText) => {
            handleSend(replyText, [], []);
          }}
          currentUserId={user?.uid}
        />
      )}

      {/* Voice Call Overlay */}
      {inVoiceRoom && (
        <VoiceCallOverlay
          roomName="general"
          participants={voiceParticipants}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onLeave={handleLeaveVoiceRoom}
        />
      )}

      {/* Member List Modal */}
      {showMemberList && <MemberListModal members={members} onClose={() => setShowMemberList(false)} />}

      {/* Member Profile Drawer */}
      {(showAvatarProfile || selectedDrawerMember) && (
        <MemberProfileDrawer
          member={showAvatarProfile || selectedDrawerMember}
          currentUserId={user?.uid}
          onClose={() => { setShowAvatarProfile(null); setSelectedDrawerMember(null); }}
          onMessage={() => { setReplyTarget(null); document.getElementById('global-chat-message')?.focus(); }}
          onMention={(name) => {
            const input = document.getElementById('global-chat-message');
            if (input) {
              input.value = (input.value + ` @${name} `).trim();
              input.focus();
            }
          }}
        />
      )}

      {/* Chat Games Modal */}
      {showGamesModal && (
        <ChatGamesModal
          onClose={() => {
            setShowGamesModal(false);
            setJoinGameSessionId(null);
          }}
          members={members}
          currentUser={user}
          activeRoomId="general"
          joinSessionId={joinGameSessionId}
          onSendGameCard={async (gameCardData) => {
            try {
              await ChatService.sendMessage({
                roomId: 'general',
                roomType: 'public',
                senderId: user?.uid,
                senderName: memberName,
                senderRole: memberRole,
                text: `🎮 Started a live ${gameCardData.title} multiplayer match! Click to join on your device!`,
                sharedContent: {
                  type: 'game',
                  title: gameCardData.title,
                  description: gameCardData.description,
                  gameId: gameCardData.gameId,
                  sessionId: gameCardData.sessionId,
                  status: 'waiting',
                  author: memberName,
                  icon: '🎮',
                }
              });
            } catch (err) {
              console.error('Failed to post game card:', err);
            }
          }}
        />
      )}

      {/* Personalization Modal */}
      {showPersonalization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowPersonalization(false)}>
          <Card className="w-full max-w-sm rounded-2xl border-white/15 bg-slate-950 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Chat settings">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-indigo-400" />
                  Chat Settings
                </div>
                <button onClick={() => setShowPersonalization(false)} className="p-1 rounded-lg hover:bg-white/10 transition" aria-label="Close settings">
                  <X className="h-4 w-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Compact Mode</span>
                <button 
                  onClick={() => updateChatSettings({ compactMode: !chatSettings.compactMode })}
                  className={`chat-toggle-switch ${chatSettings.compactMode ? 'active' : ''}`}
                  role="switch"
                  aria-checked={chatSettings.compactMode}
                  aria-label="Toggle compact mode"
                >
                  <span className="chat-toggle-thumb" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Animations</span>
                <button 
                  onClick={() => updateChatSettings({ reducedMotion: !chatSettings.reducedMotion })}
                  className={`chat-toggle-switch ${!chatSettings.reducedMotion ? 'active' : ''}`}
                  role="switch"
                  aria-checked={!chatSettings.reducedMotion}
                  aria-label="Toggle animations"
                >
                  <span className="chat-toggle-thumb" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Celebrations</span>
                <button 
                  onClick={() => updateChatSettings({ showCelebrations: !chatSettings.showCelebrations })}
                  className={`chat-toggle-switch ${chatSettings.showCelebrations ? 'active' : ''}`}
                  role="switch"
                  aria-checked={chatSettings.showCelebrations}
                  aria-label="Toggle celebrations"
                >
                  <span className="chat-toggle-thumb" />
                </button>
              </div>
              <div>
                <span className="text-sm font-bold text-white mb-2 block">Font Size</span>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => updateChatSettings({ fontSize: size })}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold transition ${
                        chatSettings.fontSize === size
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {size === 'small' ? 'A-' : size === 'large' ? 'A+' : 'A'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-white/40 text-center pt-2">Preferences synced with your BeastBuck profile.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowReportModal(false)}>
          <Card className="w-full max-w-sm rounded-2xl border-white/15 bg-slate-950 shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Report message">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Flag className="h-5 w-5 text-amber-400" />
                Report Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-white/70">Report this message to BeastBuck moderators for review.</p>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Describe the issue or violation..."
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs sm:text-sm text-white outline-none focus:border-indigo-500/60"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleReportSubmit} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
                  Submit Report
                </Button>
                <Button onClick={() => setShowReportModal(false)} variant="outline" className="flex-1 border-white/20 text-xs">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); }
        .chat-toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
          cursor: pointer;
          padding: 0;
        }
        .chat-toggle-switch.active {
          background: linear-gradient(135deg, #6366f1, #a855f7);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
          border-color: rgba(99, 102, 241, 0.5);
        }
        .chat-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        .chat-toggle-switch.active .chat-toggle-thumb {
          left: 22px;
        }
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `}</style>
    </div>
  );
});

export default ChatPage;
