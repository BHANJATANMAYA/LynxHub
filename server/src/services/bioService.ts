import { Types } from 'mongoose';
import { BioProfile, IBioProfile } from '../models/BioProfile';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { isReservedSlug } from '../utils/reservedSlugs';
import { SocialLinkItem, BioTheme } from '../types';

export class BioService {
  /**
   * Get bio profile for authenticated user.
   */
  static async getProfileByUserId(userId: string): Promise<IBioProfile> {
    const userObjectId = new Types.ObjectId(userId);
    let profile = await BioProfile.findOne({ userId: userObjectId });

    // Fallback: If not created during signup, create default
    if (!profile) {
      const user = await User.findById(userObjectId);
      if (!user) {
        throw AppError.notFound('User not found.', 'USER_NOT_FOUND');
      }

      profile = await BioProfile.create({
        userId: user._id,
        username: user.username,
        displayName: user.username,
        bio: `Hello! I'm ${user.username}. Welcome to my LynxHub link-in-bio page.`,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
        theme: 'minimal-light',
        socialLinks: [],
      });
    }

    return profile;
  }

  /**
   * Update bio profile and reordered social links.
   */
  static async updateProfile(
    userId: string,
    data: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
      theme?: BioTheme;
      socialLinks?: SocialLinkItem[];
    }
  ): Promise<IBioProfile> {
    const userObjectId = new Types.ObjectId(userId);
    const profile = await this.getProfileByUserId(userId);

    if (data.displayName !== undefined) profile.displayName = data.displayName;
    if (data.bio !== undefined) profile.bio = data.bio;
    if (data.avatarUrl !== undefined) profile.avatarUrl = data.avatarUrl;
    if (data.theme !== undefined) profile.theme = data.theme;

    if (data.socialLinks !== undefined) {
      // Normalize orders and ensure clean IDs
      profile.socialLinks = data.socialLinks.map((link, idx) => ({
        id: link.id || `link_${Date.now()}_${idx}`,
        platform: link.platform.trim(),
        label: link.label.trim(),
        url: link.url.trim(),
        icon: link.icon || link.platform.toLowerCase(),
        order: typeof link.order === 'number' ? link.order : idx,
        isActive: link.isActive !== false,
      }));
    }

    await profile.save();
    return profile;
  }

  /**
   * Get public creator bio profile by username.
   */
  static async getPublicProfile(usernameInput: string): Promise<{
    username: string;
    displayName: string;
    bio: string;
    avatarUrl: string;
    theme: string;
    socialLinks: SocialLinkItem[];
  }> {
    const username = usernameInput.toLowerCase().trim();

    if (isReservedSlug(username)) {
      throw AppError.notFound('Profile not found.', 'PROFILE_NOT_FOUND');
    }

    const profile = await BioProfile.findOne({ username }).lean();
    if (!profile) {
      throw AppError.notFound('Creator profile not found.', 'PROFILE_NOT_FOUND');
    }

    // Only return active social links sorted by order
    const activeSocialLinks = (profile.socialLinks || [])
      .filter((link) => link.isActive)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return {
      username: profile.username,
      displayName: profile.displayName || profile.username,
      bio: profile.bio || '',
      avatarUrl: profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`,
      theme: profile.theme || 'minimal-light',
      socialLinks: activeSocialLinks,
    };
  }
}
