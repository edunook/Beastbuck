import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { AlertCircle, X, Pin, MessageSquareReply, Settings, Flag, Forward } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ChatService, SUPPORTED_REACTIONS } from '@services/firestore/chat';
import { UsersService } from '@services/firestore/users';
import { hasPermission } from '@shared/permissions/permissions';
import { ChatHeader, VoiceCallOverlay, MemberListModal } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { ThreadDrawer } from './ThreadDrawer';
import { VoiceRoomBar } from './VoiceRoomBar';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { useFocusTrap } from '@frontend/hooks/useFocusTrap';
import { ChatNotification, ChatNotificationCenter } from './ChatNotifications';
import { MediaHub } from './MediaHub';
import { CelebrationContainer } from './Celebrations';
import { MemberProfileDrawer } from './MemberProfileDrawer';
import { ChatGamesModal } from './ChatGamesModal';


const DEFAULT_ROOMS = [
  { id: 'general', name: 'general', description: 'Realtime BeastBuck team messages', type: 'public', pinned: true },
  { id: 'announcements', name: 'announcements', description: 'Official community announcements', type: 'announcement', pinned: true },
  { id: 'ai-creations', name: 'ai-creations', description: 'Showcase & discuss AI models and prompts', type: 'public' },
  { id: 'research-hub', name: 'research-hub', description: 'Collaborate on research papers and ideas', type: 'public' },
  { id: 'project-showcase', name: 'project-showcase', description: 'Share project updates & achievements', type: 'public' },
  { id: 'marketplace-hub', name: 'marketplace-hub', description: 'Discuss marketplace items & releases', type: 'public' },
  { id: 'funflix-lounge', name: 'funflix-lounge', description: 'FunFlix movies & video discussions', type: 'public' },
];

