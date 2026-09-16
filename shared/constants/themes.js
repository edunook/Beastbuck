// Shared Theme Templates and Theme Utilities for BeastBuck Profiles & Portfolios

export const THEME_TEMPLATES = [
  {
    id: 'default',
    name: 'Midnight Obsidian',
    description: 'Sleek ultra-dark aesthetic with vibrant electric cyan glow',
    background: 'linear-gradient(135deg, #09090b 0%, #111116 50%, #181822 100%)',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
    cardBg: 'rgba(0, 212, 255, 0.04)',
    category: 'dark',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High-octane neon cyan & magenta matrix aesthetic',
    background: 'linear-gradient(135deg, #070314 0%, #140728 50%, #0d1b3e 100%)',
    textColor: '#ffffff',
    accentColor: '#00ffcc',
    cardBg: 'rgba(0, 255, 204, 0.05)',
    category: 'vibrant',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Nebula',
    description: 'Deep interstellar violet with radiant galactic starlight',
    background: 'linear-gradient(135deg, #090a1a 0%, #1a0b2e 50%, #2a0845 100%)',
    textColor: '#ffffff',
    accentColor: '#a855f7',
    cardBg: 'rgba(168, 85, 247, 0.06)',
    category: 'vibrant',
  },
  {
    id: 'royal',
    name: 'Royal Imperial Gold',
    description: 'Prestige 24k gold brilliance on royal dark mahogany',
    background: 'linear-gradient(135deg, #141109 0%, #291e0a 50%, #3d2c0b 100%)',
    textColor: '#fffdf5',
    accentColor: '#fbbf24',
    cardBg: 'rgba(251, 191, 36, 0.06)',
    category: 'dark',
  },
  {
    id: 'aurora',
    name: 'Nordic Aurora',
    description: 'Luminescent green & emerald northern polar lights',
    background: 'linear-gradient(135deg, #041b1d 0%, #082d2f 50%, #064e3b 100%)',
    textColor: '#ffffff',
    accentColor: '#00ff9d',
    cardBg: 'rgba(0, 255, 157, 0.05)',
    category: 'vibrant',
  },
  {
    id: 'sunset-red',
    name: 'Sunset Crimson',
    description: 'Velvet rose twilight with burning ruby glow',
    background: 'linear-gradient(135deg, #2b0b1e 0%, #4a1532 50%, #701a35 100%)',
    textColor: '#ffffff',
    accentColor: '#f43f5e',
    cardBg: 'rgba(244, 63, 94, 0.06)',
    category: 'vibrant',
  },
  {
    id: 'ocean',
    name: 'Ocean Abyss',
    description: 'Deep oceanic trench with bioluminescent blue pulse',
    background: 'linear-gradient(135deg, #021124 0%, #062347 50%, #0c3e72 100%)',
    textColor: '#f0f9ff',
    accentColor: '#38bdf8',
    cardBg: 'rgba(56, 189, 248, 0.05)',
    category: 'dark',
  },
  {
    id: 'fire',
    name: 'Solar Flare & Ember',
    description: 'Blazing volcanic magma with incandescent orange flame',
    background: 'linear-gradient(135deg, #1c0a00 0%, #381204 50%, #631a02 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b35',
    cardBg: 'rgba(255, 107, 53, 0.06)',
    category: 'vibrant',
  },
  {
    id: 'retro',
    name: 'Synthwave 80s',
    description: 'Retro-futuristic violet twilight with hot pink lasers',
    background: 'linear-gradient(135deg, #1f0836 0%, #3b0d5c 50%, #181048 100%)',
    textColor: '#ffffff',
    accentColor: '#f472b6',
    cardBg: 'rgba(244, 114, 182, 0.06)',
    category: 'vibrant',
  },
  {
    id: 'matrix',
    name: 'Matrix Terminal',
    description: 'Dark digital mainframe with high-tech hacker green pulse',
    background: 'linear-gradient(135deg, #021a0c 0%, #042914 50%, #063d1e 100%)',
    textColor: '#ecfdf5',
    accentColor: '#22c55e',
    cardBg: 'rgba(34, 197, 94, 0.06)',
    category: 'dark',
  },
  {
    id: 'cherry',
    name: 'Sakura Blossom',
    description: 'Japanese cherry blossom elegance on dark plum mist',
    background: 'linear-gradient(135deg, #24141d 0%, #3d1b2c 50%, #521e38 100%)',
    textColor: '#ffffff',
    accentColor: '#fb7185',
    cardBg: 'rgba(251, 113, 133, 0.06)',
    category: 'vibrant',
  },
  {
    id: 'ice',
    name: 'Arctic Frost',
    description: 'Glacial crystalline frost with sub-zero crystal cyan',
    background: 'linear-gradient(135deg, #071926 0%, #0c2b3e 50%, #14425a 100%)',
    textColor: '#f0fdfa',
    accentColor: '#22d3ee',
    cardBg: 'rgba(34, 211, 238, 0.05)',
    category: 'dark',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Crystal',
    description: 'Enchanting royal amethyst crystal with vivid purple haze',
    background: 'linear-gradient(135deg, #160829 0%, #2c124d 50%, #451b75 100%)',
    textColor: '#faf5ff',
    accentColor: '#c084fc',
    cardBg: 'rgba(192, 132, 252, 0.06)',
    category: 'vibrant',
  },
  {
    id: 'minimal',
    name: 'Minimal Platinum',
    description: 'Crisp, contemporary platinum light studio aesthetic',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
    textColor: '#0f172a',
    accentColor: '#0284c7',
    cardBg: 'rgba(15, 23, 42, 0.04)',
    category: 'light',
  },
];

