import { getBattleMap } from './ArenaMap';
import { BATTLE_WORLD, PLAYER_COLORS, WEAPONS } from './constants';
import { normalizeInput } from './InputManager';

const PLAYER_W = 34;
const PLAYER_H = 54;
const MAX_HP = 100;
const MAX_SHIELD = 55;
const MAX_FUEL = 100;
const RESPAWN_MS = 3000;
const INPUT_STALE_MS = 1200;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (from, to, amount) => from + (to - from) * amount;

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerRect(player) {
  return { x: player.x - PLAYER_W / 2, y: player.y - PLAYER_H, w: PLAYER_W, h: PLAYER_H };
}

function nearestSafeSpawn(map, activePlayers, seed = 0) {
  const candidates = map.spawnPoints.map((point, index) => ({ point, index, distance: Infinity }));
  for (const candidate of candidates) {
    candidate.distance = activePlayers.reduce((minimum, player) => {
      if (!player.alive) return minimum;
      return Math.min(minimum, Math.hypot(candidate.point.x - player.x, candidate.point.y - player.y));
    }, Infinity);
  }
  candidates.sort((a, b) => b.distance - a.distance || a.index - b.index);
  return candidates[seed % Math.min(3, candidates.length)].point;
}

export function createBattlePlayer(participant, index, map, activePlayers = []) {
  const spawn = nearestSafeSpawn(map, activePlayers, index);
  return {
    id: participant.uid,
    name: participant.displayName || 'Fighter',
    color: participant.color || PLAYER_COLORS[index % PLAYER_COLORS.length],
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    facing: 1,
    aimX: 1,
    aimY: 0,
    hp: MAX_HP,
    shield: 0,
    fuel: MAX_FUEL,
    grounded: false,
    alive: true,
    respawnAt: 0,
    invulnerableUntil: Date.now() + 1200,
    lastShotAt: 0,
    flashUntil: 0,
    score: 0,
    kills: 0,
    deaths: 0,
    damage: 0,
  };
}

export class BattleEngine {
  constructor({ mapId, durationSec, participants = [], initialState = null }) {
    this.map = getBattleMap(mapId);
    this.durationSec = durationSec;
    this.startedAt = initialState?.startedAt || Date.now();
    this.players = { ...(initialState?.players || {}) };
    this.projectiles = Array.isArray(initialState?.projectiles) ? initialState.projectiles : [];
    this.pickups = Array.isArray(initialState?.pickups) && initialState.pickups.length
      ? initialState.pickups
      : this.createPickups();
    this.events = Array.isArray(initialState?.events) ? initialState.events.slice(0, 8) : [];
    this.finished = Boolean(initialState?.finished);
    this.winnerId = initialState?.winnerId || null;
    this.sequence = Number(initialState?.sequence) || 0;
    this.inputs = {};
    this.syncParticipants(participants);
  }

  createPickups() {
    const types = ['health', 'shield', 'fuel', 'health', 'shield', 'fuel'];
    return this.map.pickupPoints.map((point, index) => ({
      id: `pickup-${index}`,
      type: types[index],
      x: point.x,
      y: point.y,
      availableAt: 0,
    }));
  }

  syncParticipants(participants = []) {
    const active = Object.values(this.players);
    participants.forEach((participant, index) => {
      if (!participant?.uid || this.players[participant.uid]) return;
      this.players[participant.uid] = createBattlePlayer(participant, index, this.map, active);
      active.push(this.players[participant.uid]);
    });
  }

  setInputs(inputs = {}) {
    this.inputs = inputs;
  }

  tick(deltaSec) {
    if (this.finished) return;
    const now = Date.now();
    const elapsed = (now - this.startedAt) / 1000;
    if (elapsed >= this.durationSec) {
      this.finish();
      return;
    }

    Object.values(this.players).forEach((player) => this.updatePlayer(player, deltaSec, now));
    this.updateProjectiles(deltaSec, now);
    this.updatePickups(now);
    this.sequence += 1;
  }

