import { db } from '@services/firebase/config';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { getDatabase, ref as rtdbRef, set as rtdbSet, onValue, remove as rtdbRemove } from 'firebase/database';

const RTDB_IGNORE_PATTERNS = ['/typing/', '/voiceRooms/'];

function isRtdbPermissionIssue(args) {
  const text = args.map(arg => {
    if (typeof arg === 'string') return arg;
    if (arg && typeof arg === 'object') {
      if (typeof arg.message === 'string') return arg.message;
      if (typeof arg.code === 'string') return arg.code;
      try { return JSON.stringify(arg); } catch { return ''; }
    }
    return '';
  }).join(' ').toLowerCase();
  return text.includes('permission_denied') || text.includes('permission-denied');
}

function rtdbShouldIgnore(args) {
  if (!isRtdbPermissionIssue(args)) return false;
  const text = args.join(' ').toLowerCase();
  return RTDB_IGNORE_PATTERNS.some(pattern => text.includes(pattern));
}

const originalWarn = console.warn;
console.warn = (...args) => {
  if (rtdbShouldIgnore(args)) return;
  originalWarn.apply(console, args);
};

const originalError = console.error;
console.error = (...args) => {
  if (rtdbShouldIgnore(args)) return;
  originalError.apply(console, args);
};

export const DEFAULT_CHANNELS = [
  {
    id: 'general',
    name: 'general',
    description: 'Everyday BeastBuck team chat.',
    type: 'public',
    category: 'General',
  },
  {
    id: 'announcements',
    name: 'announcements',
    description: 'Official BeastBuck announcements from leadership.',
    type: 'announcement',
    category: 'Announcements',
  },
  {
    id: 'questions',
    name: 'questions',
    description: 'Ask questions and get answers from the community.',
    type: 'public',
    category: 'Questions',
  },
  {
    id: 'help',
    name: 'help',
    description: 'Get help with BeastBuck platform and features.',
    type: 'public',
    category: 'Help',
  },
  {
    id: 'resources',
    name: 'resources',
    description: 'Share and find useful resources and tools.',
    type: 'public',
    category: 'Resources',
  },
  {
    id: 'ideas',
    name: 'ideas',
    description: 'Invention sparks and new BeastBuck concepts.',
    type: 'public',
    category: 'Ideas',
  },
  {
    id: 'feedback',
    name: 'feedback',
    description: 'Share feedback and suggestions for improvement.',
    type: 'public',
    category: 'Feedback',
  },
  {
    id: 'projects',
    name: 'projects',
    description: 'Project collaboration and updates.',
    type: 'public',
    category: 'Projects',
  },
  {
    id: 'research',
    name: 'research',
    description: 'Research discussions and findings.',
    type: 'public',
    category: 'Research',
  },
  {
    id: 'random',
    name: 'random',
    description: 'Off-topic conversations and casual chat.',
    type: 'public',
    category: 'Random',
  },
  {
    id: 'introductions',
    name: 'introductions',
    description: 'Introduce yourself to the community.',
    type: 'public',
    category: 'Introductions',
  },
  {
    id: 'events',
    name: 'events',
    description: 'Upcoming events and activities.',
    type: 'public',
    category: 'Events',
  },
  {
    id: 'challenges',
    name: 'challenges',
    description: 'Community challenges and competitions.',
    type: 'public',
    category: 'Challenges',
  },
  {
    id: 'media-sharing',
    name: 'media-sharing',
    description: 'Share images, videos, and media content.',
    type: 'public',
    category: 'Media Sharing',
  },
  {
    id: 'career-advice',
    name: 'career-advice',
    description: 'Career guidance and professional advice.',
    type: 'public',
    category: 'Career Advice',
  },
];

export const SUPPORTED_REACTIONS = [
  { key: 'thumbsUp', emoji: '\u{1F44D}', label: 'Thumbs up' },
  { key: 'heart', emoji: '\u2764\uFE0F', label: 'Heart' },
  { key: 'fire', emoji: '\u{1F525}', label: 'Fire' },
  { key: 'party', emoji: '\u{1F389}', label: 'Celebrate' },
  { key: 'smile', emoji: '\u{1F604}', label: 'Smile' },
];

function roomsRef() {
  return collection(db, 'chatRooms');
}

