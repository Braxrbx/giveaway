import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } from 'discord.js';
import { isStaffMember } from '../utils/permissions';
import { storage } from '../../storage';

export const checkInvitesCommand = {
  data: new SlashCommandBuilder()
    .setName('checkinvites')
    .setDescription('Check your invite counts for all mutual giveaways'),
  
  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    // Check if user has permission to use this command (staff member)
    if (!isStaffMember(interaction.member)) {
      await interaction.reply({ 
        content: 'You do not have permission to use this command. Only staff members can check invites.',
        ephemeral: true 
      });
      return;
    }
    
    // Check if command is used in the staff server
    const isStaffServer = interaction.guildId === process.env.GUILD_ID;
    if (!isStaffServer) {
      await interaction.reply({
        content: 'This command can only be used in the staff server.',
        ephemeral: true
      });
      return;
    }
    
    try {
      // Defer the reply as this might take some time
      await interaction.deferReply({ ephemeral: true });
      
      // Get the start of the current week (Sunday)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
      startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of the day
      
      // Get all invites for this user from the past week
      const invites = await storage.getInvitesByUser(interaction.user.id, startOfWeek);
      
      if (!invites || invites.length === 0) {
        await interaction.followUp({
          content: 'You have no recorded invites for this week.',
          ephemeral: true
        });
        return;
      }
      
      // Calculate total invites
      const totalInvites = invites.reduce((total, invite) => total + invite.uses, 0);
      
      // Create an embed to display the invite information
      const embed = new EmbedBuilder()
        .setColor('#5865F2') // Discord Blurple
        .setTitle('Your Invite Tracking')
        .setDescription(`Showing invites from Sunday to current date`)
        .addFields(
          { name: 'Total Invites', value: totalInvites.toString(), inline: false },
        )
        .setFooter({ text: 'Weekly quota resets every Sunday at 00:00 AEST' })
        .setTimestamp();
      
      // Add each server's invites as a field
      const serverInvites = new Map<string, number>();
      invites.forEach(invite => {
        const current = serverInvites.get(invite.serverName) || 0;
        serverInvites.set(invite.serverName, current + invite.uses);
      });
      
      serverInvites.forEach((uses, serverName) => {
        embed.addFields({
          name: serverName,
          value: `${uses} invites`,
          inline: true
        });
      });
      
      // Send the embed as a reply
      await interaction.followUp({
        embeds: [embed],
        ephemeral: true
      });
      
    } catch (error) {
      console.error('Error checking invites:', error);
      
      if (interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error retrieving your invite information. Please try again later.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: 'There was an error retrieving your invite information. Please try again later.',
          ephemeral: true
        });
      }
    }
  }
};
