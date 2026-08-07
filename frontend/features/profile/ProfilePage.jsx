import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  Award,
  BarChart3,
  Brain,
  Building2,
  CalendarDays,
  Check,
  FlaskConical,
  FolderKanban,
  Globe,
  GraduationCap,
  MapPin,
  Medal,
  Plus,
  Shield,
  Share2,
  Sparkles,
  Star,
  UserRound,
  X,
  Zap,
  ArrowRight,
  Edit,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { UsersService } from '@services/firestore/users';
import { hasPermission } from '@shared/permissions/permissions';
import { getLevelProgress } from '@services/firestore/gamification';
import { OrganizationService } from '@services/firestore/organization';
import { UniverseService } from '@services/firestore/universe';
import { PresenceService } from '@services/realtime/presence';
import { DEFAULT_SKILLS } from '@services/firestore/skills';
import { getSpecializationById } from '@shared/constants/specializations';
import { ROLES } from '@shared/constants/roles';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { CardSkeleton } from '@frontend/components/ui/Skeleton';
import EmptyState from '@frontend/components/ui/EmptyState';
import { MembershipService } from '@services/firestore/membership';

function formatDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Unknown';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Theme Templates
const THEME_TEMPLATES = [
  {
    id: 'default',
    name: 'Default Dark',
    description: 'Classic dark theme with cyan accents',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Deep ocean gradients with blue accents',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    textColor: '#e94560',
    accentColor: '#00d4ff',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm sunset colors with purple accents',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#f093fb',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green tones with earth accents',
    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    textColor: '#ffffff',
    accentColor: '#a8e6cf',
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    description: 'Dark purple with neon accents',
    background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
    textColor: '#e94560',
    accentColor: '#ff00ff',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon cyberpunk aesthetic',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #2d1b4e 100%)',
    textColor: '#00ff00',
    accentColor: '#ff00ff',
  },
  {
    id: 'minimal',
    name: 'Minimal Light',
    description: 'Clean minimal light theme',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    textColor: '#2d3748',
    accentColor: '#4299e1',
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    description: 'Luxurious gold and dark theme',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #4a4a4a 50%, #ffd700 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Space',
    description: 'Space theme with star effects',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #2d1b4e 100%)',
    textColor: '#e94560',
    accentColor: '#00d4ff',
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern lights color scheme',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    textColor: '#ffffff',
    accentColor: '#00ff87',
  },
  {
    id: 'fire',
    name: 'Fire & Ember',
    description: 'Warm fire colors with orange accents',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #4a1a1a 50%, #ff6b35 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b35',
  },
  {
    id: 'ice',
    name: 'Ice Crystal',
    description: 'Cool ice blue theme',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #26c6da 100%)',
    textColor: '#006064',
    accentColor: '#00bcd4',
  },
  {
    id: 'retro',
    name: 'Retro Wave',
    description: '80s retro synthwave style',
    background: 'linear-gradient(135deg, #2d1b4e 0%, #ff00ff 50%, #00ffff 100%)',
    textColor: '#ffffff',
    accentColor: '#ff00ff',
  },
  {
    id: 'nature',
    name: 'Nature Earth',
    description: 'Earth tones and natural colors',
    background: 'linear-gradient(135deg, #5d4157 0%, #a8c0ff 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b6b',
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    description: 'Matrix green code theme',
    background: 'linear-gradient(135deg, #000000 0%, #0d0d0d 50%, #1a1a1a 100%)',
    textColor: '#00ff00',
    accentColor: '#00ff00',
  },
  {
    id: 'sunset2',
    name: 'California Sunset',
    description: 'Warm California sunset colors',
    background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
  },
  {
    id: 'lavender',
    name: 'Lavender Dreams',
    description: 'Soft lavender purple theme',
    background: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)',
    textColor: '#6c5ce7',
    accentColor: '#a29bfe',
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    description: 'Pink cherry blossom theme',
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b9d',
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Vibrant neon colors on dark',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2a2a5e 100%)',
    textColor: '#00ffff',
    accentColor: '#ff00ff',
  },
  {
    id: 'volcanic',
    name: 'Volcanic Ash',
    description: 'Dark volcanic rock theme',
    background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 50%, #718096 100%)',
    textColor: '#f7fafc',
    accentColor: '#fc8181',
  },
  {
    id: 'emerald',
    name: 'Emerald City',
    description: 'Rich emerald green theme',
    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    textColor: '#ecfdf5',
    accentColor: '#34d399',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Blue',
    description: 'Deep sapphire blue theme',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
    textColor: '#eff6ff',
    accentColor: '#60a5fa',
  },
  {
    id: 'ruby',
    name: 'Ruby Red',
    description: 'Rich ruby red theme',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Purple',
    description: 'Beautiful amethyst purple',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7e22ce 100%)',
    textColor: '#faf5ff',
    accentColor: '#c084fc',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    description: 'Golden hour sunset theme',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    textColor: '#fffbeb',
    accentColor: '#fbbf24',
  },
  {
    id: 'silver',
    name: 'Silver Moon',
    description: 'Elegant silver moon theme',
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
    textColor: '#f9fafb',
    accentColor: '#d1d5db',
  },
  {
    id: 'bronze',
    name: 'Bronze Age',
    description: 'Classic bronze metal theme',
    background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    textColor: '#fff7ed',
    accentColor: '#fbbf24',
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    description: 'Premium platinum theme',
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    textColor: '#f3f4f6',
    accentColor: '#e5e7eb',
  },
  {
    id: 'titanium',
    name: 'Titanium Strong',
    description: 'Strong titanium metal theme',
    background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
    textColor: '#f9fafb',
    accentColor: '#9ca3af',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Dark',
    description: 'Deep obsidian black theme',
    background: 'linear-gradient(135deg, #030712 0%, #111827 50%, #1f2937 100%)',
    textColor: '#f9fafb',
    accentColor: '#6b7280',
  },
  {
    id: 'pearl',
    name: 'Pearl White',
    description: 'Elegant pearl white theme',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    textColor: '#1e293b',
    accentColor: '#64748b',
  },
  {
    id: 'jade',
    name: 'Jade Stone',
    description: 'Natural jade stone theme',
    background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
    textColor: '#ecfdf5',
    accentColor: '#6ee7b7',
  },
  {
    id: 'topaz',
    name: 'Topaz Gem',
    description: 'Beautiful topaz gem theme',
    background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
    textColor: '#f0f9ff',
    accentColor: '#38bdf8',
  },
  {
    id: 'garnet',
    name: 'Garnet Red',
    description: 'Deep garnet red theme',
    background: 'linear-gradient(135deg, #881337 0%, #9f1239 50%, #be123c 100%)',
    textColor: '#fff1f2',
    accentColor: '#fb7185',
  },
  {
    id: 'aquamarine',
    name: 'Aquamarine Sea',
    description: 'Clear aquamarine theme',
    background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
    textColor: '#ecfeff',
    accentColor: '#67e8f9',
  },
  {
    id: 'peridot',
    name: 'Peridot Green',
    description: 'Vibrant peridot green',
    background: 'linear-gradient(135deg, #3f6212 0%, #4d7c0f 50%, #65a30d 100%)',
    textColor: '#f7fee7',
    accentColor: '#a3e635',
  },
  {
    id: 'turquoise',
    name: 'Turquoise Stone',
    description: 'Natural turquoise theme',
    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
    textColor: '#f0fdfa',
    accentColor: '#5eead4',
  },
  {
    id: 'amethyst2',
    name: 'Amethyst Dream',
    description: 'Dreamy amethyst purple',
    background: 'linear-gradient(135deg, #6b21a8 0%, #7c3aed 50%, #8b5cf6 100%)',
    textColor: '#faf5ff',
    accentColor: '#d8b4fe',
  },
  {
    id: 'citrine',
    name: 'Citrine Yellow',
    description: 'Bright citrine yellow',
    background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
    textColor: '#fefce8',
    accentColor: '#fde047',
  },
  {
    id: 'moonstone',
    name: 'Moonstone Glow',
    description: 'Mystical moonstone theme',
    background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
    textColor: '#f8fafc',
    accentColor: '#cbd5e1',
  },
  {
    id: 'sunstone',
    name: 'Sunstone Warm',
    description: 'Warm sunstone theme',
    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)',
    textColor: '#fff7ed',
    accentColor: '#fdba74',
  },
  {
    id: 'alexandrite',
    name: 'Alexandrite Rare',
    description: 'Rare alexandrite theme',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
    textColor: '#f5f3ff',
    accentColor: '#a78bfa',
  },
  {
    id: 'tanzanite',
    name: 'Tanzanite Blue',
    description: 'Rare tanzanite blue',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    textColor: '#eef2ff',
    accentColor: '#818cf8',
  },
  {
    id: 'morganite',
    name: 'Morganite Pink',
    description: 'Soft morganite pink',
    background: 'linear-gradient(135deg, #9d174d 0%, #be185d 50%, #db2777 100%)',
    textColor: '#fdf2f8',
    accentColor: '#f472b6',
  },
  {
    id: 'spinel',
    name: 'Spinel Red',
    description: 'Vibrant spinel red',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
  },
  {
    id: 'zircon',
    name: 'Zircon Blue',
    description: 'Clear zircon blue',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    textColor: '#eff6ff',
    accentColor: '#93c5fd',
  },
  {
    id: 'kunzite',
    name: 'Kunzite Pink',
    description: 'Delicate kunzite pink',
    background: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #be185d 100%)',
    textColor: '#fdf2f8',
    accentColor: '#f9a8d4',
  },
  {
    id: 'tourmaline',
    name: 'Tourmaline Green',
    description: 'Rich tourmaline green',
    background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
    textColor: '#ecfdf5',
    accentColor: '#6ee7b7',
  },
  {
    id: 'opal',
    name: 'Opal Fire',
    description: 'Fire opal theme',
    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #fb923c 100%)',
    textColor: '#fff7ed',
    accentColor: '#fdba74',
  },
  {
    id: 'jasper',
    name: 'Jasper Stone',
    description: 'Natural jasper theme',
    background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    textColor: '#fff7ed',
    accentColor: '#fbbf24',
  },
  {
    id: 'agate',
    name: 'Agate Bands',
    description: 'Banded agate theme',
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
    textColor: '#f9fafb',
    accentColor: '#d1d5db',
  },
  {
    id: 'onyx',
    name: 'Onyx Black',
    description: 'Classic onyx black',
    background: 'linear-gradient(135deg, #000000 0%, #111827 50%, #1f2937 100%)',
    textColor: '#f9fafb',
    accentColor: '#6b7280',
  },
  {
    id: 'hematite',
    name: 'Hematite Metallic',
    description: 'Metallic hematite',
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    textColor: '#f9fafb',
    accentColor: '#9ca3af',
  },
  {
    id: 'malachite',
    name: 'Malachite Green',
    description: 'Vibrant malachite',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
    textColor: '#ecfdf5',
    accentColor: '#34d399',
  },
  {
    id: 'lapis',
    name: 'Lapis Lazuli',
    description: 'Royal lapis lazuli',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
    textColor: '#eff6ff',
    accentColor: '#60a5fa',
  },
  {
    id: 'turquoise2',
    name: 'Turquoise Classic',
    description: 'Classic turquoise',
    background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0284c7 100%)',
    textColor: '#ecfeff',
    accentColor: '#67e8f9',
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    description: 'Vibrant coral theme',
    background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
    textColor: '#fff1f2',
    accentColor: '#fb7185',
  },
  {
    id: 'amber',
    name: 'Amber Glow',
    description: 'Warm amber theme',
    background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
    textColor: '#fffbeb',
    accentColor: '#fbbf24',
  },
  {
    id: 'carnelian',
    name: 'Carnelian Red',
    description: 'Deep carnelian red',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
  },
  {
    id: 'bloodstone',
    name: 'Bloodstone Dark',
    description: 'Dark bloodstone theme',
    background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
    textColor: '#fafaf9',
    accentColor: '#a8a29e',
  },
  {
    id: 'sodalite',
    name: 'Sodalite Blue',
    description: 'Deep sodalite blue',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    textColor: '#eff6ff',
    accentColor: '#93c5fd',
  },
  {
    id: 'charoite',
    name: 'Charoite Purple',
    description: 'Rare charoite purple',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7c3aed 100%)',
    textColor: '#faf5ff',
    accentColor: '#c084fc',
  },
  {
    id: 'labradorite',
    name: 'Labradorite Flash',
    description: 'Flashing labradorite',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
    textColor: '#f5f3ff',
    accentColor: '#a78bfa',
  },
  {
    id: 'spectrolite',
    name: 'Spectrolite Rainbow',
    description: 'Rainbow spectrolite',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #db2777 100%)',
    textColor: '#fdf4ff',
    accentColor: '#e879f9',
  },
  {
    id: 'moonstone2',
    name: 'Rainbow Moonstone',
    description: 'Rainbow moonstone',
    background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #8b5cf6 100%)',
    textColor: '#f8fafc',
    accentColor: '#c4b5fd',
  },
  {
    id: 'sunstone2',
    name: 'Oregon Sunstone',
    description: 'Oregon sunstone',
    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)',
    textColor: '#fff7ed',
    accentColor: '#fdba74',
  },
  {
    id: 'phenakite',
    name: 'Phenakite Clear',
    description: 'Clear phenakite',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
    textColor: '#0c4a6e',
    accentColor: '#0ea5e9',
  },
  {
    id: 'benitoite',
    name: 'Benitoite Blue',
    description: 'Rare benitoite blue',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
    textColor: '#eff6ff',
    accentColor: '#60a5fa',
  },
  {
    id: 'poudretteite',
    name: 'Poudretteite Pink',
    description: 'Rare poudretteite pink',
    background: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #be185d 100%)',
    textColor: '#fdf2f8',
    accentColor: '#f9a8d4',
  },
  {
    id: 'grandidierite',
    name: 'Grandidierite Green',
    description: 'Rare grandidierite green',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
    textColor: '#ecfdf5',
    accentColor: '#6ee7b7',
  },
  {
    id: 'taaffeite',
    name: 'Taaffeite Purple',
    description: 'Rare taaffeite purple',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7c3aed 100%)',
    textColor: '#faf5ff',
    accentColor: '#c084fc',
  },
  {
    id: 'musgravite',
    name: 'Musgravite Dark',
    description: 'Rare musgravite dark',
    background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
    textColor: '#fafaf9',
    accentColor: '#a8a29e',
  },
  {
    id: 'jeremejevite',
    name: 'Jeremejevite Blue',
    description: 'Rare jeremejevite blue',
    background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
    textColor: '#ecfeff',
    accentColor: '#67e8f9',
  },
  {
    id: 'painite',
    name: 'Painite Red',
    description: 'Rare painite red',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
  },
];

