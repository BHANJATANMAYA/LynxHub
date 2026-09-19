import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { PublicBioProfile } from '../../types';
import { Avatar } from '../../components/ui/Avatar';
import {
  Globe,
  Github,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Music,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const PublicBioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicBioProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<{ profile: PublicBioProfile }>(`/api/bio/${username}`);
        if (res.success && res.data?.profile) {
          setProfile(res.data.profile);
        } else {
          setError(res.error?.message || 'Creator profile not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load public bio profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return <Github className="w-4 h-4" />;
      case 'twitter':
      case 'x':
        return <Twitter className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'spotify':
        return <Music className="w-4 h-4" />;
      case 'discord':
        return <MessageSquare className="w-4 h-4" />;
      case 'website':
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-xs text-slate-400">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-heading text-white">Profile Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The profile <span className="font-semibold text-slate-200">@{username}</span> does not exist or has been removed.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              Claim this username on LynxHub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine theme styles
  const theme = profile.theme || 'minimal-light';

  const themeStyles = {
    'minimal-light': {
      page: 'bg-slate-100 text-slate-900',
      avatarRing: 'ring-4 ring-white shadow-xl',
      badge: 'bg-slate-200 text-slate-700',
      name: 'text-slate-900',
      handle: 'text-slate-500',
      bio: 'text-slate-700',
      button:
        'bg-white text-slate-900 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-0.5 active:translate-y-0',
      iconColor: 'text-slate-600',
      footer: 'text-slate-400 border-slate-200',
      brandBadge: 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm',
    },
    'dark-slate': {
      page: 'bg-slate-950 text-slate-100',
      avatarRing: 'ring-4 ring-slate-800 shadow-xl border border-emerald-500/40',
      badge: 'bg-slate-900 text-emerald-400 border border-emerald-800/40',
      name: 'text-white',
      handle: 'text-slate-400',
      bio: 'text-slate-300',
      button:
        'bg-slate-900/90 text-slate-100 border border-slate-800 shadow-lg shadow-black/40 hover:border-emerald-500/50 hover:bg-slate-850 hover:-translate-y-0.5 active:translate-y-0',
      iconColor: 'text-emerald-400',
      footer: 'text-slate-500 border-slate-800/60',
      brandBadge: 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200',
    },
    'vibrant-gradient': {
      page: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white min-h-screen',
      avatarRing: 'ring-4 ring-purple-500/40 shadow-2xl shadow-indigo-500/30',
      badge: 'bg-white/10 text-indigo-300 backdrop-blur-md border border-white/15',
      name: 'text-white font-extrabold',
      handle: 'text-indigo-200',
      bio: 'text-slate-200',
      button:
        'bg-white/10 text-white border border-white/20 backdrop-blur-md shadow-xl hover:bg-white/20 hover:border-white/40 hover:-translate-y-0.5 active:translate-y-0',
      iconColor: 'text-purple-300',
      footer: 'text-indigo-300/60 border-white/10',
      brandBadge: 'bg-white/10 backdrop-blur-md border-white/20 text-indigo-200 hover:text-white',
    },
  }[theme];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 transition-colors duration-300 ${themeStyles.page}`}>
      {/* Top spacer / header */}
      <div className="w-full max-w-lg flex items-center justify-end py-2">
        <Link
          to="/signup"
          className={`text-xs px-3 py-1.5 rounded-full border transition-all inline-flex items-center gap-1.5 ${themeStyles.brandBadge}`}
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Create your own Bio</span>
        </Link>
      </div>

      {/* Profile Center Body */}
      <main className="w-full max-w-md my-auto py-8 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Avatar */}
        <div className="relative">
          <Avatar
            src={profile.avatarUrl}
            fallback={profile.displayName || profile.username}
            size="xl"
            className={themeStyles.avatarRing}
          />
        </div>

        {/* Display name & username */}
        <div className="space-y-1">
          <h1 className={`text-2xl font-bold font-heading tracking-tight ${themeStyles.name}`}>
            {profile.displayName || profile.username}
          </h1>
          <p className={`text-xs font-mono font-medium ${themeStyles.handle}`}>
            @{profile.username}
          </p>
        </div>

        {/* Bio description */}
        {profile.bio && (
          <p className={`text-xs sm:text-sm leading-relaxed max-w-sm px-2 ${themeStyles.bio}`}>
            {profile.bio}
          </p>
        )}

        {/* Action Link Buttons */}
        <div className="w-full space-y-3 pt-2">
          {profile.socialLinks && profile.socialLinks.length > 0 ? (
            profile.socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3.5 px-5 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all duration-200 ${themeStyles.button}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`p-1.5 rounded-lg bg-black/10 ${themeStyles.iconColor}`}>
                    {getPlatformIcon(link.platform)}
                  </span>
                  <span className="truncate">{link.label || link.platform}</span>
                </div>
                <ExternalLink className="w-4 h-4 opacity-50 shrink-0 ml-2" />
              </a>
            ))
          ) : (
            <div className="py-6 text-xs opacity-60">
              No public links configured yet.
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-md pt-8 pb-4 text-center">
        <Link
          to="/"
          className={`text-xs inline-flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity font-medium ${themeStyles.handle}`}
        >
          <span>Created with</span>
          <span className="font-bold font-heading text-indigo-400">LynxHub</span>
        </Link>
      </footer>
    </div>
  );
};
