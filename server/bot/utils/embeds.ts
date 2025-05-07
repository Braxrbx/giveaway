import { EmbedBuilder, User } from 'discord.js';

export function createGiveawayRequestEmbed(
  requester: User,
  serverName: string,
  serverInvite: string,
  memberCount: number,
  ourPing: string,
  theirPing: string,
  prize: string
) {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord Blurple
    .setTitle('New Mutual Giveaway Request')
    .setDescription(`A new mutual giveaway has been requested by <@${requester.id}>`)
    .addFields(
      { name: 'Server Name', value: serverName, inline: true },
      { name: 'Member Count', value: memberCount.toString(), inline: true },
      { name: 'Server Invite', value: serverInvite, inline: false },
      { name: 'Our Ping', value: ourPing, inline: true },
      { name: 'Their Ping', value: theirPing, inline: true },
      { name: 'Their Prize', value: prize, inline: false },
    )
    .setFooter({ text: 'Use the web dashboard to approve or deny this request' })
    .setTimestamp();
}

export function createGiveawayEmbed(
  serverName: string,
  serverInvite: string,
  prize: string
) {
  return new EmbedBuilder()
    .setColor('#5865F2') // Discord Blurple
    .setTitle('🎉 Mutual Giveaway')
    .setDescription(`Join **${serverName}** for a chance to win: **${prize}**`)
    .addFields(
      { name: 'How to Enter', value: `1. Join their server: ${serverInvite}\n2. Follow their giveaway instructions`, inline: false },
      { name: 'Server Invite', value: serverInvite, inline: false },
    )
    .setFooter({ text: 'Good luck!' })
    .setTimestamp();
}

export function createDenialEmbed(
  serverName: string,
  reason: string
) {
  return new EmbedBuilder()
    .setColor('#ED4245') // Discord Red
    .setTitle('Giveaway Request Denied')
    .setDescription(`Your giveaway request for **${serverName}** has been denied.`)
    .addFields(
      { name: 'Reason', value: reason, inline: false },
    )
    .setFooter({ text: 'If you have questions, please contact the management team.' })
    .setTimestamp();
}

export function createApprovalEmbed(
  serverName: string,
  scheduledTime: Date | null
) {
  const embed = new EmbedBuilder()
    .setColor('#57F287') // Discord Green
    .setTitle('Giveaway Request Approved')
    .setDescription(`Your giveaway request for **${serverName}** has been approved!`);
  
  if (scheduledTime) {
    // Format timestamp for Discord
    const timestamp = Math.floor(scheduledTime.getTime() / 1000);
    
    embed.addFields(
      { name: 'Scheduled Time', value: `<t:${timestamp}:F> (<t:${timestamp}:R>)`, inline: false },
    );
  } else {
    embed.addFields(
      { name: 'Status', value: 'Will be posted immediately', inline: false },
    );
  }
  
  embed.setFooter({ text: 'Thank you for organizing this giveaway!' })
    .setTimestamp();
  
  return embed;
}
