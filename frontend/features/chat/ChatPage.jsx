import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { AlertCircle, X, Pin, Settings, Flag, Sparkles, Hash, Megaphone } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ChatService, DEFAULT_CHANNELS } from '@services/firestore/chat';
import { UsersService } from '@services/firestore/users';
import { hasPermission } from '@shared/permissions/permissions';
import { ChatHeader, MemberListModal } from './ChatHeader';
import { ChannelSidebar } from './ChannelSidebar';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { ChatNotificationCenter } from './ChatNotifications';
import { MediaHub } from './MediaHub';
import { MemberProfileDrawer } from './MemberProfileDrawer';

const ChatPage = React.memo(function ChatPage() {
  const { user, roleData } = useAuth();

  const [rooms, setRooms] = useState(DEFAULT_CHANNELS);
  const [activeRoomId, setActiveRoomId] = useState('general');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [members, setMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showSidebarMobile, setShowSidebarMobile] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showMediaHub, setShowMediaHub] = useState(false);
  const [selectedDrawerMember, setSelectedDrawerMember] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  
  // Search in channel
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Lightbox Media Viewer
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [mediaViewerSrc, setMediaViewerSrc] = useState(null);

  // Chat Settings
  const [chatSettings, setChatSettings] = useState({
    fontSize: 'medium',
    compactMode: false,
  });

  const messageListRef = useRef(null);

  const memberName = roleData?.displayName || roleData?.username || user?.displayName || 'Member';
  const memberRole = roleData?.role || 'Member';
  const canManageAnnouncements = hasPermission(memberRole, 'canManageAnnouncements') || memberRole === 'Leader' || memberRole === 'Admin' || memberRole === 'Main CEO' || memberRole === 'Co-CEO';
  const canManageChannels = canManageAnnouncements;

  const currentRoom = useMemo(() => {
    return rooms.find(r => r.id === activeRoomId) || { id: activeRoomId, name: activeRoomId, type: 'public', description: 'BeastBuck channel' };
  }, [rooms, activeRoomId]);

  // Load rooms from Firestore
  useEffect(() => {
    const unsubscribe = ChatService.subscribeToRooms({
      onRooms: (nextRooms) => {
        if (nextRooms && nextRooms.length > 0) {
          setRooms(nextRooms);
        }
      },
      onError: (err) => {
        console.warn('Channels subscription error, using defaults:', err);
      }
    });
    return () => unsubscribe?.();
  }, []);

  // Load messages for active channel
  useEffect(() => {
    setLoading(true);
    setError(null);
    setSearchQuery('');
    setShowSearch(false);
    
    const unsubscribe = ChatService.subscribeToRoomMessages(activeRoomId, {
      onMessages: (nextMessages) => {
        setMessages(nextMessages.filter(m => !m.archived && !m.deleted));
        setLoading(false);
      },
      onError: (err) => {
        console.error('Room messages listener error:', err);
        setError('Could not load channel messages.');
        setLoading(false);
      },
    });

    return () => unsubscribe?.();
  }, [activeRoomId]);

  // Load assignable members
  useEffect(() => {
    let cancelled = false;
    async function loadMembers() {
      try {
        const assignableMembers = await UsersService.getAssignableMembers();
        if (!cancelled && assignableMembers) setMembers(assignableMembers);
      } catch (err) {
        console.warn('Member mention list error:', err);
      }
    }
    loadMembers();
    return () => { cancelled = true; };
  }, []);

  // Subscribe to typing in active channel
  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = ChatService.subscribeToTyping(activeRoomId, (users) => {
      setTypingUsers((users || []).filter(u => u.userId !== user.uid));
    });
    return () => unsubscribe?.();
  }, [activeRoomId, user?.uid]);

  // Load pinned messages when modal opens or messages change
  const currentPinnedMessages = useMemo(() => {
    return messages.filter(m => m.pinned);
  }, [messages]);

  const allMessages = useMemo(() => {
    const combined = [...messages];
    optimisticMessages.forEach(opt => {
      if (opt.roomId === activeRoomId && !messages.find(m => m.id === opt.id)) {
        combined.push(opt);
      }
    });
    return combined;
  }, [messages, optimisticMessages, activeRoomId]);

  const addNotification = useCallback((notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = {
      id,
      timestamp: Date.now(),
      autoClose: true,
      duration: 4000,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 5));
    return id;
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowPinnedModal(false);
        setShowSettings(false);
        setShowReportModal(false);
        setSelectedDrawerMember(null);
        setShowMemberList(false);
        setShowMediaHub(false);
        setShowMediaViewer(false);
        setShowSidebarMobile(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = async (text, mentions = [], attachments = []) => {
    setError(null);
    const payload = {
      id: `temp-${Date.now()}`,
      roomId: activeRoomId,
      roomType: currentRoom?.type || 'public',
      senderId: user?.uid,
      senderName: memberName,
      senderRole: memberRole,
      text,
      mentions,
      createdAt: new Date(),
      edited: false,
      deleted: false,
      reactions: {},
      attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type, url: a.url, isVoiceNote: a.isVoiceNote })),
      replyTo: replyTarget ? { messageId: replyTarget.id, senderName: replyTarget.senderName, text: replyTarget.text } : null,
    };

    setOptimisticMessages(prev => [...prev, payload]);
    setReplyTarget(null);

    try {
      await ChatService.sendMessage({
        roomId: activeRoomId,
        roomType: currentRoom?.type || 'public',
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
        ChatService.setTypingStatus(activeRoomId, user.uid, memberName, false);
      }
    } catch (err) {
      console.error('Chat message send failed:', err);
      setOptimisticMessages(prev => prev.filter(m => m.id !== payload.id));
      const messageText = (err?.message || '').toLowerCase();
      if (messageText.includes('permission') || messageText.includes('insufficient')) {
        setError('You do not have permission to send messages in this channel.');
      } else {
        setError('Failed to send message. Please check your connection.');
      }
    }
  };

  const handleSelectRoom = (roomId) => {
    setActiveRoomId(roomId);
    setReplyTarget(null);
    setShowSidebarMobile(false);
  };

  const handleCreateChannel = async ({ name, description, type }) => {
    try {
      const newRoomId = await ChatService.createChannel({
        name,
        description,
        type,
        createdBy: user?.uid,
      });
      setActiveRoomId(newRoomId);
      addNotification({
        type: 'system',
        title: 'Channel Created',
        message: `#${name} is now live.`,
      });
    } catch (err) {
      console.error('Create channel failed:', err);
      setError(err?.message || 'Failed to create channel.');
    }
  };

  const handleArchiveChannel = async (roomId) => {
    try {
      await ChatService.archiveChannel(roomId);
      if (activeRoomId === roomId) {
        setActiveRoomId('general');
      }
      addNotification({
        type: 'system',
        title: 'Channel Archived',
        message: `#${roomId} has been archived.`,
      });
    } catch (err) {
      console.error('Archive channel failed:', err);
    }
  };

  const handleTyping = useCallback((isTyping) => {
    if (!user?.uid || !memberName) return;
    try {
      ChatService.setTypingStatus(activeRoomId, user.uid, memberName, isTyping);
    } catch {
      // Ignore typing errors
    }
  }, [activeRoomId, user?.uid, memberName]);

  const handleReply = useCallback((message) => {
    setReplyTarget(message);
    document.getElementById('global-chat-message')?.focus();
  }, []);

  const handleToggleReaction = useCallback(async (messageTarget, reactionKey, isUserActive) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId) return;
    try {
      await ChatService.toggleReaction({
        roomId: activeRoomId,
        messageId: msgId,
        reactionKey,
        userId: user.uid,
        hasReacted: isUserActive,
      });
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  }, [activeRoomId, user?.uid]);

  const handleTogglePin = useCallback(async (messageTarget) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    const isPinned = typeof messageTarget === 'object' ? !messageTarget?.pinned : true;
    if (!msgId) return;
    try {
      await ChatService.pinMessage(activeRoomId, msgId, isPinned);
      addNotification({
        type: 'pin',
        title: isPinned ? 'Message Pinned' : 'Message Unpinned',
        message: isPinned ? 'Pinned message in this channel.' : 'Removed pin.',
      });
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  }, [activeRoomId, user?.uid, addNotification]);

  const handleEdit = useCallback(async (messageTarget, newText) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId || !newText?.trim()) return;
    try {
      await ChatService.editMessage(activeRoomId, msgId, newText.trim());
    } catch (error) {
      console.error('Failed to edit message:', error);
      setError('Failed to edit message.');
    }
  }, [activeRoomId, user?.uid]);

  const handleDelete = useCallback(async (messageTarget) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    if (!msgId) return;
    try {
      await ChatService.deleteMessage(activeRoomId, msgId);
      addNotification({
        type: 'system',
        title: 'Message Deleted',
        message: 'The message was permanently removed.',
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError('Failed to delete message.');
    }
  }, [activeRoomId, user?.uid, addNotification]);

  const handleBookmark = useCallback(async (messageTarget) => {
    if (!user?.uid) return;
    const msgId = typeof messageTarget === 'object' ? messageTarget?.id : messageTarget;
    const isBookmarked = typeof messageTarget === 'object' ? !messageTarget?.bookmarked : true;
    if (!msgId) return;
    try {
      await ChatService.bookmarkMessage(activeRoomId, msgId, isBookmarked);
      addNotification({
        type: 'system',
        title: isBookmarked ? 'Bookmarked' : 'Bookmark Removed',
        message: isBookmarked ? 'Saved to bookmarks.' : 'Removed from bookmarks.',
      });
    } catch (error) {
      console.error('Failed to bookmark message:', error);
    }
  }, [activeRoomId, user?.uid, addNotification]);

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
        roomId: activeRoomId,
        reportedBy: user.uid,
        reporterName: memberName,
        reason: reportReason.trim() || 'Flagged for moderation review',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      addNotification({
        type: 'system',
        title: 'Report Submitted',
        message: 'Moderators will review this message.',
      });
      setShowReportModal(false);
      setReportMessage(null);
    } catch (error) {
      console.error('Failed to report message:', error);
      setShowReportModal(false);
    }
  }, [user?.uid, reportMessage, activeRoomId, memberName, reportReason, addNotification]);

  const handleMediaOpen = useCallback((url) => {
    setMediaViewerSrc(url);
    setShowMediaViewer(true);
  }, []);

  const handleMediaClose = useCallback(() => {
    setShowMediaViewer(false);
    setMediaViewerSrc(null);
  }, []);

  return (
    <div className="flex h-[calc(100dvh-4rem-5rem)] md:h-[calc(100dvh-4.5rem)] w-full flex-col p-0 md:p-3 overflow-hidden select-none">
      
      {/* Outer Shell Glass Container */}
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden rounded-none md:rounded-3xl border-0 md:border border-white/10 bg-slate-950/90 shadow-2xl backdrop-blur-3xl">
        
        {/* Left: Desktop Channel Sidebar */}
        <div className="hidden md:flex w-64 lg:w-72 shrink-0 h-full">
          <ChannelSidebar
            rooms={rooms}
            activeRoomId={activeRoomId}
            canManageChannels={canManageChannels}
            onSelectRoom={handleSelectRoom}
            onCreateChannel={handleCreateChannel}
            onArchiveChannel={handleArchiveChannel}
          />
        </div>

        {/* Mobile Channel Drawer */}
        {showSidebarMobile && (
          <div 
            className="fixed inset-0 z-50 flex md:hidden bg-black/70 backdrop-blur-md animate-fade-in"
            onClick={() => setShowSidebarMobile(false)}
          >
            <div 
              className="w-4/5 max-w-xs h-full bg-slate-950 shadow-2xl animate-slide-right"
              onClick={(e) => e.stopPropagation()}
            >
              <ChannelSidebar
                rooms={rooms}
                activeRoomId={activeRoomId}
                canManageChannels={canManageChannels}
                onSelectRoom={handleSelectRoom}
                onCreateChannel={handleCreateChannel}
                onArchiveChannel={handleArchiveChannel}
                onCloseMobile={() => setShowSidebarMobile(false)}
              />
            </div>
          </div>
        )}

        {/* Center: Main Conversation Area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950">
          
          {/* Header */}
          <ChatHeader
            currentRoom={currentRoom}
            memberName={memberName}
            memberRole={memberRole}
            onToggleSidebar={() => setShowSidebarMobile(prev => !prev)}
            onShowPinned={() => setShowPinnedModal(true)}
            pinnedCount={currentPinnedMessages.length}
            onShowMedia={() => setShowMediaHub(true)}
            onShowMembers={() => setShowMemberList(true)}
            memberCount={members.length}
            onShowSettings={() => setShowSettings(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showSearch={showSearch}
            onToggleSearch={() => {
              setShowSearch(prev => !prev);
              if (showSearch) setSearchQuery('');
            }}
          />

          {/* Error Banner */}
          {error && (
            <div className="mx-3 mt-2 flex items-center justify-between gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2 text-xs text-red-300 animate-fade-in shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span className="truncate">{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Message List */}
          <MessageList
            ref={messageListRef}
            messages={allMessages}
            loading={loading}
            currentUserId={user?.uid}
            currentRoom={currentRoom}
            canManageAnnouncements={canManageAnnouncements}
            onReply={handleReply}
            onToggleReaction={handleToggleReaction}
            onTogglePin={handleTogglePin}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onBookmark={handleBookmark}
            onShowProfile={(senderId, senderName) => setSelectedDrawerMember({ id: senderId, displayName: senderName, role: 'Member' })}
            onMediaOpen={handleMediaOpen}
            onReport={handleReportPrompt}
            searchQuery={searchQuery}
            typingUsers={typingUsers}
          />

          {/* Message Input Composer */}
          <MessageInput
            disabled={!user}
            readOnlyReason=""
            placeholder={`Message #${currentRoom?.name || 'channel'}...`}
            onSend={handleSend}
            onTyping={handleTyping}
            replyTo={replyTarget}
            onCancelReply={() => setReplyTarget(null)}
            members={members}
          />
        </div>

      </div>

      {/* Full-screen Lightbox Media Viewer */}
      {showMediaViewer && mediaViewerSrc && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center animate-fade-in p-4" 
          onClick={handleMediaClose}
        >
          <button 
            onClick={handleMediaClose} 
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-50" 
            aria-label="Close media preview"
          >
            <X className="h-6 w-6" />
          </button>
          {mediaViewerSrc.match(/\.(mp4|webm|mov)$/i) ? (
            <video 
              src={mediaViewerSrc} 
              controls 
              autoPlay 
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          ) : (
            <img 
              src={mediaViewerSrc} 
              alt="Full size view" 
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />
          )}
        </div>
      )}

      {/* Pinned Messages Modal */}
      {showPinnedModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" 
          onClick={() => setShowPinnedModal(false)}
        >
          <Card 
            className="max-w-xl w-full max-h-[80vh] overflow-hidden rounded-2xl border-white/15 bg-slate-950 shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="border-b border-white/10 pb-3">
              <CardTitle className="flex items-center justify-between text-white text-base">
                <div className="flex items-center gap-2">
                  <Pin className="h-4 w-4 text-amber-400" />
                  <span>Pinned in #{currentRoom?.name || 'channel'}</span>
                </div>
                <button 
                  onClick={() => setShowPinnedModal(false)} 
                  className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[60vh] p-4 space-y-2.5 custom-scrollbar">
              {currentPinnedMessages.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40">
                    <Pin className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-white/50">No pinned messages in this channel</p>
                </div>
              ) : (
                currentPinnedMessages.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-indigo-400 text-xs">{msg.senderName || 'Member'}</span>
                      {canManageAnnouncements && (
                        <button
                          onClick={() => handleTogglePin(msg)}
                          className="text-[10px] text-amber-400/80 hover:text-amber-300 font-semibold"
                        >
                          Unpin
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-white leading-relaxed">{msg.text}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
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

      {/* Member List Modal */}
      {showMemberList && (
        <MemberListModal 
          members={members} 
          onClose={() => setShowMemberList(false)} 
        />
      )}

      {/* Member Profile Drawer */}
      {selectedDrawerMember && (
        <MemberProfileDrawer
          member={selectedDrawerMember}
          currentUserId={user?.uid}
          onClose={() => setSelectedDrawerMember(null)}
          onMessage={() => { 
            setSelectedDrawerMember(null); 
            document.getElementById('global-chat-message')?.focus(); 
          }}
          onMention={(name) => {
            const input = document.getElementById('global-chat-message');
            if (input) {
              input.value = (input.value + ` @${name} `).trim();
              input.focus();
            }
          }}
        />
      )}

      {/* Chat Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" 
          onClick={() => setShowSettings(false)}
        >
          <Card 
            className="w-full max-w-sm rounded-2xl border-white/15 bg-slate-950 shadow-2xl p-5" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Chat Preferences</h3>
              </div>
              <button onClick={() => setShowSettings(false)} className="p-1 rounded-lg text-white/60 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Compact Message Mode</span>
                <button 
                  onClick={() => setChatSettings(s => ({ ...s, compactMode: !s.compactMode }))}
                  className={`relative w-10 h-5 rounded-full transition ${chatSettings.compactMode ? 'bg-indigo-600' : 'bg-white/20'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition transform ${chatSettings.compactMode ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <div>
                <span className="text-xs font-semibold text-white block mb-2">Message Font Size</span>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => setChatSettings(s => ({ ...s, fontSize: size }))}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize transition ${
                        chatSettings.fontSize === size
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-white/40 text-center pt-2">Preferences are active in real time.</p>
            </div>
          </Card>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" 
          onClick={() => setShowReportModal(false)}
        >
          <Card 
            className="w-full max-w-sm rounded-2xl border-white/15 bg-slate-950 shadow-2xl p-5" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-white mb-3">
              <Flag className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold">Report Message</h3>
            </div>
            <p className="text-xs text-white/70 mb-3">
              Flag this message to BeastBuck moderators for community safety review.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue or violation..."
              className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 mb-4"
              rows={3}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleReportSubmit} 
                className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-1.5"
              >
                Submit Report
              </Button>
              <button 
                onClick={() => setShowReportModal(false)} 
                className="flex-1 px-3 py-1.5 rounded-xl border border-white/15 text-xs text-white/70 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Realtime Toasts */}
      <ChatNotificationCenter
        notifications={notifications}
        onClose={(id) => dismissNotification(id)}
        onNotificationClick={(n) => dismissNotification(n.id)}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.22); }
      `}</style>
    </div>
  );
});

export default ChatPage;
