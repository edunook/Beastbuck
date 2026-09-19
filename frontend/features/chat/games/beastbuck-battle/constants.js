export const BATTLE_GAME_ID = 'battle-arena-v2';
export const BATTLE_GAME_NAME = 'BeastBuck Battle Arena';
export const BATTLE_MAX_PLAYERS = 7;
export const BATTLE_DEFAULT_DURATION = 180;
export const BATTLE_WORLD = { width: 2400, height: 1320 };

export const PLAYER_COLORS = [
  '#68d5ff', '#a78bfa', '#34d399', '#fbbf24', '#fb7185', '#60a5fa', '#c084fc',
];

export const DEFAULT_BATTLE_OPTIONS = {
  gameMode: 'free-for-all',
  mapId: 'neon-foundry',
  durationSec: BATTLE_DEFAULT_DURATION,
  maxPlayers: BATTLE_MAX_PLAYERS,
};

export const WEAPONS = {
  pulse: { id: 'pulse', name: 'Pulse Blaster', fireRate: 260, speed: 980, damage: 19, size: 5, color: '#8be9fd' },
  bolt: { id: 'bolt', name: 'Bolt Carbine', fireRate: 125, speed: 880, damage: 9, size: 3, color: '#f9a8d4' },
  nova: { id: 'nova', name: 'Nova Cannon', fireRate: 760, speed: 660, damage: 42, size: 9, color: '#fbbf24' },
};

export const PLATFORM_COLOR = '#397d99';
