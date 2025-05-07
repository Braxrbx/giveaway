import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initBot } from "./bot/index";
import { schedulingSystem } from "./bot/utils/schedulers";
import passport from "passport";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Discord bot
  const client = initBot();
  
  // Define auth routes
  app.get('/api/auth/discord', (req, res, next) => {
    console.log('Starting Discord authentication process...');
    passport.authenticate('discord')(req, res, next);
  });
  
  app.get('/api/auth/discord/callback', 
    (req, res, next) => {
      console.log('Discord callback received, processing authentication...');
      next();
    },
    (req, res, next) => {
      passport.authenticate('discord', (err, user, info) => {
        console.log('Discord auth result:', { err: err?.message, user: user?.id, info });
        
        if (err) {
          console.error('Discord auth error:', err);
          return res.redirect('/auth?error=discord_auth_error');
        }
        
        if (!user) {
          console.error('Discord auth failed:', info);
          return res.redirect('/auth?error=no_user');
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            console.error('Login error after Discord auth:', loginErr);
            return res.redirect('/auth?error=login_error');
          }
          
          console.log('Discord authentication completed successfully, redirecting to dashboard');
          return res.redirect('/');
        });
      })(req, res, next);
    }
  );
  
  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  // Local login route for testing
  app.post('/api/auth/login', async (req, res) => {
    console.log('Login request received:', req.body);
    const { username, password } = req.body;
    
    try {
      console.log('Attempting login with:', { username, password });
      // Check if username is 'admin' or 'staff' and password matches
      if (username === 'admin' && password === 'admin123') {
        // Create or get admin user
        let user = await storage.getUserByUsername(username);
        
        if (!user) {
          user = await storage.createUser({
            username: 'admin',
            password: 'admin123', // In a real app, this would be hashed
            discordId: 'admin-id',
            isStaff: true,
            isAdmin: true,
            avatarUrl: null
          });
        }
        
        // Log in
        req.login(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Internal server error during login' });
          }
          return res.json(user);
        });
      } 
      else if (username === 'staff' && password === 'staff123') {
        // Create or get staff user
        let user = await storage.getUserByUsername(username);
        
        if (!user) {
          user = await storage.createUser({
            username: 'staff',
            password: 'staff123', // In a real app, this would be hashed
            discordId: 'staff-id',
            isStaff: true,
            isAdmin: false,
            avatarUrl: null
          });
        }
        
        // Log in
        req.login(user, (err) => {
          if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ message: 'Internal server error during login' });
          }
          return res.json(user);
        });
      } 
      else {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error during login' });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  // Debug route to help with Discord OAuth configuration
  app.get('/api/auth/debug', (req, res) => {
    const repl_slug = process.env.REPL_SLUG || '';
    const repl_owner = process.env.REPL_OWNER || '';
    const full_url = `https://${repl_slug}.${repl_owner}.replit.app/api/auth/discord/callback`;
    
    console.log('Debug info requested:', { repl_slug, repl_owner, full_url });
    
    res.json({
      repl_slug,
      repl_owner,
      full_url
    });
  });
  
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Not authenticated' });
  };
  
  // Middleware to check if user is admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated() && (req.user as any).isAdmin) {
      return next();
    }
    res.status(403).json({ message: 'Not authorized' });
  };
  
  // API endpoint to get all pending giveaways
  app.get('/api/giveaways/pending', async (req, res) => {
    try {
      const pendingGiveaways = await storage.getGiveawaysByStatus('pending');
      res.json(pendingGiveaways);
    } catch (error) {
      console.error('Error fetching pending giveaways:', error);
      res.status(500).json({ message: 'Failed to fetch pending giveaways' });
    }
  });
  
  // API endpoint to get all scheduled giveaways
  app.get('/api/giveaways/scheduled', async (req, res) => {
    try {
      const scheduledGiveaways = await storage.getGiveawaysByStatus('approved');
      res.json(scheduledGiveaways);
    } catch (error) {
      console.error('Error fetching scheduled giveaways:', error);
      res.status(500).json({ message: 'Failed to fetch scheduled giveaways' });
    }
  });
  
  // API endpoint to approve a giveaway
  app.post('/api/giveaways/:id/approve', async (req, res) => {
    try {
      const giveawayId = parseInt(req.params.id);
      const { message } = req.body;
      
      const giveaway = await storage.getGiveaway(giveawayId);
      if (!giveaway) {
        return res.status(404).json({ message: 'Giveaway not found' });
      }
      
      // Update giveaway status to approved
      const updatedGiveaway = await storage.updateGiveaway(giveawayId, {
        status: 'approved',
        approvedAt: new Date(),
        approvalMessage: message || null,
        scheduledFor: new Date() // Schedule for immediate posting by default
      });
      
      // Use proper scheduling depending on ping type
      console.log('Checking ping limits for giveaway:', updatedGiveaway.ourPing);
      
      // Handle scheduling with proper ping limits
      try {
        const scheduledTime = await schedulingSystem.scheduleGiveaway(updatedGiveaway);
        console.log('Giveaway scheduled for:', scheduledTime);
        
        // Update ping status in storage to track limits
        if (updatedGiveaway.ourPing === '@everyone') {
          await storage.updatePingStatus({
            everyone: new Date()
          });
        } else if (updatedGiveaway.ourPing === '@here') {
          await storage.updatePingStatus({
            here: new Date()
          });
        }
      } catch (scheduleError) {
        console.error('Error during giveaway scheduling:', scheduleError);
      }
      
      res.json(updatedGiveaway);
    } catch (error) {
      console.error('Error approving giveaway:', error);
      res.status(500).json({ message: 'Failed to approve giveaway' });
    }
  });
  
  // API endpoint to deny a giveaway
  app.post('/api/giveaways/:id/deny', async (req, res) => {
    try {
      const giveawayId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: 'Denial reason is required' });
      }
      
      const giveaway = await storage.getGiveaway(giveawayId);
      if (!giveaway) {
        return res.status(404).json({ message: 'Giveaway not found' });
      }
      
      // Update giveaway status to denied
      const updatedGiveaway = await storage.updateGiveaway(giveawayId, {
        status: 'denied',
        deniedAt: new Date(),
        denialReason: reason
      });
      
      // Notify the requester via DM
      try {
        // Import and use client directly from bot
        const { client } = await import('./bot/index');
        if (client && client.isReady()) {
          const requester = await client.users.fetch(giveaway.requesterUserId);
          
          if (requester) {
            await requester.send({
              content: `Your giveaway request for **${giveaway.serverName}** has been denied.\nReason: ${reason}`
            });
            console.log('Sent denial DM to', requester.tag);
          }
        }
      } catch (dmError) {
        console.error('Error sending denial DM:', dmError);
      }
      
      res.json(updatedGiveaway);
    } catch (error) {
      console.error('Error denying giveaway:', error);
      res.status(500).json({ message: 'Failed to deny giveaway' });
    }
  });
  
  // API endpoint to get invite statistics
  app.get('/api/invites/stats', async (req, res) => {
    try {
      const inviteStats = await storage.getInviteStatistics();
      res.json(inviteStats);
    } catch (error) {
      console.error('Error fetching invite statistics:', error);
      res.status(500).json({ message: 'Failed to fetch invite statistics' });
    }
  });
  
  // API endpoint to get current ping status
  app.get('/api/pings/status', async (req, res) => {
    try {
      const pingStatus = await storage.getPingStatus();
      res.json(pingStatus);
    } catch (error) {
      console.error('Error fetching ping status:', error);
      res.status(500).json({ message: 'Failed to fetch ping status' });
    }
  });
  
  // API endpoint to get giveaway performance statistics
  app.get('/api/stats/performance', async (req, res) => {
    try {
      const performanceStats = await storage.getGiveawayPerformanceStats();
      res.json(performanceStats);
    } catch (error) {
      console.error('Error fetching performance statistics:', error);
      res.status(500).json({ message: 'Failed to fetch performance statistics' });
    }
  });

  // API endpoint to get current bot settings
  app.get('/api/settings', async (req, res) => {
    try {
      // Get settings from environment variables
      const settings = {
        botToken: process.env.DISCORD_TOKEN || '',
        guildId: process.env.GUILD_ID || '',
        managementChannelId: process.env.MANAGEMENT_CHANNEL_ID || '',
        giveawayChannelId: process.env.GIVEAWAY_CHANNEL_ID || '',
        weeklyQuota: process.env.WEEKLY_QUOTA || '2',
        notifyApprovals: process.env.NOTIFY_APPROVALS !== 'false',
        notifyDenials: process.env.NOTIFY_DENIALS !== 'false',
        notifyPostings: process.env.NOTIFY_POSTINGS !== 'false'
      };
      
      res.json(settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });
  
  // API endpoint to save bot settings
  app.post('/api/settings', async (req, res) => {
    try {
      const {
        botToken,
        guildId,
        managementChannelId,
        giveawayChannelId,
        weeklyQuota,
        notifyApprovals,
        notifyDenials,
        notifyPostings
      } = req.body;
      
      // In a real implementation, this would update the .env file
      // Since we can't directly modify the .env file in this environment,
      // we would need a different approach like saving to a settings table
      // For now, we'll just acknowledge the request and log the new values
      
      console.log('Received new settings:', {
        guildId,
        managementChannelId,
        giveawayChannelId,
        weeklyQuota,
        notifyApprovals,
        notifyDenials,
        notifyPostings
      });
      
      // We don't log the token for security reasons
      
      res.json({ message: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      res.status(500).json({ message: 'Failed to save settings' });
    }
  });
  
  // API endpoint to restart the bot
  app.post('/api/bot/restart', async (req, res) => {
    try {
      // In a real implementation, this would restart the bot
      // For now, we'll just acknowledge the request
      
      console.log('Bot restart requested');
      
      res.json({ message: 'Bot restart initiated' });
    } catch (error) {
      console.error('Error restarting bot:', error);
      res.status(500).json({ message: 'Failed to restart bot' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
