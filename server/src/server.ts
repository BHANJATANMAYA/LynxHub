import { app } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { User } from './models/User';
import { BioProfile } from './models/BioProfile';
import { ShortLink } from './models/ShortLink';
import { hashPassword } from './utils/hash';

async function seedDemoUser() {
  try {
    const existing = await User.findOne({ email: 'demo@lynxhub.com' });
    if (!existing) {
      const passwordHash = await hashPassword('Password123!');
      const user = await User.create({
        email: 'demo@lynxhub.com',
        passwordHash,
        username: 'demouser',
        isEmailVerified: true,
      });

      await BioProfile.create({
        userId: user._id,
        username: 'demouser',
        displayName: 'Alex Creator',
        bio: 'Full-stack builder & tech creator. Welcome to my LynxHub link-in-bio page!',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=demouser',
        theme: 'vibrant-gradient',
        socialLinks: [
          { id: '1', platform: 'github', label: 'GitHub Projects', url: 'https://github.com', order: 0, isActive: true },
          { id: '2', platform: 'twitter', label: 'X / Twitter', url: 'https://x.com', order: 1, isActive: true },
          { id: '3', platform: 'youtube', label: 'Tech Tutorials', url: 'https://youtube.com', order: 2, isActive: true },
        ],
      });

      await ShortLink.create({
        userId: user._id,
        shortCode: 'welcome',
        destinationUrl: 'https://github.com',
        title: 'Welcome to LynxHub',
        isCustomSlug: true,
        clickCount: 14,
      });

      console.log('✨ [Database] Default demo account seeded: demo@lynxhub.com / Password123!');
    }
  } catch (err) {
    console.warn('⚠️ [Database] Demo seed note:', err);
  }
}

async function startServer() {
  try {
    await connectDB();
    await seedDemoUser();

    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀 [LynxHub Server] Running on http://localhost:${env.PORT}`);
      console.log(`📡 [LynxHub Server] Environment: ${env.NODE_ENV}`);
      console.log(`🔗 [LynxHub Server] Client URL: ${env.CLIENT_URL}\n`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 [LynxHub Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });

      // Force shutdown after 10s if graceful fails
      setTimeout(() => {
        console.error('⚠️ [LynxHub Server] Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('💥 [LynxHub Server] Fatal startup error:', error);
    process.exit(1);
  }
}

startServer();