function getThemeById(themeId) {
  return THEME_TEMPLATES.find(theme => theme.id === themeId) || THEME_TEMPLATES[0];
}

function formatActivityDate(timestamp) {
  const date = timestamp?.toDate?.();
  if (!date) return 'Recently';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getInitials(profile) {
  const source = profile?.displayName || profile?.username || 'Member';
  return source
    .split(/\s|_/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('') || 'M';
}

function normalizeAchievements(profile) {
  const achievements = profile?.achievements || [];
  if (!Array.isArray(achievements)) return [];

  return achievements.map((achievement, index) => (
    typeof achievement === 'string'
      ? { id: achievement, title: achievement.replace(/-/g, ' ') }
      : { id: achievement.id || `achievement-${index}`, ...achievement }
  ));
}

function getStats(profile, activityCount) {
  const stats = profile?.stats || {};
  return [
    ['Tasks Completed', stats.tasksCompleted || stats.completedTasks || 0],
    ['Experiments', stats.experimentsCount || 0],
    ['Products', stats.productsCount || 0],
    ['Messages', stats.messagesSent || 0],
    ['Activity Logs', activityCount],
    ['Achievements', normalizeAchievements(profile).length || stats.achievementsEarned || 0],
  ];
}

function MembershipCard({ userId, role }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const checkMembership = async () => {
      try {
        const isMember = await MembershipService.isApprovedMember(userId);
        if (!isMember) {
          const app = await MembershipService.getUserApplication(userId);
          setApplication(app);
        }
      } catch (err) {
        console.error('Error checking membership:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMembership();
  }, [userId]);

  if (loading || role === ROLES.MAIN_CEO || role === ROLES.CO_CEO || role === ROLES.MEMBER) return null;

  return (
    <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-purple-500/10 to-cyan-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Membership Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {application?.status === 'pending' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-yellow-400">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">Application Pending</span>
            </div>
            <p className="text-sm text-text-soft">
              Your membership application is under review by leadership.
            </p>
          </div>
        ) : application?.status === 'rejected' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <X className="h-5 w-5" />
              <span className="font-semibold">Application Rejected</span>
            </div>
            <p className="text-sm text-text-soft">
              {application.reviewNotes || 'Your application was not approved at this time.'}
            </p>
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 text-accent hover:text-cyan-400 font-semibold text-sm"
            >
              Submit New Application
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-text-soft">
              You currently have a standard BeastBuck account. Apply for membership to access internal collaboration, projects, research labs, and member-only experiences.
            </p>
            <Link
              to="/membership/apply"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-background font-bold hover:bg-cyan-300 transition-colors"
            >
              Apply for Membership
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CustomSectionsCard({ profile, theme }) {
  const customSections = profile?.customSections || [];
  
  if (customSections.length === 0) return null;

  return (
    <Card className="border-2 animate-scale-in" style={{ borderColor: theme.accentColor, animationDelay: '0.1s' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: theme.textColor }}>
          <Sparkles className="h-5 w-5" style={{ color: theme.accentColor }} />
          Custom Sections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customSections.map((section, index) => (
          <div 
            key={index}
            className="rounded-xl border p-4 transition-all hover:scale-[1.02]"
            style={{ 
              borderColor: `${theme.accentColor}30`,
              background: `${theme.accentColor}10`
            }}
          >
            <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>
              {section.title}
            </h3>
            <p className="text-sm opacity-80" style={{ color: theme.textColor }}>
              {section.content}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EducationInterestsCard({ profile, theme }) {
  const education = profile?.education;
  const interests = profile?.interests;
  
  if (!education && !interests) return null;

  return (
    <Card className="border-2 animate-scale-in" style={{ borderColor: theme.accentColor, animationDelay: '0.15s' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg" style={{ color: theme.textColor }}>
          <GraduationCap className="h-5 w-5" style={{ color: theme.accentColor }} />
          Education & Interests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {education && (
          <div>
            <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Education</h3>
            <p className="text-sm opacity-80" style={{ color: theme.textColor }}>{education}</p>
          </div>
        )}
        {interests && (
          <div>
            <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Interests</h3>
            <div className="flex flex-wrap gap-2">
              {interests.split(',').map((interest, index) => (
                <span 
                  key={index}
                  className="rounded-lg px-3 py-1 text-xs font-bold transition-all hover:scale-105"
                  style={{ 
                    background: `${theme.accentColor}20`,
                    color: theme.accentColor,
                    border: `1px solid ${theme.accentColor}40`
                  }}
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShareActions({ profile, theme }) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${profile.displayName || profile.username}'s profile on BeastBuck!`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.displayName || profile.username}'s Profile`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all hover:scale-105"
        style={{ 
          borderColor: theme.accentColor,
          background: `${theme.accentColor}20`,
          color: theme.accentColor 
        }}
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all hover:scale-105"
        style={{ 
          borderColor: theme.accentColor,
          background: `${theme.accentColor}20`,
          color: theme.accentColor 
        }}
      >
        <Edit className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}

function ProfileHero({ profile, status, isOwnProfile }) {
  const state = status?.state || 'offline';
  const presenceColor = PresenceService.getPresenceColor(state);
  const presenceLabel = PresenceService.getPresenceLabel(state);
  const theme = getThemeById(profile?.theme);

  return (
    <section 
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 p-6 sm:p-8 md:p-12 shadow-2xl md:p-6 animate-scale-in"
      style={{ 
        background: theme.background,
        borderColor: theme.accentColor,
        color: theme.textColor,
        animationDelay: '0s'
      }}
    >
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.accentColor }} />
      <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: theme.accentColor }} />
      
      <div className="relative flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-center md:flex-row md:items-center w-full">
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border-4 shadow-2xl transition-all duration-300 hover:scale-105" style={{ borderColor: theme.accentColor }}>
            {profile.avatar ? (
              <img src={profile.avatar} alt={`Avatar of ${profile.displayName || profile.username}`} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-4xl sm:text-5xl md:text-6xl font-black" style={{ color: theme.accentColor }}>
                {getInitials(profile)}
              </div>
            )}
            <span className={`absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 ${presenceColor}`} style={{ borderColor: theme.textColor }} />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="break-words font-heading text-3xl sm:text-4xl md:text-5xl font-black">
                {profile.displayName || profile.username || 'BeastBuck Member'}
              </h1>
              <span className="rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-widest shadow-lg" style={{ 
                background: `${theme.accentColor}30`,
                color: theme.accentColor,
                border: `1px solid ${theme.accentColor}`
              }}>
                {profile.role || 'Member'}
              </span>
            </div>
            <p className="mb-3 text-base sm:text-lg font-medium opacity-90">@{profile.username || 'member'}</p>
            
            {profile.bio && (
              <p className="mb-4 text-sm sm:text-base opacity-80 line-clamp-2 sm:line-clamp-3">
                {profile.bio}
              </p>
            )}
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm opacity-70 sm:justify-start">
              <span className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${presenceColor}`} />
                {presenceLabel}
                {status?.activity ? ` · ${status.activity}` : ''}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Joined {formatDate(profile.joinedAt)}
              </span>
              {profile.location && (
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
            </div>

            {(profile.website || profile.company) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {profile.website && (
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors hover:scale-105"
                    style={{ 
                      background: `${theme.accentColor}20`,
                      color: theme.accentColor,
                      border: `1px solid ${theme.accentColor}40`
                    }}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </a>
                )}
                {profile.company && (
                  <span className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all hover:scale-105" style={{ 
                    background: `${theme.accentColor}20`,
                    color: theme.accentColor
                  }}>
                    <Building2 className="h-3.5 w-3.5" />
                    {profile.company}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <ShareActions profile={profile} theme={theme} />
          {isOwnProfile && (
            <Link
              to={`/profile/${profile.id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border-2 px-5 py-3 text-sm sm:text-base font-bold transition-all hover:scale-105 shadow-lg"
              style={{ 
                borderColor: theme.accentColor,
                background: `${theme.accentColor}30`,
                color: theme.accentColor 
              }}
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
              Edit Profile
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function XPLevelCard({ profile }) {
  const xp = Number(profile.xp || 0);
  const progress = getLevelProgress(xp);
  const level = Math.max(Number(profile.level || 1), progress.level);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-accent" />
          XP & Level
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Current XP</p>
            <p className="mt-2 text-2xl font-bold text-white">{xp}</p>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Level</p>
            <p className="mt-2 text-2xl font-bold text-white">{level}</p>
          </div>
        </div>
        <div className="mb-2 flex justify-between text-xs text-text-muted">
          <span>Level {level}</span>
          <span>{progress.remainingXP} XP to next level</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-status-success transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SpecializationsCard({
  profile,
  specializations,
  canManage,
  managing,
  onAssign,
  onRemove,
}) {
  const assignedIds = Array.isArray(profile.specializations) ? profile.specializations : [];
  const assigned = assignedIds
    .map(id => specializations.find(item => item.id === id) || getSpecializationById(id))
    .filter(Boolean);
  const available = specializations.filter(item => !assignedIds.includes(item.id));

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-accent" />
          Specializations
        </CardTitle>
        {canManage && (
          <span className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
            <Shield className="h-3.5 w-3.5" />
            CEO Controls
          </span>
        )}
      </CardHeader>
      <CardContent>
        {assigned.length === 0 ? (
          <EmptyState 
            icon={Award} 
            title="No specializations assigned yet" 
            description="Specializations showcase your expertise in specific domains."
            compact={true}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {assigned.map(specialization => (
              <div key={specialization.id} className="rounded-xl border border-accent/20 bg-accent/10 p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="font-bold text-white">{specialization.name}</h3>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => onRemove(specialization.id)}
                      disabled={managing}
                      className="rounded-lg p-1 text-text-muted transition hover:bg-status-danger/10 hover:text-status-danger disabled:opacity-50"
                      aria-label={`Remove ${specialization.name}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs leading-5 text-text-muted">{specialization.description}</p>
              </div>
            ))}
          </div>
        )}

        {canManage && available.length > 0 && (
          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-text-muted">Assign specialization</p>
            <div className="flex flex-wrap gap-2">
              {available.map(specialization => (
                <button
                  key={specialization.id}
                  type="button"
                  onClick={() => onAssign(specialization.id)}
                  disabled={managing}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-2 text-sm font-semibold text-text-soft transition hover:border-accent/40 hover:text-white disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {specialization.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AchievementsCard({ profile }) {
  const achievements = normalizeAchievements(profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-accent" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-sm text-text-muted">
            Achievements will appear here when this member completes milestones.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map(achievement => (
              <div key={achievement.id} className="flex items-start gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
                <Medal className="mt-0.5 h-5 w-5 shrink-0 text-status-warning" />
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold capitalize text-white">{achievement.title || achievement.name}</h3>
                  {achievement.description && (
                    <p className="mt-1 text-xs leading-5 text-text-muted">{achievement.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsCard({ profile, activityCount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-accent" />
          Contribution Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {getStats(profile, activityCount).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-white/[0.03] p-4">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs font-medium text-text-muted">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SkillExpertiseCard({ profile }) {
  const skillXp = profile.skillXp || {};
  const topSkills = Object.entries(skillXp)
    .map(([skillId, xp]) => ({
      skillId,
      xp: Number(xp || 0),
      skill: DEFAULT_SKILLS.find(item => item.id === skillId),
    }))
    .filter(item => item.skill)
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  const expertise = (xp) => {
    if (xp >= 500) return 'Expert';
    if (xp >= 250) return 'Advanced';
    if (xp >= 100) return 'Builder';
    if (xp > 0) return 'Learner';
    return 'New';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-accent" />
          Skill XP & Expertise
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topSkills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-sm text-text-muted">
            Skill XP appears here when this member posts, shares resources, or completes skill challenges.
          </div>
        ) : (
          <div className="space-y-3">
            {topSkills.map(item => (
              <div key={item.skillId} className="rounded-xl border border-border bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-bold text-white">{item.skill.name}</span>
                  <span className="text-xs font-bold text-accent">{expertise(item.xp)}</span>
                </div>
                <div className="mb-1 flex justify-between text-xs text-text-muted">
                  <span>{item.xp} XP</span>
                  <span>{Math.min(100, Math.round((item.xp % 250) / 250 * 100))}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-status-success" style={{ width: `${Math.min(100, Math.round((item.xp % 250) / 250 * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AffiliationsCard({ affiliations }) {
  const departments = affiliations?.departments || [];
  const labs = affiliations?.labs || [];
  const projects = affiliations?.activeProjects || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-accent" />
          Organization Affiliations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <Building2 className="h-4 w-4 text-accent" />
            Departments
          </h3>
          {departments.length === 0 ? (
            <EmptyState 
              icon={Building2} 
              title="No department affiliation yet" 
              description="Join a department to collaborate with team members."
              compact={true}
            />
          ) : (
            <div className="space-y-2">
              {departments.map(department => <p key={department.id} className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-text-soft">{department.name}</p>)}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <FlaskConical className="h-4 w-4 text-accent" />
            Labs
          </h3>
          {labs.length === 0 ? (
            <EmptyState 
              icon={FlaskConical} 
              title="No lab affiliation yet" 
              description="Join a lab to work on research and innovation projects."
              compact={true}
            />
          ) : (
            <div className="space-y-2">
              {labs.map(lab => <p key={lab.id} className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm text-text-soft">{lab.name}</p>)}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
            <FolderKanban className="h-4 w-4 text-accent" />
            Active Projects
          </h3>
          {projects.length === 0 ? (
            <EmptyState 
              icon={FolderKanban} 
              title="No active projects yet" 
              description="Join a project to collaborate on meaningful work."
              compact={true}
            />
          ) : (
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project.id} className="rounded-lg bg-white/[0.03] px-3 py-2">
                  <p className="text-sm font-bold text-white">{project.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{project.status} / {project.progressPercent || 0}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityFeed({ activity }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activity.length === 0 ? (
          <EmptyState 
            icon={Activity} 
            title="No recent profile activity yet" 
            description="Your activity will appear here as you engage with the platform."
            compact={true}
          />
        ) : (
          <div className="space-y-3">
            {activity.map(item => (
              <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Check className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold text-white">{item.title || item.type || 'Activity'}</h3>
                  {item.description && (
                    <p className="mt-1 break-words text-xs leading-5 text-text-muted">{item.description}</p>
                  )}
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    {formatActivityDate(item.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProfilePage() {
  const { uid } = useParams();
  const [searchParams] = useSearchParams();
  const { user, roleData } = useAuth();
  const usernameParam = searchParams.get('username');
  const [resolvedUid, setResolvedUid] = useState(null);
  const profileUid = uid || resolvedUid || (!usernameParam ? user?.uid : null);
  const [profile, setProfile] = useState(null);
  const [presence, setPresence] = useState({ state: 'offline' });
  const [specializations, setSpecializations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [affiliations, setAffiliations] = useState({ departments: [], labs: [], activeProjects: [] });
  const [universeSummary, setUniverseSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [managing, setManaging] = useState(false);
  const canManageMembers = hasPermission(roleData?.role, 'canManageMembers');

  const isOwnProfile = user?.uid === profileUid;
  const profileTheme = useMemo(() => getThemeById(profile?.theme || 'default'), [profile?.theme]);

  const pageTitle = useMemo(() => {
    if (!profile) return 'Member Profile';
    return `${profile.displayName || profile.username || 'Member'}'s Profile`;
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    async function resolveUsername() {
      if (!usernameParam || uid) return;

      try {
        const nextUid = await UsersService.getUidForUsername(usernameParam);
        if (!cancelled) {
          setResolvedUid(nextUid);
          if (!nextUid) setLoading(false);
        }
      } catch (err) {
        console.error('Username profile lookup failed:', err);
        if (!cancelled) {
          setError('Could not find a profile for that username.');
          setLoading(false);
        }
      }
    }

    resolveUsername();

    return () => {
      cancelled = true;
    };
  }, [uid, usernameParam]);

  useEffect(() => {
    if (!profileUid) return undefined;

    const unsubscribe = UsersService.subscribeToUserProfile(profileUid, {
      onProfile: (nextProfile) => {
        setProfile(nextProfile);
        setLoading(false);
      },
      onError: (err) => {
        console.error('Profile listener failed:', err);
        setError('Could not load this profile. Check Firestore permissions and try again.');
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [profileUid]);

  useEffect(() => {
    if (!profileUid) return undefined;
    return UsersService.subscribeToPresence(profileUid, {
      onStatus: setPresence,
    });
  }, [profileUid]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfileSupportData() {
      try {
        const [specializationResult, activityResult, affiliationResult] = await Promise.allSettled([
          UsersService.getSpecializations(),
          UsersService.getUserActivity(profileUid),
          OrganizationService.getMemberAffiliations(profileUid),
        ]);

        if (!cancelled) {
          if (specializationResult.status === 'fulfilled') {
            setSpecializations(specializationResult.value);
          }
          if (activityResult.status === 'fulfilled') {
            setActivity(activityResult.value);
          }
          if (affiliationResult.status === 'fulfilled') {
            setAffiliations(affiliationResult.value);
          }
        }
      } catch (err) {
        console.error('Profile support data failed:', err);
        if (!cancelled) setError('Some profile details could not be loaded.');
      }
    }

    if (profileUid) loadProfileSupportData();

    return () => {
      cancelled = true;
    };
  }, [profileUid]);

  useEffect(() => {
    if (!profileUid) return;
    let cancelled = false;
    Promise.all([
      UniverseService.getUniverseProfile(profileUid),
      UniverseService.getMemberJourney(profileUid),
      UniverseService.getMemberGoals(profileUid),
    ])
      .then(([profileData, journey, goals]) => {
        if (!cancelled) setUniverseSummary({ profile: profileData, journey, goals });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [profileUid]);

  useEffect(() => {
    if (!canManageMembers || !user?.uid) return;

    UsersService.seedDefaultSpecializations(user.uid).catch((err) => {
      console.error('Default specialization seed failed:', err);
    });
  }, [canManageMembers, user?.uid]);

  const assignSpecialization = async (specializationId) => {
    setManaging(true);
    setError(null);
    try {
      await UsersService.assignSpecialization(profileUid, specializationId);
    } catch (err) {
      console.error('Assign specialization failed:', err);
      setError('Specialization could not be assigned. CEO or Co-CEO access is required.');
    } finally {
      setManaging(false);
    }
  };

  const removeSpecialization = async (specializationId) => {
    setManaging(true);
    setError(null);
    try {
      await UsersService.removeSpecialization(profileUid, specializationId);
    } catch (err) {
      console.error('Remove specialization failed:', err);
      setError('Specialization could not be removed. CEO or Co-CEO access is required.');
    } finally {
      setManaging(false);
    }
  };

  if (!uid && !usernameParam && user?.uid) {
    return <Navigate to={`/profile/${user.uid}`} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-4xl space-y-6 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center p-4 text-center">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <UserRound className="mx-auto mb-4 h-12 w-12 text-text-muted" />
          <h1 className="mb-2 text-2xl font-bold text-white">Profile not found</h1>
          <p className="text-sm text-text-muted">This member profile does not exist or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="flex flex-col gap-2 animate-fade-in">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Identity</p>
        <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">{pageTitle}</h1>
        <p className="text-sm text-text-muted">
          {isOwnProfile ? 'Your BeastBuck identity, progress, and reputation.' : 'Member identity, progress, and reputation.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-status-danger/20 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </div>
      )}

      <ProfileHero profile={profile} status={presence} isOwnProfile={isOwnProfile} />

      <CustomSectionsCard profile={profile} theme={profileTheme} />

      <EducationInterestsCard profile={profile} theme={profileTheme} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="space-y-5">
          <SpecializationsCard
            profile={profile}
            specializations={specializations}
            canManage={canManageMembers}
            managing={managing}
            onAssign={assignSpecialization}
            onRemove={removeSpecialization}
          />
          <AffiliationsCard affiliations={affiliations} />
          {universeSummary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Universe Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-text-soft">
                <p>
                  Journey milestones:{' '}
                  <span className="font-bold text-white">
                    {Object.keys(universeSummary.journey?.milestones || {}).length}
                  </span>
                </p>
                <p>
                  Active goals:{' '}
                  <span className="font-bold text-white">
                    {(universeSummary.goals || []).filter(g => g.status === 'ACTIVE').length}
                  </span>
                </p>
                {isOwnProfile && (
                  <a href="/universe" className="inline-block font-bold text-accent hover:underline">
                    Open Universe OS →
                  </a>
                )}
              </CardContent>
            </Card>
          )}
          <AchievementsCard profile={profile} />
          <ActivityFeed activity={activity} />
        </div>

        <aside className="space-y-5">
          {isOwnProfile && <MembershipCard userId={profileUid} role={profile.role} />}
          <XPLevelCard profile={profile} />
          <SkillExpertiseCard profile={profile} />
          <StatsCard profile={profile} activityCount={activity.length} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-accent" />
                Reputation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-text-soft">
                <div className="flex justify-between gap-3">
                  <span>Role</span>
                  <span className="font-bold text-white">{profile.role || 'Member'}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Specializations</span>
                  <span className="font-bold text-white">{(profile.specializations || []).length}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Achievements</span>
                  <span className="font-bold text-white">{normalizeAchievements(profile).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
