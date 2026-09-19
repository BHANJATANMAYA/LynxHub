import { Types, FilterQuery } from 'mongoose';
import { ShortLink, IShortLink } from '../models/ShortLink';
import { ClickEvent } from '../models/ClickEvent';
import { AppError } from '../utils/AppError';
import { generateShortCode } from '../utils/shortCode';
import { isReservedSlug } from '../utils/reservedSlugs';

export class LinkService {
  /**
   * Create a new short link with an auto-generated 6-char code or custom slug.
   * Detects and handles collision cleanly.
   */
  static async createLink(params: {
    userId: string;
    destinationUrl: string;
    customSlug?: string;
    title?: string;
  }): Promise<IShortLink> {
    const userObjectId = new Types.ObjectId(params.userId);
    let shortCode = '';
    let isCustomSlug = false;

    if (params.customSlug && params.customSlug.trim()) {
      const slug = params.customSlug.trim();

      if (isReservedSlug(slug)) {
        throw AppError.conflict('This custom slug is reserved by the platform.', 'RESERVED_SLUG');
      }

      // Check for collision
      const existing = await ShortLink.findOne({ shortCode: slug });
      if (existing) {
        throw AppError.conflict(
          `The custom slug "${slug}" is already taken. Please choose another.`,
          'SLUG_COLLISION'
        );
      }

      shortCode = slug;
      isCustomSlug = true;
    } else {
      // Auto-generate 6-char code with collision retry loop
      let attempts = 0;
      const MAX_ATTEMPTS = 6;
      let generated = '';

      while (attempts < MAX_ATTEMPTS) {
        generated = generateShortCode(6);
        if (!isReservedSlug(generated)) {
          const collision = await ShortLink.findOne({ shortCode: generated });
          if (!collision) {
            shortCode = generated;
            break;
          }
        }
        attempts++;
      }

      if (!shortCode) {
        throw AppError.internal('Failed to allocate a unique shortcode. Please try again.', 'SHORTCODE_EXHAUSTED');
      }
    }

    try {
      const newLink = await ShortLink.create({
        userId: userObjectId,
        shortCode,
        destinationUrl: params.destinationUrl,
        title: params.title || '',
        isCustomSlug,
        clickCount: 0,
      });

      return newLink;
    } catch (err: any) {
      if (err.code === 11000) {
        throw AppError.conflict('A short link with this slug already exists.', 'SLUG_COLLISION');
      }
      throw err;
    }
  }

  /**
   * Paginated list of links strictly isolated to the authenticated user.
   */
  static async getUserLinks(params: {
    userId: string;
    page: number;
    limit: number;
    search?: string;
  }): Promise<{
    links: IShortLink[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const userObjectId = new Types.ObjectId(params.userId);
    const filter: FilterQuery<IShortLink> = { userId: userObjectId };

    if (params.search && params.search.trim()) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      filter.$or = [
        { shortCode: searchRegex },
        { destinationUrl: searchRegex },
        { title: searchRegex },
      ];
    }

    const page = Math.max(1, params.page);
    const limit = Math.min(100, Math.max(1, params.limit));
    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      ShortLink.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ShortLink.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      links: links as unknown as IShortLink[],
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get a single short link, enforcing user ownership.
   */
  static async getLinkById(userId: string, linkId: string): Promise<IShortLink> {
    const link = await ShortLink.findOne({
      _id: new Types.ObjectId(linkId),
      userId: new Types.ObjectId(userId),
    });

    if (!link) {
      throw AppError.notFound('Short link not found or access denied.', 'LINK_NOT_FOUND');
    }

    return link;
  }

  /**
   * Delete a link and its telemetry events, enforcing user ownership.
   */
  static async deleteLink(userId: string, linkId: string): Promise<void> {
    const linkObjectId = new Types.ObjectId(linkId);
    const userObjectId = new Types.ObjectId(userId);

    const deleted = await ShortLink.findOneAndDelete({
      _id: linkObjectId,
      userId: userObjectId,
    });

    if (!deleted) {
      throw AppError.notFound('Short link not found or access denied.', 'LINK_NOT_FOUND');
    }

    // Clean up all click events associated with this deleted link
    await ClickEvent.deleteMany({ shortLinkId: linkObjectId });
  }

  /**
   * Fast indexed resolution of shortCode for public redirect (no user check).
   */
  static async resolveShortCode(shortCode: string): Promise<IShortLink | null> {
    return ShortLink.findOne({ shortCode }).lean() as unknown as IShortLink | null;
  }
}