export const GRADIENT_PRESETS = [
  { name: 'Neon Cyber', from: '#0f0c29', to: '#24243e', angle: '135deg' },
  { name: 'Electric Violet', from: '#1a0b2e', to: '#4a0e4e', angle: '135deg' },
  { name: 'Emerald Abyss', from: '#021f14', to: '#064e3b', angle: '135deg' },
  { name: 'Solar Blaze', from: '#2e0a00', to: '#7c2d12', angle: '135deg' },
  { name: 'Midnight Cyan', from: '#070b19', to: '#0c2d48', angle: '135deg' },
  { name: 'Rose Velvet', from: '#2c0b1e', to: '#831843', angle: '135deg' },
  { name: 'Tokyo Dusk', from: '#180e29', to: '#311042', angle: '135deg' },
  { name: 'Pure Obsidian', from: '#050508', to: '#181820', angle: '135deg' },
];

export const COLOR_SWATCHES = [
  '#00d4ff', '#00ffcc', '#a855f7', '#fbbf24', '#00ff9d',
  '#f43f5e', '#38bdf8', '#ff6b35', '#f472b6', '#22c55e',
  '#ffffff', '#e2e8f0', '#94a3b8', '#cbd5e1'
];

/**
 * Returns clean CSS background properties whether the background is a gradient, solid color, or image URL.
 */
export function getThemeBackgroundStyle(background) {
  if (!background) {
    return { background: THEME_TEMPLATES[0].background };
  }

  const trimmed = String(background).trim();

  // Check if it's an image URL or data URI
  const isImage =
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('url(');

  if (isImage) {
    const url = trimmed.startsWith('url(') ? trimmed : `url("${trimmed}")`;
    return {
      backgroundImage: url,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    };
  }

  return {
    background: trimmed,
  };
}

/**
 * Resolve a theme object from a themeId and optional customTheme data.
 */
export function resolveTheme(themeId, customTheme = null) {
  // If customTheme is provided and theme is 'custom' or matches custom ID
  if (customTheme && (themeId === 'custom' || customTheme.isCustom || themeId === customTheme.id)) {
    return {
      id: 'custom',
      name: customTheme.name || 'Custom Theme',
      description: customTheme.description || 'Personalized custom theme',
      background: customTheme.background || THEME_TEMPLATES[0].background,
      textColor: customTheme.textColor || '#ffffff',
      accentColor: customTheme.accentColor || '#00d4ff',
      cardBg: customTheme.cardBg || 'rgba(255, 255, 255, 0.05)',
      isCustom: true,
    };
  }

  // If themeId is an object
  if (typeof themeId === 'object' && themeId !== null) {
    return {
      id: themeId.id || 'custom',
      name: themeId.name || 'Custom Theme',
      description: themeId.description || 'Personalized custom theme',
      background: themeId.background || THEME_TEMPLATES[0].background,
      textColor: themeId.textColor || '#ffffff',
      accentColor: themeId.accentColor || '#00d4ff',
      cardBg: themeId.cardBg || 'rgba(255, 255, 255, 0.05)',
      isCustom: true,
    };
  }

  // Lookup in templates
  const found = THEME_TEMPLATES.find((t) => t.id === themeId);
  if (found) return found;

  // Fallback if customTheme exists
  if (customTheme) {
    return {
      id: 'custom',
      name: customTheme.name || 'Custom Theme',
      description: customTheme.description || 'Personalized custom theme',
      background: customTheme.background || THEME_TEMPLATES[0].background,
      textColor: customTheme.textColor || '#ffffff',
      accentColor: customTheme.accentColor || '#00d4ff',
      cardBg: customTheme.cardBg || 'rgba(255, 255, 255, 0.05)',
      isCustom: true,
    };
  }

  return THEME_TEMPLATES[0];
}
