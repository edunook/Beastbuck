import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UsersService } from '@services/firestore/users';
import { PortfolioService } from '@services/firestore/portfolio';
import { LoadingState } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { 
  Award, 
  FolderKanban, 
  FlaskConical, 
  TrendingUp, 
  ExternalLink,
  Lock,
  Globe,
  Edit,
  Crown,
  Shield,
  Mail,
  Download,
  Share2,
  Star,
  Code,
  Palette,
  Zap,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  GraduationCap,
  Activity,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '@shared/constants/roles';
import { PresenceService } from '@services/realtime/presence';

// Theme Templates - Same as ProfilePage for consistency
const THEME_TEMPLATES = [
  {
    id: 'sunset-red',
    name: 'Sunset Red',
    description: 'Warm reddish sunset theme with orange accents',
    background: 'linear-gradient(135deg, #2d1f3f 0%, #4a2c2a 50%, #6b3a3a 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b6b',
    cardBg: 'rgba(255, 107, 107, 0.1)',
  },
  {
    id: 'default',
    name: 'Default Dark',
    description: 'Classic dark theme with cyan accents',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
    cardBg: 'rgba(255, 255, 255, 0.05)',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Deep ocean gradients with blue accents',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    textColor: '#e94560',
    accentColor: '#00d4ff',
    cardBg: 'rgba(0, 212, 255, 0.05)',
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Warm sunset colors with purple accents',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    accentColor: '#f093fb',
    cardBg: 'rgba(240, 147, 251, 0.05)',
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural green tones with earth accents',
    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    textColor: '#ffffff',
    accentColor: '#a8e6cf',
    cardBg: 'rgba(168, 230, 207, 0.05)',
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    description: 'Dark purple with neon accents',
    background: 'linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)',
    textColor: '#e94560',
    accentColor: '#ff00ff',
    cardBg: 'rgba(255, 0, 255, 0.05)',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon cyberpunk aesthetic',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #2d1b4e 100%)',
    textColor: '#00ff00',
    accentColor: '#ff00ff',
    cardBg: 'rgba(255, 0, 255, 0.05)',
  },
  {
    id: 'minimal',
    name: 'Minimal Light',
    description: 'Clean minimal light theme',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    textColor: '#2d3748',
    accentColor: '#4299e1',
    cardBg: 'rgba(66, 153, 225, 0.05)',
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    description: 'Luxurious gold and dark theme',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #4a4a4a 50%, #ffd700 100%)',
    textColor: '#ffffff',
    accentColor: '#ffd700',
    cardBg: 'rgba(255, 215, 0, 0.05)',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Space',
    description: 'Space theme with star effects',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #2d1b4e 100%)',
    textColor: '#e94560',
    accentColor: '#00d4ff',
    cardBg: 'rgba(0, 212, 255, 0.05)',
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern lights color scheme',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    textColor: '#ffffff',
    accentColor: '#00ff87',
    cardBg: 'rgba(0, 255, 135, 0.05)',
  },
  {
    id: 'fire',
    name: 'Fire & Ember',
    description: 'Warm fire colors with orange accents',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #4a1a1a 50%, #ff6b35 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b35',
    cardBg: 'rgba(255, 107, 53, 0.05)',
  },
  {
    id: 'ice',
    name: 'Ice Crystal',
    description: 'Cool ice blue theme',
    background: 'linear-gradient(135deg, #e0f7fa 0%, #80deea 50%, #26c6da 100%)',
    textColor: '#006064',
    accentColor: '#00bcd4',
    cardBg: 'rgba(0, 188, 212, 0.05)',
  },
  {
    id: 'retro',
    name: 'Retro Wave',
    description: '80s retro synthwave style',
    background: 'linear-gradient(135deg, #2d1b4e 0%, #ff00ff 50%, #00ffff 100%)',
    textColor: '#ffffff',
    accentColor: '#ff00ff',
    cardBg: 'rgba(255, 0, 255, 0.05)',
  },
  {
    id: 'nature',
    name: 'Nature Earth',
    description: 'Earth tones and natural colors',
    background: 'linear-gradient(135deg, #5d4157 0%, #a8c0ff 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b6b',
    cardBg: 'rgba(255, 107, 107, 0.05)',
  },
  {
    id: 'matrix',
    name: 'Matrix Code',
    description: 'Matrix green code theme',
    background: 'linear-gradient(135deg, #000000 0%, #0d0d0d 50%, #1a1a1a 100%)',
    textColor: '#00ff00',
    accentColor: '#00ff00',
    cardBg: 'rgba(0, 255, 0, 0.05)',
  },
  {
    id: 'sunset2',
    name: 'California Sunset',
    description: 'Warm California sunset colors',
    background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    cardBg: 'rgba(255, 255, 255, 0.05)',
  },
  {
    id: 'lavender',
    name: 'Lavender Dreams',
    description: 'Soft lavender purple theme',
    background: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)',
    textColor: '#6c5ce7',
    accentColor: '#a29bfe',
    cardBg: 'rgba(162, 155, 254, 0.05)',
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    description: 'Pink cherry blossom theme',
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    textColor: '#ffffff',
    accentColor: '#ff6b9d',
    cardBg: 'rgba(255, 107, 157, 0.05)',
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Vibrant neon colors on dark',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #2a2a5e 100%)',
    textColor: '#00ffff',
    accentColor: '#ff00ff',
    cardBg: 'rgba(255, 0, 255, 0.05)',
  },
  {
    id: 'volcanic',
    name: 'Volcanic Ash',
    description: 'Dark volcanic rock theme',
    background: 'linear-gradient(135deg, #2c3e50 0%, #4a5568 50%, #718096 100%)',
    textColor: '#f7fafc',
    accentColor: '#fc8181',
    cardBg: 'rgba(252, 129, 129, 0.05)',
  },
  {
    id: 'emerald',
    name: 'Emerald City',
    description: 'Rich emerald green theme',
    background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    textColor: '#ecfdf5',
    accentColor: '#34d399',
    cardBg: 'rgba(52, 211, 153, 0.05)',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Blue',
    description: 'Deep sapphire blue theme',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
    textColor: '#eff6ff',
    accentColor: '#60a5fa',
    cardBg: 'rgba(96, 165, 250, 0.05)',
  },
  {
    id: 'ruby',
    name: 'Ruby Red',
    description: 'Rich ruby red theme',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
    cardBg: 'rgba(248, 113, 113, 0.05)',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Purple',
    description: 'Beautiful amethyst purple',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7e22ce 100%)',
    textColor: '#faf5ff',
    accentColor: '#c084fc',
    cardBg: 'rgba(192, 132, 252, 0.05)',
  },
  {
    id: 'golden',
    name: 'Golden Hour',
    description: 'Golden hour sunset theme',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
    textColor: '#fffbeb',
    accentColor: '#fbbf24',
    cardBg: 'rgba(251, 191, 36, 0.05)',
  },
  {
    id: 'silver',
    name: 'Silver Moon',
    description: 'Elegant silver moon theme',
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
    textColor: '#f9fafb',
    accentColor: '#d1d5db',
    cardBg: 'rgba(209, 213, 219, 0.05)',
  },
  {
    id: 'bronze',
    name: 'Bronze Age',
    description: 'Classic bronze metal theme',
    background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    textColor: '#fff7ed',
    accentColor: '#fbbf24',
    cardBg: 'rgba(251, 191, 36, 0.05)',
  },
  {
    id: 'platinum',
    name: 'Platinum Elite',
    description: 'Premium platinum theme',
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    textColor: '#f3f4f6',
    accentColor: '#e5e7eb',
    cardBg: 'rgba(229, 231, 235, 0.05)',
  },
  {
    id: 'titanium',
    name: 'Titanium Strong',
    description: 'Strong titanium metal theme',
    background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #374151 100%)',
    textColor: '#f9fafb',
    accentColor: '#9ca3af',
    cardBg: 'rgba(156, 163, 175, 0.05)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Dark',
    description: 'Deep obsidian black theme',
    background: 'linear-gradient(135deg, #030712 0%, #111827 50%, #1f2937 100%)',
    textColor: '#f9fafb',
    accentColor: '#6b7280',
    cardBg: 'rgba(107, 114, 128, 0.05)',
  },
  {
    id: 'pearl',
    name: 'Pearl White',
    description: 'Elegant pearl white theme',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    textColor: '#1e293b',
    accentColor: '#64748b',
    cardBg: 'rgba(100, 116, 139, 0.05)',
  },
  {
    id: 'jade',
    name: 'Jade Stone',
    description: 'Natural jade stone theme',
    background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
    textColor: '#ecfdf5',
    accentColor: '#6ee7b7',
    cardBg: 'rgba(110, 231, 183, 0.05)',
  },
  {
    id: 'topaz',
    name: 'Topaz Gem',
    description: 'Beautiful topaz gem theme',
    background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)',
    textColor: '#f0f9ff',
    accentColor: '#38bdf8',
    cardBg: 'rgba(56, 189, 248, 0.05)',
  },
  {
    id: 'garnet',
    name: 'Garnet Red',
    description: 'Deep garnet red theme',
    background: 'linear-gradient(135deg, #881337 0%, #9f1239 50%, #be123c 100%)',
    textColor: '#fff1f2',
    accentColor: '#fb7185',
    cardBg: 'rgba(251, 113, 133, 0.05)',
  },
  {
    id: 'aquamarine',
    name: 'Aquamarine Sea',
    description: 'Clear aquamarine theme',
    background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
    textColor: '#ecfeff',
    accentColor: '#67e8f9',
    cardBg: 'rgba(103, 232, 249, 0.05)',
  },
  {
    id: 'peridot',
    name: 'Peridot Green',
    description: 'Vibrant peridot green',
    background: 'linear-gradient(135deg, #3f6212 0%, #4d7c0f 50%, #65a30d 100%)',
    textColor: '#f7fee7',
    accentColor: '#a3e635',
    cardBg: 'rgba(163, 230, 53, 0.05)',
  },
  {
    id: 'turquoise',
    name: 'Turquoise Stone',
    description: 'Natural turquoise theme',
    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
    textColor: '#f0fdfa',
    accentColor: '#5eead4',
    cardBg: 'rgba(94, 234, 212, 0.05)',
  },
  {
    id: 'amethyst2',
    name: 'Amethyst Dream',
    description: 'Dreamy amethyst purple',
    background: 'linear-gradient(135deg, #6b21a8 0%, #7c3aed 50%, #8b5cf6 100%)',
    textColor: '#faf5ff',
    accentColor: '#d8b4fe',
    cardBg: 'rgba(216, 180, 254, 0.05)',
  },
  {
    id: 'citrine',
    name: 'Citrine Yellow',
    description: 'Bright citrine yellow',
    background: 'linear-gradient(135deg, #ca8a04 0%, #eab308 50%, #facc15 100%)',
    textColor: '#fefce8',
    accentColor: '#fde047',
    cardBg: 'rgba(253, 224, 71, 0.05)',
  },
  {
    id: 'moonstone',
    name: 'Moonstone Glow',
    description: 'Mystical moonstone theme',
    background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #94a3b8 100%)',
    textColor: '#f8fafc',
    accentColor: '#cbd5e1',
    cardBg: 'rgba(203, 213, 225, 0.05)',
  },
  {
    id: 'sunstone',
    name: 'Sunstone Warm',
    description: 'Warm sunstone theme',
    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)',
    textColor: '#fff7ed',
    accentColor: '#fdba74',
    cardBg: 'rgba(253, 186, 116, 0.05)',
  },
  {
    id: 'alexandrite',
    name: 'Alexandrite Rare',
    description: 'Rare alexandrite theme',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
    textColor: '#f5f3ff',
    accentColor: '#a78bfa',
    cardBg: 'rgba(167, 139, 250, 0.05)',
  },
  {
    id: 'tanzanite',
    name: 'Tanzanite Blue',
    description: 'Rare tanzanite blue',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    textColor: '#eef2ff',
    accentColor: '#818cf8',
    cardBg: 'rgba(129, 140, 248, 0.05)',
  },
  {
    id: 'morganite',
    name: 'Morganite Pink',
    description: 'Soft morganite pink',
    background: 'linear-gradient(135deg, #9d174d 0%, #be185d 50%, #db2777 100%)',
    textColor: '#fdf2f8',
    accentColor: '#f472b6',
    cardBg: 'rgba(244, 114, 182, 0.05)',
  },
  {
    id: 'spinel',
    name: 'Spinel Red',
    description: 'Vibrant spinel red',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 50%, #dc2626 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
    cardBg: 'rgba(248, 113, 113, 0.05)',
  },
  {
    id: 'zircon',
    name: 'Zircon Blue',
    description: 'Clear zircon blue',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
    textColor: '#eff6ff',
    accentColor: '#93c5fd',
    cardBg: 'rgba(147, 197, 253, 0.05)',
  },
  {
    id: 'kunzite',
    name: 'Kunzite Pink',
    description: 'Delicate kunzite pink',
    background: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #be185d 100%)',
    textColor: '#fdf2f8',
    accentColor: '#f9a8d4',
    cardBg: 'rgba(249, 168, 212, 0.05)',
  },
  {
    id: 'tourmaline',
    name: 'Tourmaline Green',
    description: 'Rich tourmaline green',
    background: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
    textColor: '#ecfdf5',
    accentColor: '#6ee7b7',
    cardBg: 'rgba(110, 231, 183, 0.05)',
  },
  {
    id: 'opal',
    name: 'Opal Fire',
    description: 'Fire opal theme',
    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #fb923c 100%)',
    textColor: '#fff7ed',
    accentColor: '#fdba74',
    cardBg: 'rgba(253, 186, 116, 0.05)',
  },
  {
    id: 'jasper',
    name: 'Jasper Stone',
    description: 'Natural jasper theme',
    background: 'linear-gradient(135deg, #78350f 0%, #92400e 50%, #b45309 100%)',
    textColor: '#fff7ed',
    accentColor: '#fbbf24',
    cardBg: 'rgba(251, 191, 36, 0.05)',
  },
  {
    id: 'agate',
    name: 'Agate Bands',
    description: 'Banded agate theme',
    background: 'linear-gradient(135deg, #374151 0%, #4b5563 50%, #6b7280 100%)',
    textColor: '#f9fafb',
    accentColor: '#d1d5db',
    cardBg: 'rgba(209, 213, 219, 0.05)',
  },
  {
    id: 'onyx',
    name: 'Onyx Black',
    description: 'Classic onyx black',
    background: 'linear-gradient(135deg, #000000 0%, #111827 50%, #1f2937 100%)',
    textColor: '#f9fafb',
    accentColor: '#6b7280',
    cardBg: 'rgba(107, 114, 128, 0.05)',
  },
  {
    id: 'hematite',
    name: 'Hematite Metallic',
    description: 'Metallic hematite',
    background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
    textColor: '#f9fafb',
    accentColor: '#9ca3af',
    cardBg: 'rgba(156, 163, 175, 0.05)',
  },
  {
    id: 'malachite',
    name: 'Malachite Green',
    description: 'Vibrant malachite',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
    textColor: '#ecfdf5',
    accentColor: '#34d399',
    cardBg: 'rgba(52, 211, 153, 0.05)',
  },
  {
    id: 'lapis',
    name: 'Lapis Lazuli',
    description: 'Royal lapis lazuli',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
    textColor: '#eff6ff',
    accentColor: '#60a5fa',
    cardBg: 'rgba(96, 165, 250, 0.05)',
  },
  {
    id: 'turquoise2',
    name: 'Turquoise Classic',
    description: 'Classic turquoise',
    background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #0284c7 100%)',
    textColor: '#ecfeff',
    accentColor: '#67e8f9',
    cardBg: 'rgba(103, 232, 249, 0.05)',
  },
  {
    id: 'coral',
    name: 'Coral Reef',
    description: 'Vibrant coral theme',
    background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)',
    textColor: '#fff1f2',
    accentColor: '#fb7185',
    cardBg: 'rgba(251, 113, 133, 0.05)',
  },
  {
    id: 'amber',
    name: 'Amber Glow',
    description: 'Warm amber theme',
    background: 'linear-gradient(135deg, #92400e 0%, #b45309 50%, #d97706 100%)',
    textColor: '#fffbeb',
    accentColor: '#fbbf24',
    cardBg: 'rgba(251, 191, 36, 0.05)',
  },
  {
    id: 'carnelian',
    name: 'Carnelian Red',
    description: 'Deep carnelian red',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
    cardBg: 'rgba(248, 113, 113, 0.05)',
  },
  {
    id: 'bloodstone',
    name: 'Bloodstone Dark',
    description: 'Dark bloodstone theme',
    background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
    textColor: '#fafaf9',
    accentColor: '#a8a29e',
    cardBg: 'rgba(168, 162, 158, 0.05)',
  },
  {
    id: 'sodalite',
    name: 'Sodalite Blue',
    description: 'Deep sodalite blue',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    textColor: '#eff6ff',
    accentColor: '#93c5fd',
    cardBg: 'rgba(147, 197, 253, 0.05)',
  },
  {
    id: 'charoite',
    name: 'Charoite Purple',
    description: 'Rare charoite purple',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7c3aed 100%)',
    textColor: '#faf5ff',
    accentColor: '#c084fc',
    cardBg: 'rgba(192, 132, 252, 0.05)',
  },
  {
    id: 'labradorite',
    name: 'Labradorite Flash',
    description: 'Flashing labradorite',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
    textColor: '#f5f3ff',
    accentColor: '#a78bfa',
    cardBg: 'rgba(167, 139, 250, 0.05)',
  },
  {
    id: 'spectrolite',
    name: 'Spectrolite Rainbow',
    description: 'Rainbow spectrolite',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 50%, #db2777 100%)',
    textColor: '#fdf4ff',
    accentColor: '#e879f9',
    cardBg: 'rgba(232, 121, 249, 0.05)',
  },
  {
    id: 'moonstone2',
    name: 'Rainbow Moonstone',
    description: 'Rainbow moonstone',
    background: 'linear-gradient(135deg, #475569 0%, #64748b 50%, #8b5cf6 100%)',
    textColor: '#f8fafc',
    accentColor: '#c4b5fd',
    cardBg: 'rgba(196, 181, 253, 0.05)',
  },
  {
    id: 'sunstone2',
    name: 'Oregon Sunstone',
    description: 'Oregon sunstone',
    background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 50%, #f97316 100%)',
    textColor: '#fff7ed',
    accentColor: '#fdba74',
    cardBg: 'rgba(253, 186, 116, 0.05)',
  },
  {
    id: 'phenakite',
    name: 'Phenakite Clear',
    description: 'Clear phenakite',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)',
    textColor: '#0c4a6e',
    accentColor: '#0ea5e9',
    cardBg: 'rgba(14, 165, 233, 0.05)',
  },
  {
    id: 'benitoite',
    name: 'Benitoite Blue',
    description: 'Rare benitoite blue',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
    textColor: '#eff6ff',
    accentColor: '#60a5fa',
    cardBg: 'rgba(96, 165, 250, 0.05)',
  },
  {
    id: 'poudretteite',
    name: 'Poudretteite Pink',
    description: 'Rare poudretteite pink',
    background: 'linear-gradient(135deg, #831843 0%, #9d174d 50%, #be185d 100%)',
    textColor: '#fdf2f8',
    accentColor: '#f9a8d4',
    cardBg: 'rgba(249, 168, 212, 0.05)',
  },
  {
    id: 'grandidierite',
    name: 'Grandidierite Green',
    description: 'Rare grandidierite green',
    background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
    textColor: '#ecfdf5',
    accentColor: '#6ee7b7',
    cardBg: 'rgba(110, 231, 183, 0.05)',
  },
  {
    id: 'taaffeite',
    name: 'Taaffeite Purple',
    description: 'Rare taaffeite purple',
    background: 'linear-gradient(135deg, #581c87 0%, #6b21a8 50%, #7c3aed 100%)',
    textColor: '#faf5ff',
    accentColor: '#c084fc',
    cardBg: 'rgba(192, 132, 252, 0.05)',
  },
  {
    id: 'musgravite',
    name: 'Musgravite Dark',
    description: 'Rare musgravite dark',
    background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%)',
    textColor: '#fafaf9',
    accentColor: '#a8a29e',
    cardBg: 'rgba(168, 162, 158, 0.05)',
  },
  {
    id: 'jeremejevite',
    name: 'Jeremejevite Blue',
    description: 'Rare jeremejevite blue',
    background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #06b6d4 100%)',
    textColor: '#ecfeff',
    accentColor: '#67e8f9',
    cardBg: 'rgba(103, 232, 249, 0.05)',
  },
  {
    id: 'painite',
    name: 'Painite Red',
    description: 'Rare painite red',
    background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
    textColor: '#fef2f2',
    accentColor: '#f87171',
    cardBg: 'rgba(248, 113, 113, 0.05)',
  },
];

