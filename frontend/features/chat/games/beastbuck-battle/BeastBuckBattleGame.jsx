import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Crosshair, Pause, Shield, Volume2, VolumeX, Zap } from 'lucide-react';
import { getBattleMap } from './ArenaMap';
import { BattleAudio } from './BattleAudio';
import { BattleEngine, interpolatePlayer, predictLocalPlayer } from './GameEngine';
import { InputManager } from './InputManager';
import {
  claimBattleHost,
  joinBattleRuntime,
  releaseBattleHostOnDisconnect,
  subscribeBattleRuntime,
  updateBattleMeta,
  writeBattleInput,
  writeBattleSnapshot,
} from './GameNetwork';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

function drawPlatform(context, platform, camera) {
  const x = platform.x - camera.x;
  const y = platform.y - camera.y;
  context.fillStyle = platform.kind === 'cover' ? '#12324c' : '#1a4666';
  context.fillRect(x, y, platform.w, platform.h);
  context.fillStyle = '#5ce1e6';
  context.globalAlpha = 0.7;
  context.fillRect(x, y, platform.w, 3);
  context.globalAlpha = 1;
  if (platform.kind === 'cover') {
    context.fillStyle = 'rgba(255,255,255,0.07)';
    context.fillRect(x + 7, y + 12, platform.w - 14, 4);
  }
}

function drawPlayer(context, player, camera, now, isLocal) {
  if (!player?.alive) return;
  const x = player.x - camera.x;
  const y = player.y - camera.y;
  const flashing = now < player.flashUntil;
  const invulnerable = now < player.invulnerableUntil;
  const direction = player.aimX >= 0 ? 1 : -1;
  context.save();
  context.translate(x, y);
  context.globalAlpha = invulnerable ? 0.65 + Math.sin(now / 70) * 0.25 : 1;
  context.shadowBlur = isLocal ? 20 : 12;
  context.shadowColor = player.color;
  context.fillStyle = flashing ? '#ffffff' : player.color;
  context.fillRect(-11, -35, 22, 25);
  context.fillStyle = '#091827';
  context.fillRect(-8, -44, 16, 13);
  context.fillStyle = player.color;
  context.fillRect(-10, -48, 20, 7);
  context.fillStyle = '#d9f6ff';
  context.fillRect(direction > 0 ? 2 : -13, -41, 11, 3);
  context.fillStyle = '#0b1c2d';
  context.fillRect(-10, -10, 7, 11);
  context.fillRect(3, -10, 7, 11);
  if (Math.abs(player.vy) > 80 || player.fuel < 99) {
    context.fillStyle = '#fbbf24';
    context.globalAlpha = 0.75;
    context.beginPath();
    context.moveTo(-7, -9);
    context.lineTo(0, 8 + Math.sin(now / 45) * 5);
    context.lineTo(7, -9);
    context.fill();
    context.globalAlpha = 1;
  }
  const angle = Math.atan2(player.aimY, player.aimX);
  context.rotate(angle);
  context.fillStyle = '#d9f6ff';
  context.fillRect(5, -4, 27, 8);
  context.fillStyle = player.color;
  context.fillRect(23, -3, 13, 6);
  context.restore();

  const hpWidth = 38;
  context.fillStyle = 'rgba(3, 12, 25, 0.9)';
  context.fillRect(x - hpWidth / 2, y - 63, hpWidth, 5);
  context.fillStyle = '#fb7185';
  context.fillRect(x - hpWidth / 2, y - 63, hpWidth * (player.hp / 100), 5);
  if (player.shield > 0) {
    context.fillStyle = '#67e8f9';
    context.fillRect(x - hpWidth / 2, y - 57, hpWidth * (player.shield / 55), 3);
  }
}

