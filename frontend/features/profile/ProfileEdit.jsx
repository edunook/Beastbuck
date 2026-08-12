import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, X, Plus, Trash2, User, MapPin, Globe, Briefcase, GraduationCap, Heart, Palette, Layout, Wand2, Upload, Lock, Globe as GlobeIcon, Star, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { UsersService } from '@services/firestore/users';
import { ThemesService } from '@services/firestore/themes';
import { uploadProfilePhoto, isIPFSConfigured } from '@services/storage/ipfs';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { LoadingState } from '@frontend/components/ui/UIElements';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { groqProvider } from '@services/ai/providers/groq';


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

export default function ProfileEdit() {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user, roleData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    education: '',
    interests: '',
    customSections: []
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [showAllThemes, setShowAllThemes] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [generatingBio, setGeneratingBio] = useState(false);
  
  // Custom theme upload state
  const [showCustomThemeUpload, setShowCustomThemeUpload] = useState(false);
  const [customThemeName, setCustomThemeName] = useState('');
  const [customThemeDescription, setCustomThemeDescription] = useState('');
  const [customThemeImage, setCustomThemeImage] = useState(null);
  const [customThemeImagePreview, setCustomThemeImagePreview] = useState(null);
  const [customThemeIsPublic, setCustomThemeIsPublic] = useState(false);
  const [uploadingTheme, setUploadingTheme] = useState(false);
  const [customThemes, setCustomThemes] = useState([]);
  const [showThemePreview, setShowThemePreview] = useState(false);
  const [showBioPreview, setShowBioPreview] = useState(false);
  
  // Theme customization state
  const [customizingTheme, setCustomizingTheme] = useState(false);
  const [customColors, setCustomColors] = useState({
    textColor: '#ffffff',
    accentColor: '#00d4ff',
  });
  
  // Theme filter state
  const [themeSearch, setThemeSearch] = useState('');
  const [themeCategory, setThemeCategory] = useState('all');
  const [favoriteThemes, setFavoriteThemes] = useState([]);

  // Initialize TipTap editor for bio
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.bio || '',
    onUpdate: ({ editor: currentEditor }) => {
      if (currentEditor && !currentEditor.isDestroyed) {
        handleInputChange('bio', currentEditor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 rounded-xl border border-border bg-surface text-white',
      },
    },
  });

  // Update editor content when formData.bio changes externally
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    try {
      const currentHTML = editor.getHTML();
      if (formData.bio !== undefined && formData.bio !== currentHTML) {
        editor.commands.setContent(formData.bio || '');
      }
    } catch (err) {
      // TipTap editor not fully initialized yet
    }
  }, [formData.bio, editor]);

  useEffect(() => {
    if (!user?.uid) return;

    // Security check: Users can only edit their own profile
    // CEO and Co-CEO can edit any profile
    const userRole = roleData?.role?.toLowerCase().trim() || '';
    const isCEO = userRole === 'main ceo' || userRole === 'ceo';
    const isCoCEO = userRole === 'co-ceo' || userRole === 'co ceo';
    const isExecutive = isCEO || isCoCEO;

    const profileUid = uid || user.uid;

    // If uid is provided and it's not the user's own profile, check permissions
    if (uid && uid !== user.uid && !isExecutive) {
      console.error('Security: Attempting to edit another user\'s profile without permission');
      navigate(`/profile/${user.uid}`);
      return;
    }

    const unsubscribe = UsersService.subscribeToUserProfile(profileUid, {
      onProfile: (nextProfile) => {
        setProfile(nextProfile);
        setFormData({
          displayName: nextProfile?.displayName || '',
          bio: nextProfile?.bio || '',
          location: nextProfile?.location || '',
          website: nextProfile?.website || '',
          company: nextProfile?.company || '',
          education: nextProfile?.education || '',
          interests: nextProfile?.interests || '',
          customSections: nextProfile?.customSections || []
        });
        setSelectedTheme(nextProfile?.theme || 'default');
        setProfilePhotoPreview(nextProfile?.photoURL || null);
        setLoading(false);
      },
      onError: (err) => {
        console.error('Profile load failed:', err);
        setLoading(false);
      },
    });

    // Fetch public custom themes from Firestore
    ThemesService.getPublicThemes()
      .then(themes => {
        setCustomThemes(prev => {
          // Remove duplicates by ID
          const existingIds = new Set(prev.map(t => t.id));
          const newThemes = themes.filter(t => !existingIds.has(t.id));
          return [...prev, ...newThemes];
        });
      })
      .catch(err => {
        console.error('Failed to load public themes:', err);
        // Silently fail - themes won't be available without proper Firestore rules
      });

    // Fetch user's private themes from Firestore
    if (user?.uid) {
      ThemesService.getUserThemes(user.uid)
        .then(themes => {
          setCustomThemes(prev => {
            // Remove duplicates by ID
            const existingIds = new Set(prev.map(t => t.id));
            const newThemes = themes.filter(t => !existingIds.has(t.id));
            return [...prev, ...newThemes];
          });
        })
        .catch(err => {
          console.error('Failed to load user themes:', err);
          // Silently fail - themes won't be available without proper Firestore rules
        });
    }

    return () => unsubscribe();
  }, [user?.uid, uid]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSection = () => {
    if (!newSectionTitle || !newSectionContent) return;
    
    setFormData(prev => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        {
          id: Date.now().toString(),
          title: newSectionTitle,
          content: newSectionContent
        }
      ]
    }));
    setNewSectionTitle('');
    setNewSectionContent('');
  };

  const handleRemoveSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(s => s.id !== sectionId)
    }));
  };

  const handleGenerateBio = async () => {
    setGeneratingBio(true);
    try {
      const systemPrompt = 'You are a professional bio writer for the BeastBuck community. Write engaging, professional bios that highlight the person\'s expertise, interests, and contributions. Keep bios concise (2-3 sentences) and inspiring.';
      
      const userPrompt = `Write a professional bio for ${formData.displayName || roleData?.username || 'a BeastBuck community member'} who has interests in ${formData.interests || 'various fields'}. They work at ${formData.company || 'a company'} and studied ${formData.education || 'various subjects'}. Location: ${formData.location || 'not specified'}.`;
      
      const generatedBio = await groqProvider.chat({
        messages: [{ role: 'user', content: userPrompt }],
        systemPrompt,
      });
      
      setFormData(prev => ({ ...prev, bio: generatedBio }));
    } catch (error) {
      console.error('Bio generation failed:', error);
      alert('Failed to generate bio. Please try again or write it manually.');
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleCustomThemeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomThemeImage(file);
      setCustomThemeImagePreview(URL.createObjectURL(file));
    }
  };

  // Get the current theme object
  const getCurrentTheme = () => {
    const allThemes = [...THEME_TEMPLATES, ...customThemes];
    return allThemes.find(t => t.id === selectedTheme) || THEME_TEMPLATES[0];
  };

  // Filter themes based on search and category
  const getFilteredThemes = () => {
    const allThemes = [...THEME_TEMPLATES, ...customThemes];
    
    let filtered = allThemes;
    
    // Filter by category
    if (themeCategory !== 'all') {
      filtered = filtered.filter(theme => {
        if (themeCategory === 'dark') {
          return theme.textColor === '#ffffff' || theme.textColor === '#f9fafb';
        } else if (themeCategory === 'light') {
          return theme.textColor !== '#ffffff' && theme.textColor !== '#f9fafb';
        } else if (themeCategory === 'custom') {
          return theme.isCustom;
        } else if (themeCategory === 'popular') {
          return THEME_TEMPLATES.slice(0, 12).some(t => t.id === theme.id);
        } else if (themeCategory === 'favorites') {
          return favoriteThemes.includes(theme.id);
        }
        return true;
      });
    }
    
    // Filter by search
    if (themeSearch) {
      const searchLower = themeSearch.toLowerCase();
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(searchLower) ||
        theme.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  };

  const toggleFavoriteTheme = (themeId) => {
    setFavoriteThemes(prev => {
      if (prev.includes(themeId)) {
        return prev.filter(id => id !== themeId);
      } else {
        return [...prev, themeId];
      }
    });
  };

  const handleUploadCustomTheme = async () => {
    if (!customThemeName || !customThemeImage) {
      alert('Please provide a theme name and upload an image');
      return;
    }

    setUploadingTheme(true);
    try {
      let imageUrl = customThemeImagePreview;

      // Upload image to Cloudinary if configured
      if (isCloudinaryConfigured) {
        try {
          const uploadResult = await uploadProofFile(customThemeImage, { folder: 'beastbuck/themes' });
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error('Image upload failed, using local preview:', uploadError);
          // Fall back to local preview if upload fails
        }
      }

      // Create theme data for Firestore
      const themeData = {
        name: customThemeName,
        description: customThemeDescription,
        background: imageUrl,
        textColor: '#ffffff',
        accentColor: '#00d4ff',
        isCustom: true,
        isPublic: customThemeIsPublic,
        createdBy: user.uid,
      };

      // Save to Firestore
      try {
        const newTheme = await ThemesService.createTheme(themeData);
        setCustomThemes(prev => [...prev, newTheme]);
        setSelectedTheme(newTheme.id);
      } catch (firestoreError) {
        console.error('Firestore save failed:', firestoreError);
        alert('Failed to save theme to Firestore. Please check your Firestore security rules.');
        return;
      }
      
      // Reset form
      setCustomThemeName('');
      setCustomThemeDescription('');
      setCustomThemeImage(null);
      setCustomThemeImagePreview(null);
      setCustomThemeIsPublic(false);
      setShowCustomThemeUpload(false);
      
      alert('Custom theme uploaded successfully!');
    } catch (error) {
      console.error('Theme upload failed:', error);
      alert('Failed to upload theme. Please try again.');
    } finally {
      setUploadingTheme(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Security check: Users can only edit their own profile
      // CEO and Co-CEO can edit any profile
      const userRole = roleData?.role?.toLowerCase().trim() || '';
      const isCEO = userRole === 'main ceo' || userRole === 'ceo';
      const isCoCEO = userRole === 'co-ceo' || userRole === 'co ceo';
      const isExecutive = isCEO || isCoCEO;

      const profileUid = uid || user?.uid;

      // If uid is provided and it's not the user's own profile, check permissions
      if (uid && uid !== user?.uid && !isExecutive) {
        console.error('Security: Attempting to save another user\'s profile without permission');
        alert('You do not have permission to edit this profile.');
        setSaving(false);
        return;
      }

      const updateData = {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        company: formData.company,
        education: formData.education,
        interests: formData.interests,
        customSections: formData.customSections,
        theme: selectedTheme
      };

      // If there's a new profile photo, upload it first using IPFS
      if (profilePhoto) {
        const photoResult = await uploadProfilePhoto(profilePhoto);
        updateData.photoURL = photoResult.url;
        updateData.photoCID = photoResult.cid;
      }

      await UsersService.updateUserProfile(profileUid, updateData);
      navigate(`/profile/${profileUid}`);
    } catch (error) {
      console.error('Profile save failed:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 10MB for IPFS)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size must be less than 10MB');
        return;
      }
      setProfilePhoto(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
  };

  if (loading) {
    return <LoadingState text="Loading profile..." />;
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Profile Editor</p>
        <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Edit Your Profile</h1>
        <p className="text-sm text-text-muted">Customize your profile with themes, sections, and AI-generated content.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Main Editor */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Photo Upload */}
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-border bg-surface">
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-text-muted">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      id="profile-photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-photo"
                      className="inline-flex items-center gap-2 rounded-xl bg-accent/10 px-4 py-2 text-sm font-bold text-accent hover:bg-accent/20 cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </label>
                    {profilePhotoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="h-4 w-4" />
                        Remove Photo
                      </button>
                    )}
                    <p className="text-xs text-text-muted">Max size: 10MB. JPG, PNG, GIF, WebP, SVG</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                  placeholder="Your display name"
                />
              </div>
              
              <div>
                <label className="mb-2 block text-sm font-bold text-white">Username</label>
                <input
                  type="text"
                  value={profile?.username || ''}
                  disabled
                  className="w-full rounded-xl border border-border bg-surface/50 px-4 py-3 text-text-muted placeholder:text-text-muted focus:border-accent focus:outline-none cursor-not-allowed"
                  placeholder="Username cannot be changed"
                />
                <p className="mt-1 text-xs text-text-muted">Username cannot be changed</p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    Bio
                    <button
                      type="button"
                      onClick={handleGenerateBio}
                      disabled={generatingBio}
                      className="rounded-lg bg-accent/10 px-2 py-1 text-xs font-bold text-accent hover:bg-accent/20 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Wand2 className="h-3 w-3" />
                      {generatingBio ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBioPreview(!showBioPreview)}
                    className="rounded-lg bg-white/10 px-2 py-1 text-xs font-bold text-white hover:bg-white/20 flex items-center gap-1"
                  >
                    {showBioPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {showBioPreview ? 'Edit' : 'Preview'}
                  </button>
                </label>
                
                {/* Split-screen Bio Editor */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Editor Panel */}
                  {!showBioPreview && (
                    <div className="md:col-span-2">
                      {editor && (
                        <div className="rounded-xl border border-border bg-surface overflow-hidden">
                          <div className="flex items-center gap-2 border-b border-border bg-white/5 p-2">
                            <button
                              onClick={() => editor.chain().focus().toggleBold().run()}
                              className={`rounded px-2 py-1 text-sm font-bold ${editor.isActive('bold') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
                            >
                              B
                            </button>
                            <button
                              onClick={() => editor.chain().focus().toggleItalic().run()}
                              className={`rounded px-2 py-1 text-sm italic ${editor.isActive('italic') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
                            >
                              I
                            </button>
                            <button
                              onClick={() => editor.chain().focus().toggleBulletList().run()}
                              className={`rounded px-2 py-1 text-sm ${editor.isActive('bulletList') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
                            >
                              • List
                            </button>
                            <button
                              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                              className={`rounded px-2 py-1 text-sm font-mono ${editor.isActive('codeBlock') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
                            >
                              &lt;/&gt;
                            </button>
                          </div>
                          <EditorContent editor={editor} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Preview Panel */}
                  {showBioPreview && (
                    <div className="md:col-span-2">
                      <div className="rounded-xl border border-border bg-surface p-4 prose prose-invert max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: formData.bio }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                    placeholder="Your company"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-white flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Education
                  </label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                    placeholder="Your education"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-white flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Interests
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                  placeholder="Your interests (comma separated)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-accent" />
                Custom Sections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                  placeholder="Section title"
                />
                <input
                  type="text"
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                  placeholder="Section content"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                disabled={!newSectionTitle || !newSectionContent}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-background hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>

              {formData.customSections.length > 0 && (
                <div className="space-y-3">
                  {formData.customSections.map(section => (
                    <div key={section.id} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-white">{section.title}</h4>
                        <p className="mt-1 text-sm text-text-muted">{section.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(section.id)}
                        className="rounded-lg p-2 text-text-muted transition hover:bg-status-danger/10 hover:text-status-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Theme Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-accent" />
                Theme Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">Choose from {THEME_TEMPLATES.length} professional themes</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowThemePreview(!showThemePreview)}
                    className="text-sm font-bold text-accent hover:text-cyan-400"
                  >
                    {showThemePreview ? 'Hide Preview' : 'Live Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllThemes(!showAllThemes)}
                    className="text-sm font-bold text-accent hover:text-cyan-400"
                  >
                    {showAllThemes ? 'Show Popular' : 'Show All'}
                  </button>
                </div>
              </div>

              {/* Theme Search */}
              <div>
                <input
                  type="text"
                  value={themeSearch}
                  onChange={(e) => setThemeSearch(e.target.value)}
                  placeholder="Search themes..."
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
              </div>

              {/* Theme Categories */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'favorites', label: 'Favorites', icon: Star },
                  { id: 'popular', label: 'Popular' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'light', label: 'Light' },
                  { id: 'custom', label: 'Custom' },
                ].map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setThemeCategory(category.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      themeCategory === category.id
                        ? 'bg-accent text-background'
                        : 'bg-surface text-text-muted hover:bg-white/5'
                    }`}
                  >
                    {category.icon && <category.icon className="h-3 w-3" />}
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Live Theme Preview */}
              {showThemePreview && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <div
                    className="p-6"
                    style={{
                      background: getCurrentTheme().background,
                      color: getCurrentTheme().textColor,
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-8 w-8" style={{ color: getCurrentTheme().textColor }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold" style={{ color: getCurrentTheme().textColor }}>
                          {formData.displayName || 'Your Name'}
                        </h3>
                        <p className="text-sm opacity-80" style={{ color: getCurrentTheme().textColor }}>
                          @{profile?.username || 'username'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm mb-4 opacity-90" style={{ color: getCurrentTheme().textColor }}>
                      {formData.bio || 'Your bio will appear here...'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-bold"
                        style={{
                          background: getCurrentTheme().accentColor,
                          color: '#ffffff',
                        }}
                      >
                        Follow
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-bold border-2"
                        style={{
                          borderColor: getCurrentTheme().accentColor,
                          color: getCurrentTheme().accentColor,
                        }}
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Custom Theme Upload Button */}
              <button
                type="button"
                onClick={() => setShowCustomThemeUpload(!showCustomThemeUpload)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent/50 bg-accent/5 px-4 py-3 text-sm font-bold text-accent hover:bg-accent/10 transition-all"
              >
                <Upload className="h-4 w-4" />
                {showCustomThemeUpload ? 'Cancel Upload' : 'Upload Custom Theme'}
              </button>

              {/* Theme Color Customization */}
              <button
                type="button"
                onClick={() => setCustomizingTheme(!customizingTheme)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-bold text-white hover:bg-white/5 transition-all"
              >
                <Palette className="h-4 w-4 text-accent" />
                {customizingTheme ? 'Cancel Customization' : 'Customize Colors'}
              </button>

              {customizingTheme && (
                <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColors.textColor}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, textColor: e.target.value }))}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColors.textColor}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, textColor: e.target.value }))}
                        className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-white focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">Accent Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={customColors.accentColor}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="h-10 w-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColors.accentColor}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1 rounded-xl border border-border bg-surface px-4 py-2 text-white focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomColors({ textColor: '#ffffff', accentColor: '#00d4ff' });
                        const currentTheme = getCurrentTheme();
                        if (currentTheme) {
                          setSelectedTheme(currentTheme.id);
                        }
                      }}
                      className="flex-1 rounded-lg bg-surface px-4 py-2 text-sm font-bold text-text-muted hover:bg-white/5"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const currentTheme = getCurrentTheme();
                        if (currentTheme) {
                          const customizedTheme = {
                            ...currentTheme,
                            id: `${currentTheme.id}-custom`,
                            textColor: customColors.textColor,
                            accentColor: customColors.accentColor,
                            isCustom: true,
                            isLocal: true,
                          };
                          setCustomThemes(prev => [...prev, customizedTheme]);
                          setSelectedTheme(customizedTheme.id);
                        }
                      }}
                      className="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background hover:bg-cyan-400"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
              
              {/* Custom Theme Upload Form */}
              {showCustomThemeUpload && (
                <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">Theme Name</label>
                    <input
                      type="text"
                      value={customThemeName}
                      onChange={(e) => setCustomThemeName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                      placeholder="My Custom Theme"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">Description</label>
                    <input
                      type="text"
                      value={customThemeDescription}
                      onChange={(e) => setCustomThemeDescription(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                      placeholder="A beautiful custom theme"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-white">Theme Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCustomThemeImageChange}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-accent/20 file:text-accent file:py-2 file:px-4 focus:border-accent focus:outline-none"
                    />
                    {customThemeImagePreview && (
                      <div className="mt-2">
                        <img 
                          src={customThemeImagePreview} 
                          alt="Theme preview" 
                          className="h-32 w-full rounded-xl object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomThemeIsPublic(!customThemeIsPublic)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                        customThemeIsPublic 
                          ? 'bg-accent/20 text-accent' 
                          : 'bg-surface text-text-muted'
                      }`}
                    >
                      {customThemeIsPublic ? <GlobeIcon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {customThemeIsPublic ? 'Public' : 'Private'}
                    </button>
                    <p className="text-xs text-text-muted">
                      {customThemeIsPublic ? 'Everyone can see and use this theme' : 'Only you can use this theme'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUploadCustomTheme}
                    disabled={uploadingTheme || !customThemeName || !customThemeImage}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan-500 px-6 py-3 text-sm font-bold text-background hover:from-cyan-400 hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingTheme ? 'Uploading...' : 'Upload Theme'}
                  </button>
                </div>
              )}

              <div className="grid gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {getFilteredThemes().length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    No themes found for this category
                  </div>
                )}
                {getFilteredThemes().map(theme => (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition-all cursor-pointer ${
                      selectedTheme === theme.id
                        ? 'border-accent bg-accent/10'
                        : 'border-border hover:border-accent/50'
                    }`}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ background: theme.background }}
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white">{theme.name}</h4>
                          {theme.isCustom && (
                            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                              Custom
                            </span>
                          )}
                          {theme.isPublic && (
                            <GlobeIcon className="h-3 w-3 text-accent" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteTheme(theme.id);
                          }}
                          className="p-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                          <Star 
                            className={`h-4 w-4 transition-colors ${
                              favoriteThemes.includes(theme.id) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-text-muted'
                            }`} 
                          />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-text-muted">{theme.description}</p>
                      <div className="mt-2 flex gap-2">
                        <div
                          className="h-4 w-4 rounded-full border border-white/20"
                          style={{ background: theme.accentColor }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan-500 px-6 py-3 text-sm font-bold text-background hover:from-cyan-400 hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                to={`/profile/${uid || user?.uid}`}
                className="block w-full text-center"
              >
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-text-soft hover:bg-white/5"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
