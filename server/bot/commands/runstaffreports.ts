import { SlashCommandBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import { isStaffMember } from '../utils/permissions';
import { staffReportSystem } from '../utils/staffReports';

export const runStaffReportsCommand = {
  data: new SlashCommandBuilder()
    .setName('runstaffreports')
    .setDescription('Manually trigger staff reports (Admin only)'),
  
  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    // Check if the user has permissions to run this command
    if (!isStaffMember(interaction.member)) {
      await interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true
      });
      return;
    }
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      // Manually trigger the staff reports
      await staffReportSystem.runWeeklyReportsManually();
      
      await interaction.editReply({
        content: 'Staff reports have been generated and sent to the designated channel.',
      });
    } catch (error) {
      console.error('Error running manual staff reports:', error);
      await interaction.editReply({
        content: 'There was an error running the staff reports. Check the console for details.',
      });
    }
  },
};