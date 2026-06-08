import { db } from './config';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
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

export const DEFAULT_CHANNELS = [
  {
    id: 'general',
    name: 'general',
    description: 'Everyday BeastBuck team chat.',
    type: 'public',
  },
  {
    id: 'announcements',
    name: 'announcements',
    description: 'Official BeastBuck announcements from leadership.',
    type: 'announcement',
  },
  {
    id: 'experiments',
    name: 'experiments',
    description: 'Science tests, lab updates, and experiment discoveries.',
    type: 'public',
  },
  {
    id: 'products',
    name: 'products',
    description: 'Product ideas, marketplace work, and launch updates.',
    type: 'public',
  },
  {
    id: 'ideas',
    name: 'ideas',
    description: 'Invention sparks and new BeastBuck concepts.',
    type: 'public',
  },
  {
    id: 'coding',
    name: 'coding',
    description: 'Code, bugs, builds, and developer missions.',
    type: 'public',
  },
  {
    id: 'science',
    name: 'science',
    description: 'Research, questions, and science learning.',
    type: 'public',
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
    text,
    replyTo = null,
    mentions = [],
    members = [],
  }) {
    const cleanText = text.trim();

    if (!cleanText) {
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
};