  updatePlayer(player, deltaSec, now) {
    if (!player.alive) {
      if (now >= player.respawnAt) this.respawn(player, now);
      return;
    }

    const rawInput = this.inputs[player.id];
    const input = rawInput && now - rawInput.timestamp < INPUT_STALE_MS ? normalizeInput(rawInput) : normalizeInput();
    const targetSpeed = input.moveX * 345;
    const acceleration = player.grounded ? 2400 : 1350;
    player.vx += clamp(targetSpeed - player.vx, -acceleration * deltaSec, acceleration * deltaSec);
    if (!input.moveX && player.grounded) player.vx *= Math.pow(0.0008, deltaSec);
    player.vx = clamp(player.vx, -360, 360);

    if (input.moveX) player.facing = input.moveX > 0 ? 1 : -1;
    player.aimX = input.aimX;
    player.aimY = input.aimY;

    const canJet = input.jump && player.fuel > 0;
    player.vy += 1550 * deltaSec;
    if (canJet) {
      player.vy -= player.grounded ? 2100 * deltaSec : 1750 * deltaSec;
      player.fuel = Math.max(0, player.fuel - 46 * deltaSec);
    } else if (player.grounded) {
      player.fuel = Math.min(MAX_FUEL, player.fuel + 42 * deltaSec);
    } else {
      player.fuel = Math.min(MAX_FUEL, player.fuel + 13 * deltaSec);
    }
    player.vy = clamp(player.vy, -620, 820);
    this.moveAndCollide(player, deltaSec);
    if (input.fire) this.tryShoot(player, input, now);
  }

  moveAndCollide(player, deltaSec) {
    const map = this.map;
    let resolvedX = clamp(player.x + player.vx * deltaSec, PLAYER_W / 2, map.world.width - PLAYER_W / 2);
    let rect = playerRect({ ...player, x: resolvedX });
    for (const platform of map.platforms) {
      if (!overlap(rect, platform)) continue;
      if (player.vx > 0) {
        resolvedX = platform.x - PLAYER_W / 2;
      } else if (player.vx < 0) {
        resolvedX = platform.x + platform.w + PLAYER_W / 2;
      }
      player.vx = 0;
      rect = playerRect({ ...player, x: resolvedX });
    }
    player.x = resolvedX;

    const previousBottom = player.y;
    player.y += player.vy * deltaSec;
    player.grounded = false;
    rect = playerRect(player);
    for (const platform of map.platforms) {
      if (!overlap(rect, platform)) continue;
      const previousTop = previousBottom - PLAYER_H;
      if (player.vy >= 0 && previousBottom <= platform.y + 12) {
        player.y = platform.y;
        player.vy = 0;
        player.grounded = true;
      } else if (player.vy < 0 && previousTop >= platform.y + platform.h - 12) {
        player.y = platform.y + platform.h + PLAYER_H;
        player.vy = 0;
      } else {
        player.x += player.vx >= 0 ? -8 : 8;
        player.vx = 0;
      }
      rect = playerRect(player);
    }
    if (player.y > map.world.height + 120) this.damagePlayer(player, 999, null, Date.now());
  }

  tryShoot(player, input, now) {
    const weapon = WEAPONS[input.weapon] || WEAPONS.pulse;
    if (now - player.lastShotAt < weapon.fireRate) return;
    player.lastShotAt = now;
    const angle = Math.atan2(input.aimY, input.aimX);
    const muzzleX = player.x + Math.cos(angle) * 28;
    const muzzleY = player.y - 31 + Math.sin(angle) * 28;
    this.projectiles.push({
      id: makeId('bolt'),
      ownerId: player.id,
      x: muzzleX,
      y: muzzleY,
      vx: Math.cos(angle) * weapon.speed,
      vy: Math.sin(angle) * weapon.speed,
      damage: weapon.damage,
      color: weapon.color,
      size: weapon.size,
      expiresAt: now + 1100,
    });
    this.events.unshift({ id: makeId('event'), type: 'shot', ownerId: player.id, x: muzzleX, y: muzzleY, at: now });
    this.events = this.events.slice(0, 18);
  }

  updateProjectiles(deltaSec, now) {
    const next = [];
    for (const projectile of this.projectiles) {
      if (projectile.expiresAt < now) continue;
      projectile.x += projectile.vx * deltaSec;
      projectile.y += projectile.vy * deltaSec;
      if (projectile.x < 0 || projectile.x > BATTLE_WORLD.width || projectile.y < 0 || projectile.y > BATTLE_WORLD.height) continue;
      if (this.map.platforms.some((platform) => projectile.x >= platform.x && projectile.x <= platform.x + platform.w && projectile.y >= platform.y && projectile.y <= platform.y + platform.h)) {
        this.addImpact(projectile.x, projectile.y, projectile.color, now);
        continue;
      }
      const target = Object.values(this.players).find((player) => player.id !== projectile.ownerId && player.alive && Math.abs(player.x - projectile.x) < 22 && Math.abs((player.y - 28) - projectile.y) < 32);
      if (target) {
        this.damagePlayer(target, projectile.damage, projectile.ownerId, now);
        this.addImpact(projectile.x, projectile.y, projectile.color, now);
        continue;
      }
      next.push(projectile);
    }
    this.projectiles = next;
  }