function drawWorld(context, canvas, state, map, camera, localId) {
  const now = Date.now();
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#07182d');
  sky.addColorStop(0.55, '#0b2c4c');
  sky.addColorStop(1, '#061321');
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);

  context.save();
  context.globalAlpha = 0.18;
  context.fillStyle = '#58d9ff';
  for (let index = 0; index < 32; index += 1) {
    const x = ((index * 177 - camera.x * 0.14) % (width + 200)) - 80;
    const y = 90 + ((index * 89) % Math.max(110, height - 180));
    context.fillRect(x, y, 2, 2);
  }
  context.restore();

  context.save();
  context.translate(-camera.x * 0.24, -camera.y * 0.15);
  context.fillStyle = 'rgba(29, 101, 139, 0.38)';
  for (let index = 0; index < 10; index += 1) {
    const x = index * 320 - 140;
    context.fillRect(x, 260 + (index % 3) * 60, 190, 700);
  }
  context.restore();

  map.platforms.forEach((platform) => drawPlatform(context, platform, camera));
  (state.pickups || []).forEach((pickup) => {
    if (pickup.availableAt > now) return;
    const x = pickup.x - camera.x;
    const y = pickup.y - camera.y;
    const colors = { health: '#fb7185', shield: '#67e8f9', fuel: '#fbbf24' };
    context.save();
    context.translate(x, y + Math.sin(now / 300 + x) * 3);
    context.shadowBlur = 16;
    context.shadowColor = colors[pickup.type];
    context.fillStyle = colors[pickup.type];
    context.fillRect(-9, -9, 18, 18);
    context.fillStyle = '#061321';
    context.font = 'bold 13px sans-serif';
    context.textAlign = 'center';
    context.fillText(pickup.type === 'health' ? '+' : pickup.type === 'shield' ? 'S' : 'F', 0, 5);
    context.restore();
  });

  (state.projectiles || []).forEach((projectile) => {
    const x = projectile.x - camera.x;
    const y = projectile.y - camera.y;
    context.save();
    context.strokeStyle = projectile.color;
    context.lineWidth = projectile.size;
    context.shadowBlur = 12;
    context.shadowColor = projectile.color;
    context.beginPath();
    context.moveTo(x - projectile.vx * 0.018, y - projectile.vy * 0.018);
    context.lineTo(x, y);
    context.stroke();
    context.restore();
  });

  Object.values(state.players || {}).forEach((player) => drawPlayer(context, player, camera, now, player.id === localId));
  (state.events || []).forEach((event) => {
    const age = now - event.at;
    if (age > 520 || event.type !== 'impact') return;
    const x = event.x - camera.x;
    const y = event.y - camera.y;
    context.save();
    context.globalAlpha = 1 - age / 520;
    context.strokeStyle = event.color || '#ffffff';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, 7 + age / 20, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  });
}

