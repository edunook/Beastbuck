import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Save, X, Plus, Trash2, User, MapPin, Globe, Briefcase, GraduationCap, 
  Heart, Palette, Layout, Wand2, Upload, Lock, Globe as GlobeIcon, 
  Star, Eye, EyeOff, Sparkles, Sliders, Check, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '@frontend/features/auth/AuthContext';
import { UsersService } from '@services/firestore/users';
import { ThemesService } from '@services/firestore/themes';
import { uploadFile, uploadProfilePhoto, normalizeMediaUrl } from '@services/storage/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import { LoadingState } from '@frontend/components/ui/UIElements';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { groqProvider } from '@services/ai/providers/groq';
import { 
  THEME_TEMPLATES, 
  GRADIENT_PRESETS, 
  COLOR_SWATCHES, 
  getThemeBackgroundStyle, 
  resolveTheme 
} from '@shared/constants/themes';

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
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [generatingBio, setGeneratingBio] = useState(false);
  
  // Custom theme studio state
  const [activeThemeTab, setActiveThemeTab] = useState('presets'); // 'presets' | 'custom-studio'
  const [customThemeConfig, setCustomThemeConfig] = useState({
    name: 'My Custom Theme',
    description: 'Personalized BeastBuck theme',
    backgroundType: 'gradient', // 'gradient' | 'solid' | 'image'
    gradientFrom: '#0f0c29',
    gradientTo: '#24243e',
    gradientAngle: '135deg',
    solidColor: '#09090b',
    imageUrl: '',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
    isPublic: false,
  });
  const [customThemeImageFile, setCustomThemeImageFile] = useState(null);
  const [customThemeImagePreview, setCustomThemeImagePreview] = useState(null);
  const [uploadingTheme, setUploadingTheme] = useState(false);
  const [customThemes, setCustomThemes] = useState([]);
  const [showThemePreview, setShowThemePreview] = useState(true);
  const [showBioPreview, setShowBioPreview] = useState(false);
  
  // Theme filter state
  const [themeSearch, setThemeSearch] = useState('');
  const [themeCategory, setThemeCategory] = useState('all');
  const [favoriteThemes, setFavoriteThemes] = useState([]);

  // Compute live custom theme background string
  const computedCustomBackground = useMemo(() => {
    if (customThemeConfig.backgroundType === 'solid') {
      return customThemeConfig.solidColor || '#09090b';
    }
    if (customThemeConfig.backgroundType === 'image') {
      return customThemeImagePreview || customThemeConfig.imageUrl || 'linear-gradient(135deg, #09090b 0%, #111116 100%)';
    }
    return `linear-gradient(${customThemeConfig.gradientAngle || '135deg'}, ${customThemeConfig.gradientFrom || '#0f0c29'} 0%, ${customThemeConfig.gradientTo || '#24243e'} 100%)`;
  }, [
    customThemeConfig.backgroundType,
    customThemeConfig.solidColor,
    customThemeConfig.imageUrl,
    customThemeImagePreview,
    customThemeConfig.gradientAngle,
    customThemeConfig.gradientFrom,
    customThemeConfig.gradientTo,
  ]);

  // Current active custom theme object
  const activeCustomThemeObject = useMemo(() => ({
    id: 'custom',
    name: customThemeConfig.name || 'Custom Theme',
    description: customThemeConfig.description || 'Personalized custom theme',
    background: computedCustomBackground,
    textColor: customThemeConfig.textColor || '#ffffff',
    accentColor: customThemeConfig.accentColor || '#00d4ff',
    cardBg: 'rgba(255, 255, 255, 0.05)',
    isCustom: true,
  }), [customThemeConfig, computedCustomBackground]);

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
    } catch {
      // TipTap editor not fully initialized yet
    }
  }, [formData.bio, editor]);

  useEffect(() => {
    if (!user?.uid) return;

    const userRole = roleData?.role?.toLowerCase().trim() || '';
    const isCEO = userRole === 'main ceo' || userRole === 'ceo';
    const isCoCEO = userRole === 'co-ceo' || userRole === 'co ceo';
    const isExecutive = isCEO || isCoCEO;

    const profileUid = uid || user.uid;

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
        
        const initialTheme = nextProfile?.theme || 'default';
        setSelectedTheme(initialTheme);

        // If user already has a custom theme saved on profile, hydrate custom theme builder
        if (nextProfile?.customTheme) {
          const ct = nextProfile.customTheme;
          setCustomThemeConfig(prev => ({
            ...prev,
            name: ct.name || prev.name,
            description: ct.description || prev.description,
            textColor: ct.textColor || prev.textColor,
            accentColor: ct.accentColor || prev.accentColor,
            backgroundType: ct.background?.startsWith('http') || ct.background?.startsWith('data:image') ? 'image' : 'gradient',
            imageUrl: ct.background?.startsWith('http') ? ct.background : '',
          }));
          if (ct.background?.startsWith('http') || ct.background?.startsWith('data:image')) {
            setCustomThemeImagePreview(ct.background);
          }
          setCustomThemes(prev => {
            const filtered = prev.filter(t => t.id !== 'custom');
            return [{ ...ct, id: 'custom', isCustom: true }, ...filtered];
          });
        }

        setProfilePhotoPreview(normalizeMediaUrl(nextProfile?.photoURL) || null);
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
          const existingIds = new Set(prev.map(t => t.id));
          const newThemes = themes.filter(t => !existingIds.has(t.id));
          return [...prev, ...newThemes];
        });
      })
      .catch(err => {
        console.error('Failed to load public themes:', err);
      });

    // Fetch user's private themes from Firestore
    if (user?.uid) {
      ThemesService.getUserThemes(user.uid)
        .then(themes => {
          setCustomThemes(prev => {
            const existingIds = new Set(prev.map(t => t.id));
            const newThemes = themes.filter(t => !existingIds.has(t.id));
            return [...prev, ...newThemes];
          });
        })
        .catch(err => {
          console.error('Failed to load user themes:', err);
        });
    }

    return () => unsubscribe();
  }, [user?.uid, uid, navigate, roleData?.role]);

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
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setCustomThemeImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCustomThemeImagePreview(previewUrl);
      setCustomThemeConfig(prev => ({ ...prev, backgroundType: 'image', imageUrl: previewUrl }));
    }
  };

  // Get current active theme object
  const getCurrentTheme = () => {
    if (selectedTheme === 'custom') {
      return activeCustomThemeObject;
    }
    const allThemes = [...THEME_TEMPLATES, ...customThemes];
    const found = allThemes.find(t => t.id === selectedTheme);
    if (found) return found;
    if (profile?.customTheme && selectedTheme === profile.customTheme.id) {
      return profile.customTheme;
    }
    return resolveTheme(selectedTheme, profile?.customTheme);
  };

  // Filter themes based on search and category
  const getFilteredThemes = () => {
    const allThemes = [...THEME_TEMPLATES, ...customThemes.filter(ct => ct.id !== 'custom')];
    
    let filtered = allThemes;
    
    // Filter by category
    if (themeCategory !== 'all') {
      filtered = filtered.filter(theme => {
        if (themeCategory === 'dark') {
          return theme.category === 'dark' || theme.textColor === '#ffffff' || theme.textColor === '#fafafa';
        } else if (themeCategory === 'vibrant') {
          return theme.category === 'vibrant';
        } else if (themeCategory === 'light') {
          return theme.category === 'light' || (theme.textColor !== '#ffffff' && !theme.textColor?.toLowerCase().includes('fff'));
        } else if (themeCategory === 'custom') {
          return theme.isCustom;
        } else if (themeCategory === 'favorites') {
          return favoriteThemes.includes(theme.id);
        }
        return true;
      });
    }
    
    // Filter by search
    if (themeSearch.trim()) {
      const searchLower = themeSearch.toLowerCase().trim();
      filtered = filtered.filter(theme =>
        theme.name.toLowerCase().includes(searchLower) ||
        theme.description?.toLowerCase().includes(searchLower)
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

  // Apply custom theme studio config directly to active profile
  const handleApplyCustomTheme = () => {
    setSelectedTheme('custom');
    setActiveThemeTab('presets');
  };

  // Save custom theme to Firestore collection (optional sharing / library saving)
  const handleSaveThemeToLibrary = async () => {
    if (!customThemeConfig.name.trim()) {
      alert('Please provide a name for your custom theme');
      return;
    }

    setUploadingTheme(true);
    try {
      let finalBackground = computedCustomBackground;

      // If user uploaded a physical file, upload to storage
      if (customThemeImageFile) {
        try {
          const uploadRes = await uploadFile(customThemeImageFile, { folder: 'themes' });
          if (uploadRes?.url) {
            finalBackground = normalizeMediaUrl(uploadRes.url);
          }
        } catch (uploadErr) {
          console.warn('Storage upload error, using local data URL:', uploadErr);
        }
      }

      const themeData = {
        name: customThemeConfig.name.trim(),
        description: customThemeConfig.description || 'Personalized custom theme',
        background: finalBackground,
        textColor: customThemeConfig.textColor,
        accentColor: customThemeConfig.accentColor,
        cardBg: 'rgba(255, 255, 255, 0.05)',
        isCustom: true,
        isPublic: !!customThemeConfig.isPublic,
        createdBy: user.uid,
      };

      try {
        const newTheme = await ThemesService.createTheme(themeData);
        setCustomThemes(prev => [newTheme, ...prev]);
        setSelectedTheme(newTheme.id);
        alert('Custom theme saved to your library!');
        setActiveThemeTab('presets');
      } catch (firestoreErr) {
        console.warn('Firestore theme save warning, activating theme locally:', firestoreErr);
        setSelectedTheme('custom');
        alert('Custom theme applied to your profile!');
        setActiveThemeTab('presets');
      }
    } catch (error) {
      console.error('Custom theme creation error:', error);
      alert('Failed to save theme. Applying locally instead.');
      setSelectedTheme('custom');
    } finally {
      setUploadingTheme(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userRole = roleData?.role?.toLowerCase().trim() || '';
      const isCEO = userRole === 'main ceo' || userRole === 'ceo';
      const isCoCEO = userRole === 'co-ceo' || userRole === 'co ceo';
      const isExecutive = isCEO || isCoCEO;

      const profileUid = uid || user?.uid;

      if (uid && uid !== user?.uid && !isExecutive) {
        alert('You do not have permission to edit this profile.');
        setSaving(false);
        return;
      }

      // If user is currently editing custom theme studio, make sure 'custom' theme is selected
      let themeToSave = selectedTheme;
      if (activeThemeTab === 'custom-studio') {
        themeToSave = 'custom';
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
        theme: themeToSave
      };

      // If custom theme is chosen or custom config is active, save full customTheme object
      if (themeToSave === 'custom') {
        let finalBg = computedCustomBackground;
        if (customThemeImageFile) {
          try {
            const uploadRes = await uploadFile(customThemeImageFile, { folder: 'themes' });
            if (uploadRes?.url) {
              finalBg = normalizeMediaUrl(uploadRes.url);
            }
          } catch (uploadErr) {
            console.warn('Custom theme image upload failed, using background string:', uploadErr);
          }
        }
        updateData.customTheme = {
          id: 'custom',
          name: customThemeConfig.name || 'Custom Theme',
          description: customThemeConfig.description || '',
          background: finalBg,
          textColor: customThemeConfig.textColor || '#ffffff',
          accentColor: customThemeConfig.accentColor || '#00d4ff',
          cardBg: 'rgba(255, 255, 255, 0.05)',
          isCustom: true,
          updatedAt: new Date().toISOString()
        };
      } else {
        const foundCustom = customThemes.find(t => t.id === selectedTheme);
        if (foundCustom) {
          updateData.customTheme = foundCustom;
        }
      }

      // If there is a new profile photo, upload it
      if (profilePhoto) {
        const photoResult = await uploadProfilePhoto(profilePhoto);
        updateData.photoURL = normalizeMediaUrl(photoResult.url);
        updateData.photoCID = photoResult.cid || null;
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
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
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

  const currentTheme = getCurrentTheme();

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Profile Editor</p>
        <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">Edit Your Profile</h1>
        <p className="text-sm text-text-muted">Customize your profile with eye-catching themes, sections, and AI-generated bio.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
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
                        src={normalizeMediaUrl(profilePhotoPreview)}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
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
                    <p className="text-xs text-text-muted">Max size: 10MB. JPG, PNG, GIF, WebP</p>
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
                
                {/* Bio Editor */}
                <div className="grid gap-4">
                  {!showBioPreview && (
                    <div>
                      {editor && (
                        <div className="rounded-xl border border-border bg-surface overflow-hidden">
                          <div className="flex items-center gap-2 border-b border-border bg-white/5 p-2">
                            <button
                              type="button"
                              onClick={() => editor.chain().focus().toggleBold().run()}
                              className={`rounded px-2 py-1 text-sm font-bold ${editor.isActive('bold') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
                            >
                              B
                            </button>
                            <button
                              type="button"
                              onClick={() => editor.chain().focus().toggleItalic().run()}
                              className={`rounded px-2 py-1 text-sm italic ${editor.isActive('italic') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => editor.chain().focus().toggleBulletList().run()}
                              className={`rounded px-2 py-1 text-sm ${editor.isActive('bulletList') ? 'bg-accent text-black' : 'text-white hover:bg-white/10'}`}
                            >
                              • List
                            </button>
                            <button
                              type="button"
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
                  
                  {showBioPreview && (
                    <div className="rounded-xl border border-border bg-surface p-4 prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: formData.bio || '<em>No bio entered yet.</em>' }} />
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

        {/* Theme Selection & Custom Theme Studio */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-accent" />
                  Theme Studio
                </CardTitle>
                <button
                  type="button"
                  onClick={() => setShowThemePreview(!showThemePreview)}
                  className="text-xs font-bold text-accent hover:text-cyan-400 flex items-center gap-1"
                >
                  {showThemePreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showThemePreview ? 'Hide Preview' : 'Live Preview'}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Tab Navigation: Presets vs Custom Studio */}
              <div className="flex rounded-xl bg-surface border border-border p-1">
                <button
                  type="button"
                  onClick={() => setActiveThemeTab('presets')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeThemeTab === 'presets'
                      ? 'bg-accent text-background shadow-md'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  <Palette className="h-4 w-4" />
                  Curated Themes ({THEME_TEMPLATES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveThemeTab('custom-studio')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    activeThemeTab === 'custom-studio'
                      ? 'bg-accent text-background shadow-md'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  Custom Theme Studio
                </button>
              </div>

              {/* Real-time Theme Preview Card */}
              {showThemePreview && (
                <div className="rounded-2xl border-2 overflow-hidden shadow-xl transition-all" style={{ borderColor: currentTheme.accentColor }}>
                  <div
                    className="p-5 relative transition-all duration-300"
                    style={{
                      ...getThemeBackgroundStyle(currentTheme.background),
                      color: currentTheme.textColor,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-xl border-2 flex items-center justify-center font-bold text-lg" style={{ borderColor: currentTheme.accentColor, background: `${currentTheme.accentColor}20` }}>
                        {formData.displayName?.[0] || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base truncate" style={{ color: currentTheme.textColor }}>
                            {formData.displayName || 'Your Profile'}
                          </h4>
                          {selectedTheme === 'custom' && (
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${currentTheme.accentColor}30`, color: currentTheme.accentColor }}>
                              Custom
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-75 truncate" style={{ color: currentTheme.textColor }}>
                          @{profile?.username || 'username'} · {currentTheme.name}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-xs mb-3 line-clamp-2 opacity-85" style={{ color: currentTheme.textColor }}>
                      {formData.bio?.replace(/<[^>]*>?/gm, '') || 'Live preview of your profile theme styling and accent colors.'}
                    </p>

                    <div className="flex gap-2">
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-background flex items-center justify-center"
                        style={{ background: currentTheme.accentColor }}
                      >
                        Active Accent
                      </div>
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-bold border"
                        style={{
                          borderColor: currentTheme.accentColor,
                          color: currentTheme.accentColor,
                          background: `${currentTheme.accentColor}15`
                        }}
                      >
                        Border Accent
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 1: CURATED PRESETS ================= */}
              {activeThemeTab === 'presets' && (
                <div className="space-y-4">
                  {/* Theme Search */}
                  <div>
                    <input
                      type="text"
                      value={themeSearch}
                      onChange={(e) => setThemeSearch(e.target.value)}
                      placeholder="Search themes by name or vibe..."
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                    />
                  </div>

                  {/* Theme Categories */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'favorites', label: 'Starred', icon: Star },
                      { id: 'dark', label: 'Dark' },
                      { id: 'vibrant', label: 'Vibrant' },
                      { id: 'light', label: 'Light' },
                      { id: 'custom', label: 'My Library' },
                    ].map(category => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setThemeCategory(category.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

                  {/* Dedicated Custom Theme Selector Card */}
                  <div
                    onClick={() => {
                      setSelectedTheme('custom');
                    }}
                    className={`relative overflow-hidden rounded-xl border-2 p-3.5 transition-all cursor-pointer ${
                      selectedTheme === 'custom'
                        ? 'border-accent bg-accent/15 shadow-lg ring-1 ring-accent/40'
                        : 'border-dashed border-accent/40 bg-accent/5 hover:bg-accent/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-accent/20 text-accent">
                          <Sliders className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{customThemeConfig.name || 'Custom Theme'}</h4>
                            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-accent">
                              Live Builder
                            </span>
                          </div>
                          <p className="text-xs text-text-muted">Click to select or customize colors/background</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTheme('custom');
                            setActiveThemeTab('custom-studio');
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-accent/20 text-accent hover:bg-accent hover:text-background transition-all"
                        >
                          Edit Studio
                        </button>
                        {selectedTheme === 'custom' && (
                          <div className="h-6 w-6 rounded-full bg-accent text-background flex items-center justify-center font-bold">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Themes List (10-15 Curated Themes) */}
                  <div className="grid gap-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {getFilteredThemes().length === 0 ? (
                      <div className="text-center py-6 text-text-muted text-sm border border-dashed border-border rounded-xl">
                        No themes matching your search or filter
                      </div>
                    ) : (
                      getFilteredThemes().map(theme => {
                        const isSelected = selectedTheme === theme.id;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`group relative overflow-hidden rounded-xl border-2 p-3.5 text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-accent bg-accent/10 shadow-lg ring-1 ring-accent/30'
                                : 'border-border hover:border-accent/40 bg-surface/60'
                            }`}
                            role="button"
                            tabIndex={0}
                          >
                            <div
                              className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity"
                              style={{ ...getThemeBackgroundStyle(theme.background) }}
                            />
                            <div className="relative flex items-center justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-white truncate">{theme.name}</h4>
                                  {theme.isCustom && (
                                    <span className="rounded-full bg-purple-500/20 px-2 py-0.2 text-[9px] font-bold text-purple-400">
                                      Custom
                                    </span>
                                  )}
                                  {theme.isPublic && (
                                    <GlobeIcon className="h-3 w-3 text-accent" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-text-muted line-clamp-1">{theme.description}</p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div
                                  className="h-5 w-5 rounded-full border border-white/30 shadow-sm"
                                  style={{ background: theme.accentColor }}
                                  title={`Accent: ${theme.accentColor}`}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavoriteTheme(theme.id);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                  title="Favorite theme"
                                >
                                  <Star 
                                    className={`h-4 w-4 transition-colors ${
                                      favoriteThemes.includes(theme.id) 
                                        ? 'fill-yellow-400 text-yellow-400' 
                                        : 'text-text-muted hover:text-white'
                                    }`} 
                                  />
                                </button>
                                {isSelected && (
                                  <div className="h-5 w-5 rounded-full bg-accent text-background flex items-center justify-center font-bold">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* ================= TAB 2: CUSTOM THEME STUDIO ================= */}
              {activeThemeTab === 'custom-studio' && (
                <div className="space-y-4 rounded-xl border border-border bg-surface/80 p-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Design Custom Theme
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomThemeConfig({
                          name: 'My Custom Theme',
                          description: 'Personalized BeastBuck theme',
                          backgroundType: 'gradient',
                          gradientFrom: '#0f0c29',
                          gradientTo: '#24243e',
                          gradientAngle: '135deg',
                          solidColor: '#09090b',
                          imageUrl: '',
                          textColor: '#ffffff',
                          accentColor: '#00d4ff',
                          isPublic: false,
                        });
                        setCustomThemeImageFile(null);
                        setCustomThemeImagePreview(null);
                      }}
                      className="text-xs text-text-muted hover:text-white flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Reset
                    </button>
                  </div>

                  {/* Theme Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-white">Theme Name</label>
                    <input
                      type="text"
                      value={customThemeConfig.name}
                      onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                      placeholder="e.g., Cyberpunk Matrix"
                    />
                  </div>

                  {/* Background Type Selector */}
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-white">Background Mode</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'gradient', label: 'Gradient' },
                        { id: 'solid', label: 'Solid Color' },
                        { id: 'image', label: 'Image' },
                      ].map(type => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setCustomThemeConfig(prev => ({ ...prev, backgroundType: type.id }))}
                          className={`py-2 rounded-lg text-xs font-bold transition-all ${
                            customThemeConfig.backgroundType === type.id
                              ? 'bg-accent text-background'
                              : 'bg-black/30 border border-border text-text-muted hover:bg-white/5'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gradient Background Builder */}
                  {customThemeConfig.backgroundType === 'gradient' && (
                    <div className="space-y-3 rounded-xl border border-border/70 bg-black/30 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-text-muted">Color 1 (Start)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customThemeConfig.gradientFrom}
                              onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, gradientFrom: e.target.value }))}
                              className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={customThemeConfig.gradientFrom}
                              onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, gradientFrom: e.target.value }))}
                              className="w-full rounded-lg border border-border bg-black/50 px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1 block text-[11px] font-bold text-text-muted">Color 2 (End)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={customThemeConfig.gradientTo}
                              onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, gradientTo: e.target.value }))}
                              className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={customThemeConfig.gradientTo}
                              onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, gradientTo: e.target.value }))}
                              className="w-full rounded-lg border border-border bg-black/50 px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Gradient Angle */}
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-text-muted">Direction</label>
                        <div className="flex gap-2">
                          {['135deg', '90deg', '180deg', '45deg'].map(angle => (
                            <button
                              key={angle}
                              type="button"
                              onClick={() => setCustomThemeConfig(prev => ({ ...prev, gradientAngle: angle }))}
                              className={`flex-1 py-1 rounded text-[11px] font-bold transition-all ${
                                customThemeConfig.gradientAngle === angle
                                  ? 'bg-accent/30 text-accent border border-accent/50'
                                  : 'bg-white/5 text-text-muted hover:bg-white/10'
                              }`}
                            >
                              {angle}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick Gradient Palettes */}
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold text-text-muted">Quick Gradient Presets</label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {GRADIENT_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setCustomThemeConfig(prev => ({
                                  ...prev,
                                  gradientFrom: preset.from,
                                  gradientTo: preset.to,
                                  gradientAngle: preset.angle || '135deg'
                                }));
                              }}
                              className="h-7 rounded-lg border border-white/20 transition-all hover:scale-105"
                              style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Solid Background Builder */}
                  {customThemeConfig.backgroundType === 'solid' && (
                    <div className="space-y-2 rounded-xl border border-border/70 bg-black/30 p-3">
                      <label className="mb-1 block text-[11px] font-bold text-text-muted">Solid Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customThemeConfig.solidColor}
                          onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, solidColor: e.target.value }))}
                          className="h-9 w-9 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={customThemeConfig.solidColor}
                          onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, solidColor: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Background Builder */}
                  {customThemeConfig.backgroundType === 'image' && (
                    <div className="space-y-3 rounded-xl border border-border/70 bg-black/30 p-3">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-bold text-text-muted">Upload Background Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomThemeImageChange}
                          className="w-full text-xs text-text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-accent/20 file:text-accent hover:file:bg-accent/30 cursor-pointer"
                        />
                      </div>

                      <div className="relative flex items-center">
                        <div className="flex-grow border-t border-border/50"></div>
                        <span className="flex-shrink mx-2 text-[10px] uppercase text-text-muted">Or Image URL</span>
                        <div className="flex-grow border-t border-border/50"></div>
                      </div>

                      <input
                        type="url"
                        value={customThemeConfig.imageUrl}
                        onChange={(e) => {
                          setCustomThemeConfig(prev => ({ ...prev, imageUrl: e.target.value }));
                          setCustomThemeImagePreview(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full rounded-lg border border-border bg-black/50 px-3 py-2 text-xs text-white placeholder:text-text-muted focus:border-accent focus:outline-none"
                      />

                      {(customThemeImagePreview || customThemeConfig.imageUrl) && (
                        <div className="relative h-20 w-full rounded-lg overflow-hidden border border-border">
                          <img
                            src={customThemeImagePreview || customThemeConfig.imageUrl}
                            alt="Background preview"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCustomThemeImageFile(null);
                              setCustomThemeImagePreview(null);
                              setCustomThemeConfig(prev => ({ ...prev, imageUrl: '' }));
                            }}
                            className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md hover:bg-red-500 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Colors: Text and Accent */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-white">Text Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customThemeConfig.textColor}
                          onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={customThemeConfig.textColor}
                          onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, textColor: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-black/40 px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-white">Accent Glow</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customThemeConfig.accentColor}
                          onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="h-8 w-8 rounded-lg cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={customThemeConfig.accentColor}
                          onChange={(e) => setCustomThemeConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-black/40 px-2.5 py-1.5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accent Swatches */}
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-text-muted">Popular Accent Swatches</label>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_SWATCHES.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCustomThemeConfig(prev => ({ ...prev, accentColor: color }))}
                          className="h-6 w-6 rounded-full border border-white/30 transition-all hover:scale-110"
                          style={{ background: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Public / Private Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCustomThemeConfig(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                          customThemeConfig.isPublic 
                            ? 'bg-accent/20 text-accent border border-accent/40' 
                            : 'bg-white/5 text-text-muted'
                        }`}
                      >
                        {customThemeConfig.isPublic ? <GlobeIcon className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        {customThemeConfig.isPublic ? 'Public Theme' : 'Private'}
                      </button>
                    </div>
                    <span className="text-[11px] text-text-muted">
                      {customThemeConfig.isPublic ? 'Visible in community library' : 'Only for your profile'}
                    </span>
                  </div>

                  {/* Custom Theme Studio Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleApplyCustomTheme}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs sm:text-sm font-bold text-background hover:bg-cyan-300 transition-all shadow-md"
                    >
                      <Sparkles className="h-4 w-4" />
                      Apply Custom Theme
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveThemeToLibrary}
                      disabled={uploadingTheme}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 text-accent" />
                      {uploadingTheme ? 'Saving...' : 'Save to Library'}
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-cyan-500 px-6 py-3.5 text-sm font-bold text-background hover:from-cyan-400 hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 cursor-pointer"
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
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 py-3 text-sm font-bold text-text-soft hover:bg-white/5 cursor-pointer"
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
