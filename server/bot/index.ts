import { Client, Events, GatewayIntentBits, Collection, REST, Routes, GuildMember } from 'discord.js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Import commands
import { requestGiveawayCommand } from './commands/requestgw';
import { checkInvitesCommand } from './commands/checkinvites';
import { runStaffReportsCommand } from './commands/runstaffreports';
import { schedulingSystem } from './utils/schedulers';
import { staffReportSystem } from './utils/staffReports';
import { canApproveGiveaways } from './utils/permissions';
import { storage } from '../storage';

// Extend Discord.js types
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, any>;
    inviteUses: Map<string, number>;
  }
}

// Load environment variables
dotenv.config();

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
  ],
});

// Create commands collection
client.commands = new Collection();

// Add commands to collection
client.commands.set(requestGiveawayCommand.data.name, requestGiveawayCommand);
client.commands.set(checkInvitesCommand.data.name, checkInvitesCommand);
client.commands.set(runStaffReportsCommand.data.name, runStaffReportsCommand);

// Command registration
async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = client.user?.id;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    console.error('Missing required environment variables for command registration');
    return;
  }

  const commands = [
    requestGiveawayCommand.data.toJSON(),
    checkInvitesCommand.data.toJSON(),
    runStaffReportsCommand.data.toJSON(),
  ];

  try {
    const rest = new REST({ version: '10' }).setToken(token);
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing commands:', error);
  }
}

// Event listeners
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Discord Bot Ready! Logged in as ${readyClient.user.tag}`);
  
  // Debug guild and channel access
  console.log('Bot is in the following guilds:');
  readyClient.guilds.cache.forEach(guild => {
    console.log(`- ${guild.name} (ID: ${guild.id})`);
    
    // Log channel information
    console.log('  Available channels:');
    guild.channels.cache.forEach(channel => {
      // Check if it's a channel with a name property (not all channel types have names)
      if ('name' in channel) {
        console.log(`  - ${channel.name} (ID: ${channel.id}, Type: ${channel.type})`);
      } else {
        console.log(`  - Channel without name (ID: ${channel.id}, Type: ${channel.type})`);
      }
    });
  });
  
  // Check if the designated channel exists
  const giveawayChannelId = process.env.GIVEAWAY_CHANNEL_ID;
  if (giveawayChannelId) {
    try {
      const channel = await readyClient.channels.fetch(giveawayChannelId);
      console.log(`Giveaway channel check: ${channel ? 'Found' : 'Not found'}`);
      if (channel) {
        // Check if it's a text channel with name property
        if ('name' in channel) {
          console.log(`Channel name: ${channel.name}, Type: ${channel.type}`);
        } else {
          console.log(`Channel found but is not a text channel, Type: ${channel.type}`);
        }
      }
    } catch (error) {
      console.error('Error fetching giveaway channel:', error);
    }
  }
  
  // Register commands
  await registerCommands();
  
  // Initialize scheduling system
  schedulingSystem.initialize(client);
  
  // Initialize staff reporting system (for weekly quota checks and invite reports)
  staffReportSystem.initialize(client);
  
  // Initialize invite cache for tracking
  client.guilds.cache.forEach(guild => {
    guild.invites.fetch().then(invites => {
      const codeUses = new Map();
      invites.each(invite => {
        codeUses.set(invite.code, invite.uses);
      });
      client.inviteUses = codeUses;
    });
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  // Handle command interactions
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error: any) {
      // Check for interaction timeout errors (which are normal in Discord API)
      if (error.code === 10062) {
        console.log(`Interaction timeout for command ${interaction.commandName} - this is normal and can be safely ignored`);
        return;
      }
      
      console.error(`Error executing command ${interaction.commandName}:`, error);
      
      try {
        const errorMessage = {
          content: 'There was an error while executing this command!',
          ephemeral: true
        };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage).catch((e: any) => {
            console.log('Could not send error followUp:', e.message);
          });
        } else {
          await interaction.reply(errorMessage).catch((e: any) => {
            console.log('Could not send error reply:', e.message);
          });
        }
      } catch (replyError: any) {
        console.log('Failed to send error response:', replyError.message);
      }
    }
  }
  
  // Button interactions have been removed as requested
  // All approvals and denials will now be handled through the web dashboard
});

// Invite tracking
client.on(Events.InviteCreate, async (invite) => {
  // Add new invite to cache
  client.inviteUses.set(invite.code, invite.uses || 0);
});

// Handle invite usages
client.on(Events.GuildMemberAdd, async (member) => {
  // Update invite tracking
  try {
    const guild = member.guild;
    const newInvites = await guild.invites.fetch();
    
    // Compare the new invite counts with the cached ones
    // Using a regular for loop instead of forEach to allow await
    for (const invite of newInvites.values()) {
      const oldUses = client.inviteUses.get(invite.code) || 0;
      const currentUses = invite.uses || 0;
      
      if (currentUses > oldUses) {
        // This invite was used to join
        console.log(`Member ${member.user.tag} joined using invite code ${invite.code} from ${invite.inviter?.tag}`);
        
        // Update the cache
        client.inviteUses.set(invite.code, currentUses);
        
        // Update database with invite information
        if (invite.inviter) {
          try {
            // Check if this invite already exists in the database
            const invites = await storage.getInvitesByCode(invite.code);
            
            if (invites.length > 0) {
              // Invite exists, update its use count
              const existingInvite = invites[0];
              await storage.updateInvite(existingInvite.id, {
                uses: currentUses,
                lastUpdated: new Date()
              });
              console.log(`Updated invite ${invite.code} in database, new use count: ${currentUses}`);
            } else {
              // Invite doesn't exist, create a new record
              await storage.createInvite({
                inviteCode: invite.code,
                serverName: guild.name,
                staffUserId: invite.inviter.id,
                staffUsername: invite.inviter.tag,
                giveawayId: 0, // Not associated with a specific giveaway
                uses: currentUses,
                createdAt: new Date(),
                lastUpdated: new Date()
              });
              console.log(`Added new invite ${invite.code} to database with use count: ${currentUses}`);
            }
          } catch (error) {
            console.error('Error updating invite in database:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error tracking invite usage:', error);
  }
});

// Initialize and export the client
export function initBot() {
  // Set up global error handler for Discord.js
  client.on('error', (error: any) => {
    // Check if it's a timeout or interaction error
    if (error.code === 10062) {
      console.log('Discord interaction timeout (safe to ignore):', error.message);
    } else {
      console.error('Discord client error:', error);
    }
  });

  // Log in to Discord with your client's token
  client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Error logging in to Discord:', err);
  });
  
  return client;
}

export { client };