  addImpact(x, y, color, now) {
    this.events.unshift({ id: makeId('impact'), type: 'impact', x, y, color, at: now });
    this.events = this.events.slice(0, 18);
  }

  damagePlayer(player, damage, ownerId, now) {
    if (!player.alive || now < player.invulnerableUntil) return;
    const shieldDamage = Math.min(player.shield, damage);
    player.shield -= shieldDamage;
    const hpDamage = damage - shieldDamage;
    player.hp = Math.max(0, player.hp - hpDamage);
    player.flashUntil = now + 160;
    if (ownerId && this.players[ownerId]) this.players[ownerId].damage += hpDamage + shieldDamage;
    if (player.hp <= 0) {
      player.alive = false;
      player.deaths += 1;
      player.respawnAt = now + RESPAWN_MS;
      this.events.unshift({ id: makeId('elimination'), type: 'elimination', targetId: player.id, ownerId, at: now });
      if (ownerId && this.players[ownerId]) {
        this.players[ownerId].kills += 1;
        this.players[ownerId].score += 1;
      }
    }
  }

  respawn(player, now) {
    const spawn = nearestSafeSpawn(this.map, Object.values(this.players).filter((other) => other.id !== player.id), player.deaths);
    Object.assign(player, {
      x: spawn.x, y: spawn.y, vx: 0, vy: 0, hp: MAX_HP, shield: 25, fuel: MAX_FUEL,
      alive: true, grounded: false, invulnerableUntil: now + 1400, flashUntil: now + 260,
    });
    this.events.unshift({ id: makeId('respawn'), type: 'respawn', targetId: player.id, at: now });
  }

  updatePickups(now) {
    for (const pickup of this.pickups) {
      if (pickup.availableAt > now) continue;
      const collector = Object.values(this.players).find((player) => player.alive && Math.hypot(player.x - pickup.x, (player.y - 25) - pickup.y) < 35);
      if (!collector) continue;
      if (pickup.type === 'health') collector.hp = Math.min(MAX_HP, collector.hp + 32);
      if (pickup.type === 'shield') collector.shield = Math.min(MAX_SHIELD, collector.shield + 28);
      if (pickup.type === 'fuel') collector.fuel = MAX_FUEL;
      pickup.availableAt = now + 9000;
      this.events.unshift({ id: makeId('pickup'), type: 'pickup', targetId: collector.id, pickupType: pickup.type, at: now });
      this.events = this.events.slice(0, 18);
    }
  }

  finish() {
    this.finished = true;
    const ranked = Object.values(this.players).sort((a, b) => b.score - a.score || b.kills - a.kills || b.damage - a.damage);
    this.winnerId = ranked[0]?.id || null;
  }

  serialize() {
    return {
      sequence: this.sequence,
      startedAt: this.startedAt,
      finished: this.finished,
      winnerId: this.winnerId,
      players: this.players,
      projectiles: this.projectiles,
      pickups: this.pickups,
      events: this.events.filter((event) => Date.now() - event.at < 1100),
    };
  }
}

export function predictLocalPlayer(previous, input, deltaSec, mapId) {
  if (!previous?.alive) return previous;
  const map = getBattleMap(mapId);
  const next = { ...previous };
  const cleanInput = normalizeInput(input);
  const targetSpeed = cleanInput.moveX * 345;
  next.vx += clamp(targetSpeed - next.vx, -1600 * deltaSec, 1600 * deltaSec);
  next.vx = clamp(next.vx, -360, 360);
  if (cleanInput.moveX) next.facing = cleanInput.moveX > 0 ? 1 : -1;
  next.vy = clamp(next.vy + 1550 * deltaSec - (cleanInput.jump && next.fuel > 0 ? 1700 * deltaSec : 0), -620, 820);
  next.x = clamp(next.x + next.vx * deltaSec, PLAYER_W / 2, map.world.width - PLAYER_W / 2);
  next.y += next.vy * deltaSec;
  return next;
}

export function interpolatePlayer(current, incoming, amount = 0.35) {
  if (!current) return { ...incoming };
  return {
    ...incoming,
    x: lerp(current.x, incoming.x, amount),
    y: lerp(current.y, incoming.y, amount),
  };
}
