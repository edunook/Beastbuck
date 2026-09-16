import { db } from '@services/firebase/config';
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ROLES } from '@shared/constants/roles';

function formatDate(timestamp) {
  if (!timestamp) return 'Recently';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    const diffMins = Math.max(1, Math.floor((now - date) / (1000 * 60)));
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffHours < 48) {
    return 'Yesterday';
  }
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export const ExecutiveNewsService = {
  /**
   * Subscribe to 100% real BeastBuck news, including:
   * 1. Official announcements published by Main CEO or Co-CEO
   * 2. Live Executive role appointments (Co-CEO, Main CEO, Leaders)
   * 3. Verified Audit Logs of leadership transitions
   * 4. High-priority official ecosystem notifications
   */
  subscribeToTopNews({ onNews, onError, maxItems = 15 }) {
    const newsMap = new Map();
    const unsubscribers = [];

    const notifyUpdate = () => {
      const items = Array.from(newsMap.values());
      items.sort((a, b) => {
        const timeA = a.rawDate?.toDate ? a.rawDate.toDate().getTime() : new Date(a.rawDate || 0).getTime();
        const timeB = b.rawDate?.toDate ? b.rawDate.toDate().getTime() : new Date(b.rawDate || 0).getTime();
        return timeB - timeA;
      });
      onNews(items.slice(0, maxItems));
    };

    // 1. Listen to official organization announcements
    try {
      const orgAnnounceRef = collection(db, 'organizationAnnouncements');
      const qOrg = query(orgAnnounceRef, orderBy('createdAt', 'desc'), limit(10));
      const unsubOrg = onSnapshot(
        qOrg,
        (snapshot) => {
          snapshot.docs.forEach((d) => {
            const data = d.data();
            newsMap.set(`org_${d.id}`, {
              id: `org_${d.id}`,
              type: 'ceo_announcement',
              category: 'CEO Announcement',
              title: data.title || 'Executive Platform Announcement',
              content: data.content || '',
              authorName: data.authorName || 'Executive Leadership',
              authorRole: data.authorRole || ROLES.MAIN_CEO,
              authorPhoto: data.authorPhoto || '',
              pinned: Boolean(data.pinned),
              badgeColor: 'from-amber-400 to-yellow-500',
              badgeText: '👑 Executive Dispatch',
              rawDate: data.createdAt,
              dateStr: formatDate(data.createdAt),
              link: '/dashboard',
            });
          });
          notifyUpdate();
        },
        (err) => {
          console.warn('Organization announcements query fallback:', err?.message);
        }
      );
      unsubscribers.push(unsubOrg);
    } catch (e) {
      console.warn('Org announcements listener setup error:', e);
    }

    // 2. Listen to announcements in the chat channel
    try {
      const messagesRef = collection(db, 'rooms', 'announcements', 'messages');
      const qChat = query(messagesRef, orderBy('createdAt', 'desc'), limit(10));
      const unsubChat = onSnapshot(
        qChat,
        (snapshot) => {
          snapshot.docs.forEach((d) => {
            const data = d.data();
            if (data.deleted || data.archived) return;

            const isCeo = data.senderRole === ROLES.MAIN_CEO || data.senderRole === 'Main CEO';
            const isCoCeo = data.senderRole === ROLES.CO_CEO || data.senderRole === 'Co-CEO';

            newsMap.set(`chat_${d.id}`, {
              id: `chat_${d.id}`,
              type: isCeo || isCoCeo ? 'ceo_announcement' : 'official_announcement',
              category: isCeo ? 'Main CEO Announcement' : isCoCeo ? 'Co-CEO Announcement' : 'Official Broadcast',
              title: isCeo ? `Main CEO Announcement: ${data.senderName || 'Leadership'}` : isCoCeo ? `Co-CEO Announcement: ${data.senderName || 'Leadership'}` : (data.title || 'Official Broadcast'),
              content: data.text || data.message || '',
              authorName: data.senderName || 'Leadership',
              authorRole: data.senderRole || ROLES.MAIN_CEO,
              authorPhoto: data.senderPhoto || '',
              pinned: Boolean(data.pinned),
              badgeColor: isCeo ? 'from-amber-400 to-yellow-500' : isCoCeo ? 'from-cyan-400 to-blue-500' : 'from-purple-400 to-pink-500',
              badgeText: isCeo ? '👑 Main CEO' : isCoCeo ? '⚡ Co-CEO' : '📢 Official',
              rawDate: data.createdAt,
              dateStr: formatDate(data.createdAt),
              link: '/chat',
            });
          });
          notifyUpdate();
        },
        (err) => {
          console.warn('Chat announcements listener error:', err?.message);
        }
      );
      unsubscribers.push(unsubChat);
    } catch (e) {
      console.warn('Chat announcements listener setup error:', e);
    }

    // 3. Listen to auditLogs for real Executive and Leadership promotions
    try {
      const auditRef = collection(db, 'auditLogs');
      const qAudit = query(
        auditRef,
        where('type', 'in', ['ROLE_CHANGED', 'CEO_ASSIGNED', 'CEO_SUCCESSION', 'UNIT_CREATED', 'MEMBER_REINSTATED']),
        limit(15)
      );
      const unsubAudit = onSnapshot(
        qAudit,
        (snapshot) => {
          snapshot.docs.forEach((d) => {
            const data = d.data();
            const details = data.details || {};
            const isCoCeoPromo = details.newRole === ROLES.CO_CEO || details.newRole === 'Co-CEO' || data.summary?.includes('Co-CEO');
            const isCeoPromo = data.type === 'CEO_ASSIGNED' || data.type === 'CEO_SUCCESSION' || details.newRole === ROLES.MAIN_CEO || data.summary?.includes('Main CEO');
            const isLeaderPromo = details.newRole === ROLES.LEADER || details.newRole === 'Leader' || data.summary?.includes('Leader');

            let badgeColor = 'from-purple-400 to-cyan-400';
            let badgeText = '⭐ Leadership Update';
            let headlineType = 'leadership_promotion';

            if (isCeoPromo) {
              badgeColor = 'from-amber-400 to-yellow-500';
              badgeText = '👑 Main CEO Appointment';
              headlineType = 'ceo_appointment';
            } else if (isCoCeoPromo) {
              badgeColor = 'from-cyan-400 to-indigo-500';
              badgeText = '⚡ Co-CEO Appointment';
              headlineType = 'co_ceo_appointment';
            } else if (isLeaderPromo) {
              badgeColor = 'from-emerald-400 to-teal-500';
              badgeText = '🛡️ Leadership Rank';
            }

            newsMap.set(`audit_${d.id}`, {
              id: `audit_${d.id}`,
              type: headlineType,
              category: 'Executive Appointment',
              title: data.summary || 'Official Leadership Appointment',
              content: details.reason ? `Official Statement: ${details.reason}` : (data.summary || 'Confirmed official promotion within BeastBuck leadership structure.'),
              authorName: 'Ecosystem Registry',
              authorRole: 'BeastBuck Executive Bureau',
              pinned: isCeoPromo || isCoCeoPromo,
              badgeColor,
              badgeText,
              rawDate: data.createdAt,
              dateStr: formatDate(data.createdAt),
              link: details.newCeoUid ? `/m/${details.newCeoUid}` : '/dashboard',
            });
          });
          notifyUpdate();
        },
        (err) => {
          console.warn('Audit logs listener fallback:', err?.message);
        }
      );
      unsubscribers.push(unsubAudit);
    } catch (e) {
      console.warn('Audit logs listener setup error:', e);
    }

    // 4. Listen to real high-priority system notifications
    try {
      const sysNotifRef = collection(db, 'system_notifications');
      const qSys = query(sysNotifRef, orderBy('createdAt', 'desc'), limit(10));
      const unsubSys = onSnapshot(
        qSys,
        (snapshot) => {
          snapshot.docs.forEach((d) => {
            const data = d.data();
            newsMap.set(`sys_${d.id}`, {
              id: `sys_${d.id}`,
              type: 'system_alert',
              category: data.category || 'Important Update',
              title: data.title || 'Official BeastBuck Notice',
              content: data.message || '',
              authorName: data.actorName || 'BeastBuck System',
              authorRole: 'Verified Broadcast',
              pinned: Boolean(data.priority === 'high' || data.isPinned),
              badgeColor: data.priority === 'high' ? 'from-rose-500 to-amber-500' : 'from-indigo-400 to-purple-500',
              badgeText: data.priority === 'high' ? '🔥 Critical Broadcast' : '🔔 Official Notice',
              rawDate: data.createdAt,
              dateStr: formatDate(data.createdAt),
              link: data.link || '/notifications',
            });
          });
          notifyUpdate();
        },
        (err) => {
          console.warn('System notifications listener fallback:', err?.message);
        }
      );
      unsubscribers.push(unsubSys);
    } catch (e) {
      console.warn('System notifications setup error:', e);
    }

    // 5. Query active leadership users to ensure current Main CEO and Co-CEOs are always represented in the wire
    (async () => {
      try {
        const usersRef = collection(db, 'users');
        const qUsers = query(
          usersRef,
          where('role', 'in', [ROLES.MAIN_CEO, 'Main CEO', ROLES.CO_CEO, 'Co-CEO', ROLES.LEADER, 'Leader']),
          limit(10)
        );
        const usersSnap = await getDocs(qUsers);
        usersSnap.docs.forEach((docSnap) => {
          const u = docSnap.data();
          const isCeo = u.role === ROLES.MAIN_CEO || u.role === 'Main CEO';
          const isCoCeo = u.role === ROLES.CO_CEO || u.role === 'Co-CEO';
          const isLeader = u.role === ROLES.LEADER || u.role === 'Leader';

          const name = u.displayName || u.username || 'Executive Officer';
          const handle = u.username ? `@${u.username}` : '';
          const roleTitle = isCeo ? 'Main CEO' : isCoCeo ? 'Co-CEO' : 'Official Leader';

          const headlineKey = `leader_status_${docSnap.id}`;
          if (!newsMap.has(headlineKey)) {
            newsMap.set(headlineKey, {
              id: headlineKey,
              type: isCeo ? 'ceo_appointment' : isCoCeo ? 'co_ceo_appointment' : 'leadership_promotion',
              category: 'Active Leadership',
              title: isCeo 
                ? `👑 ${name} ${handle ? `(${handle})` : ''} confirmed as Main CEO of BeastBuck`
                : isCoCeo 
                ? `⚡ ${name} ${handle ? `(${handle})` : ''} confirmed as Co-CEO of BeastBuck`
                : `🛡️ ${name} active as Official BeastBuck Leader`,
              content: u.bio || `${name} actively serves as ${roleTitle}, overseeing projects, research labs, and platform operations.`,
              authorName: name,
              authorRole: roleTitle,
              authorPhoto: u.photoURL || u.avatar || '',
              username: u.username,
              uid: docSnap.id,
              pinned: isCeo || isCoCeo,
              badgeColor: isCeo ? 'from-amber-400 to-yellow-500' : isCoCeo ? 'from-cyan-400 to-blue-500' : 'from-emerald-400 to-teal-500',
              badgeText: isCeo ? '👑 Main CEO' : isCoCeo ? '⚡ Co-CEO' : '🛡️ Leader',
              rawDate: u.promotedAt || u.updatedAt || u.createdAt || new Date(),
              dateStr: formatDate(u.promotedAt || u.updatedAt || u.createdAt),
              link: u.username ? `/m/${u.username}` : '/dashboard',
            });
          }
        });
        notifyUpdate();
      } catch (err) {
        console.warn('Leadership users query warning:', err?.message);
      }
    })();

    return () => {
      unsubscribers.forEach((unsub) => {
        try {
          if (typeof unsub === 'function') unsub();
        } catch (e) {}
      });
    };
  },

  /**
   * Publish an official executive announcement / top headline (CEO/Co-CEO only)
   */
  async publishExecutiveHeadline({ title, content, user, roleData, pinned = true }) {
    if (!title || !content) {
      throw new Error('Title and content are required for an executive headline.');
    }

    const isCeo = roleData?.role === ROLES.MAIN_CEO || roleData?.role === 'Main CEO';
    const isCoCeo = roleData?.role === ROLES.CO_CEO || roleData?.role === 'Co-CEO';

    if (!isCeo && !isCoCeo) {
      throw new Error('Only the Main CEO or Co-CEO can publish verified executive headlines.');
    }

    const authorName = user?.displayName || roleData?.username || 'Executive Officer';
    const authorRole = isCeo ? ROLES.MAIN_CEO : ROLES.CO_CEO;

    // 1. Save to organization announcements
    const orgAnnounceRef = collection(db, 'organizationAnnouncements');
    const docRef = await addDoc(orgAnnounceRef, {
      title: title.trim(),
      content: content.trim(),
      pinned: Boolean(pinned),
      authorId: user?.uid,
      authorName,
      authorRole,
      authorPhoto: user?.photoURL || roleData?.avatar || '',
      createdAt: serverTimestamp(),
    });

    // 2. Also broadcast to system_notifications for real-time visibility across users
    try {
      const sysNotifRef = collection(db, 'system_notifications');
      await addDoc(sysNotifRef, {
        title: `Executive Headline: ${title.trim()}`,
        message: content.trim(),
        type: 'EXECUTIVE_BROADCAST',
        category: 'Executive Dispatch',
        actorName: authorName,
        actorId: user?.uid,
        priority: 'high',
        isPinned: Boolean(pinned),
        link: '/dashboard',
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Could not post to system_notifications (non-fatal):', e);
    }

    // 3. Log to auditLogs
    try {
      const auditRef = collection(db, 'auditLogs');
      await addDoc(auditRef, {
        type: 'EXECUTIVE_HEADLINE_PUBLISHED',
        actorId: user?.uid,
        summary: `Executive headline published: "${title.trim()}"`,
        details: {
          title: title.trim(),
          role: authorRole,
          announcementId: docRef.id,
        },
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('Could not log headline audit (non-fatal):', e);
    }

    return docRef.id;
  },
};
