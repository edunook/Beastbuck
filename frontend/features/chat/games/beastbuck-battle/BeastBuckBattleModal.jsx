import { useCallback, useEffect, useState } from 'react';
import {
  addDoc, collection, doc, onSnapshot, runTransaction, serverTimestamp, setDoc, updateDoc,
} from 'firebase/firestore';
import { Check, Crosshair, Link2, Map, Radio, RefreshCw, Trophy, X } from 'lucide-react';
import { db } from '@services/firebase/config';
import { BeastBuckBattleGame } from './BeastBuckBattleGame';
import { BATTLE_DEFAULT_DURATION, BATTLE_GAME_ID, BATTLE_GAME_NAME, BATTLE_MAX_PLAYERS, DEFAULT_BATTLE_OPTIONS, PLAYER_COLORS } from './constants';
import { initializeBattleRuntime, updateBattleMeta } from './GameNetwork';

const matchRef = (id) => doc(db, 'battleMatches', id);
const participantsRef = (id) => collection(db, 'battleMatches', id, 'participants');

function playerLabel(player, index) {
  return player.displayName || `Fighter ${index + 1}`;
}

function readMatchId(value) {
  const trimmed = value.trim();
  if (!trimmed) return '';
  try {
    return new URL(trimmed, window.location.origin).searchParams.get('battle') || '';
  } catch {
    return trimmed.includes('/') || trimmed.includes('?') ? '' : trimmed;
  }
}

function BattleSetup({ creating, onCreate, onJoin, onClose }) {
  const [durationSec, setDurationSec] = useState(BATTLE_DEFAULT_DURATION);
  const [joinValue, setJoinValue] = useState('');
  const joinId = readMatchId(joinValue);
  return (
    <div className="mx-auto w-full max-w-xl p-4 sm:p-7">
      <div className="overflow-hidden rounded-lg border border-cyan-200/20 bg-[#071a2e] shadow-2xl shadow-cyan-950/50">
        <div className="border-b border-cyan-200/15 bg-[#0b2743] p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-md border border-cyan-200/35 bg-cyan-400/15 text-cyan-200"><Crosshair className="h-6 w-6" /></div><div><h2 className="text-xl font-black text-white">{BATTLE_GAME_NAME}</h2><p className="mt-1 text-sm text-cyan-100/60">Real-time 2-7 player free-for-all</p></div></div>
            <button type="button" onClick={onClose} aria-label="Close game" className="grid h-9 w-9 place-items-center rounded-md border border-cyan-200/20 text-cyan-100/70 hover:bg-cyan-100/10"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="space-y-5 p-5 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-cyan-200/15 bg-[#06172a] p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-cyan-200/65"><Map className="h-4 w-4" />Arena</div><p className="mt-2 font-bold text-white">Neon Foundry</p><p className="mt-1 text-xs leading-relaxed text-cyan-100/55">Layered platforms, aerial routes, cover, and pickups.</p></div>
            <div className="rounded-md border border-emerald-300/15 bg-[#06172a] p-4"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-emerald-200/65"><Trophy className="h-4 w-4" />Mode</div><p className="mt-2 font-bold text-white">Free for all</p><p className="mt-1 text-xs leading-relaxed text-cyan-100/55">Respawn, earn eliminations, finish on top.</p></div>
          </div>
          <label className="block"><span className="text-xs font-bold uppercase tracking-[0.13em] text-[#39728d]">Match duration</span><div className="mt-2 grid grid-cols-3 gap-2">{[180, 240, 300].map((duration) => <button key={duration} type="button" onClick={() => setDurationSec(duration)} className={`rounded-md border px-3 py-2.5 text-sm font-bold transition ${durationSec === duration ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-sky-200 bg-sky-50 text-[#39728d] hover:bg-sky-100'}`}>{duration / 60} min</button>)}</div></label>
          <button type="button" disabled={creating} onClick={() => onCreate(durationSec)} className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-600 disabled:opacity-60"><Crosshair className="h-4 w-4" />{creating ? 'Creating match' : 'Create match'}</button>
          <div className="border-t border-cyan-100/15 pt-4"><label className="block text-xs font-bold uppercase tracking-[0.13em] text-cyan-100/60">Join an existing match</label><div className="mt-2 flex gap-2"><input value={joinValue} onChange={(event) => setJoinValue(event.target.value)} placeholder="Paste a join link or match code" className="min-w-0 flex-1 rounded-md border border-cyan-200/20 bg-[#06172a] px-3 py-2 text-sm text-cyan-50 placeholder:text-cyan-100/35 outline-none focus:border-cyan-300" /><button type="button" disabled={!joinId} onClick={() => onJoin(joinId)} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-cyan-300/35 bg-cyan-400/15 px-3 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-35"><Link2 className="h-4 w-4" />Join</button></div></div>
        </div>
      </div>
    </div>
  );
}

