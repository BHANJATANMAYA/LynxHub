import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { User } from '../src/models/User';
import { ShortLink } from '../src/models/ShortLink';
import { ClickEvent } from '../src/models/ClickEvent';
import { BioProfile } from '../src/models/BioProfile';

describe('LynxHub Full API Test Suite', () => {
  const userA = {
    email: 'usera@example.com',
    password: 'Password123!',
    username: 'usera',
  };

  const userB = {
    email: 'userb@example.com',
    password: 'Password123!',
    username: 'userb',
  };

  describe('1. Authentication & Security', () => {
    it('should register a new user and set auth cookies', async () => {
      const res = await request(app).post('/api/auth/signup').send(userA);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(userA.email);
      expect(res.body.data.user.username).toBe(userA.username);
      expect(res.body.data.user.isEmailVerified).toBe(false);
      expect(res.body.data.simulatedVerificationUrl).toBeDefined();

      // Check cookies
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieStr = Array.isArray(cookies) ? cookies.join('; ') : cookies;
      expect(cookieStr).toContain('access_token');
      expect(cookieStr).toContain('refresh_token');

      // Check BioProfile was automatically created
      const bio = await BioProfile.findOne({ username: userA.username });
      expect(bio).not.toBeNull();
      expect(bio?.displayName).toBe(userA.username);
    });

    it('should prevent duplicate email registration', async () => {
      await request(app).post('/api/auth/signup').send(userA);

      const res = await request(app).post('/api/auth/signup').send({
        email: userA.email,
        password: 'Password123!',
        username: 'otheruser',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should authenticate valid credentials and reject invalid password', async () => {
      await request(app).post('/api/auth/signup').send(userA);

      // Wrong password
      const badLogin = await request(app).post('/api/auth/login').send({
        email: userA.email,
        password: 'WrongPassword!',
      });
      expect(badLogin.status).toBe(401);

      // Correct password
      const goodLogin = await request(app).post('/api/auth/login').send({
        email: userA.email,
        password: userA.password,
      });
      expect(goodLogin.status).toBe(200);
      expect(goodLogin.body.data.user.email).toBe(userA.email);
    });

    it('should rotate refresh token upon refresh request', async () => {
      const signupRes = await request(app).post('/api/auth/signup').send(userA);
      const cookies = signupRes.headers['set-cookie'];

      // Perform token refresh
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);

      const newCookies = refreshRes.headers['set-cookie'];
      expect(newCookies).toBeDefined();

      // Trying to reuse the OLD refresh token should now be rejected (token rotation)
      const reuseRes = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies);

      expect(reuseRes.status).toBe(401);
    });

    it('should complete simulated email verification', async () => {
      const signupRes = await request(app).post('/api/auth/signup').send(userA);
      const verificationUrl = signupRes.body.data.simulatedVerificationUrl;
      const urlObj = new URL(verificationUrl);
      const token = urlObj.searchParams.get('token');

      expect(token).toBeDefined();

      const verifyRes = await request(app).get(`/api/auth/verify-email?token=${token}`);
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.user.isEmailVerified).toBe(true);

      const dbUser = await User.findOne({ email: userA.email });
      expect(dbUser?.isEmailVerified).toBe(true);
    });

    it('should complete forgot password and reset password flow', async () => {
      await request(app).post('/api/auth/signup').send(userA);

      const forgotRes = await request(app).post('/api/auth/forgot-password').send({
        email: userA.email,
      });
      expect(forgotRes.status).toBe(200);

      const resetUrl = forgotRes.body.data.simulatedResetUrl;
      const urlObj = new URL(resetUrl);
      const token = urlObj.searchParams.get('token');

      const resetRes = await request(app).post('/api/auth/reset-password').send({
        token,
        password: 'NewPassword123!',
      });
      expect(resetRes.status).toBe(200);

      // Verify login with new password works
      const loginRes = await request(app).post('/api/auth/login').send({
        email: userA.email,
        password: 'NewPassword123!',
      });
      expect(loginRes.status).toBe(200);
    });
  });

  describe('2. URL Shortener & Multi-Tenant Isolation', () => {
    let userACookies: string[];
    let userBCookies: string[];

    beforeEach(async () => {
      const resA = await request(app).post('/api/auth/signup').send(userA);
      userACookies = resA.headers['set-cookie'];

      const resB = await request(app).post('/api/auth/signup').send(userB);
      userBCookies = resB.headers['set-cookie'];
    });

    it('should create a short link with auto-generated 6-character code', async () => {
      const res = await request(app)
        .post('/api/links')
        .set('Cookie', userACookies)
        .send({
          destinationUrl: 'https://developer.mozilla.org/en-US/docs/Web',
          title: 'MDN Web Docs',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.link.shortCode).toHaveLength(6);
      expect(res.body.data.link.isCustomSlug).toBe(false);
      expect(res.body.data.link.destinationUrl).toBe('https://developer.mozilla.org/en-US/docs/Web');
    });

    it('should create a short link with custom vanity slug', async () => {
      const res = await request(app)
        .post('/api/links')
        .set('Cookie', userACookies)
        .send({
          destinationUrl: 'https://example.com/summer-sale',
          customSlug: 'summer-sale-2026',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.link.shortCode).toBe('summer-sale-2026');
      expect(res.body.data.link.isCustomSlug).toBe(true);
    });

    it('should reject reserved slugs and duplicate custom slugs (collision)', async () => {
      // Reserved slug
      const reservedRes = await request(app)
        .post('/api/links')
        .set('Cookie', userACookies)
        .send({
          destinationUrl: 'https://example.com',
          customSlug: 'admin',
        });
      expect(reservedRes.status).toBe(400);

      // Create first
      await request(app)
        .post('/api/links')
        .set('Cookie', userACookies)
        .send({
          destinationUrl: 'https://example.com',
          customSlug: 'black-friday',
        });

      // Attempt duplicate by another user
      const collisionRes = await request(app)
        .post('/api/links')
        .set('Cookie', userBCookies)
        .send({
          destinationUrl: 'https://competitor.com',
          customSlug: 'black-friday',
        });

      expect(collisionRes.status).toBe(409);
      expect(collisionRes.body.error.code).toBe('SLUG_COLLISION');
    });

    it('should reject invalid destination URLs', async () => {
      const res = await request(app)
        .post('/api/links')
        .set('Cookie', userACookies)
        .send({
          destinationUrl: 'not-a-valid-url',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should isolate links per user (User B cannot view or delete User A links)', async () => {
      // User A creates a link
      const createRes = await request(app)
        .post('/api/links')
        .set('Cookie', userACookies)
        .send({
          destinationUrl: 'https://private-data.com',
          customSlug: 'user-a-secret',
        });

      const linkId = createRes.body.data.link._id;

      // User B lists links - should be empty
      const listB = await request(app).get('/api/links').set('Cookie', userBCookies);
      expect(listB.body.data).toHaveLength(0);

      // User B attempts to get User A's link details
      const getB = await request(app).get(`/api/links/${linkId}`).set('Cookie', userBCookies);
      expect(getB.status).toBe(404);

      // User B attempts to delete User A's link
      const deleteB = await request(app).delete(`/api/links/${linkId}`).set('Cookie', userBCookies);
      expect(deleteB.status).toBe(404);

      // Link should still exist
      const checkA = await request(app).get(`/api/links/${linkId}`).set('Cookie', userACookies);
      expect(checkA.status).toBe(200);
    });

    it('should support search and server-side pagination for user links', async () => {
      // Create 3 links
      await request(app).post('/api/links').set('Cookie', userACookies).send({
        destinationUrl: 'https://github.com/facebook/react',
        title: 'React Repository',
      });
      await request(app).post('/api/links').set('Cookie', userACookies).send({
        destinationUrl: 'https://github.com/vuejs/vue',
        title: 'Vue Repository',
      });
      await request(app).post('/api/links').set('Cookie', userACookies).send({
        destinationUrl: 'https://nodejs.org',
        title: 'NodeJS Official',
      });

      // Search for "react"
      const searchRes = await request(app)
        .get('/api/links?search=react')
        .set('Cookie', userACookies);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data).toHaveLength(1);
      expect(searchRes.body.data[0].title).toBe('React Repository');

      // Test pagination: limit 2
      const pagedRes = await request(app)
        .get('/api/links?limit=2&page=1')
        .set('Cookie', userACookies);

      expect(pagedRes.body.data).toHaveLength(2);
      expect(pagedRes.body.meta.pagination.total).toBe(3);
      expect(pagedRes.body.meta.pagination.totalPages).toBe(2);
    });
  });

  describe('3. Short Redirect & Telemetry Aggregations', () => {
    let userCookies: string[];

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/signup').send(userA);
      userCookies = res.headers['set-cookie'];
    });

    it('should return 302 redirect and record click telemetry with salted IP hash', async () => {
      const createRes = await request(app)
        .post('/api/links')
        .set('Cookie', userCookies)
        .send({
          destinationUrl: 'https://vitest.dev',
          customSlug: 'vitest-docs',
        });

      const linkId = createRes.body.data.link._id;

      // Hit short redirect endpoint
      const redirectRes = await request(app)
        .get('/r/vitest-docs')
        .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile/15E148')
        .set('Referer', 'https://twitter.com/dev');

      expect(redirectRes.status).toBe(302);
      expect(redirectRes.headers.location).toBe('https://vitest.dev');

      // Allow asynchronous setImmediate telemetry logging to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify ClickEvent document was created
      const clicks = await ClickEvent.find({ shortLinkId: linkId });
      expect(clicks.length).toBe(1);
      expect(clicks[0].deviceType).toBe('Mobile');
      expect(clicks[0].referrerDomain).toBe('twitter.com');
      expect(clicks[0].ipHash).toBeDefined();
      expect(clicks[0].ipHash).not.toBe('127.0.0.1'); // Ensure it is hashed, not raw IP

      // Verify ShortLink click count incremented
      const updatedLink = await ShortLink.findById(linkId);
      expect(updatedLink?.clickCount).toBe(1);
    });

    it('should return analytics aggregated data for the link', async () => {
      const createRes = await request(app)
        .post('/api/links')
        .set('Cookie', userCookies)
        .send({
          destinationUrl: 'https://typescriptlang.org',
          customSlug: 'ts-docs',
        });
      const linkId = createRes.body.data.link._id;

      // Trigger 2 redirects
      await request(app).get('/r/ts-docs').set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
      await request(app).get('/r/ts-docs').set('User-Agent', 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const analyticsRes = await request(app)
        .get(`/api/links/${linkId}/analytics?period=7d`)
        .set('Cookie', userCookies);

      expect(analyticsRes.status).toBe(200);
      expect(analyticsRes.body.data.summary.totalClicks).toBe(2);
      expect(analyticsRes.body.data.deviceDistribution.length).toBeGreaterThan(0);
      expect(analyticsRes.body.data.clicksOverTime.length).toBeGreaterThan(0);
    });
  });

  describe('4. Link-in-Bio Profile Builder & Public Page', () => {
    let userCookies: string[];

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/signup').send(userA);
      userCookies = res.headers['set-cookie'];
    });

    it('should update bio profile, theme, and reorder social links', async () => {
      const updateData = {
        displayName: 'Alice Developer',
        bio: 'Full-stack software engineer & open-source enthusiast',
        theme: 'vibrant-gradient',
        socialLinks: [
          {
            id: 'sl-1',
            platform: 'github',
            label: 'GitHub Profile',
            url: 'https://github.com/alice',
            order: 0,
            isActive: true,
          },
          {
            id: 'sl-2',
            platform: 'twitter',
            label: 'X / Twitter',
            url: 'https://x.com/alice',
            order: 1,
            isActive: true,
          },
        ],
      };

      const putRes = await request(app)
        .put('/api/bio/me')
        .set('Cookie', userCookies)
        .send(updateData);

      expect(putRes.status).toBe(200);
      expect(putRes.body.data.profile.displayName).toBe('Alice Developer');
      expect(putRes.body.data.profile.theme).toBe('vibrant-gradient');
      expect(putRes.body.data.profile.socialLinks).toHaveLength(2);
    });

    it('should publicly render creator profile at GET /api/bio/:username without authentication', async () => {
      // First update profile
      await request(app)
        .put('/api/bio/me')
        .set('Cookie', userCookies)
        .send({
          displayName: 'Alice Public Profile',
          bio: 'Publicly visible creator bio',
          theme: 'dark-slate',
          socialLinks: [
            {
              id: 'sl-pub',
              platform: 'website',
              label: 'Portfolio',
              url: 'https://alice.dev',
              order: 0,
              isActive: true,
            },
          ],
        });

      // Fetch without any cookie or auth header
      const publicRes = await request(app).get(`/api/bio/${userA.username}`);

      expect(publicRes.status).toBe(200);
      expect(publicRes.body.success).toBe(true);
      expect(publicRes.body.data.profile.displayName).toBe('Alice Public Profile');
      expect(publicRes.body.data.profile.theme).toBe('dark-slate');
      expect(publicRes.body.data.profile.socialLinks[0].label).toBe('Portfolio');
    });
  });
});
