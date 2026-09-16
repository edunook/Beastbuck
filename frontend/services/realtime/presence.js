import { ref, onValue, onDisconnect, set, serverTimestamp, get } from 'firebase/database';
import { collection, doc, setDoc, onSnapshot, getDoc, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';
import { rtdb, db } from '@services/firebase/config';
import { errorHandler } from '@shared/utils/errorHandler';
import { PERMISSIONS } from '@shared/permissions/permissions';

export const PRESENCE_STATES = [
  'online',
  'offline',
  'away',
  'busy',
  'inMeeting',
  'inCall',
  'presenting',
  'researching',
  'building',
  'learning',
  'coding',
  'inventing',
  'collaborating',
];

export const PRESENCE_COLORS = {
  online: 'bg-status-success',
  away: 'bg-yellow-400',
  busy: 'bg-status-danger',
  inMeeting: 'bg-purple-500',
  inCall: 'bg-blue-500',
  presenting: 'bg-purple-400',
  collaborating: 'bg-blue-400',
  researching: 'bg-cyan-400',
  building: 'bg-orange-400',
  learning: 'bg-indigo-400',
  coding: 'bg-emerald-400',
  inventing: 'bg-pink-400',
  offline: 'bg-text-muted',
};

export const PRESENCE_LABELS = {
  online: 'Online',
  offline: 'Offline',
  away: 'Away',
  busy: 'Busy',
  inMeeting: 'In meeting',
  inCall: 'In call',
  presenting: 'Presenting',
  collaborating: 'Collaborating',
  researching: 'Researching',
  building: 'Building',
  learning: 'Learning',
  coding: 'Coding',
  inventing: 'Inventing',
};

let lastPresenceWrite = 0;
const PRESENCE_THROTTLE_MS = 3000;

function rtdbStatusRef(uid) {
  return ref(rtdb, `/status/${uid}`);
}

function rtdbPresenceRef(uid) {
  return ref(rtdb, `/presence/${uid}`);
}

export const PresenceService = {
  getPresenceColor(state) {
    return PRESENCE_COLORS[state] || PRESENCE_COLORS.offline;
  },

  getPresenceLabel(state) {
    return PRESENCE_LABELS[state] || 'Offline';
  },

  /**
   * Initialize RTDB online/offline + Firestore presence doc on login.
   */
  initializePresence(uid, profile = {}) {
    if (!uid) return () => {};

    const connectedRef = ref(rtdb, '.info/connected');
    const statusRef = rtdbStatusRef(uid);
    const richRef = rtdbPresenceRef(uid);

    const unsub = onValue(connectedRef, (snap) => {
      if (snap.val() !== true) return;

      const basePayload = {
        state: 'online',
        displayName: profile.displayName || profile.username || 'Member',
        avatar: profile.avatar || '',
        role: profile.role || 'user',
        membershipStatus: profile.membershipStatus || 'pending',
        suspended: profile.suspended || false,
        accountStatus: profile.accountStatus || 'active',
        last_changed: serverTimestamp(),
      };

      onDisconnect(statusRef).set({
        state: 'offline',
        last_changed: serverTimestamp(),
      }).catch(err => errorHandler.warn('Presence onDisconnect status error', 'Presence Status', { error: err.message }));

      onDisconnect(richRef).set({
        ...basePayload,
        state: 'offline',
        activity: '',
      }).catch(err => errorHandler.warn('Presence onDisconnect rich error', 'Presence Rich', { error: err.message }));

      set(statusRef, basePayload).catch(err => errorHandler.warn('Presence set status error', 'Presence Set Status', { error: err.message }));
      set(richRef, {
        ...basePayload,
        activity: profile.activity || '',
        activeWorkspace: profile.activeWorkspace || null,
        activeProject: profile.activeProject || null,
      }).catch(err => errorHandler.warn('Presence set rich error', 'Presence Set Rich', { error: err.message }));

      setDoc(
        doc(db, 'presence', uid),
        {
          uid,
          state: 'online',
          displayName: basePayload.displayName,
          avatar: basePayload.avatar,
          role: basePayload.role,
          membershipStatus: basePayload.membershipStatus,
          suspended: basePayload.suspended,
          accountStatus: basePayload.accountStatus,
          activity: '',
          activeWorkspace: null,
          activeProject: null,
          activeDepartment: null,
          activeLab: null,
          lastSeen: firestoreTimestamp(),
          updatedAt: firestoreTimestamp(),
        },
        { merge: true }
      ).catch(err => errorHandler.warn('Presence Firestore not accessible', 'Presence Firestore', { error: err.message }));
    });

    return () => {
      unsub();
      set(statusRef, { state: 'offline', last_changed: serverTimestamp() }).catch(() => {});
    };
  },

  /**
   * Throttled presence context update (workspace, project, activity).
   */
  async updatePresenceContext(uid, context = {}) {
    if (!uid) return;
    const now = Date.now();
    if (now - lastPresenceWrite < PRESENCE_THROTTLE_MS && !context.force) return;
    lastPresenceWrite = now;

    const { state, activity, activeWorkspace, activeProject, activeDepartment, activeLab } = context;

    try {
      const richRef = rtdbPresenceRef(uid);
      const current = (await get(richRef)).val() || {};
      await set(richRef, {
        ...current,
        ...(state ? { state } : {}),
        ...(activity !== undefined ? { activity } : {}),
        ...(activeWorkspace !== undefined ? { activeWorkspace } : {}),
        ...(activeProject !== undefined ? { activeProject } : {}),
        last_changed: serverTimestamp(),
      });
    } catch (err) {
      errorHandler.warn('RTDB update failed', 'Presence RTDB Update', { error: err.message });
    }

    try {
      await setDoc(
        doc(db, 'presence', uid),
        {
          ...(state ? { state } : {}),
          ...(activity !== undefined ? { activity } : {}),
          ...(activeWorkspace !== undefined ? { activeWorkspace } : {}),
          ...(activeProject !== undefined ? { activeProject } : {}),
          ...(activeDepartment !== undefined ? { activeDepartment } : {}),
          ...(activeLab !== undefined ? { activeLab } : {}),
          lastSeen: firestoreTimestamp(),
          updatedAt: firestoreTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      errorHandler.warn('Firestore presence update failed', 'Presence Firestore Update', { error: err?.message || err });
    }
  },

  async setPresenceState(uid, state, extra = {}) {
    return this.updatePresenceContext(uid, { state, force: true, ...extra });
  },

  subscribeToPresence(uid, { onStatus }) {
    const statusRef = rtdbStatusRef(uid);
    const richRef = rtdbPresenceRef(uid);

    const unsubStatus = onValue(statusRef, (snap) => {
      const status = snap.val() || { state: 'offline' };
      onStatus(status);
    });

    const unsubRich = onValue(richRef, (snap) => {
      const rich = snap.val();
      if (rich) {
        onStatus({
          state: rich.state || 'offline',
          activity: rich.activity,
          activeWorkspace: rich.activeWorkspace,
          activeProject: rich.activeProject,
          last_changed: rich.last_changed,
        });
      }
    });

    return () => {
      unsubStatus();
      unsubRich();
    };
  },

  subscribeToFirestorePresence(uid, { onPresence }) {
    return onSnapshot(doc(db, 'presence', uid), (snap) => {
      onPresence(snap.exists() ? snap.data() : { state: 'offline', uid });
    });
  },

  subscribeToPresenceMap(uids, { onMap }) {
    if (!uids?.length) {
      onMap({});
      return () => {};
    }

    const unsubs = uids.map(uid =>
      this.subscribeToPresence(uid, {
        onStatus: (status) => {
          onMap((prev) => ({ ...prev, [uid]: status }));
        },
      })
    );

    return () => unsubs.forEach(u => u());
  },

  /**
   * Subscribe to all online members across the entire BeastBuck platform in real time.
   * Enforces a 120-second stale heartbeat threshold so offline/stale users resolve to 'offline'.
   */
  subscribeToAllPresence(callback) {
    const firestoreMap = {};
    const rtdbMap = {};
    const usersMap = {};
    const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

    const publishCleanMap = () => {
      const now = Date.now();
      const finalMap = {};

      // Combine RTDB and Firestore records
      const allUids = new Set([...Object.keys(firestoreMap), ...Object.keys(rtdbMap)]);

      allUids.forEach(uid => {
        const fsDoc = firestoreMap[uid] || {};
        const rtDoc = rtdbMap[uid] || {};
        const userDoc = usersMap[uid] || {};

        // Evaluate whether this user account is an approved member
        const userRoleMeta = {
          role: userDoc.role || rtDoc.role || fsDoc.role,
          membershipStatus: userDoc.membershipStatus || rtDoc.membershipStatus || fsDoc.membershipStatus,
          suspended: userDoc.suspended ?? rtDoc.suspended ?? fsDoc.suspended,
          accountStatus: userDoc.accountStatus || rtDoc.accountStatus || fsDoc.accountStatus,
        };

        if (!PERMISSIONS.isApprovedMember(userRoleMeta)) {
          return; // Exclude non-members from live presence!
        }

        // Parse timestamps
        const fsTime = fsDoc.updatedAt?.toDate ? fsDoc.updatedAt.toDate().getTime() : (fsDoc.lastSeen?.toDate ? fsDoc.lastSeen.toDate().getTime() : 0);
        const rtTime = rtDoc.last_changed ? (typeof rtDoc.last_changed === 'number' ? rtDoc.last_changed : new Date(rtDoc.last_changed).getTime()) : 0;

        const maxTime = Math.max(fsTime, rtTime);
        const isFresh = maxTime > 0 && (now - maxTime < STALE_THRESHOLD_MS);

        let resolvedState = 'offline';
        if (rtDoc.state && rtDoc.state !== 'offline') {
          resolvedState = rtDoc.state;
        } else if (fsDoc.state && fsDoc.state !== 'offline' && isFresh) {
          resolvedState = fsDoc.state;
        }

        finalMap[uid] = {
          uid,
          state: resolvedState,
          displayName: userDoc.displayName || rtDoc.displayName || fsDoc.displayName || 'Member',
          avatar: userDoc.avatar || userDoc.photoURL || rtDoc.avatar || fsDoc.avatar || '',
          activity: rtDoc.activity !== undefined ? rtDoc.activity : (fsDoc.activity || (resolvedState !== 'offline' ? 'Active' : 'Offline')),
          activeWorkspace: rtDoc.activeWorkspace !== undefined ? rtDoc.activeWorkspace : fsDoc.activeWorkspace,
          lastSeen: maxTime || Date.now(),
        };
      });

      callback(finalMap);
    };

    // 1. Listen to users collection for role validation
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        snap.docs.forEach(docSnap => {
          if (docSnap.exists()) {
            usersMap[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
          }
        });
        publishCleanMap();
      },
      (err) => {
        errorHandler.warn('Users collection listener for presence failed:', 'Presence Stream', { error: err.message });
      }
    );

    // 2. Listen to Firestore presence collection
    const unsubFirestore = onSnapshot(
      collection(db, 'presence'),
      (snap) => {
        snap.docs.forEach(docSnap => {
          const data = docSnap.data();
          if (data?.uid) {
            firestoreMap[data.uid] = data;
          }
        });
        publishCleanMap();
      },
      (err) => {
        errorHandler.warn('Firestore presence collection listener failed:', 'Presence Stream', { error: err.message });
      }
    );

    // 3. Listen to Realtime Database /presence node
    let unsubRTDB = () => {};
    try {
      const allPresenceRef = ref(rtdb, '/presence');
      unsubRTDB = onValue(allPresenceRef, (snap) => {
        const val = snap.val();
        if (val) {
          Object.entries(val).forEach(([uid, rich]) => {
            if (rich) {
              rtdbMap[uid] = rich;
            }
          });
        } else {
          Object.keys(rtdbMap).forEach(key => delete rtdbMap[key]);
        }
        publishCleanMap();
      });
    } catch (err) {
      console.warn('RTDB presence stream fallback:', err);
    }

    return () => {
      unsubUsers();
      unsubFirestore();
      unsubRTDB();
    };
  },

  async getUserPresence(uid) {
    try {
      const presenceDoc = await getDoc(doc(db, 'presence', uid));
      if (presenceDoc.exists()) {
        return presenceDoc.data();
      }
      // Fallback to RTDB if Firestore doesn't have the data
      const richRef = rtdbPresenceRef(uid);
      const richSnap = await get(richRef);
      if (richSnap.exists()) {
        const rich = richSnap.val();
        return {
          state: rich.state || 'offline',
          activity: rich.activity,
          activeWorkspace: rich.activeWorkspace,
          activeProject: rich.activeProject,
          last_changed: rich.last_changed,
          uid,
        };
      }
      return { state: 'offline', uid };
    } catch (err) {
      errorHandler.warn('Failed to get user presence', 'Presence Get', { error: err.message });
      return { state: 'offline', uid };
    }
  },
};
