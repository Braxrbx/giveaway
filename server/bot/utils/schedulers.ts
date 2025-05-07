import { Client, TextChannel, EmbedBuilder, ChannelType } from 'discord.js';
import * as nodeSchedule from 'node-schedule';
import { storage } from '../../storage';
import { createGiveawayEmbed } from './embeds';

interface PingLimits {
  everyone: Date | null;
  here: Date | null;
}

class SchedulingSystem {
  private client: Client | null = null;
  private scheduledTasks: Map<number, nodeSchedule.Job> = new Map();

  public initialize(client: Client) {
    this.client = client;
    this.loadScheduledGiveaways();
    
    // Schedule daily reset of ping limits (no longer needed as we use the database)
    // But we can still ensure the database has the correct structure
    this.initializePingStatusTracking();
  }
  
  private async initializePingStatusTracking() {
    try {
      // Make sure we have a ping status record in the database
      await storage.getPingStatus();
      console.log('Ping status tracking initialized');
    } catch (error) {
      console.error('Error initializing ping status tracking:', error);
    }
  }
  
  private async loadScheduledGiveaways() {
    if (!this.client) {
      console.error('Client not initialized');
      return;
    }
    
    try {
      // Load all approved but not posted giveaways
      const pendingGiveaways = await storage.getGiveawaysByStatus('approved');
      console.log('Loaded scheduled giveaways:', pendingGiveaways.length);
      
      for (const giveaway of pendingGiveaways) {
        if (!giveaway.scheduledFor) continue;
        
        // Check if it's scheduled for the future
        if (new Date(giveaway.scheduledFor) > new Date()) {
          this.scheduleGiveaway(giveaway);
        }
      }
    } catch (error) {
      console.error('Error loading scheduled giveaways:', error);
    }
  }
  
  public async scheduleGiveaway(giveaway: any) {
    if (!this.client) {
      console.error('Client not initialized');
      return null;
    }
    
    try {
      console.log(`Scheduling giveaway ID ${giveaway.id} with ping type: ${giveaway.ourPing}`);
      
      // Get current ping status from database
      const pingStatus = await storage.getPingStatus();
      console.log('Current ping status:', pingStatus);
      
      // Determine when the giveaway should be posted based on ping limits
      let scheduledTime: Date;
      
      if (giveaway.ourPing === '@everyone') {
        if (pingStatus?.everyone) {
          console.log('Found previous @everyone ping at:', pingStatus.everyone);
          // Schedule for 24 hours after the last @everyone ping
          scheduledTime = new Date(pingStatus.everyone);
          scheduledTime.setHours(scheduledTime.getHours() + 24);
          console.log('Scheduling @everyone ping for:', scheduledTime);
        } else {
          // Can post immediately
          scheduledTime = new Date();
          console.log('No previous @everyone ping, can post immediately');
        }
      } else if (giveaway.ourPing === '@here') {
        if (pingStatus?.here) {
          console.log('Found previous @here ping at:', pingStatus.here);
          // Schedule for 24 hours after the last @here ping
          scheduledTime = new Date(pingStatus.here);
          scheduledTime.setHours(scheduledTime.getHours() + 24);
          console.log('Scheduling @here ping for:', scheduledTime);
        } else if (pingStatus?.everyone) {
          // Check if we've already used an @everyone today
          const everyoneTime = new Date(pingStatus.everyone);
          const now = new Date();
          const hoursSinceEveryone = (now.getTime() - everyoneTime.getTime()) / (1000 * 60 * 60);
          
          console.log('Hours since @everyone ping:', hoursSinceEveryone);
          
          if (hoursSinceEveryone < 24) {
            // We can use one more @here in the same day
            scheduledTime = now;
            console.log('@everyone was used but <24 hours ago, can use @here now');
          } else {
            // Schedule for 24 hours after the last @everyone ping
            scheduledTime = new Date(pingStatus.everyone);
            scheduledTime.setHours(scheduledTime.getHours() + 24);
            console.log('@everyone was >24 hours ago, scheduling @here for tomorrow');
          }
        } else {
          // Can post immediately
          scheduledTime = new Date();
          console.log('No previous pings, can post @here immediately');
        }
      } else {
        // For @Mutual Giveaways or No Ping, can schedule immediately
        scheduledTime = new Date();
        console.log('Non-ping mention, can post immediately');
      }
      
      // Add a small buffer to avoid race conditions (1 minute minimum)
      const now = new Date();
      if (scheduledTime.getTime() - now.getTime() < 60000) {
        scheduledTime = new Date(now.getTime() + 60000);
        console.log('Adding a 1-minute buffer to scheduled time');
      }
      
      // Update the giveaway in storage with the scheduled time
      const updatedGiveaway = await storage.updateGiveaway(giveaway.id, {
        scheduledFor: scheduledTime
      });
      console.log(`Updated giveaway ${updatedGiveaway.id} with scheduled time:`, scheduledTime);
      
      // Schedule the job
      const task = nodeSchedule.scheduleJob(scheduledTime, () => {
        this.postGiveaway(updatedGiveaway);
      });
      
      // Store the scheduled task
      this.scheduledTasks.set(updatedGiveaway.id, task);
      console.log(`Scheduled task for giveaway ${updatedGiveaway.id} at:`, scheduledTime);
      
      // Notify staff of scheduled time
      this.notifyStaffOfSchedule(updatedGiveaway, scheduledTime);
      
      return scheduledTime;
    } catch (error) {
      console.error('Error scheduling giveaway:', error);
      return null;
    }
  }
  