function TouchControls({ inputRef }) {
  const joyRef = useRef(null);
  const fireRef = useRef(null);
  const pointers = useRef({ move: null, fire: null, jump: null });

  const updateMove = useCallback((event) => {
    const box = joyRef.current?.getBoundingClientRect();
    if (!box || event.pointerId !== pointers.current.move) return;
    const x = clamp((event.clientX - (box.left + box.width / 2)) / (box.width / 2), -1, 1);
    inputRef.current?.setTouchMove(x);
  }, [inputRef]);

  const updateFire = useCallback((event) => {
    const box = fireRef.current?.getBoundingClientRect();
    if (!box || event.pointerId !== pointers.current.fire) return;
    const x = event.clientX - (box.left + box.width / 2);
    const y = event.clientY - (box.top + box.height / 2);
    inputRef.current?.setTouchFire(true, { x, y });
  }, [inputRef]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <div
        ref={joyRef}
        className="pointer-events-auto flex h-28 w-28 items-center justify-center rounded-full border border-cyan-300/35 bg-[#071d35]/80 shadow-lg shadow-cyan-950/30 touch-none"
        onPointerDown={(event) => { pointers.current.move = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); updateMove(event); }}
        onPointerMove={updateMove}
        onPointerUp={(event) => { if (pointers.current.move === event.pointerId) { pointers.current.move = null; inputRef.current?.setTouchMove(0); } }}
        onPointerCancel={() => { pointers.current.move = null; inputRef.current?.setTouchMove(0); }}
      >
        <div className="h-12 w-12 rounded-full border border-cyan-200/70 bg-cyan-400/25" />
      </div>
      <div className="pointer-events-auto flex items-end gap-3">
        <button
          type="button"
          aria-label="Jet boost"
          className="flex h-16 w-16 touch-none items-center justify-center rounded-full border border-amber-300/45 bg-amber-500/20 text-amber-100 shadow-lg shadow-amber-950/30"
          onPointerDown={(event) => { pointers.current.jump = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); inputRef.current?.setTouchJump(true); }}
          onPointerUp={() => inputRef.current?.setTouchJump(false)}
          onPointerCancel={() => inputRef.current?.setTouchJump(false)}
        >
          <Zap className="h-7 w-7" />
        </button>
        <div
          ref={fireRef}
          className="flex h-28 w-28 touch-none items-center justify-center rounded-full border border-rose-300/45 bg-rose-500/20 text-rose-100 shadow-lg shadow-rose-950/30"
          onPointerDown={(event) => { pointers.current.fire = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); updateFire(event); }}
          onPointerMove={updateFire}
          onPointerUp={(event) => { if (pointers.current.fire === event.pointerId) { pointers.current.fire = null; inputRef.current?.setTouchFire(false); } }}
          onPointerCancel={() => { pointers.current.fire = null; inputRef.current?.setTouchFire(false); }}
        >
          <Crosshair className="h-9 w-9" />
        </div>
      </div>
    </div>
  );
}

