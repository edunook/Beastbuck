import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { User, Link as LinkIcon, MapPin, Image as ImageIcon } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';

export default function ProfileSettings() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    username: user?.email?.split('@')[0] || '',
    bio: '',
    tagline: '',
    website: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Profile Settings" 
        description="Profile editing including name, username, bio, tagline, profile picture, cover image, social links, website, skills, interests, languages, and location."
        hero={true}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-accent" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Tagline</label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                placeholder="A short description..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Website</label>
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-text-muted" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">Location (Optional)</label>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-text-muted" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent"
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-bold text-white mb-4">Profile Picture</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-4xl">
                👤
              </div>
              <div>
                <Button variant="secondary" className="mb-2">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Upload New
                </Button>
                <Button variant="secondary" className="text-red-400 hover:text-red-300">
                  Remove
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-bold text-white mb-4">Cover Image</h3>
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent transition-all cursor-pointer">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-text-muted" />
              <p className="text-text-muted mb-2">Click to upload cover image</p>
              <p className="text-text-muted text-xs">Recommended: 1920x600px</p>
            </div>
          </div>

          <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
