import { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, TextChannel, PermissionFlagsBits } from 'discord.js';
import { isStaffMember } from '../utils/permissions';
import { createGiveawayRequestEmbed } from '../utils/embeds';
import { storage } from '../../storage';

export const requestGiveawayCommand = {
  data: new SlashCommandBuilder()
    .setName('requestgw')
    .setDescription('Request a mutual giveaway with another server')
    .addStringOption(option => 
      option.setName('server-name')
        .setDescription('The name of the server for the mutual giveaway')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('server-invite')
        .setDescription('Permanent invite to the server')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('member-count')
        .setDescription('Member count of the server')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('our-ping')
        .setDescription('The ping to use in our server')
        .addChoices(
          { name: 'everyone', value: '@everyone' },
          { name: 'here', value: '@here' },
          { name: 'Mutual Giveaways', value: '@Mutual Giveaways' },
          { name: 'No Ping', value: 'No Ping' },
        )
        .setRequired(true))
    .addStringOption(option => 
      option.setName('their-ping')
        .setDescription('The ping they will use in their server')
        .addChoices(
          { name: 'everyone', value: '@everyone' },
          { name: 'here', value: '@here' },
          { name: 'Other', value: 'Other' },
          { name: 'No Ping', value: 'No Ping' },
        )
        .setRequired(true))
    .addStringOption(option => 
      option.setName('prize')
        .setDescription('The prize they are offering')
        .setRequired(true)),
  
  async execute(interaction: ChatInputCommandInteraction, client: Client) {
    // Check if user has permission to use this command (staff member)
    if (!isStaffMember(interaction.member)) {
      await interaction.reply({ 
        content: 'You do not have permission to use this command. Only staff members can request giveaways.',
        ephemeral: true 
      });
      return;
    }
    
    // Check if command is used in the staff server
    const managementChannelId = process.env.MANAGEMENT_CHANNEL_ID;
    if (!managementChannelId) {
      await interaction.reply({
        content: 'Configuration error: MANAGEMENT_CHANNEL_ID not set in environment variables.',
        ephemeral: true
      });
      return;
    }
    
    // Get all command options
    const serverName = interaction.options.getString('server-name', true);
    const serverInvite = interaction.options.getString('server-invite', true);
    const memberCount = interaction.options.getInteger('member-count', true);
    const ourPing = interaction.options.getString('our-ping', true);
    const theirPing = interaction.options.getString('their-ping', true);
    const prize = interaction.options.getString('prize', true);
    
    try {
      // Create the giveaway request in storage
      const giveawayRequest = await storage.createGiveawayRequest({
        requesterUserId: interaction.user.id,
        requesterUsername: interaction.user.username,
        serverName,
        serverInvite,
        memberCount,
        ourPing,
        theirPing,
        prize,
        requestedAt: new Date(),
        status: 'pending'
      });
      
      // Send embed to management channel for approval
      const managementChannel = await client.channels.fetch(managementChannelId) as TextChannel;
      
      if (!managementChannel) {
        await interaction.reply({
          content: 'Error: Could not find the management channel.',
          ephemeral: true
        });
        return;
      }
      
      const embed = createGiveawayRequestEmbed(
        interaction.user, 
        serverName, 
        serverInvite, 
        memberCount, 
        ourPing, 
        theirPing, 
        prize
      );
      
      // Send the embed to the management channel without buttons (as requested)
      await managementChannel.send({
        embeds: [embed]
      });
      
      // Reply to the user that their request has been submitted
      await interaction.reply({
        content: `Your giveaway request for ${serverName} has been submitted for approval.`,
        ephemeral: true
      });
      
    } catch (error) {
      console.error('Error creating giveaway request:', error);
      await interaction.reply({
        content: 'There was an error processing your request. Please try again later.',
        ephemeral: true
      });
    }
  }
};
