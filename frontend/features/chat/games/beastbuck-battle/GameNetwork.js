import { ref, onValue, onDisconnect, remove, runTransaction, set, update } from 'firebase/database';
import { rtdb } from '@services/firebase/config';

const runtimeRef = (matchId) => ref(rtdb, `battleRuntime/${matchId}`);
const now = () => Date.now();

export function subscribeBattleRuntime(matchId, onRuntime, onError) {
  return onValue(runtimeRef(matchId), (snapshot) => onRuntime(snapshot.val() || {}), onError);
}

export async function initializeBattleRuntime(matchId, hostId) {
  const root = runtimeRef(matchId);
  await update(root, {
    'meta/hostId': hostId,
    'meta/status': 'waiting',
    'meta/createdAt': now(),
  });
}

export async function joinBattleRuntime(matchId, participant) {
  const presence = ref(rtdb, `battleRuntime/${matchId}/presence/${participant.uid}`);
  const input = ref(rtdb, `battleRuntime/${matchId}/inputs/${participant.uid}`);
  await set(presence, {
    uid: participant.uid,
    displayName: participant.displayName,
    connectedAt: now(),
  });
  await set(input, { moveX: 0, jump: false, fire: false, aimX: 1, aimY: 0, weapon: 'pulse', timestamp: now() });
  onDisconnect(presence).remove();
  onDisconnect(input).remove();
  return () => {
    remove(presence).catch(() => {});
    remove(input).catch(() => {});
  };
}

export function writeBattleInput(matchId, uid, input) {
  return set(ref(rtdb, `battleRuntime/${matchId}/inputs/${uid}`), input);
}

export function writeBattleSnapshot(matchId, state) {
  return set(ref(rtdb, `battleRuntime/${matchId}/state`), state);
}

export function updateBattleMeta(matchId, updates) {
  return update(ref(rtdb, `battleRuntime/${matchId}/meta`), updates);
}

export function releaseBattleHostOnDisconnect(matchId) {
  return onDisconnect(ref(rtdb, `battleRuntime/${matchId}/meta/hostId`)).set(null);
}

export async function claimBattleHost(matchId, uid) {
  const hostRef = ref(rtdb, `battleRuntime/${matchId}/meta/hostId`);
  const result = await runTransaction(hostRef, (currentHost) => currentHost || uid, { applyLocally: false });
  return result.snapshot.val() === uid;
}

export function cleanupBattleRuntime(matchId) {
  return remove(runtimeRef(matchId));
}
