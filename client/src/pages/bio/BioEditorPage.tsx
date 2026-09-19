import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { BioProfile, SocialLink, BioTheme } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';
import {
  User,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Palette,
  Smartphone,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const BioEditorPage: React.FC = () => {
  const [profile, setProfile] = useState<BioProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [theme, setTheme] = useState<BioTheme>('minimal-light');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error: toastError } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get<{ profile: BioProfile }>('/api/bio/me');
        if (res.success && res.data?.profile) {
          const p = res.data.profile;
          setProfile(p);
          setDisplayName(p.displayName || p.username);
          setBio(p.bio || '');
          setAvatarUrl(p.avatarUrl || '');
          setTheme(p.theme || 'minimal-light');
          setSocialLinks(p.socialLinks || []);
        }
      } catch (err: any) {
        toastError('Failed to load profile', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [toastError]);

  const handleAddLink = () => {
    const newLink: SocialLink = {
      id: `link_${Date.now()}`,
      platform: 'website',
      label: 'My Website',
      url: 'https://',
      order: socialLinks.length,
      isActive: true,
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const handleUpdateLink = (index: number, fields: Partial<SocialLink>) => {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], ...fields };
    setSocialLinks(updated);
  };

  const handleDeleteLink = (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index);
    setSocialLinks(updated);
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === socialLinks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...socialLinks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Update orders
    const reordered = updated.map((item, idx) => ({ ...item, order: idx }));
    setSocialLinks(reordered);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put<{ profile: BioProfile }>('/api/bio/me', {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        theme,
        socialLinks: socialLinks.map((l, idx) => ({ ...l, order: idx })),
      });

      if (res.success) {
        success('Profile saved!', 'Your public bio page has been updated.');
        setProfile(res.data.profile);
      } else {
        toastError('Failed to save', res.error?.message);
      }
    } catch (err: any) {
      toastError('Save error', err.message);
    } finally {
      setSaving(false);
    }
  };

  const avatarPresets = [
    { label: 'Bottts', url: `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'user'}` },
    { label: 'Pixel', url: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username || 'user'}` },
    { label: 'Adventurer', url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile?.username || 'user'}` },
    { label: 'Thumbs', url: `https://api.dicebear.com/7.x/thumbs/svg?seed=${profile?.username || 'user'}` },
  ];

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading your bio builder...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            Link-in-Bio Profile Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Customize your public creator page and view live updates in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <a
              href={`/bio/${profile.username}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:bg-slate-850 transition-colors"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            </a>
          )}
          <Button onClick={handleSave} loading={saving} className="shadow-indigo-600/30">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Split Grid: Left Editor Controls, Right Live Phone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Identity Card */}
          <Card className="glass-card border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Profile Details
              </CardTitle>
              <CardDescription>Configure your identity, avatar, and creator bio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar
                  src={avatarUrl}
                  fallback={displayName || profile?.username || 'U'}
                  size="lg"
                  className="ring-2 ring-indigo-500/40"
                />
                <div className="flex-1 space-y-1">
                  <Input
                    label="Avatar Image URL"
                    placeholder="https://example.com/avatar.png"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400">Presets:</span>
                    {avatarPresets.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setAvatarUrl(preset.url)}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Input
                label="Display Name"
                placeholder="e.g. Alice Cooper"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
              />

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Bio Description ({bio.length}/500)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell your audience about who you are, what you build, and what to check out..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-800 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Selector Card */}
          <Card className="glass-card border-slate-800/80">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                Select Profile Theme
              </CardTitle>
              <CardDescription>
                Themes substantially alter background, card aesthetics, and typography.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Minimal Light */}
                <div
                  onClick={() => setTheme('minimal-light')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    theme === 'minimal-light'
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="h-16 rounded-lg bg-slate-100 p-2 flex flex-col items-center justify-center gap-1.5 shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-slate-400" />
                    <div className="w-16 h-2 rounded bg-slate-300" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Minimal Light</span>
                    {theme === 'minimal-light' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>

                {/* Dark Slate */}
                <div
                  onClick={() => setTheme('dark-slate')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    theme === 'dark-slate'
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="h-16 rounded-lg bg-slate-950 p-2 flex flex-col items-center justify-center gap-1.5 border border-slate-800">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500" />
                    <div className="w-16 h-2 rounded bg-slate-800" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Dark Slate</span>
                    {theme === 'dark-slate' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>

                {/* Vibrant Gradient */}
                <div
                  onClick={() => setTheme('vibrant-gradient')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    theme === 'vibrant-gradient'
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="h-16 rounded-lg bg-gradient-to-tr from-indigo-900 via-purple-900 to-pink-900 p-2 flex flex-col items-center justify-center gap-1.5 shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-white/30 backdrop-blur-sm" />
                    <div className="w-16 h-2 rounded bg-white/30" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">Gradient</span>
                    {theme === 'vibrant-gradient' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links Manager Card */}
          <Card className="glass-card border-slate-800/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  Social Links & Custom Buttons
                </CardTitle>
                <CardDescription>
                  Add, edit, reorder, and activate buttons on your public page.
                </CardDescription>
              </div>
              <Button size="sm" onClick={handleAddLink} variant="secondary">
                <Plus className="w-3.5 h-3.5" /> Add Link
              </Button>
            </CardHeader>
            <CardContent>
              {socialLinks.length > 0 ? (
                <div className="space-y-3">
                  {socialLinks.map((link, idx) => (
                    <div
                      key={link.id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500 font-bold">#{idx + 1}</span>
                          <select
                            value={link.platform}
                            onChange={(e) => handleUpdateLink(idx, { platform: e.target.value })}
                            className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="website">🌐 Website</option>
                            <option value="github">🐙 GitHub</option>
                            <option value="twitter">🐦 X / Twitter</option>
                            <option value="linkedin">💼 LinkedIn</option>
                            <option value="youtube">📺 YouTube</option>
                            <option value="instagram">📸 Instagram</option>
                            <option value="spotify">🎵 Spotify</option>
                            <option value="discord">💬 Discord</option>
                          </select>
                        </div>

                        {/* Order & Delete actions */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveLink(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                            title="Move up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === socialLinks.length - 1}
                            onClick={() => handleMoveLink(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-slate-800"
                            title="Move down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink(idx)}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-500/10 ml-1"
                            title="Delete link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <Input
                          placeholder="Button Label (e.g. My Portfolio)"
                          value={link.label}
                          onChange={(e) => handleUpdateLink(idx, { label: e.target.value })}
                          className="text-xs py-2"
                        />
                        <Input
                          placeholder="URL (e.g. https://...)"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(idx, { url: e.target.value })}
                          className="text-xs py-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                  <p>No social links added yet.</p>
                  <Button size="sm" variant="outline" onClick={handleAddLink}>
                    <Plus className="w-3.5 h-3.5" /> Add Your First Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Interactive Live Mobile Phone Mockup */}
        <div className="lg:col-span-5 sticky top-20 flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Live Interactive Mobile Preview</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-[320px] sm:w-[350px] h-[640px] rounded-[42px] p-3.5 bg-slate-900 border-[5px] border-slate-800 shadow-2xl shadow-black/80 flex flex-col relative overflow-hidden">
            {/* Top speaker & camera notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-850 mr-2" />
              <div className="w-8 h-1 rounded-full bg-slate-850" />
            </div>

            {/* Inner phone screen container */}
            <div
              className={`w-full h-full rounded-[32px] overflow-y-auto pt-10 pb-6 px-4 flex flex-col items-center transition-colors duration-300 ${
                theme === 'minimal-light'
                  ? 'bg-slate-50 text-slate-900'
                  : theme === 'dark-slate'
                  ? 'bg-slate-950 text-slate-100 border border-slate-850'
                  : 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white'
              }`}
            >
              {/* Avatar */}
              <div className="mt-4">
                <Avatar
                  src={avatarUrl}
                  fallback={displayName || profile?.username || 'U'}
                  size="lg"
                  className={
                    theme === 'minimal-light'
                      ? 'ring-4 ring-slate-200 shadow-md'
                      : theme === 'dark-slate'
                      ? 'ring-4 ring-slate-800 border border-emerald-500/40 shadow-lg'
                      : 'ring-4 ring-purple-500/40 shadow-xl'
                  }
                />
              </div>

              {/* Names */}
              <h2 className="mt-3 text-base font-bold text-center leading-tight">
                {displayName || profile?.username || 'Your Name'}
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  theme === 'minimal-light' ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                @{profile?.username || 'username'}
              </p>

              {/* Bio */}
              {bio && (
                <p
                  className={`mt-2 text-xs text-center leading-relaxed px-2 line-clamp-3 ${
                    theme === 'minimal-light' ? 'text-slate-600' : 'text-slate-300'
                  }`}
                >
                  {bio}
                </p>
              )}

              {/* Social Links Buttons */}
              <div className="w-full mt-6 space-y-2.5 flex-1">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-between transition-all duration-200 shadow-sm ${
                      theme === 'minimal-light'
                        ? 'bg-white text-slate-800 border border-slate-200 hover:border-slate-400 hover:shadow-md'
                        : theme === 'dark-slate'
                        ? 'bg-slate-900/90 text-slate-100 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850'
                        : 'bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 hover:scale-[1.02]'
                    }`}
                  >
                    <span className="truncate">{link.label || link.platform}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0 ml-2" />
                  </a>
                ))}

                {socialLinks.length === 0 && (
                  <div
                    className={`py-8 text-center text-xs rounded-xl border border-dashed ${
                      theme === 'minimal-light' ? 'border-slate-300 text-slate-400' : 'border-slate-800 text-slate-500'
                    }`}
                  >
                    No links added yet
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-4 text-[10px] text-center opacity-60">
                Created with <span className="font-bold">LynxHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