  private async postGiveaway(giveaway: any) {
    if (!this.client) {
      console.error('Client not initialized');
      return;
    }
    
    try {
      const giveawayChannelId = process.env.GIVEAWAY_CHANNEL_ID;
      console.log('Attempting to post giveaway to channel:', giveawayChannelId);
      
      if (!giveawayChannelId) {
        console.error('Giveaway channel ID not set');
        return;
      }
      
      console.log('Fetching channel...');
      
      const giveawayChannel = await this.client.channels.fetch(giveawayChannelId) as TextChannel;
      console.log('Channel fetch result:', giveawayChannel ? 'Found channel' : 'Channel not found');
      
      if (!giveawayChannel) {
        console.error(`Could not find giveaway channel with ID ${giveawayChannelId}`);
        return;
      }
      
      // Check if it's a text channel by checking its type
      if (giveawayChannel.type !== ChannelType.GuildText) {
        console.error(`Channel with ID ${giveawayChannelId} is not a text channel (type: ${giveawayChannel.type})`);
        return;
      }
    
      // Create the giveaway embed
      const embed = createGiveawayEmbed(
        giveaway.serverName,
        giveaway.serverInvite,
        giveaway.prize
      );
      
      // Determine the ping to use
      let pingContent = '';
      if (giveaway.ourPing === '@everyone') {
        pingContent = '@everyone';
        // Update the ping status in the database when using @everyone
        await storage.updatePingStatus({ everyone: new Date() });
        console.log('Updated @everyone timestamp in database');
      } else if (giveaway.ourPing === '@here') {
        pingContent = '@here';
        // Update the ping status in the database when using @here
        await storage.updatePingStatus({ here: new Date() });
        console.log('Updated @here timestamp in database');
      } else if (giveaway.ourPing === '@Mutual Giveaways') {
        const roleId = process.env.MUTUAL_GIVEAWAYS_ROLE_ID;
        if (roleId && roleId.trim() !== '') {
          pingContent = `<@&${roleId}>`;
        } else {
          console.log('No MUTUAL_GIVEAWAYS_ROLE_ID found or it is empty, skipping role ping');
        }
      } else if (giveaway.ourPing && giveaway.ourPing.trim() !== '') {
        // For any other custom ping text, use it as is without modification
        pingContent = giveaway.ourPing;
      }
      
      console.log('Sending giveaway message with ping:', pingContent);
      
      // Send the giveaway
      console.log('Attempting to send message to channel:', giveawayChannel.id);
      console.log('Message content:', pingContent);
      
      // Check if client user exists before checking permissions
      if (this.client.user) {
        // Get channel permissions for the bot
        const permissions = giveawayChannel.permissionsFor(this.client.user);
        console.log('Channel permissions:', permissions ? 'Permissions available' : 'No permissions available');
        
        // Check if the bot has permission to send messages
        console.log('Can send messages:', permissions?.has('SendMessages'));
        console.log('Can mention everyone:', permissions?.has('MentionEveryone'));
      } else {
        console.log('Client user is null, cannot check permissions');
      }
      
      try {
        let messageOptions;
        if (pingContent && pingContent.trim() !== '') {
          messageOptions = {
            content: pingContent,
            embeds: [embed]
          };
        } else {
          // Don't include content field if there's no ping
          messageOptions = {
            embeds: [embed]
          };
        }
        
        const sentMessage = await giveawayChannel.send(messageOptions);
        console.log('Message sent successfully, ID:', sentMessage.id);
      } catch (messageError) {
        console.error('Error sending message to channel:', messageError);
        // Try sending without mentions as a fallback
        try {
          console.log('Trying to send without mentions as a fallback');
          const sentMessage = await giveawayChannel.send({
            content: 'Giveaway announcement (mention failed):',
            embeds: [embed]
          });
          console.log('Fallback message sent successfully, ID:', sentMessage.id);
        } catch (fallbackError) {
          console.error('Even fallback message failed:', fallbackError);
          throw fallbackError; // Re-throw to be caught by the outer try-catch
        }
      }
      
      console.log('Giveaway sent successfully');
      
      // Update giveaway status in storage
      await storage.updateGiveaway(giveaway.id, {
        status: 'posted',
        postedAt: new Date()
      });
      
      // Clear the scheduled task
      this.scheduledTasks.delete(giveaway.id);
      
      // Notify the staff member that their giveaway has been posted
      this.notifyStaffOfPosting(giveaway);
    } catch (error) {
      console.error('Error posting giveaway:', error);
    }
  }
  
