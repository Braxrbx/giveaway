import { GuildMember, PermissionFlagsBits } from 'discord.js';

/**
 * Checks if a member is a staff member based on permissions or roles
 * 
 * @param member The guild member to check
 * @returns boolean indicating if the member is a staff member
 */
export function isStaffMember(member: GuildMember | null): boolean {
  if (!member) return false;
  
  // Check if member has administrator permissions
  if (member.permissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }
  
  // Check if member has manage server permissions
  if (member.permissions.has(PermissionFlagsBits.ManageGuild)) {
    return true;
  }
  
  // Check for specific staff/marketing roles
  // You can customize this based on your server's role structure
  const staffRoleNames = ['Staff', 'Marketing', 'Admin', 'Moderator'];
  return member.roles.cache.some(role => 
    staffRoleNames.includes(role.name) || 
    role.name.toLowerCase().includes('staff') ||
    role.name.toLowerCase().includes('marketing')
  );
}

/**
 * Checks if a member has giveaway approval permissions
 * 
 * @param member The guild member to check
 * @returns boolean indicating if the member can approve giveaways
 */
export function canApproveGiveaways(member: GuildMember | null): boolean {
  if (!member) return false;
  
  // Must be a staff member first
  if (!isStaffMember(member)) {
    return false;
  }
  
  // Additional checks for approval permissions
  // You can customize this based on your requirements
  return true;
}