function getVerificationHalo(role, badges) {
  if (role === ROLES.MAIN_CEO) {
    return {
      color: '#ffd700',
      glow: '0 0 20px rgba(255, 215, 0, 0.6)',
      label: 'CEO'
    };
  }
  if (role === ROLES.CO_CEO) {
    return {
      color: '#c0c0c0',
      glow: '0 0 20px rgba(192, 192, 192, 0.6)',
      label: 'Co-CEO'
    };
  }
  if (badges?.includes('mentor')) {
    return {
      color: '#00ff87',
      glow: '0 0 20px rgba(0, 255, 135, 0.6)',
      label: 'Mentor'
    };
  }
  if (badges?.includes('innovator')) {
    return {
      color: '#ff6b6b',
      glow: '0 0 20px rgba(255, 107, 107, 0.6)',
      label: 'Innovator'
    };
  }
  return null;
}

export default function PortfolioPage() {
  const { username } = useParams();
  const { user, roleData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showPrivacyPanel, setShowPrivacyPanel] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    async function loadPortfolio() {
      try {
        const uid = await UsersService.getUidForUsername(username);
        if (!uid) {
          setLoading(false);
          return;
        }

        const userProfile = await UsersService.getUserProfile(uid);
        if (!userProfile) {
          console.error('User profile not found for uid:', uid);
          setLoading(false);
          return;
        }
        
        setProfile(userProfile);

        // Debug logging to see what's in the profile
        console.log('PortfolioPage - Loaded userProfile:', userProfile);
        console.log('PortfolioPage - userProfile.theme:', userProfile?.theme);
        console.log('PortfolioPage - userProfile.profileCustomization:', userProfile?.profileCustomization);

        // Use profileCustomization if available (from PortfolioCustomization page)
        // Check if profileCustomization has actual content (not just empty object)
        const hasCustomTheme = userProfile?.profileCustomization?.accentColor ||
                             userProfile?.profileCustomization?.backgroundTheme;

        if (hasCustomTheme) {
          // User has custom color customization from PortfolioCustomization page
          console.log('PortfolioPage - Using custom theme from profileCustomization');
          setSelectedTheme('custom');
        } else if (userProfile?.theme) {
          // User has selected a preset theme from ProfileEdit
          console.log('PortfolioPage - Using preset theme:', userProfile.theme);
          setSelectedTheme(userProfile.theme);
        } else {
          // No theme selected, use default
          console.log('PortfolioPage - No theme found, using default');
          setSelectedTheme('default');
        }

        // Use profile data directly - theme is stored in profile
        // Skip loading additional portfolio data to avoid permission errors
        setPortfolioData({
          ...userProfile,
          stats: {
            totalXP: userProfile?.xp || 0,
            level: userProfile?.level || 1,
            projectsJoined: 0,
            experimentsCreated: 0,
            productsCreated: 0,
            certificatesEarned: 0,
            achievementsEarned: (userProfile?.achievements || []).length,
          },
          specializations: userProfile?.specializations || [],
          achievements: userProfile?.achievements || [],
          activity: []
        });

        // Load presence status (with error handling)
        try {
          const presence = await PresenceService.getUserPresence(uid);
          setStatus(presence);
        } catch (presenceErr) {
          console.warn('Failed to load presence status:', presenceErr);
          setStatus({ state: 'offline' }); // Default to offline if presence fails
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setLoading(false);
      }
    }
    loadPortfolio();
  }, [username]);

  const isOwnProfile = user?.uid === profile?.uid;
  
  // Security check: Only user can edit their own profile, or CEO/Co-CEO can edit any profile
  const userRole = roleData?.role?.toLowerCase().trim() || '';
  const isCEO = userRole === 'main ceo' || userRole === 'ceo';
  const isCoCEO = userRole === 'co-ceo' || userRole === 'co ceo';
  const isExecutive = isCEO || isCoCEO;
  const canEdit = isOwnProfile || isExecutive;
  
  const verification = getVerificationHalo(profile?.role, profile?.badges);
  const state = status?.state || 'offline';
  const presenceColor = PresenceService.getPresenceColor(state);
  const presenceLabel = PresenceService.getPresenceLabel(state);

  const handlePrivacyToggle = async (section, isVisible) => {
    // Security check: Only user can edit their own profile, or CEO/Co-CEO can edit any profile
    if (!isOwnProfile && !isExecutive) return;
    
    try {
      await PortfolioService.updatePrivacySettings(profile.uid, {
        [section]: isVisible
      });
      setPortfolioData(prev => ({
        ...prev,
        privacy: { ...prev.privacy, [section]: isVisible }
      }));
    } catch (err) {
      console.error('Failed to update privacy:', err);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><LoadingState text="Loading portfolio..." /></div>;
  }

  if (!profile) {
    return <div className="p-20 text-center text-white font-bold text-2xl">Portfolio Not Found</div>;
  }

  const theme = (() => {
    // Check if profileCustomization has actual content
    const hasCustomTheme = profile?.profileCustomization?.accentColor ||
                         profile?.profileCustomization?.backgroundTheme;

    // Use profile.theme directly instead of selectedTheme state to avoid timing issues
    const themeToUse = hasCustomTheme ? 'custom' : (profile?.theme || 'default');

    console.log('PortfolioPage - Calculating theme with:', {
      themeToUse,
      profileTheme: profile?.theme,
      hasProfileCustomization: hasCustomTheme,
      profileCustomization: profile?.profileCustomization
    });

    if (themeToUse === 'custom' && hasCustomTheme) {
      const custom = profile.profileCustomization;
      console.log('PortfolioPage - Rendering custom theme with accentColor:', custom.accentColor);
      return {
        id: 'custom',
        name: 'Custom Theme',
        background: custom.backgroundTheme === 'dark'
          ? 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)'
          : custom.backgroundTheme === 'light'
          ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
          : custom.backgroundTheme === 'gradient'
          ? `linear-gradient(135deg, ${custom.accentColor}22 0%, ${custom.accentColor}44 50%, ${custom.accentColor}66 100%)`
          : custom.backgroundTheme === 'aurora'
          ? `linear-gradient(135deg, ${custom.accentColor}11 0%, ${custom.accentColor}33 25%, ${custom.accentColor}55 50%, ${custom.accentColor}77 75%, ${custom.accentColor}99 100%)`
          : 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        accentColor: custom.accentColor || '#00d4ff',
        textColor: custom.backgroundTheme === 'light' ? '#2d3748' : '#ffffff',
        cardBg: custom.cardStyle === 'glass'
          ? `rgba(255, 255, 255, 0.05)`
          : custom.cardStyle === 'solid'
          ? `${custom.accentColor}15`
          : custom.cardStyle === 'bordered'
          ? 'transparent'
          : 'rgba(255, 255, 255, 0.02)'
      };
    }

    // Find the preset theme by ID
    const foundTheme = THEME_TEMPLATES.find(t => t.id === themeToUse);
    console.log('PortfolioPage - Rendering preset theme:', foundTheme?.id, foundTheme?.name);
    return foundTheme || THEME_TEMPLATES[0];
  })();
  const privacy = portfolioData?.privacy || {};

  return (
    <div className="min-h-screen bg-background">
      {/* Portfolio Cover Section with Dynamic Styling */}
      <section 
        className="relative overflow-hidden border-b-2 p-8 md:p-12 lg:p-16 transition-all duration-500"
        style={{ 
          background: theme.background,
          borderColor: theme.accentColor,
          color: theme.textColor
        }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full opacity-30 blur-3xl transition-all duration-700 animate-pulse" style={{ background: theme.accentColor }} />
        <div className="absolute -left-32 -bottom-32 h-64 w-64 rounded-full opacity-30 blur-3xl transition-all duration-700 animate-pulse" style={{ background: theme.accentColor }} />
        
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Avatar with Glowing Halo */}
            <div className="flex items-center gap-6">
              <div 
                className="relative h-32 w-32 md:h-40 md:w-40 shrink-0 overflow-hidden rounded-2xl border-4 shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ 
                  borderColor: theme.accentColor,
                  boxShadow: verification?.glow || 'none'
                }}
              >
                {profile.photoURL || profile.avatar ? (
                  <img src={profile.photoURL || profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-black" style={{ color: theme.accentColor }}>
                    {profile.displayName?.[0] || 'M'}
                  </div>
                )}
                <span className={`absolute bottom-3 right-3 h-4 w-4 rounded-full border-2 ${presenceColor}`} style={{ borderColor: theme.textColor }} />
                {verification && (
                  <div className="absolute -top-2 -right-2 rounded-full p-2" style={{ background: verification.color }}>
                    <Crown className="h-4 w-4 text-black" />
                  </div>
                )}
              </div>

              <div>
                <h1 className="font-heading text-3xl font-black md:text-4xl lg:text-5xl">
                  {profile.displayName || profile.username}
                </h1>
                <p className="mt-2 text-lg opacity-80">@{profile.username}</p>
                <div className="mt-2 flex items-center gap-2 opacity-70">
                  <span className={`h-2.5 w-2.5 rounded-full ${presenceColor}`} />
                  <span className="text-sm">{presenceLabel}</span>
                  {status?.activity && <span className="text-sm"> · {status.activity}</span>}
                </div>
                {verification && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold" style={{ background: `${verification.color}30`, color: verification.color }}>
                    <Shield className="h-4 w-4" />
                    {verification.label}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canEdit && (
                <Link
                  to={`/profile/${profile.uid}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-bold transition-all hover:scale-105"
                  style={{ 
                    borderColor: theme.accentColor,
                    background: `${theme.accentColor}20`,
                    color: theme.accentColor 
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Portfolio
                </Link>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${profile.displayName || profile.username}'s Portfolio`,
                      text: `Check out ${profile.displayName || profile.username}'s portfolio on BeastBuck!`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-bold transition-all hover:scale-105"
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
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 font-bold transition-all hover:scale-105"
                style={{ 
                  borderColor: theme.accentColor,
                  background: `${theme.accentColor}20`,
                  color: theme.accentColor 
                }}
              >
                <Download className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-6 max-w-3xl text-lg opacity-90">{profile.bio}</p>
          )}
        </div>
      </section>

      {/* Privacy Panel - Only for own profile */}
      {showPrivacyPanel && isOwnProfile && (
        <div className="mx-auto max-w-6xl p-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-accent" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'showProjects', label: 'Show Projects' },
                { key: 'showResearch', label: 'Show Research Papers' },
                { key: 'showAchievements', label: 'Show Achievements' },
                { key: 'showStats', label: 'Show Statistics' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="font-bold text-white">{label}</span>
                  <button
                    onClick={() => handlePrivacyToggle(key, !privacy[key])}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${privacy[key] ? 'bg-accent' : 'bg-white/10'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${privacy[key] ? 'translate-x-5.5' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Portfolio Content - Show all data to everyone */}
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-8">
        {/* Quick Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickInfoCard 
            icon={Briefcase}
            label="Role"
            value={profile?.role || 'Member'}
            theme={theme}
          />
          <QuickInfoCard 
            icon={GraduationCap}
            label="Level"
            value={`Level ${portfolioData?.stats?.level || 1}`}
            theme={theme}
          />
          <QuickInfoCard 
            icon={Star}
            label="Total XP"
            value={portfolioData?.stats?.totalXP || 0}
            theme={theme}
          />
          <QuickInfoCard 
            icon={Zap}
            label="Impact"
            value={portfolioData?.stats?.impact || 0}
            theme={theme}
          />
        </div>

        {/* Skills Section */}
        {portfolioData?.specializations?.length > 0 && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <Code className="h-5 w-5" style={{ color: theme.accentColor }} />
                Specializations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {portfolioData.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="rounded-full px-4 py-2 text-sm font-bold transition-all hover:scale-105"
                    style={{
                      background: `${theme.accentColor}20`,
                      color: theme.accentColor,
                      border: `1px solid ${theme.accentColor}40`
                    }}
                  >
                    {spec.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            icon={FolderKanban} 
            label="Projects" 
            value={portfolioData?.stats?.projects || 0}
            theme={theme}
          />
          <StatCard 
            icon={FlaskConical} 
            label="Research" 
            value={portfolioData?.stats?.research || 0}
            theme={theme}
          />
          <StatCard 
            icon={Award} 
            label="Achievements" 
            value={portfolioData?.stats?.achievements || 0}
            theme={theme}
          />
          <StatCard 
            icon={TrendingUp} 
            label="Impact Score" 
            value={portfolioData?.stats?.impact || 0}
            theme={theme}
          />
        </div>

        {/* Projects Section */}
        {portfolioData?.projects?.length > 0 && (
          <PortfolioSection 
            title="Featured Projects" 
            icon={FolderKanban}
            items={portfolioData.projects}
            theme={theme}
          />
        )}

        {/* Research Section */}
        {portfolioData?.research?.length > 0 && (
          <PortfolioSection 
            title="Research Papers" 
            icon={FlaskConical}
            items={portfolioData.research}
            theme={theme}
          />
        )}

        {/* Achievements Section */}
        {portfolioData?.achievements?.length > 0 && (
          <PortfolioSection 
            title="Achievements" 
            icon={Award}
            items={portfolioData.achievements}
            theme={theme}
          />
        )}

        {/* Contact Section */}
        <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
              <Mail className="h-5 w-5" style={{ color: theme.accentColor }} />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile?.email && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <Mail className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.email}</span>
                </div>
              )}
              {profile?.phoneNumber && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <Phone className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.phoneNumber}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <MapPin className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.location}</span>
                </div>
              )}
              {profile?.education && (
                <div className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:scale-105" style={{ borderColor: `${theme.accentColor}40` }}>
                  <div className="rounded-lg p-2" style={{ background: `${theme.accentColor}20` }}>
                    <GraduationCap className="h-5 w-5" style={{ color: theme.accentColor }} />
                  </div>
                  <span className="text-sm" style={{ color: theme.textColor }}>{profile.education}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Education & Interests Section */}
        {(profile?.education || profile?.interests) && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <GraduationCap className="h-5 w-5" style={{ color: theme.accentColor }} />
                Education & Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.education && (
                <div>
                  <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Education</h3>
                  <p className="text-sm opacity-80" style={{ color: theme.textColor }}>{profile.education}</p>
                </div>
              )}
              {profile?.interests && (
                <div>
                  <h3 className="mb-2 font-bold" style={{ color: theme.textColor }}>Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.split(',').map((interest, index) => (
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
        )}

        {/* Custom Sections */}
        {profile?.customSections?.length > 0 && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <Sparkles className="h-5 w-5" style={{ color: theme.accentColor }} />
                Custom Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.customSections.map((section, index) => (
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
        )}

        {/* Activity Feed */}
        {portfolioData?.activity?.length > 0 && (
          <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
                <Activity className="h-5 w-5" style={{ color: theme.accentColor }} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolioData.activity.slice(0, 10).map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 rounded-lg border p-3 transition-all hover:scale-[1.01]"
                    style={{ 
                      borderColor: `${theme.accentColor}30`,
                      background: `${theme.accentColor}10`
                    }}
                  >
                    <div className="rounded-full p-2" style={{ background: `${theme.accentColor}20` }}>
                      <Activity className="h-4 w-4" style={{ color: theme.accentColor }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: theme.textColor }}>
                        {activity.action || activity.type || 'Activity'}
                      </p>
                      <p className="text-xs opacity-70" style={{ color: theme.textColor }}>
                        {activity.timestamp?.toDate?.() 
                          ? new Date(activity.timestamp.toDate()).toLocaleDateString()
                          : 'Recently'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, theme }) {
  return (
    <Card 
      className="transition-all duration-300 hover:scale-105"
      style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}
    >
      <CardContent className="flex items-center gap-4 p-6">
        <div 
          className="rounded-xl p-3"
          style={{ background: `${theme.accentColor}20` }}
        >
          <Icon className="h-6 w-6" style={{ color: theme.accentColor }} />
        </div>
        <div>
          <p className="text-2xl font-black" style={{ color: theme.textColor }}>{value}</p>
          <p className="text-sm opacity-70" style={{ color: theme.textColor }}>{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickInfoCard({ icon: Icon, label, value, theme }) {
  return (
    <div 
      className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:scale-105"
      style={{ 
        borderColor: `${theme.accentColor}40`,
        background: theme.cardBg
      }}
    >
      <div 
        className="rounded-lg p-2"
        style={{ background: `${theme.accentColor}20` }}
      >
        <Icon className="h-5 w-5" style={{ color: theme.accentColor }} />
      </div>
      <div>
        <p className="text-xs opacity-70" style={{ color: theme.textColor }}>{label}</p>
        <p className="font-bold" style={{ color: theme.textColor }}>{value}</p>
      </div>
    </div>
  );
}

function PortfolioSection({ title, icon: Icon, items, theme }) {
  return (
    <Card style={{ borderColor: `${theme.accentColor}40`, background: theme.cardBg }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: theme.textColor }}>
          <Icon className="h-5 w-5" style={{ color: theme.accentColor }} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className="overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:scale-105"
              style={{ 
                borderColor: `${theme.accentColor}40`,
                background: `${theme.accentColor}10`
              }}
            >
              {/* Media Display */}
              {item.media && item.media.length > 0 && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  {item.media[0].type === 'video' ? (
                    <video 
                      src={item.media[0].url} 
                      controls
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                  ) : (
                    <img 
                      src={item.media[0].url} 
                      alt={item.title}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                </div>
              )}
              <h3 className="font-bold" style={{ color: theme.textColor }}>{item.title}</h3>
              <p className="mt-2 text-sm opacity-80" style={{ color: theme.textColor }}>{item.description}</p>
              {item.link && (
                <a 
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-bold hover:underline"
                  style={{ color: theme.accentColor }}
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