  private async notifyStaffOfSchedule(giveaway: any, scheduledTime: Date) {
    if (!this.client) return;
    
    try {
      const requester = await this.client.users.fetch(giveaway.requesterUserId);
      
      if (requester) {
        // Determine if it's immediate or scheduled
        const now = new Date();
        const isImmediate = scheduledTime.getTime() - now.getTime() < 60000; // Less than 1 minute
        
        if (isImmediate) {
          await requester.send({
            content: `Your giveaway request for **${giveaway.serverName}** has been approved and will be posted immediately!`
          });
        } else {
          // Format the timestamp for Discord
          const timestamp = Math.floor(scheduledTime.getTime() / 1000);
          
          await requester.send({
            content: `Your giveaway request for **${giveaway.serverName}** has been approved and will be posted <t:${timestamp}:F> (<t:${timestamp}:R>)`
          });
        }
      }
    } catch (error) {
      console.error('Error notifying staff of schedule:', error);
    }
  }
  
  private async notifyStaffOfPosting(giveaway: any) {
    if (!this.client) return;
    
    try {
      const requester = await this.client.users.fetch(giveaway.requesterUserId);
      
      if (requester) {
        await requester.send({
          content: `Your giveaway for **${giveaway.serverName}** has been posted in the mutual giveaways channel!`
        });
      }
    } catch (error) {
      console.error('Error notifying staff of posting:', error);
    }
  }
  
  public async cancelScheduledGiveaway(giveawayId: number) {
    const task = this.scheduledTasks.get(giveawayId);
    if (task) {
      task.cancel();
      this.scheduledTasks.delete(giveawayId);
      
      // Update giveaway in storage
      await storage.updateGiveaway(giveawayId, {
        status: 'cancelled',
        scheduledFor: null
      });
      
      return true;
    }
    return false;
  }
}

export const schedulingSystem = new SchedulingSystem();