function BattleLobby({ match, participants, currentUser, onStart, onBroadcast, onCopyLink, onExit, busy, inviteSent, linkCopied }) {
  const isHost = match.hostId === currentUser.uid;
  const canStart = isHost && participants.length >= 2;
  return (
    <div className="mx-auto w-full max-w-4xl p-3 sm:p-6">
      <div className="overflow-hidden rounded-lg border border-sky-200 bg-white shadow-2xl shadow-sky-900/15">
        <div className="relative h-48 overflow-hidden border-b border-sky-200 bg-[#bcecff] sm:h-60">
          <div className="absolute inset-x-0 bottom-0 h-10 bg-[#4c99ae]" />
          <div className="absolute bottom-10 left-[8%] h-9 w-[26%] border-t-2 border-cyan-50 bg-[#397d99]" />
          <div className="absolute bottom-20 left-[42%] h-9 w-[22%] border-t-2 border-cyan-50 bg-[#397d99]" />
          <div className="absolute bottom-12 right-[8%] h-9 w-[22%] border-t-2 border-cyan-50 bg-[#397d99]" />
          {participants.map((player, index) => <div key={player.uid} className="absolute bottom-8" style={{ left: `${10 + (index % 4) * 24}%` }}><div className="h-9 w-7 border border-white/35" style={{ backgroundColor: player.color }} /><div className="mx-auto h-4 w-5 border border-white/35 bg-[#b7ecff]" /></div>)}
          <div className="absolute left-4 top-4 rounded-md border border-sky-200 bg-white/90 px-3 py-2 text-xs font-bold text-[#39728d]"><span className="text-cyan-700">{participants.length}</span> / {BATTLE_MAX_PLAYERS} fighters</div>
        </div>
        <div className="p-4 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black text-[#164661]">{BATTLE_GAME_NAME}</h2><p className="mt-1 text-sm text-[#39728d]">Neon Foundry · Free for all · {match.durationSec / 60} min</p></div><button type="button" onClick={onExit} aria-label="Exit battle" className="grid h-9 w-9 place-items-center rounded-md border border-sky-200 text-[#39728d] hover:bg-sky-100"><X className="h-4 w-4" /></button></div><div className="mt-4 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:flex-wrap sm:items-center">{isHost && <button type="button" disabled={!canStart || busy} onClick={onStart} className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-45"><Crosshair className="h-4 w-4" />Start match</button>}<button type="button" onClick={onBroadcast} disabled={inviteSent} className="inline-flex items-center justify-center gap-2 rounded-md border border-cyan-300 bg-cyan-50 px-5 py-3 text-sm font-bold text-cyan-800 hover:bg-cyan-100 disabled:opacity-60"><Radio className="h-4 w-4" />{inviteSent ? 'Invite sent to chat' : 'Invite players in chat'}</button><button type="button" onClick={onCopyLink} className="inline-flex items-center justify-center gap-2 rounded-md border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-bold text-[#164661] hover:bg-sky-100">{linkCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Link2 className="h-4 w-4" />}{linkCopied ? 'Link copied' : 'Copy join link'}</button></div>{isHost && !canStart && <p className="mt-3 text-center text-xs text-[#4b7d94]">Share the chat invite or join link, then start once at least two fighters are ready.</p>}
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: BATTLE_MAX_PLAYERS }, (_, index) => { const player = participants[index]; return <div key={player?.uid || index} className={`flex min-w-0 items-center gap-3 rounded-md border p-3 ${player ? 'border-sky-200 bg-sky-50' : 'border-dashed border-sky-200 bg-slate-50'}`}><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white text-xs font-black text-[#164661]" style={{ backgroundColor: player?.color || '#c8e4ec' }}>{player ? playerLabel(player, index).slice(0, 1).toUpperCase() : '+'}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-[#164661]">{player ? playerLabel(player, index) : 'Open fighter slot'}</p><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#4b7d94]">{player?.uid === match.hostId ? 'Host' : player ? 'Ready' : `Slot ${index + 1}`}</p></div></div>; })}</div>
          <div className="hidden">{isHost && <button type="button" disabled={!canStart || busy} onClick={onStart}>Start match</button>}</div></div>
      </div>
    </div>
  );
}

function BattleResults({ match, currentUser, onRematch, onExit }) {
  const rankings = [...(match.result?.rankings || [])].sort((a, b) => a.rank - b.rank);
  const winner = rankings[0];
  return <div className="mx-auto w-full max-w-xl p-4 sm:p-7"><div className="rounded-lg border border-sky-200 bg-white p-5 text-center shadow-2xl shadow-sky-900/15 sm:p-7"><Trophy className="mx-auto h-10 w-10 text-amber-400" /><h2 className="mt-3 text-2xl font-black text-[#164661]">Match complete</h2><p className="mt-1 text-sm text-[#39728d]">{winner?.uid === currentUser.uid ? 'You took the arena.' : `${winner?.name || 'The leading fighter'} wins the arena.`}</p><div className="mt-6 overflow-hidden rounded-md border border-sky-200 text-left">{rankings.map((result, index) => <div key={result.uid} className="flex items-center justify-between border-b border-sky-100 px-4 py-3 last:border-0"><div className="flex min-w-0 items-center gap-3"><span className="w-5 font-mono text-sm font-black text-cyan-700">{index + 1}</span><span className="truncate font-bold text-[#164661]">{result.name}</span></div><div className="flex gap-3 text-xs text-[#39728d]"><span>{result.score} pts</span><span>{result.kills} K</span><span>{result.deaths} D</span></div></div>)}</div><div className="mt-5 flex gap-2"><button type="button" onClick={onRematch} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-cyan-500 px-3 py-2.5 text-sm font-bold text-white"><RefreshCw className="h-4 w-4" />Create rematch</button><button type="button" onClick={onExit} className="flex-1 rounded-md border border-sky-200 px-3 py-2.5 text-sm font-bold text-[#164661] hover:bg-sky-50">Exit</button></div></div></div>;
}

export function BeastBuckBattleModal({ onClose, currentUser, activeRoomId = 'general', onSendGameCard, joinMatchId = null }) {
  const [matchId, setMatchId] = useState(joinMatchId);
  const [match, setMatch] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [creating, setCreating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [error, setError] = useState(null);
  const userId = currentUser?.uid || '';
  const name = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Fighter';

  useEffect(() => {
    if (!matchId) return undefined;
    const stopMatch = onSnapshot(matchRef(matchId), (snapshot) => {
      if (!snapshot.exists()) { setError('This battle match is no longer available.'); return; }
      setMatch({ id: snapshot.id, ...snapshot.data() });
    }, () => setError('Unable to connect to this battle match.'));
    const stopParticipants = onSnapshot(participantsRef(matchId), (snapshot) => {
      setParticipants(snapshot.docs.map((entry) => entry.data()).sort((a, b) => (a.joinedAtClient || 0) - (b.joinedAtClient || 0)));
    });
    return () => { stopMatch(); stopParticipants(); };
  }, [matchId]);

  const joinMatch = useCallback(async (id, knownParticipants = participants) => {
    if (!userId || knownParticipants.some((player) => player.uid === userId)) return;
    const participant = { uid: userId, displayName: name, color: PLAYER_COLORS[knownParticipants.length % PLAYER_COLORS.length], joinedAtClient: Date.now() };
    await runTransaction(db, async (transaction) => {
      const matchSnapshot = await transaction.get(matchRef(id));
      if (!matchSnapshot.exists()) throw new Error('This battle match no longer exists.');
      const matchData = matchSnapshot.data();
      const roster = Array.isArray(matchData.participantIds) ? matchData.participantIds : [];
      if (matchData.status !== 'waiting') throw new Error('This battle has already started.');
      if (roster.includes(userId)) return;
      if (roster.length >= BATTLE_MAX_PLAYERS) throw new Error('This battle lobby is full.');
      transaction.update(matchRef(id), { participantIds: [...roster, userId] });
      transaction.set(doc(db, 'battleMatches', id, 'participants', userId), participant);
    });
  }, [userId, name, participants]);

  useEffect(() => {
    if (!match || !matchId || match.status !== 'waiting') return;
    joinMatch(matchId).catch(() => setError('Unable to join this battle lobby.'));
  }, [match, matchId, joinMatch]);

  const createMatch = async (durationSec) => {
    if (!userId) { setError('Sign in to create a battle match.'); return; }
    setCreating(true); setError(null);
    try {
      const ref = await addDoc(collection(db, 'battleMatches'), {
        gameId: BATTLE_GAME_ID,
        version: 2,
        hostId: userId,
        hostName: name,
        roomId: activeRoomId,
        status: 'waiting',
        ...DEFAULT_BATTLE_OPTIONS,
        durationSec,
        participantIds: [userId],
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db, 'battleMatches', ref.id, 'participants', userId), { uid: userId, displayName: name, color: PLAYER_COLORS[0], joinedAtClient: Date.now() });
      await initializeBattleRuntime(ref.id, userId);
      setMatchId(ref.id);
      sendInvite(ref.id);
    } catch (err) {
      console.error('Failed to create battle match:', err);
      setError('Could not create the battle match. Check Firebase permissions and try again.');
    } finally { setCreating(false); }
  };

  const startMatch = async () => {
    if (!match || match.hostId !== userId || participants.length < 2) return;
    setStarting(true); setError(null);
    try {
      const countdownAt = Date.now() + 3300;
      await updateDoc(matchRef(match.id), { status: 'countdown', countdownAt, startedAtClient: countdownAt });
      await updateBattleMeta(match.id, { status: 'countdown', countdownAt });
    } catch (err) { console.error('Failed to start battle:', err); setError('Could not start the match.'); } finally { setStarting(false); }
  };

  const activateMatch = useCallback(async () => {
    if (!match || match.hostId !== userId) return;
    try { await updateDoc(matchRef(match.id), { status: 'active', startedAt: serverTimestamp() }); } catch (err) { console.error('Failed to activate battle:', err); }
  }, [match, userId]);

  const finishMatch = useCallback(async (state) => {
    if (!match || match.hostId !== userId) return;
    const rankings = Object.values(state.players || {}).sort((a, b) => b.score - a.score || b.kills - a.kills || b.damage - a.damage).map((player, index) => ({ uid: player.id, name: player.name, rank: index + 1, score: player.score, kills: player.kills, deaths: player.deaths, damage: Math.round(player.damage) }));
    try { await updateDoc(matchRef(match.id), { status: 'finished', winnerId: state.winnerId, result: { rankings }, endedAt: serverTimestamp() }); } catch (err) { console.error('Failed to finish battle:', err); }
  }, [match, userId]);

  const sendInvite = (id) => {
    if (!id || !onSendGameCard) return;
    onSendGameCard({ gameId: BATTLE_GAME_ID, title: BATTLE_GAME_NAME, description: 'Join a live real-time 2D free-for-all in Neon Foundry.', sessionId: id });
    setInviteSent(true); window.setTimeout(() => setInviteSent(false), 2600);
  };

  const broadcast = () => sendInvite(match?.id);

  const copyJoinLink = async () => {
    if (!match) return;
    const link = `${window.location.origin}/chat?battle=${encodeURIComponent(match.id)}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2600);
    } catch (err) {
      console.error('Failed to copy battle join link:', err);
      setError('Could not copy the link. Please use the chat invite instead.');
    }
  };

  const createRematch = () => {
    const durationSec = match?.durationSec || BATTLE_DEFAULT_DURATION;
    setMatchId(null); setMatch(null); setParticipants([]); setError(null);
    createMatch(durationSec);
  };

  if (!matchId) return <BattleSetup creating={creating} onCreate={createMatch} onJoin={setMatchId} onClose={onClose} />;
  if (error && !match) return <div className="p-6 text-center text-sm text-rose-200"><p>{error}</p><button type="button" onClick={onClose} className="mt-4 rounded-md border border-rose-200/30 px-4 py-2">Close</button></div>;
  if (!match) return <div className="p-8 text-center text-sm text-cyan-100/60">Loading battle match...</div>;
  if (match.status === 'finished') return <BattleResults match={match} currentUser={currentUser} onRematch={createRematch} onExit={onClose} />;
  if (match.status === 'waiting') return <><BattleLobby match={match} participants={participants} currentUser={currentUser} onStart={startMatch} onBroadcast={broadcast} onCopyLink={copyJoinLink} onExit={onClose} busy={starting} inviteSent={inviteSent} linkCopied={linkCopied} />{error && <p className="pb-4 text-center text-sm text-rose-600">{error}</p>}</>;
  return <div className="p-0 sm:p-3"><BeastBuckBattleGame match={match} participants={participants} currentUser={currentUser} onActivate={activateMatch} onFinish={finishMatch} onExit={onClose} /></div>;
}