export function BeastBuckBattleGame({ match, participants, currentUser, onActivate, onFinish, onExit }) {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const snapshotRef = useRef({ players: {}, projectiles: [], pickups: [], events: [] });
  const runtimeRef = useRef({});
  const participantsRef = useRef(participants);
  const heardEventsRef = useRef(new Set());
  const audioRef = useRef(null);
  const [runtime, setRuntime] = useState({});
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [selectedWeapon, setSelectedWeapon] = useState('pulse');
  const [volumes, setVolumes] = useState({ master: 0.55, sfx: 0.7, music: 0.18 });
  const [hud, setHud] = useState({ time: match.durationSec, me: null, ranking: [] });
  const map = useMemo(() => getBattleMap(match.mapId), [match.mapId]);
  const participantKey = useMemo(() => participants.map((participant) => participant.uid).sort().join('|'), [participants]);
  const isHost = runtime.meta?.hostId === currentUser.uid;
  const runtimeStatus = runtime.meta?.status || match.status;

  useEffect(() => { participantsRef.current = participants; }, [participants]);

  useEffect(() => subscribeBattleRuntime(match.id, (nextRuntime) => {
    runtimeRef.current = nextRuntime;
    snapshotRef.current = nextRuntime.state || snapshotRef.current;
    setRuntime(nextRuntime);
  }, () => setRuntime((current) => ({ ...current, error: true }))), [match.id]);

  useEffect(() => {
    let disposed = false;
    let leaveRuntime = null;
    joinBattleRuntime(match.id, {
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Fighter',
    }).then((cleanup) => {
      if (disposed) cleanup();
      else leaveRuntime = cleanup;
    }).catch(() => {});
    return () => {
      disposed = true;
      leaveRuntime?.();
    };
  }, [match.id, currentUser.uid, currentUser.displayName, currentUser.email]);

  useEffect(() => {
    if (runtimeStatus !== 'active' || runtime.meta?.hostId) return;
    claimBattleHost(match.id, currentUser.uid).catch(() => {});
  }, [match.id, currentUser.uid, runtimeStatus, runtime.meta?.hostId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const input = new InputManager(canvas);
    inputRef.current = input;
    const audio = new BattleAudio();
    audio.setMuted(muted);
    audioRef.current = audio;
    const unlock = () => { audio.unlock(); audio.startMusic(); };
    canvas.addEventListener('pointerdown', unlock, { once: true });
    return () => {
      canvas.removeEventListener('pointerdown', unlock);
      input.destroy();
      audio.destroy();
      inputRef.current = null;
    };
  }, [muted]);

  useEffect(() => {
    audioRef.current?.setMuted(muted);
    audioRef.current?.setVolumes(volumes);
  }, [muted, volumes]);

  useEffect(() => {
    const audio = audioRef.current;
    const events = runtime.state?.events || [];
    const cutoff = Date.now() - 1200;
    events.forEach((event) => {
      if (event.at < cutoff || heardEventsRef.current.has(event.id)) return;
      heardEventsRef.current.add(event.id);
      if (event.type === 'shot' && event.ownerId === currentUser.uid) audio?.shoot();
      if (event.type === 'impact') audio?.hit();
      if (event.type === 'pickup' && event.targetId === currentUser.uid) audio?.pickup();
    });
    if (heardEventsRef.current.size > 90) heardEventsRef.current = new Set([...heardEventsRef.current].slice(-40));
  }, [runtime.state?.sequence, runtime.state?.events, currentUser.uid]);

  useEffect(() => {
    const handleWeaponSelect = (event) => {
      if (event.code === 'Digit1') setSelectedWeapon('pulse');
      if (event.code === 'Digit2') setSelectedWeapon('bolt');
      if (event.code === 'Digit3') setSelectedWeapon('nova');
    };
    window.addEventListener('keydown', handleWeaponSelect);
    return () => window.removeEventListener('keydown', handleWeaponSelect);
  }, []);

  const handleExit = useCallback(async () => {
    if (isHost) {
      try {
        await updateBattleMeta(match.id, { hostId: null });
      } catch {
        // The RTDB disconnect handler also triggers a host election.
      }
    }
    onExit?.();
  }, [isHost, match.id, onExit]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const input = inputRef.current?.snapshot();
      if (input) writeBattleInput(match.id, currentUser.uid, input).catch(() => {});
    }, 50);
    return () => window.clearInterval(interval);
  }, [match.id, currentUser.uid]);

  useEffect(() => {
    if (!isHost) return undefined;
    const battleMeta = runtimeRef.current.meta || {};
    releaseBattleHostOnDisconnect(match.id).catch(() => {});
    if (runtimeStatus === 'countdown') {
      const delay = Math.max(0, (battleMeta.countdownAt || Date.now()) - Date.now());
      const timer = window.setTimeout(() => {
        updateBattleMeta(match.id, { status: 'active', startedAt: Date.now() }).catch(() => {});
        onActivate?.();
      }, delay);
      return () => window.clearTimeout(timer);
    }
    if (runtimeStatus !== 'active') return undefined;

    const initialState = snapshotRef.current?.players && Object.keys(snapshotRef.current.players).length ? snapshotRef.current : null;
    const engine = new BattleEngine({
      mapId: match.mapId,
      durationSec: match.durationSec,
      participants: participantsRef.current,
      initialState: initialState ? { ...initialState, startedAt: battleMeta.startedAt || initialState.startedAt } : null,
    });
    let raf;
    let lastFrame = performance.now();
    let lastPublish = 0;
    let didFinish = false;
    const frame = (time) => {
      const delta = Math.min(0.035, (time - lastFrame) / 1000);
      lastFrame = time;
      engine.syncParticipants(participantsRef.current);
      engine.setInputs(runtimeRef.current.inputs || {});
      engine.tick(delta);
      const state = engine.serialize();
      snapshotRef.current = state;
      if (time - lastPublish > 82) {
        lastPublish = time;
        writeBattleSnapshot(match.id, state).catch(() => {});
      }
      if (state.finished && !didFinish) {
        didFinish = true;
        updateBattleMeta(match.id, { status: 'finished', finishedAt: Date.now(), winnerId: state.winnerId }).catch(() => {});
        onFinish?.(state);
      }
      if (!state.finished) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [isHost, runtimeStatus, match.id, match.mapId, match.durationSec, participantKey, onActivate, onFinish]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext('2d');
    let animationFrame;
    let previous = performance.now();
    let camera = { x: 0, y: 0 };
    let localPredicted = null;
    let lastHud = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const frame = (time) => {
      const delta = Math.min(0.035, (time - previous) / 1000);
      previous = time;
      const source = snapshotRef.current || {};
      const state = { ...source, players: { ...(source.players || {}) } };
      const serverLocal = state.players[currentUser.uid];
      const input = inputRef.current?.snapshot();
      if (serverLocal) {
        const base = localPredicted ? interpolatePlayer(localPredicted, serverLocal, 0.18) : { ...serverLocal };
        localPredicted = predictLocalPlayer(base, input, delta, match.mapId);
        state.players[currentUser.uid] = localPredicted;
      }
      const focus = state.players[currentUser.uid] || Object.values(state.players)[0] || { x: map.world.width / 2, y: map.world.height / 2 };
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const targetX = clamp(focus.x - width * 0.5 + (focus.aimX || 0) * 56, 0, Math.max(0, map.world.width - width));
      const targetY = clamp(focus.y - height * 0.58 + (focus.aimY || 0) * 28, 0, Math.max(0, map.world.height - height));
      camera.x += (targetX - camera.x) * Math.min(1, delta * 7);
      camera.y += (targetY - camera.y) * Math.min(1, delta * 7);
      drawWorld(context, canvas, state, map, camera, currentUser.uid);
      if (time - lastHud > 180) {
        lastHud = time;
        const elapsed = ((Date.now() - (runtime.meta?.startedAt || source.startedAt || Date.now())) / 1000);
        const ranking = Object.values(source.players || {}).sort((a, b) => b.score - a.score || b.kills - a.kills);
        setHud({ time: match.durationSec - elapsed, me: source.players?.[currentUser.uid] || null, ranking });
      }
      animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [currentUser.uid, map, match.durationSec, match.mapId, runtime.meta?.startedAt]);

  useEffect(() => {
    const onKeyDown = (event) => { if (event.code === 'Escape') setPaused((value) => !value); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const countdown = runtimeStatus === 'countdown' ? Math.max(0, Math.ceil(((runtime.meta?.countdownAt || Date.now()) - Date.now()) / 1000)) : null;
  return (
    <div className="relative h-[min(78dvh,720px)] min-h-[430px] w-full overflow-hidden rounded-lg border border-cyan-300/30 bg-[#061321] shadow-2xl shadow-cyan-950/50">
      <canvas 
        ref={canvasRef} 
        className="h-full w-full touch-none cursor-crosshair" 
        aria-label="BeastBuck Battle Arena"
        tabIndex={0}
        style={{ outline: 'none' }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="rounded-md border border-cyan-200/20 bg-[#071d35]/90 px-3 py-2 text-cyan-50 shadow-lg shadow-cyan-950/30 backdrop-blur">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200/65">Free For All</div>
          <div className="mt-0.5 font-mono text-xl font-black tabular-nums text-cyan-50">{formatTime(hud.time)}</div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMuted((value) => !value)} aria-label={muted ? 'Enable sound' : 'Mute sound'} className="pointer-events-auto grid h-9 w-9 place-items-center rounded-md border border-cyan-200/20 bg-[#071d35]/90 text-cyan-50 backdrop-blur">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => setPaused(true)} aria-label="Pause match" className="pointer-events-auto grid h-9 w-9 place-items-center rounded-md border border-cyan-200/20 bg-[#071d35]/90 text-cyan-50 backdrop-blur">
            <Pause className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="pointer-events-none absolute left-3 top-20 z-10 w-40 rounded-md border border-cyan-200/20 bg-[#071d35]/85 p-2.5 text-cyan-50 backdrop-blur sm:left-4 sm:top-24">
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-cyan-50/75"><span>HP</span><span>{Math.ceil(hud.me?.hp || 0)}</span></div>
        <div className="h-2 overflow-hidden rounded bg-[#03101e]"><div className="h-full bg-rose-400" style={{ width: `${hud.me?.hp || 0}%` }} /></div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-cyan-50/75"><span>Shield</span><span>{Math.ceil(hud.me?.shield || 0)}</span></div>
        <div className="h-1.5 overflow-hidden rounded bg-[#03101e]"><div className="h-full bg-cyan-300" style={{ width: `${((hud.me?.shield || 0) / 55) * 100}%` }} /></div>
        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-cyan-50/75"><span>Jet</span><span>{Math.ceil(hud.me?.fuel || 0)}</span></div>
        <div className="h-1.5 overflow-hidden rounded bg-[#03101e]"><div className="h-full bg-amber-300" style={{ width: `${hud.me?.fuel || 0}%` }} /></div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-cyan-100"><Crosshair className="h-3 w-3" />{selectedWeapon}</div>
      </div>
      <div className="pointer-events-none absolute right-3 top-16 z-10 hidden w-44 rounded-md border border-cyan-200/20 bg-[#071d35]/85 p-2 backdrop-blur sm:block sm:right-4 sm:top-20">
        {hud.ranking.slice(0, 7).map((player, index) => <div key={player.id} className="flex items-center justify-between py-1 text-xs"><span className="min-w-0 truncate text-cyan-50/80"><b className="mr-1 text-cyan-200">{index + 1}</b>{player.name}</span><span className="font-mono font-bold text-cyan-50">{player.score}</span></div>)}
      </div>
      {runtime.error && <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center"><span className="rounded-full border border-amber-200 bg-amber-50/95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-lg">Reconnecting to the battle...</span></div>}
      {countdown !== null && <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-sky-950/25"><span className="text-7xl font-black text-white drop-shadow-[0_0_24px_rgba(14,116,144,0.8)]">{countdown || 'GO!'}</span></div>}
      {paused && <div className="absolute inset-0 z-40 grid place-items-center bg-sky-950/30 p-5 backdrop-blur-sm"><div className="w-full max-w-xs rounded-lg border border-sky-200 bg-white p-5 text-center shadow-2xl shadow-sky-900/20"><Shield className="mx-auto h-7 w-7 text-cyan-600" /><h3 className="mt-3 text-lg font-bold text-[#164661]">Local pause</h3><div className="mt-4 space-y-3 text-left">{[['Master', 'master'], ['SFX', 'sfx'], ['Music', 'music']].map(([label, key]) => <label key={key} className="block text-xs font-bold text-[#39728d]"><span className="flex justify-between"><span>{label}</span><span>{Math.round(volumes[key] * 100)}%</span></span><input aria-label={`${label} volume`} type="range" min="0" max="1" step="0.05" value={volumes[key]} onChange={(event) => setVolumes((current) => ({ ...current, [key]: Number(event.target.value) }))} className="mt-1 w-full accent-cyan-600" /></label>)}</div><div className="mt-4 flex gap-2"><button type="button" onClick={() => setPaused(false)} className="flex-1 rounded-md bg-cyan-500 px-3 py-2 text-sm font-bold text-white hover:bg-cyan-600">Resume</button><button type="button" onClick={handleExit} className="flex-1 rounded-md border border-sky-200 px-3 py-2 text-sm font-bold text-[#164661] hover:bg-sky-50">Exit</button></div></div></div>}
      <TouchControls inputRef={inputRef} />
    </div>
  );
}
