import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ChatService, DEFAULT_CHANNELS } from '../../services/firebase/chat';
import { UsersService } from '../../services/firebase/users';
import { hasPermission } from '../../services/firebase/permissions';
import { ChannelSidebar } from './ChannelSidebar';
import { ChatHeader } from './ChatHeader';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';

const ChatPage = React.memo(function ChatPage() {
  const { user, roleData } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRoomId = searchParams.get('room') || 'general';
  const [rooms, setRooms] = useState(DEFAULT_CHANNELS.map(channel => ({
    ...channel,
    archived: false,
    isDefault: true,
  })));
  const [activeRoomId, setActiveRoomId] = useState(initialRoomId);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);
  const [members, setMembers] = useState([]);
  const memberName = roleData?.displayName || roleData?.username || user?.displayName || 'Member';
  const memberRole = roleData?.role || 'Member';
  const activeRoom = rooms.find(room => room.id === activeRoomId) || rooms[0];
  const canCreateAnnouncements = hasPermission(memberRole, 'canCreateAnnouncements');
  const canManageChannels = hasPermission(memberRole, 'canManageChannels');
  const canManageAnnouncements = hasPermission(memberRole, 'canManageAnnouncements');
  const isAnnouncementRoom = activeRoom?.type === 'announcement';
  const canSendInRoom = !!user && (!isAnnouncementRoom || canCreateAnnouncements);

  const sender = useMemo(() => ({
    senderId: user?.uid,
    senderName: memberName,
    senderRole: memberRole,
  }), [memberName, memberRole, user?.uid]);

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToRooms({
      onRooms: (nextRooms) => {
        setRooms(nextRooms);
        if (!nextRooms.some(room => room.id === activeRoomId)) {
          setLoading(true);
          setMessages([]);
          setReplyTarget(null);
          setActiveRoomId(nextRooms[0]?.id || 'general');
        }
      },
      onError: (err) => {
        console.error('Channel listener failed:', err);
        setError('Could not load channel list. Default channels are still available.');
      },
    });

    return () => unsubscribe();
  }, [activeRoomId]);

  useEffect(() => {
    const unsubscribe = ChatService.subscribeToRoomMessages(activeRoomId, {
      onMessages: (nextMessages) => {
        setMessages(nextMessages.filter(message => !message.archived));
        setLoading(false);
      },
      onError: (err) => {
        console.error('Channel message listener failed:', err);
        setError('Could not load this channel. Check Firestore permissions and try again.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [activeRoomId]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextParams.get('room') !== activeRoomId) {
      nextParams.set('room', activeRoomId);
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeRoomId, searchParams, setSearchParams]);

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

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSend = async (text, mentions = []) => {
    setError(null);
    try {
      await ChatService.sendMessage({
        roomId: activeRoomId,
        roomType: activeRoom?.type || 'public',
        ...sender,
        text,
        replyTo: replyTarget,
        mentions,
        members,
      });
      setReplyTarget(null);
    } catch (err) {
      console.error('Channel message send failed:', err);
      setError('Message could not be sent. Please try again.');
    }
  };

  const handleReply = (message) => {
    setReplyTarget({
      messageId: message.id,
      senderName: message.senderName || 'Member',
      text: message.text,
    });
  };

  const handleToggleReaction = async (message, reactionKey, hasReacted) => {
    if (!user?.uid) return;

    setError(null);
    try {
      await ChatService.toggleReaction({
        roomId: activeRoomId,
        messageId: message.id,
        reactionKey,
        userId: user.uid,
        hasReacted,
      });
    } catch (err) {
      console.error('Global chat reaction failed:', err);
      setError('Reaction could not be updated. Please try again.');
    }
  };

  const handleSelectRoom = (roomId) => {
    setError(null);
    setLoading(true);
    setMessages([]);
    setReplyTarget(null);
    setActiveRoomId(roomId);
  };

  const handleCreateChannel = async ({ name, description, type }) => {
    setError(null);
    try {
      const roomId = await ChatService.createChannel({
        name,
        description,
        type,
        createdBy: user.uid,
      });
      setActiveRoomId(roomId);
    } catch (err) {
      console.error('Channel create failed:', err);
      setError('Channel could not be created. CEO or Co-CEO access is required.');
    }
  };

  const handleArchiveChannel = async (roomId) => {
    setError(null);
    try {
      await ChatService.archiveChannel(roomId);
      if (roomId === activeRoomId) setActiveRoomId('general');
    } catch (err) {
      console.error('Channel archive failed:', err);
      setError('Channel could not be archived. CEO or Co-CEO access is required.');
    }
  };

  const handleTogglePin = async (message) => {
    setError(null);
    try {
      await ChatService.updateAnnouncement({
        roomId: activeRoomId,
        messageId: message.id,
        pinned: !message.pinned,
      });
    } catch (err) {
      console.error('Announcement pin failed:', err);
      setError('Announcement could not be updated. CEO or Co-CEO access is required.');
    }
  };

  const handleArchiveAnnouncement = async (message) => {
    setError(null);
    try {
      await ChatService.updateAnnouncement({
        roomId: activeRoomId,
        messageId: message.id,
        archived: true,
      });
    } catch (err) {
      console.error('Announcement archive failed:', err);
      setError('Announcement could not be archived. CEO or Co-CEO access is required.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-1rem)] min-h-[620px] w-full flex-col p-2 md:h-[calc(100vh-2rem)] md:p-4">
      <section className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-2xl md:flex-row">
        <ChannelSidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          canManageChannels={canManageChannels}
          onSelectRoom={handleSelectRoom}
          onCreateChannel={handleCreateChannel}
          onArchiveChannel={handleArchiveChannel}
        />

        <div className="flex min-h-0 flex-1 flex-col">
          <ChatHeader
            room={activeRoom}
            memberName={memberName}
            memberRole={memberRole}
            canSend={canSendInRoom}
          />

          {error && (
            <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger md:mx-5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <MessageList
            messages={messages}
            loading={loading}
            currentUserId={user?.uid}
            roomName={activeRoom?.name}
            isAnnouncementRoom={isAnnouncementRoom}
            canManageAnnouncements={canManageAnnouncements}
            onReply={handleReply}
            onToggleReaction={handleToggleReaction}
            onTogglePin={handleTogglePin}
            onArchiveAnnouncement={handleArchiveAnnouncement}
          />

          <MessageInput
            disabled={!user}
            readOnlyReason={isAnnouncementRoom && !canCreateAnnouncements ? 'Only leaders and CEOs can post announcements.' : ''}
            placeholder={isAnnouncementRoom ? 'Post an announcement...' : `Message #${activeRoom?.name || 'general'}...`}
            onSend={handleSend}
            replyTo={replyTarget}
            onCancelReply={() => setReplyTarget(null)}
            members={members}
          />
        </div>
      </section>
    </div>
  );
});

export default ChatPage;