const ChatPage = React.memo(function ChatPage() {
  const { user, roleData } = useAuth();
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState('general');

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [members, setMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [voiceParticipants, setVoiceParticipants] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [inVoiceRoom, setInVoiceRoom] = useState(false);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [screenEffect, setScreenEffect] = useState(null);
  const [showReplyPanel, setShowReplyPanel] = useState(false);
  const [replyThread, setReplyThread] = useState(null);
  const [showThreadDrawer, setShowThreadDrawer] = useState(false);
  const [threadMessage, setThreadMessage] = useState(null);
  const [memberPresence, setMemberPresence] = useState({});
  const [showMemberList, setShowMemberList] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [celebrations, setCelebrations] = useState([]);
  const [showMediaHub, setShowMediaHub] = useState(false);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [selectedDrawerMember, setSelectedDrawerMember] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
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
  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('beastbuck-chat-offline-queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const messageListRef = useRef(null);

  const memberName = roleData?.displayName || roleData?.username || user?.displayName || 'Member';
  const memberRole = roleData?.role || 'Member';
  const canManageAnnouncements = hasPermission(memberRole, 'canManageAnnouncements');
  const canSendInRoom = !!user;

  const sender = useMemo(() => ({
    senderId: user?.uid,
    senderName: memberName,
    senderRole: memberRole,
  }), [memberName, memberRole, user?.uid]);

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
        if (err?.code !== 'permission-denied') {
          console.log('Chat settings load failed:', err.message);
        }
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
    } catch (err) {
      if (err?.code !== 'permission-denied') {
        console.log('Chat settings save failed:', err.message);
      }
    }
  }, [chatSettings, user?.uid]);

  // Subscribe to messages for active chat room
  useEffect(() => {
    setLoading(true);
    const unsubscribe = ChatService.subscribeToRoomMessages(activeRoomId, {
      onMessages: (nextMessages) => {
        setMessages(nextMessages.filter(message => !message.archived));
        setLoading(false);
      },
      onError: (err) => {
        console.error('Message listener failed:', err);
        setError('Failed to load messages');
        setLoading(false);
      },
    });
    return () => unsubscribe();
  }, [activeRoomId]);

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

  useEffect(() => {
    if (!user?.uid) return;
    const roomId = 'general';
    const unsubscribe = ChatService.subscribeToTyping(roomId, (users) => {
      setTypingUsers(users.filter(u => u.userId !== user.uid));
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!inVoiceRoom) return;
    const roomId = 'general';
    const unsubscribe = ChatService.subscribeToVoiceRoom(roomId, (participants) => {
      setVoiceParticipants(participants);
    });
    return () => unsubscribe();
  }, [inVoiceRoom]);

  useEffect(() => {
    if (!showPinnedModal) return;
    const roomId = 'general';
    const unsubscribe = ChatService.subscribeToPinnedMessages(roomId, (messages) => {
      setPinnedMessages(messages);
    });
    return () => unsubscribe();
  }, [showPinnedModal]);

  useEffect(() => {
    return () => {
      if (inVoiceRoom && user?.uid) {
        const roomId = 'general';
        ChatService.leaveVoiceRoom(roomId, user.uid);
      }
    };
  }, [inVoiceRoom, user?.uid]);

  useEffect(() => {
    if (screenEffect) {
      const timer = setTimeout(() => setScreenEffect(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [screenEffect]);

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

  // Demo: trigger welcome notification
  useEffect(() => {
    if (notifications.length > 0) return;
    const timer = setTimeout(() => {
      addNotification({
        type: 'system',
        title: 'Welcome to BeastBuck Chat!',
        message: 'Explore your conversations, join voice rooms, and connect with the community.',
        badge: 'New',
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [notifications.length, addNotification]);

  // Demo: trigger celebration on specific keywords
  useEffect(() => {
    if (!chatSettings.showCelebrations) return;
    const lastMessage = allMessages[allMessages.length - 1];
    if (!lastMessage?.text) return;
    const text = lastMessage.text.toLowerCase();
    if (text.includes('congratulations') || text.includes('congrats') || text.includes('achievement')) {
      addCelebration({
        type: 'achievement',
        title: 'Achievement Unlocked!',
        description: 'You discovered a secret keyword. Keep exploring!',
        xp: 50,
      });
    }
  }, [allMessages, chatSettings.showCelebrations, addCelebration]);

  // Keyboard shortcuts
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
        setShowForwardModal(false);
        setShowAvatarProfile(null);
        setShowMemberList(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await ChatService.syncRoom('general');
    } catch {
      // ignore sync errors
    } finally {
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
      attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type, url: a.url })),
      replyTo: replyTarget ? { messageId: replyTarget.messageId, senderName: replyTarget.senderName, text: replyTarget.text } : null,
    };

    if (!navigator.onLine) {
      setOfflineQueue(prev => {
        const next = [...prev, payload];
        localStorage.setItem('beastbuck-chat-offline-queue', JSON.stringify(next));
        return next;
      });
      setOptimisticMessages(prev => [...prev, payload]);
      setReplyTarget(null);
      return;
    }

    setOptimisticMessages(prev => [...prev, payload]);
    setReplyTarget(null);

    try {
      const lowerText = text.toLowerCase();
      if (chatSettings.showCelebrations) {
        if (lowerText.includes('completed') || lowerText.includes('done') || lowerText.includes('finished')) setScreenEffect('confetti');
        if (lowerText.includes('fire') || lowerText.includes('burn')) setScreenEffect('fire');
        if (lowerText.includes('party') || lowerText.includes('celebrate')) setScreenEffect('party');
      }
      await ChatService.sendMessage({
        roomId: 'general',
        roomType: 'public',
        senderId: user?.uid,
        senderName: memberName,
        senderRole: memberRole,
        text,
        replyTo: replyTarget,
        mentions,
        members,
      });
      setOptimisticMessages(prev => prev.filter(m => m.id !== payload.id));
      ChatService.setTypingStatus('general', user.uid, memberName, false);
    } catch (err) {
      console.error('Channel message send failed:', err);
      const message_text = (err?.message || '').toLowerCase();
      if (message_text.includes('permission') || message_text.includes('insufficient')) {
        setError('You do not have permission to send messages. Join as an approved Member to unlock full chat features.');
        setOptimisticMessages(prev => prev.filter(m => m.id !== payload.id));
      } else {
        setOfflineQueue(prev => {
          const next = [...prev, payload];
          localStorage.setItem('beastbuck-chat-offline-queue', JSON.stringify(next));
          return next;
        });
        setOptimisticMessages(prev => prev.map(m => m.id === payload.id ? { ...m, deliveryStatus: 'queued' } : m));
        setError('Message queued. Will send when back online.');
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
      await ChatService.joinVoiceRoom('general', user.uid);
      setInVoiceRoom(true);
    } catch (error) {
      console.error('Failed to join voice room:', error);
      setError('Failed to join voice room');
    }
  }, [user?.uid]);

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
    setIsMuted(prev => !prev);
  }, []);

  const handleOpenThread = useCallback((message) => {
    setThreadMessage(message);
    setShowThreadDrawer(true);
  }, []);

  const handleCloseThread = useCallback(() => {
    setShowThreadDrawer(false);
    setThreadMessage(null);
  }, []);

  const handleThreadReply = useCallback((message, text) => {
    setOptimisticMessages(prev => prev.map(m => 
      m.id === message.id 
        ? { ...m, replyCount: (m.replyCount || 0) + 1 }
        : m
    ));
  }, []);

  const handleTyping = useCallback((isTyping) => {
    if (!user?.uid || !memberName) return;
    try {
      ChatService.setTypingStatus('general', user.uid, memberName, isTyping);
    } catch (error) {
      // Ignore typing indicator errors
    }
  }, [user?.uid, memberName]);

  const handleFileSelect = useCallback((files) => {
    // Files are already processed in MessageInput; parent can inspect or upload here
    if (!files?.length) return;
    console.log('Files selected in chat:', files.length);
  }, []);

  const handleVoiceRecord = useCallback(() => {
    // Placeholder for future voice recording implementation
    console.log('Voice record requested');
  }, []);

  const handleReply = useCallback((message) => {
    setReplyTarget(message);
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
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }, [user?.uid]);

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
    } catch (error) {
      console.error('Failed to bookmark message:', error);
    }
  }, [user?.uid]);

  const handleForward = useCallback(async (messageTarget, targetRoomId) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId) return;
    try {
      await ChatService.forwardMessage({
        sourceRoomId: 'general',
        messageId: msgId,
        targetRoomId: targetRoomId || 'general',
        senderId: user.uid,
        senderName: memberName,
        senderRole: memberRole,
      });
    } catch (error) {
      console.error('Failed to forward message:', error);
      setError('Failed to forward message');
    }
  }, [user?.uid, memberName, memberRole]);

  const handleReport = useCallback(async (messageTarget, reason) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId) return;
    try {
      // Log report cleanly
      console.log('Report logged for message:', msgId, reason);
    } catch (error) {
      console.error('Failed to report message:', error);
      setError('Failed to report message');
    }
  }, [user?.uid]);

  const handleAIAction = useCallback(async (message, actionId) => {
    if (!user?.uid) return;
    
    const actions = {
      rewrite: { prefix: 'Rewritten:', text: message.text.split(' ').reverse().join(' ') + ' (improved)' },
      translate: { prefix: 'Translated:', text: `[Translated] ${message.text}` },
      grammar: { prefix: 'Corrected:', text: message.text.replace(/[.,!?]$/g, match => match.toUpperCase()) },
      summarize: { prefix: 'Summary:', text: message.text.split(' ').slice(0, 10).join(' ') + '...' },
      reply: { prefix: 'Suggested Reply:', text: 'Thanks for sharing! This is a helpful AI-generated response.' },
      explain: { prefix: 'Explanation:', text: `This message says: "${message.text}". It appears to be a regular chat message.` },
      brainstorm: { prefix: 'Ideas:', text: 'Here are some creative ideas based on your message: 1) Expand on the topic 2) Add examples 3) Include references' },
      enhance: { prefix: 'Enhanced:', text: message.text + ' [AI-enhanced with better structure and clarity]' },
    };

    const action = actions[actionId];
    if (!action) return { error: 'Unknown action' };

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    return {
      text: `${action.prefix}\n\n${action.text}`,
      actionId,
    };
  }, [user?.uid]);

  const handleMediaOpen = useCallback((url) => {
    setMediaViewerSrc(url);
    setShowMediaViewer(true);
  }, []);

  const handleMediaClose = useCallback(() => {
    setShowMediaViewer(false);
    setMediaViewerSrc(null);
  }, []);

  const voiceParticipantCount = Object.keys(voiceParticipants).length;

  const getFontSizeClass = () => {
    switch (chatSettings.fontSize) {
      case 'small': return 'text-xs';
      case 'large': return 'text-base';
      default: return 'text-sm';
    }
  };

  const getMessageStyle = () => {
    const base = chatSettings.compactMode ? 'p-2 sm:p-3' : 'p-3 sm:p-4';
    return base;
  };

  const currentRoom = useMemo(() => {
    return rooms.find(r => r.id === activeRoomId) || rooms[0] || { name: activeRoomId, type: 'public' };
  }, [rooms, activeRoomId]);

  return (
    <div className={`flex h-[calc(100dvh-4rem-5rem)] md:h-[calc(100dvh-4rem)] w-full flex-col p-0 md:p-2 overflow-hidden ${getFontSizeClass()} ${chatSettings.reducedMotion ? 'reduce-motion' : ''}`}>
      <section className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col overflow-hidden rounded-none md:rounded-2xl border-0 md:border border-white/15 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 shadow-2xl backdrop-blur-2xl">

        {/* Main Conversation Area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <ChatHeader
            room={currentRoom}
            memberName={memberName}
            memberRole={memberRole}
            canSend={canSendInRoom}
            onShowPinned={() => setShowPinnedModal(true)}
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
                <span>{error}</span>
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
              roomName={currentRoom.name}
              isAnnouncementRoom={currentRoom.type === 'announcement'}
              canManageAnnouncements={canManageAnnouncements}
              onReply={handleReply}
              onToggleReaction={handleToggleReaction}
              onTogglePin={handleTogglePin}
              onArchiveAnnouncement={handleArchiveAnnouncement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBookmark={handleBookmark}
              onForward={handleForward}
              onReport={handleReport}
              onOpenThread={handleOpenThread}
              onAIAction={handleAIAction}
              senderPresence={memberPresence}
              onShowProfile={(senderId, senderName) => setSelectedDrawerMember({ id: senderId, displayName: senderName, role: 'Member' })}
              onMediaOpen={handleMediaOpen}
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
              placeholder={`Message #${currentRoom.name}...`}
              onSend={handleSend}
              onTyping={handleTyping}
              replyTo={replyTarget}
              onCancelReply={() => setReplyTarget(null)}
              members={members}
              onFileSelect={handleFileSelect}
              onVoiceRecord={handleVoiceRecord}
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
      </section>

      {/* Screen Effect Overlay */}
      {screenEffect && chatSettings.showCelebrations && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {screenEffect === 'confetti' && <div className="text-6xl animate-bounce">🎉</div>}
          {screenEffect === 'fire' && <div className="text-6xl animate-pulse">🔥</div>}
          {screenEffect === 'party' && <div className="text-6xl animate-spin">🎊</div>}
        </div>
      )}

      {/* Full-screen Media Viewer */}
      {showMediaViewer && mediaViewerSrc && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fade-in" onClick={handleMediaClose}>
          <button onClick={handleMediaClose} className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition z-50" aria-label="Close media">
            <X className="h-5 w-5 text-white" />
          </button>
          {mediaViewerSrc.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={mediaViewerSrc} controls autoPlay className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          ) : (
            <img src={mediaViewerSrc} alt="Full screen media" className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
          )}
        </div>
      )}

      {/* Thread Drawer */}
      {showThreadDrawer && threadMessage && (
        <ThreadDrawer
          message={threadMessage}
          onClose={handleCloseThread}
          onReply={handleThreadReply}
          currentUserId={user?.uid}
        />
      )}

      {/* Media Hub */}
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

      {/* Notifications */}
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
        onClaim={(celebration) => {
          console.log('Celebration claimed:', celebration);
        }}
      />

      {/* Pinned Messages Modal */}
      {showPinnedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowPinnedModal(false)}>
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Pinned messages">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pin className="h-5 w-5 text-accent" />
                  Pinned Messages
                </div>
                <button onClick={() => setShowPinnedModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition active:scale-95" aria-label="Close pinned messages">
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh] space-y-3 custom-scrollbar">
              {pinnedMessages.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-white/5">
                    <Pin className="h-6 w-6 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted">No pinned messages in this channel yet</p>
                </div>
              ) : (
                pinnedMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-border transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-accent text-sm">{msg.senderName}</span>
                      <span className="text-xs text-text-muted">{msg.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</span>
                    </div>
                    <p className="text-sm text-white">{msg.text}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reply Thread Slide-out Panel */}
      {showReplyPanel && replyThread && (
        <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-surface border-l border-border shadow-2xl animate-slide-in">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-bold text-white">Thread</h3>
              <button onClick={handleCloseReplyPanel} className="p-1 rounded-lg hover:bg-white/10 transition active:scale-95" aria-label="Close thread">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-accent text-sm">{replyThread.senderName}</span>
                  <span className="text-xs text-text-muted">{replyThread.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}</span>
                </div>
                <p className="text-sm text-white">{replyThread.text}</p>
              </div>
              <div className="text-center py-12 text-text-muted">
                <MessageSquareReply className="mx-auto mb-3 h-10 w-10 text-text-muted/50" />
                <p className="text-sm font-medium">Thread replies will appear here</p>
                <p className="text-xs mt-2 text-text-muted/70">Replies are being loaded...</p>
              </div>
            </div>
            <div className="border-t border-border p-4">
              <MessageInput
                disabled={!user}
                placeholder="Reply to thread..."
                onSend={handleSend}
                onTyping={handleTyping}
                replyTo={replyTarget}
                onCancelReply={() => { setReplyTarget(null); handleCloseReplyPanel(); }}
                members={members}
              />
            </div>
          </div>
        </div>
      )}

      {/* Voice Call Overlay */}
      {inVoiceRoom && <VoiceCallOverlay roomName="general" participants={voiceParticipants} isMuted={isMuted} onToggleMute={handleToggleMute} onLeave={handleLeaveVoiceRoom} />}

      {/* Member List Modal */}
      {showMemberList && <MemberListModal members={members} onClose={() => setShowMemberList(false)} />}

      {/* Member Profile Drawer */}
      {(showAvatarProfile || selectedDrawerMember) && (
        <MemberProfileDrawer
          member={showAvatarProfile || selectedDrawerMember}
          currentUserId={user?.uid}
          onClose={() => { setShowAvatarProfile(null); setSelectedDrawerMember(null); }}
          onMessage={(m) => { setReplyTarget(null); document.getElementById('global-chat-message')?.focus(); }}
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
          onClose={() => setShowGamesModal(false)}
          members={members}
          currentUser={user}
          onSendGameCard={async (gameCardData) => {
            try {
              await ChatService.sendMessage({
                roomId: activeRoomId,
                roomType: currentRoom.type,
                senderId: user?.uid,
                senderName: memberName,
                senderRole: memberRole,
                text: `🎮 Started a live ${gameCardData.title} multiplayer match! Click to join on your device!`,
                sharedContent: {
                  type: 'game',
                  title: gameCardData.title,
                  description: gameCardData.description,
                  gameId: gameCardData.gameId,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowPersonalization(false)}>
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Chat settings">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-accent" />
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
                          ? 'border-accent/50 bg-accent/15 text-white'
                          : 'border-border bg-white/5 text-text-muted hover:text-white'
                      }`}
                    >
                      {size === 'small' ? 'A-' : size === 'large' ? 'A+' : 'A'}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-text-muted text-center pt-2">Preferences are stored in Firestore.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowReportModal(false)}>
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Report message">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-status-warning" />
                Report Message
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-muted">Report this message to moderators for review.</p>
              <textarea
                placeholder="Describe the issue..."
                className="w-full rounded-xl border border-border bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-accent/60"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={() => setShowReportModal(false)} className="flex-1 bg-status-danger hover:bg-status-danger/90">Report</Button>
                <Button onClick={() => setShowReportModal(false)} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && forwardMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in" onClick={() => setShowForwardModal(false)}>
          <Card className="w-full max-w-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Forward message">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Forward className="h-5 w-5 text-accent" />
                  Forward Message
                </div>
                <button onClick={() => setShowForwardModal(false)} className="p-1 rounded-lg hover:bg-white/10 transition" aria-label="Close forward">
                  <X className="h-4 w-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-text-muted">Forwarding is not available in single chat mode.</p>
            </CardContent>
          </Card>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out both;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
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
          background: linear-gradient(135deg, #8338ec, #ff006e);
          box-shadow: 0 0 15px rgba(255, 0, 110, 0.4);
          border-color: rgba(255, 0, 110, 0.5);
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
          left: 24px;
        }
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* Modern Glassmorphism & Effects */
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes message-in {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .animate-slide-in-up {
          animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        .animate-message-in {
          animation: message-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        .animate-typing-dot {
          animation: typing-dot 1.4s ease-in-out infinite;
        }

        /* Skeleton Shimmer */
        .skeleton-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }

        /* Toggle Switch */
        .chat-toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          padding: 0;
        }
        .chat-toggle-switch.active {
          background: linear-gradient(135deg, #8338ec, #ff006e);
          box-shadow: 0 0 20px rgba(255, 0, 110, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);
          border-color: rgba(255, 0, 110, 0.5);
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255,255,255,0.1);
        }
        .chat-toggle-switch.active .chat-toggle-thumb {
          left: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255,255,255,0.2);
        }

        /* Glassmorphism */
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .glass-strong {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Message Bubble Enhancements */
        .message-bubble {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .message-bubble:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        /* Button Ripple Effect */
        .btn-ripple {
          position: relative;
          overflow: hidden;
        }
        .btn-ripple::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          opacity: 0;
          transform: scale(0);
          transition: transform 0.5s, opacity 0.3s;
        }
        .btn-ripple:active::after {
          transform: scale(2);
          opacity: 1;
          transition: transform 0s, opacity 0s;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .typing-indicator span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          animation: typing-dot 1.4s ease-in-out infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        /* Reduced Motion */
        .reduce-motion *,
        .reduce-motion *::before,
        .reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* Notification Progress Bar */
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
});

export default ChatPage;