function roomRef(roomId) {
  return doc(db, 'chatRooms', roomId);
}

function messagesRef(roomId) {
  return collection(db, 'chatRooms', roomId, 'messages');
}

function messageRef(roomId, messageId) {
  return doc(db, 'chatRooms', roomId, 'messages', messageId);
}

function normalizeRoomId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function mergeDefaultChannels(snapshotRooms) {
  const roomMap = new Map(DEFAULT_CHANNELS.map(channel => [
    channel.id,
    {
      ...channel,
      createdAt: null,
      archived: false,
      isDefault: true,
    },
  ]));

  for (const room of snapshotRooms) {
    roomMap.set(room.id, {
      ...roomMap.get(room.id),
      ...room,
      archived: room.archived === true,
    });
  }

  return [...roomMap.values()]
    .filter(room => !room.archived)
    .sort((a, b) => {
      const aIndex = DEFAULT_CHANNELS.findIndex(channel => channel.id === a.id);
      const bIndex = DEFAULT_CHANNELS.findIndex(channel => channel.id === b.id);
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }
      return a.name.localeCompare(b.name);
    });
}

function getAnnouncementLink(roomId) {
  return `/chat?room=${encodeURIComponent(roomId)}`;
}

export const ChatService = {
  subscribeToRooms({ onRooms, onError }) {
    const q = query(roomsRef(), orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snap) => {
        const rooms = snap.docs.map(roomDoc => ({
          id: roomDoc.id,
          ...roomDoc.data(),
        }));
        onRooms(mergeDefaultChannels(rooms));
      },
      (error) => {
        onError?.(error);
        onRooms(mergeDefaultChannels([]));
      },
    );
  },

  subscribeToRoomMessages(roomId, { onMessages, onError, messageLimit = 100 }) {
    const q = query(
      messagesRef(roomId),
      orderBy('createdAt', 'asc'),
      limitToLast(messageLimit),
    );

    return onSnapshot(
      q,
      (snap) => {
        const messages = snap.docs.map(messageDoc => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        }));
        onMessages(messages);
      },
      (error) => {
        onError?.(error);
      },
    );
  },

  subscribeToAnnouncements({ onAnnouncements, onError, announcementLimit = 5 }) {
    const q = query(
      messagesRef('announcements'),
      where('announcement', '==', true),
      limit(announcementLimit * 2), // Fetch more to account for filtering
    );

    return onSnapshot(
      q,
      (snap) => {
        const announcements = snap.docs
          .map(messageDoc => ({
            id: messageDoc.id,
            ...messageDoc.data(),
          }))
          .filter(announcement => !announcement.archived)
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return bTime - aTime;
          })
          .slice(0, announcementLimit); // Limit after sorting
        onAnnouncements(announcements);
      },
      (error) => {
        onError?.(error);
      },
    );
  },

  async createChannel({ name, description, type, createdBy }) {
    const roomId = normalizeRoomId(name);

    if (!roomId) {
      throw new Error('Channel name is required.');
    }

    if (!['public', 'announcement'].includes(type)) {
      throw new Error('Unsupported channel type.');
    }

    await setDoc(roomRef(roomId), {
      name: roomId,
      description: description.trim(),
      type,
      createdBy,
      createdAt: serverTimestamp(),
      archived: false,
    });

    return roomId;
  },

  async archiveChannel(roomId) {
    await updateDoc(roomRef(roomId), { archived: true });
  },

  async sendMessage({
    roomId,
    roomType = 'public',
    senderId,
    senderName,
    senderRole,
    text = '',
    attachments = [],
    file = null,
    sharedContent = null,
    replyTo = null,
    mentions = [],
    members = [],
  }) {
    const cleanText = (text || '').trim();

    if (!cleanText && (!attachments || attachments.length === 0) && !file && !sharedContent) {
      throw new Error('Message cannot be empty.');
    }

    const message = {
      senderId,
      senderName,
      senderRole,
      text: cleanText,
      createdAt: serverTimestamp(),
      edited: false,
      deleted: false,
      reactions: {},
      mentions,
    };

    if (attachments && attachments.length > 0) {
      message.attachments = attachments;
    }
    if (file) {
      message.file = file;
    }
    if (sharedContent) {
      message.sharedContent = sharedContent;
    }

    if (roomType === 'announcement') {
      message.announcement = true;
      message.pinned = false;
      message.archived = false;
    }

    if (replyTo) {
      message.replyTo = {
        messageId: replyTo.messageId,
        senderName: replyTo.senderName,
        text: replyTo.text,
      };
    }

    const createdMessageRef = await addDoc(messagesRef(roomId), message);
    const uniqueMentions = mentions.filter((mention, index, all) =>
      mention.uid !== senderId && all.findIndex(item => item.uid === mention.uid) === index
    );

    if (uniqueMentions.length > 0) {
      const batch = writeBatch(db);

      for (const mention of uniqueMentions) {
        const notificationRef = doc(collection(db, 'users', mention.uid, 'notifications'));
        batch.set(notificationRef, {
          type: 'MENTION',
          title: 'You were mentioned',
          message: `${senderName} mentioned you in #${roomId}.`,
          link: getAnnouncementLink(roomId),
          read: false,
          createdAt: serverTimestamp(),
          actorId: senderId,
        });
      }

      await batch.commit();
    }

    if (roomType === 'announcement') {
      const uniqueMembers = members.filter((member, index, all) =>
        member.id !== senderId && all.findIndex(item => item.id === member.id) === index
      );

      if (uniqueMembers.length > 0) {
        const batch = writeBatch(db);

        for (const member of uniqueMembers) {
          const notificationRef = doc(collection(db, 'users', member.id, 'notifications'));
          batch.set(notificationRef, {
            type: 'ANNOUNCEMENT',
            title: 'New announcement',
            message: `${senderName} posted in #${roomId}.`,
            link: getAnnouncementLink(roomId),
            read: false,
            createdAt: serverTimestamp(),
            actorId: senderId,
          });
        }

        await batch.commit();
      }
    }

    return createdMessageRef.id;
  },

  async sendGlobalMessage(payload) {
    return this.sendMessage({ ...payload, roomId: 'general', roomType: 'public' });
  },

  async toggleReaction({ roomId, messageId, reactionKey, userId, hasReacted }) {
    if (!userId) {
      throw new Error('You must be signed in to react.');
    }

    const reaction = SUPPORTED_REACTIONS.find(item => item.key === reactionKey);

    if (!reaction) {
      throw new Error('Unsupported reaction.');
    }

    await updateDoc(messageRef(roomId, messageId), {
      [`reactions.${reactionKey}`]: hasReacted ? arrayRemove(userId) : arrayUnion(userId),
    });
  },

  async updateAnnouncement({ roomId, messageId, pinned, archived }) {
    await updateDoc(messageRef(roomId, messageId), {
      ...(typeof pinned === 'boolean' ? { pinned } : {}),
      ...(typeof archived === 'boolean' ? { archived } : {}),
    });
  },

  // Typing Indicators
  setTypingStatus(roomId, userId, userName, isTyping) {
    const typingRef = rtdbRef(getDatabase(), `typing/${roomId}/${userId}`);
    if (isTyping) {
      rtdbSet(typingRef, {
        userName,
        timestamp: Date.now(),
      }).catch(() => {
        // Ignore typing indicator permission errors
      });
      // Auto-clear after 3 seconds
      setTimeout(() => {
        rtdbRemove(typingRef).catch(() => {});
      }, 3000);
    } else {
      rtdbRemove(typingRef).catch(() => {});
    }
  },

  subscribeToTyping(roomId, callback) {
    const typingRef = rtdbRef(getDatabase(), `typing/${roomId}`);
    return onValue(typingRef, (snapshot) => {
      const typingData = snapshot.val();
      const typingUsers = typingData
        ? Object.entries(typingData)
            .filter(([, data]) => Date.now() - data.timestamp < 3000)
            .map(([userId, data]) => ({ userId, userName: data.userName }))
        : [];
      callback(typingUsers);
    }, (error) => {
      const message = (error?.message || error?.code || '').toLowerCase();
      if (!message.includes('permission')) {
        console.error('Typing subscription failed:', error);
      }
    });
  },

  // WebRTC Voice Room Signaling
  async joinVoiceRoom(roomId, userId, userName) {
    const voiceRef = rtdbRef(getDatabase(), `voiceRooms/${roomId}/participants/${userId}`);
    try {
      await rtdbSet(voiceRef, {
        userName,
        isMuted: false,
        joinedAt: Date.now(),
      });
    } catch (err) {
      const code = err?.code || '';
      if (!code.includes('permission')) {
        console.error('Voice room join failed:', err);
      }
    }
  },

  async leaveVoiceRoom(roomId, userId) {
    const voiceRef = rtdbRef(getDatabase(), `voiceRooms/${roomId}/participants/${userId}`);
    try {
      await rtdbRemove(voiceRef);
    } catch (err) {
      const code = err?.code || '';
      if (!code.includes('permission')) {
        console.error('Voice room leave failed:', err);
      }
    }
  },

  async toggleVoiceMute(roomId, userId, isMuted) {
    const voiceRef = rtdbRef(getDatabase(), `voiceRooms/${roomId}/participants/${userId}`);
    try {
      await rtdbSet(voiceRef, {
        isMuted,
      });
    } catch (err) {
      const code = err?.code || '';
      if (!code.includes('permission')) {
        console.error('Voice mute toggle failed:', err);
      }
    }
  },

  subscribeToVoiceRoom(roomId, callback) {
    const voiceRef = rtdbRef(getDatabase(), `voiceRooms/${roomId}/participants`);
    return onValue(voiceRef, (snapshot) => {
      const participants = snapshot.val();
      callback(participants || {});
    }, (error) => {
      const message = (error?.message || error?.code || '').toLowerCase();
      if (!message.includes('permission')) {
        console.error('Voice room subscription failed:', error);
      }
    });
  },

  // Pinned Messages
  async pinMessage(roomId, messageId, isPinned) {
    try {
      await updateDoc(messageRef(roomId, messageId), { pinned: isPinned });
    } catch (err) {
      console.warn('Pin message permission check:', err?.message || err);
      throw new Error('Only administrators or announcement managers can pin messages.', { cause: err });
    }
  },

  subscribeToPinnedMessages(roomId, callback) {
    const q = query(
      messagesRef(roomId),
      where('pinned', '==', true),
      orderBy('createdAt', 'desc'),
    );
    return onSnapshot(q, (snap) => {
      const pinnedMessages = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(pinnedMessages);
    });
  },

  async editMessage(roomId, messageId, newText) {
    await updateDoc(messageRef(roomId, messageId), {
      text: newText.trim(),
      edited: true,
      editedAt: serverTimestamp(),
    });
  },

  async deleteMessage(roomId, messageId) {
    await updateDoc(messageRef(roomId, messageId), {
      deleted: true,
      deletedAt: serverTimestamp(),
      text: '[Message deleted]',
    });
  },

  async bookmarkMessage(roomId, messageId, isBookmarked) {
    await updateDoc(messageRef(roomId, messageId), {
      bookmarked: isBookmarked,
    });
  },

  async updateDeliveryStatus(roomId, messageId, status) {
    await updateDoc(messageRef(roomId, messageId), {
      deliveryStatus: status,
      ...(status === 'read' ? { readAt: serverTimestamp() } : {}),
    });
  },

  async forwardMessage({ sourceRoomId, messageId, targetRoomId, senderId, senderName, senderRole }) {
    const sourceSnap = await getDoc(messageRef(sourceRoomId, messageId));
    if (!sourceSnap.exists()) throw new Error('Original message not found');

    const original = sourceSnap.data();
    const forwarded = {
      senderId,
      senderName,
      senderRole,
      text: original.text,
      createdAt: serverTimestamp(),
      edited: false,
      deleted: false,
      reactions: {},
      mentions: original.mentions || [],
      replyTo: null,
      forwarded: true,
      originalRoomId: sourceRoomId,
      originalMessageId: messageId,
      originalSenderName: original.senderName,
    };

    await addDoc(messagesRef(targetRoomId), forwarded);
  },

  async shareContent({ roomId, senderId, senderName, senderRole, content }) {
    const message = {
      senderId,
      senderName,
      senderRole,
      text: content.title || 'Shared content',
      createdAt: serverTimestamp(),
      edited: false,
      deleted: false,
      reactions: {},
      mentions: [],
      replyTo: null,
      sharedContent: {
        type: content.type,
        id: content.id,
        title: content.title,
        description: content.description,
        url: content.url,
        icon: content.icon,
      },
    };

    return addDoc(messagesRef(roomId), message);
  },
};
