import { BATTLE_WORLD } from './constants';

export const NEON_FOUNDRY_MAP = {
  id: 'neon-foundry',
  name: 'Neon Foundry',
  world: BATTLE_WORLD,
  platforms: [
    { x: 0, y: 1210, w: 2400, h: 110, kind: 'ground' },
    { x: 150, y: 970, w: 410, h: 42 },
    { x: 770, y: 1070, w: 300, h: 42 },
    { x: 1230, y: 960, w: 460, h: 42 },
    { x: 1900, y: 1030, w: 310, h: 42 },
    { x: 440, y: 720, w: 330, h: 38 },
    { x: 1010, y: 700, w: 380, h: 38 },
    { x: 1660, y: 730, w: 330, h: 38 },
    { x: 130, y: 475, w: 370, h: 38 },
    { x: 820, y: 430, w: 440, h: 38 },
    { x: 1570, y: 455, w: 430, h: 38 },
    { x: 590, y: 255, w: 300, h: 36 },
    { x: 1450, y: 240, w: 340, h: 36 },
    { x: 1130, y: 1050, w: 92, h: 160, kind: 'cover' },
    { x: 1740, y: 850, w: 78, h: 180, kind: 'cover' },
    { x: 650, y: 780, w: 72, h: 190, kind: 'cover' },
  ],
  spawnPoints: [
    { x: 245, y: 900 }, { x: 920, y: 1000 }, { x: 1450, y: 890 }, { x: 2050, y: 960 },
    { x: 540, y: 650 }, { x: 1170, y: 610 }, { x: 1800, y: 680 }, { x: 305, y: 410 },
    { x: 1030, y: 365 }, { x: 1760, y: 390 },
  ],
  pickupPoints: [
    { x: 355, y: 925 }, { x: 916, y: 660 }, { x: 1455, y: 918 }, { x: 2010, y: 995 },
    { x: 640, y: 215 }, { x: 1640, y: 415 },
  ],
};

export function getBattleMap(mapId) {
  return mapId === NEON_FOUNDRY_MAP.id ? NEON_FOUNDRY_MAP : NEON_FOUNDRY_MAP;
}
