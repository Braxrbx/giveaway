import { TextChannel } from 'discord.js';
import { Client } from 'discord.js';
import nodeSchedule from 'node-schedule';
import { storage } from '../../storage';
import { EmbedBuilder } from 'discord.js';

// Configuration
const STAFF_REPORT_CHANNEL_ID = process.env.STAFF_REPORT_CHANNEL_ID || '1369640932286402735'; // Default to general channel for testing
const QUOTA_MINIMUM = 2; // Minimum 2 giveaway requests per week
const INVITE_PAY_RATE = 10; // 10 Robux per invite

class StaffReportSystem {
  private client: Client | null = null;
  private weeklyReportJob: nodeSchedule.Job | null = null;
  
  /**
   * Initialize the staff reporting system
   * @param client Discord.js client instance
   */
  public initialize(client: Client) {
    this.client = client;
    this.scheduleWeeklyReports();
    console.log('Staff reporting system initialized');
  }
  
  /**
   * Schedule the weekly reports to run every Sunday at 12 PM AEST
   */
  private scheduleWeeklyReports() {
    // Schedule for Sunday at 12 PM AEST (2 AM UTC)
    // '0 2 * * 0' - At 2:00 AM UTC, only on Sunday
    this.weeklyReportJob = nodeSchedule.scheduleJob('0 2 * * 0', async () => {
      console.log('Running weekly staff reports');
      
      if (!this.client || !this.client.isReady()) {
        console.error('Discord client not ready when attempting to run weekly staff reports');
        return;
      }
      
      // Generate and send both reports
      await this.sendWeeklyInviteReport();
      await this.checkQuotaAndNotify();
      
      // Reset invite tracking data after reports are generated
      await this.clearInviteTrackingData();
    });
    
    console.log('Weekly staff reports scheduled for Sunday at 12 PM AEST');
  }

  /**
   * Get the reporting channel
   * @returns The Discord text channel for staff reports
   */
  private async getReportChannel(): Promise<TextChannel | null> {
    if (!this.client || !this.client.isReady()) {
      console.error('Discord client not ready when getting report channel');
      return null;
    }
    
    try {
      // Fetch the channel for reports
      const channel = await this.client.channels.fetch(STAFF_REPORT_CHANNEL_ID);
      
      if (!channel || !(channel instanceof TextChannel)) {
        console.error(`Staff report channel ${STAFF_REPORT_CHANNEL_ID} not found or not a text channel`);
        return null;
      }
      
      return channel;
    } catch (error) {
      console.error('Error fetching staff report channel:', error);
      return null;
    }
  }
  
  /**
   * Generate and send the weekly invite report
   */
  public async sendWeeklyInviteReport() {
    try {
      const channel = await this.getReportChannel();
      if (!channel) return;
      
      // Get the invite statistics for the past week
      const inviteStats = await storage.getInviteStatistics();
      
      // Format the report
      let report = '# Weekly Staff Invite Report\n';
      report += `**Period**: ${new Date(inviteStats.weekStartDate).toLocaleDateString()} - ${new Date().toLocaleDateString()}\n\n`;
      
      if (!inviteStats.userStats || inviteStats.userStats.length === 0) {
        report += 'No invites tracked for this week.\n';
      } else {
        // Sort users by total invites in descending order
        const sortedUsers = [...inviteStats.userStats].sort((a, b) => b.totalUses - a.totalUses);
        
        for (const user of sortedUsers) {
          // Calculate pay based on invites
          const pay = user.totalUses * INVITE_PAY_RATE;
          report += `<@${user.userId}> - ${user.totalUses} Invites - ${pay} Robux\n`;
        }
      }
      
      report += `\n**Total Invites**: ${inviteStats.totalInvites || 0}\n`;
      report += `**Total Robux Paid**: ${(inviteStats.totalInvites || 0) * INVITE_PAY_RATE}\n`;
      
      // Send the report
      await channel.send({
        content: report
      });
      
      console.log('Weekly invite report sent');
    } catch (error) {
      console.error('Error sending weekly invite report:', error);
    }
  }
  
  /**
   * Check if all staff members have met their quota and notify about those who haven't
   */
  public async checkQuotaAndNotify() {
    try {
      const channel = await this.getReportChannel();
      if (!channel) return;
      
      // Get all giveaway requests from the past week
      const now = new Date();
      // Calculate last Sunday at noon AEST
      const lastSunday = new Date(now);
      lastSunday.setDate(now.getDate() - now.getDay());
      lastSunday.setHours(2, 0, 0, 0); // 12 PM AEST = 2 AM UTC
      
      // Get all staff members who have made requests in the past week
      const allStaffRequesters = await storage.getGiveawayRequestersFromWeek(lastSunday);
      
      // Get all active staff members
      const allStaffMembers = await storage.getAllStaffMembers();
      
      // Find staff who didn't meet quota
      const failedQuota = allStaffMembers.filter(staff => {
        // Check if this staff member has made at least QUOTA_MINIMUM requests
        return !allStaffRequesters.some(
          requester => requester.discordId === staff.discordId
        );
      });
      
      if (failedQuota.length > 0) {
        // Create an embed for staff who failed to meet quota
        const embed = new EmbedBuilder()
          .setTitle('Weekly Giveaway Quota Report')
          .setDescription(`The following staff members did not meet the minimum quota of ${QUOTA_MINIMUM} giveaway request(s) this week:`)
          .setColor('#ED4245') // Discord red
          .setTimestamp();
        
        // Add each staff member who failed
        failedQuota.forEach(staff => {
          embed.addFields({
            name: staff.username,
            value: `<@${staff.discordId}> - 0/${QUOTA_MINIMUM} giveaways requested`,
            inline: false
          });
        });
        
        // Send the notification
        await channel.send({ embeds: [embed] });
        console.log(`Quota notification sent for ${failedQuota.length} staff members`);
      } else {
        // Everyone met quota
        const embed = new EmbedBuilder()
          .setTitle('Weekly Giveaway Quota Report')
          .setDescription(`All staff members have met their weekly quota of ${QUOTA_MINIMUM} giveaway request(s). Great job!`)
          .setColor('#57F287') // Discord green
          .setTimestamp();
        
        await channel.send({ embeds: [embed] });
        console.log('All staff members met their quota this week');
      }
    } catch (error) {
      console.error('Error checking quotas:', error);
    }
  }
  
  /**
   * Clear invite tracking data after weekly report generation
   */
  private async clearInviteTrackingData() {
    try {
      // Call a storage method to clear invite data
      await storage.clearAllInviteTracking();
      console.log('Invite tracking data has been cleared after weekly reports');
      
      // Notify the staff report channel
      const channel = await this.getReportChannel();
      if (channel) {
        await channel.send({
          content: '**Notice:** Invite tracking data has been reset for the new week.'
        });
      }
    } catch (error) {
      console.error('Error clearing invite tracking data:', error);
    }
  }

  /**
   * Manually trigger the weekly reports (for testing purposes)
   */
  public async runWeeklyReportsManually() {
    if (!this.client || !this.client.isReady()) {
      console.error('Discord client not ready for manual report');
      return;
    }
    
    await this.sendWeeklyInviteReport();
    await this.checkQuotaAndNotify();
    
    // Also clear invite tracking data when manually running reports
    await this.clearInviteTrackingData();
  }
}

export const staffReportSystem = new StaffReportSystem();