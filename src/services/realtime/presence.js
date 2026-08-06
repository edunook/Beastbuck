import { ref, onValue, onDisconnect, set, serverTimestamp, get } from 'firebase/database';
import { doc, setDoc, onSnapshot, serverTimestamp as firestoreTimestamp } from 'firebase/firestore';
import { rtdb, db } from '../firebase/config';
import { errorHandler } from '../../utils/errorHandler';

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
};
