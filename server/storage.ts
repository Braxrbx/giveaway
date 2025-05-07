import { 
  users, type User, type InsertUser,
  giveawayRequests, type GiveawayRequest, type InsertGiveawayRequest,
  invites, type Invite, type InsertInvite,
  pingStatus, type PingStatus, type InsertPingStatus
} from "@shared/schema";
import { db } from './db';
import { eq, and, gte, desc } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getAllStaffMembers(): Promise<User[]>; // Get all users with isStaff = true
  
  // Giveaway Request methods
  getGiveaway(id: number): Promise<GiveawayRequest | undefined>;
  getGiveawaysByStatus(status: string): Promise<GiveawayRequest[]>;
  createGiveawayRequest(request: InsertGiveawayRequest): Promise<GiveawayRequest>;
  updateGiveaway(id: number, updates: Partial<GiveawayRequest>): Promise<GiveawayRequest>;
  getGiveawayRequestersFromWeek(since: Date): Promise<User[]>; // Get users who requested giveaways since the date
  
  // Invite methods
  getInvite(id: number): Promise<Invite | undefined>;
  getInvitesByUser(userId: string, since?: Date): Promise<Invite[]>;
  getInvitesByCode(inviteCode: string): Promise<Invite[]>;
  createInvite(invite: InsertInvite): Promise<Invite>;
  updateInvite(id: number, updates: Partial<Invite>): Promise<Invite>;
  getInviteStatistics(): Promise<any>;
  clearAllInviteTracking(): Promise<void>; // Clear all invite tracking data after weekly report
  
  // Ping Status methods
  getPingStatus(): Promise<PingStatus | undefined>;
  updatePingStatus(updates: Partial<PingStatus>): Promise<PingStatus>;
  
  // Performance Statistics methods
  getGiveawayPerformanceStats(): Promise<{
    totalGiveaways: number;
    completedGiveaways: number;
    pendingGiveaways: number;
    deniedGiveaways: number;
    averageTimeToApproval: number; // in hours
    averageServerSize: number;
    pingUsageStats: {
      everyone: number;
      here: number;
      other: number;
    };
    monthlyGiveaways: {
      month: string;
      count: number;
    }[];
    popularServers: {
      serverName: string;
      count: number;
    }[];
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private giveaways: Map<number, GiveawayRequest>;
  private inviteEntries: Map<number, Invite>;
  private pingStatusData: PingStatus | undefined;
  
  private userIdCounter: number;
  private giveawayIdCounter: number;
  private inviteIdCounter: number;
  private pingStatusIdCounter: number;

  constructor() {
    this.users = new Map();
    this.giveaways = new Map();
    this.inviteEntries = new Map();
    
    this.userIdCounter = 1;
    this.giveawayIdCounter = 1;
    this.inviteIdCounter = 1;
    this.pingStatusIdCounter = 1;
    
    // Initialize ping status
    this.pingStatusData = {
      id: this.pingStatusIdCounter++,
      everyone: null,
      here: null
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllStaffMembers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isStaff);
  }
  
  async getGiveawayRequestersFromWeek(since: Date): Promise<User[]> {
    // Get giveaway requests from the past week
    const recentGiveaways = Array.from(this.giveaways.values())
      .filter(giveaway => new Date(giveaway.requestedAt) >= since);
    
    // Extract unique requester IDs
    const requesterIds = new Set<string>();
    recentGiveaways.forEach(giveaway => {
      requesterIds.add(giveaway.requesterUserId);
    });
    
    // Find users that match these Discord IDs
    return Array.from(this.users.values())
      .filter(user => user.discordId && requesterIds.has(user.discordId));
  }
  
  // Giveaway Request methods
  async getGiveaway(id: number): Promise<GiveawayRequest | undefined> {
    return this.giveaways.get(id);
  }
  
  async getGiveawaysByStatus(status: string): Promise<GiveawayRequest[]> {
    return Array.from(this.giveaways.values()).filter(
      (giveaway) => giveaway.status === status
    );
  }
  
  async createGiveawayRequest(request: InsertGiveawayRequest): Promise<GiveawayRequest> {
    const id = this.giveawayIdCounter++;
    const giveaway: GiveawayRequest = { ...request, id };
    this.giveaways.set(id, giveaway);
    return giveaway;
  }
  
  async updateGiveaway(id: number, updates: Partial<GiveawayRequest>): Promise<GiveawayRequest> {
    const giveaway = this.giveaways.get(id);
    if (!giveaway) {
      throw new Error(`Giveaway with id ${id} not found`);
    }
    
    const updatedGiveaway = { ...giveaway, ...updates };
    this.giveaways.set(id, updatedGiveaway);
    return updatedGiveaway;
  }
  
  // Invite methods
  async getInvite(id: number): Promise<Invite | undefined> {
    return this.inviteEntries.get(id);
  }
  
  async getInvitesByUser(userId: string, since?: Date): Promise<Invite[]> {
    let invites = Array.from(this.inviteEntries.values()).filter(
      (invite) => invite.staffUserId === userId
    );
    
    if (since) {
      invites = invites.filter(
        (invite) => new Date(invite.createdAt) >= since
      );
    }
    
    return invites;
  }
  
  async getInvitesByCode(inviteCode: string): Promise<Invite[]> {
    return Array.from(this.inviteEntries.values()).filter(
      (invite) => invite.inviteCode === inviteCode
    );
  }
  
  async createInvite(inviteData: InsertInvite): Promise<Invite> {
    const id = this.inviteIdCounter++;
    const invite: Invite = { ...inviteData, id };
    this.inviteEntries.set(id, invite);
    return invite;
  }
  
  async updateInvite(id: number, updates: Partial<Invite>): Promise<Invite> {
    const invite = this.inviteEntries.get(id);
    if (!invite) {
      throw new Error(`Invite with id ${id} not found`);
    }
    
    const updatedInvite = { ...invite, ...updates };
    this.inviteEntries.set(id, updatedInvite);
    return updatedInvite;
  }
  
  async getInviteStatistics(): Promise<any> {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of the day
    
    // Get all invites from this week
    const weeklyInvites = Array.from(this.inviteEntries.values()).filter(
      (invite) => new Date(invite.createdAt) >= startOfWeek
    );
    
    // Group invites by user
    const groupedByUser = new Map();
    weeklyInvites.forEach(invite => {
      if (!groupedByUser.has(invite.staffUserId)) {
        groupedByUser.set(invite.staffUserId, {
          userId: invite.staffUserId,
          username: invite.staffUsername,
          totalUses: 0,
          servers: new Map()
        });
      }
      
      const userData = groupedByUser.get(invite.staffUserId);
      userData.totalUses += invite.uses;
      
      if (!userData.servers.has(invite.serverName)) {
        userData.servers.set(invite.serverName, {
          name: invite.serverName,
          uses: 0,
          inviteCodes: []
        });
      }
      
      const serverData = userData.servers.get(invite.serverName);
      serverData.uses += invite.uses;
      serverData.inviteCodes.push({
        code: invite.inviteCode,
        uses: invite.uses
      });
    });
    
    // Convert to array format for response
    const result = Array.from(groupedByUser.values()).map(userData => ({
      userId: userData.userId,
      username: userData.username,
      totalUses: userData.totalUses,
      servers: Array.from(userData.servers.values()).map(server => ({
        name: server.name,
        uses: server.uses,
        inviteCodes: server.inviteCodes
      }))
    }));
    
    return {
      weekStartDate: startOfWeek,
      totalInvites: weeklyInvites.reduce((total, invite) => total + invite.uses, 0),
      userStats: result
    };
  }
  
  /**
   * Clear all invite tracking data after weekly report generation
   */
  async clearAllInviteTracking(): Promise<void> {
    // In the in-memory implementation, simply clear the invites map
    this.inviteEntries.clear();
    console.log('Cleared all invite tracking data from in-memory storage');
  }
  
  // Ping Status methods
  async getPingStatus(): Promise<PingStatus | undefined> {
    return this.pingStatusData;
  }
  
  async updatePingStatus(updates: Partial<PingStatus>): Promise<PingStatus> {
    if (!this.pingStatusData) {
      this.pingStatusData = {
        id: this.pingStatusIdCounter++,
        ...updates
      };
    } else {
      this.pingStatusData = { ...this.pingStatusData, ...updates };
    }
    
    return this.pingStatusData;
  }
  
  // Performance Statistics methods
  async getGiveawayPerformanceStats(): Promise<any> {
    const allGiveaways = Array.from(this.giveaways.values());
    
    // Basic counts
    const totalGiveaways = allGiveaways.length;
    const completedGiveaways = allGiveaways.filter(g => g.status === 'posted').length;
    const pendingGiveaways = allGiveaways.filter(g => g.status === 'pending').length;
    const deniedGiveaways = allGiveaways.filter(g => g.status === 'denied').length;
    
    // Average time to approval (in hours)
    const approvedGiveaways = allGiveaways.filter(g => 
      g.status === 'approved' || g.status === 'posted'
    );
    
    let totalApprovalTimeHours = 0;
    let giveawaysWithApprovalTime = 0;
    
    approvedGiveaways.forEach(g => {
      if (g.requestedAt && g.approvedAt) {
        const requestTime = new Date(g.requestedAt).getTime();
        const approvalTime = new Date(g.approvedAt).getTime();
        const diffHours = (approvalTime - requestTime) / (1000 * 60 * 60);
        totalApprovalTimeHours += diffHours;
        giveawaysWithApprovalTime++;
      }
    });
    
    const averageTimeToApproval = giveawaysWithApprovalTime > 0 
      ? totalApprovalTimeHours / giveawaysWithApprovalTime 
      : 0;
    
    // Average server size
    let totalServerSize = 0;
    allGiveaways.forEach(g => {
      totalServerSize += g.memberCount;
    });
    
    const averageServerSize = totalGiveaways > 0 
      ? Math.round(totalServerSize / totalGiveaways) 
      : 0;
    
    // Ping usage stats
    const pingUsageStats = {
      everyone: allGiveaways.filter(g => g.ourPing === '@everyone').length,
      here: allGiveaways.filter(g => g.ourPing === '@here').length,
      other: allGiveaways.filter(g => 
        g.ourPing !== '@everyone' && g.ourPing !== '@here'
      ).length
    };
    
    // Monthly giveaways
    const monthlyData = new Map();
    
    allGiveaways.forEach(g => {
      const date = new Date(g.requestedAt);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long' });
      const key = `${monthName} ${date.getFullYear()}`;
      
      if (!monthlyData.has(key)) {
        monthlyData.set(key, { month: key, count: 0 });
      }
      
      const monthData = monthlyData.get(key);
      monthData.count++;
    });
    
    const monthlyGiveaways = Array.from(monthlyData.values())
      .sort((a, b) => {
        // Parse the month names to sort chronologically
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear);
        }
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(aMonth) - months.indexOf(bMonth);
      });
    
    // Popular servers
    const serverData = new Map();
    
    allGiveaways.forEach(g => {
      if (!serverData.has(g.serverName)) {
        serverData.set(g.serverName, { serverName: g.serverName, count: 0 });
      }
      
      const data = serverData.get(g.serverName);
      data.count++;
    });
    
    const popularServers = Array.from(serverData.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 servers
    
    return {
      totalGiveaways,
      completedGiveaways,
      pendingGiveaways,
      deniedGiveaways,
      averageTimeToApproval,
      averageServerSize,
      pingUsageStats,
      monthlyGiveaways,
      popularServers
    };
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }
  
  async getAllStaffMembers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.isStaff, true));
  }
  
  async getGiveawayRequestersFromWeek(since: Date): Promise<User[]> {
    // Get all users who have requested giveaways since the given date
    const recentRequesters = await db
      .select({
        user: users
      })
      .from(users)
      .innerJoin(
        giveawayRequests,
        and(
          eq(users.discordId, giveawayRequests.requesterUserId),
          gte(giveawayRequests.requestedAt, since)
        )
      );
    
    // Extract unique users
    const uniqueUsers = new Map<number, User>();
    recentRequesters.forEach(item => {
      if (!uniqueUsers.has(item.user.id)) {
        uniqueUsers.set(item.user.id, item.user);
      }
    });
    
    return Array.from(uniqueUsers.values());
  }
  
  // Giveaway Request methods
  async getGiveaway(id: number): Promise<GiveawayRequest | undefined> {
    const [giveaway] = await db.select().from(giveawayRequests).where(eq(giveawayRequests.id, id));
    return giveaway;
  }
  
  async getGiveawaysByStatus(status: string): Promise<GiveawayRequest[]> {
    return await db.select().from(giveawayRequests).where(eq(giveawayRequests.status, status));
  }
  
  async createGiveawayRequest(request: InsertGiveawayRequest): Promise<GiveawayRequest> {
    const [giveaway] = await db.insert(giveawayRequests).values(request).returning();
    return giveaway;
  }
  
  async updateGiveaway(id: number, updates: Partial<GiveawayRequest>): Promise<GiveawayRequest> {
    const [updatedGiveaway] = await db
      .update(giveawayRequests)
      .set(updates)
      .where(eq(giveawayRequests.id, id))
      .returning();
    
    if (!updatedGiveaway) {
      throw new Error(`Giveaway with id ${id} not found`);
    }
    
    return updatedGiveaway;
  }
  
  // Invite methods
  async getInvite(id: number): Promise<Invite | undefined> {
    const [invite] = await db.select().from(invites).where(eq(invites.id, id));
    return invite;
  }
  
  async getInvitesByUser(userId: string, since?: Date): Promise<Invite[]> {
    let query = db.select().from(invites).where(eq(invites.staffUserId, userId));
    
    if (since) {
      query = query.where(and(
        eq(invites.staffUserId, userId),
        gte(invites.createdAt, since)
      ));
    }
    
    return await query;
  }
  
  async getInvitesByCode(inviteCode: string): Promise<Invite[]> {
    return await db.select().from(invites).where(eq(invites.inviteCode, inviteCode));
  }
  
  async createInvite(inviteData: InsertInvite): Promise<Invite> {
    const [invite] = await db.insert(invites).values(inviteData).returning();
    return invite;
  }
  
  async updateInvite(id: number, updates: Partial<Invite>): Promise<Invite> {
    const [updatedInvite] = await db
      .update(invites)
      .set(updates)
      .where(eq(invites.id, id))
      .returning();
    
    if (!updatedInvite) {
      throw new Error(`Invite with id ${id} not found`);
    }
    
    return updatedInvite;
  }
  
  async getInviteStatistics(): Promise<any> {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek); // Go back to Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of the day
    
    // Get all invites from this week
    const weeklyInvites = await db.select()
      .from(invites)
      .where(gte(invites.createdAt, startOfWeek))
      .orderBy(desc(invites.createdAt));
    
    // Group invites by user
    const groupedByUser = new Map();
    weeklyInvites.forEach(invite => {
      if (!groupedByUser.has(invite.staffUserId)) {
        groupedByUser.set(invite.staffUserId, {
          userId: invite.staffUserId,
          username: invite.staffUsername,
          totalUses: 0,
          servers: new Map()
        });
      }
      
      const userData = groupedByUser.get(invite.staffUserId);
      userData.totalUses += invite.uses;
      
      if (!userData.servers.has(invite.serverName)) {
        userData.servers.set(invite.serverName, {
          name: invite.serverName,
          uses: 0,
          inviteCodes: []
        });
      }
      
      const serverData = userData.servers.get(invite.serverName);
      serverData.uses += invite.uses;
      serverData.inviteCodes.push({
        code: invite.inviteCode,
        uses: invite.uses
      });
    });
    
    // Convert to array format for response
    const result = Array.from(groupedByUser.values()).map(userData => ({
      userId: userData.userId,
      username: userData.username,
      totalUses: userData.totalUses,
      servers: Array.from(userData.servers.values()).map(server => ({
        name: server.name,
        uses: server.uses,
        inviteCodes: server.inviteCodes
      }))
    }));
    
    return {
      weekStartDate: startOfWeek,
      totalInvites: weeklyInvites.reduce((total, invite) => total + invite.uses, 0),
      userStats: result
    };
  }
  
  /**
   * Clear all invite tracking data after weekly report generation
   */
  async clearAllInviteTracking(): Promise<void> {
    try {
      // Delete all records from the invites table
      await db.delete(invites);
      console.log('All invite tracking data cleared from database');
    } catch (error) {
      console.error('Error clearing invite tracking data:', error);
      throw error;
    }
  }
  
  // Ping Status methods
  async getPingStatus(): Promise<PingStatus | undefined> {
    // Try to get the ping status, if it doesn't exist, create it
    let [status] = await db.select().from(pingStatus).limit(1);
    
    if (!status) {
      // Create initial ping status
      [status] = await db.insert(pingStatus).values({
        everyone: null,
        here: null
      }).returning();
    }
    
    return status;
  }
  
  async updatePingStatus(updates: Partial<PingStatus>): Promise<PingStatus> {
    // Get the current ping status
    let [status] = await db.select().from(pingStatus).limit(1);
    
    if (!status) {
      // If no status exists, create one
      [status] = await db.insert(pingStatus).values({
        ...updates
      }).returning();
      return status;
    }
    
    // Update the existing status
    const [updatedStatus] = await db
      .update(pingStatus)
      .set(updates)
      .where(eq(pingStatus.id, status.id))
      .returning();
    
    return updatedStatus;
  }
  
  // Performance Statistics methods
  async getGiveawayPerformanceStats(): Promise<any> {
    // Get all giveaways for analysis
    const allGiveaways = await db.select().from(giveawayRequests);
    
    // Basic counts
    const totalGiveaways = allGiveaways.length;
    const completedGiveaways = allGiveaways.filter(g => g.status === 'posted').length;
    const pendingGiveaways = allGiveaways.filter(g => g.status === 'pending').length;
    const deniedGiveaways = allGiveaways.filter(g => g.status === 'denied').length;
    
    // Average time to approval (in hours)
    const approvedGiveaways = allGiveaways.filter(g => 
      g.status === 'approved' || g.status === 'posted'
    );
    
    let totalApprovalTimeHours = 0;
    let giveawaysWithApprovalTime = 0;
    
    approvedGiveaways.forEach(g => {
      if (g.requestedAt && g.approvedAt) {
        const requestTime = new Date(g.requestedAt).getTime();
        const approvalTime = new Date(g.approvedAt).getTime();
        const diffHours = (approvalTime - requestTime) / (1000 * 60 * 60);
        totalApprovalTimeHours += diffHours;
        giveawaysWithApprovalTime++;
      }
    });
    
    const averageTimeToApproval = giveawaysWithApprovalTime > 0 
      ? totalApprovalTimeHours / giveawaysWithApprovalTime 
      : 0;
    
    // Average server size
    let totalServerSize = 0;
    allGiveaways.forEach(g => {
      totalServerSize += g.memberCount;
    });
    
    const averageServerSize = totalGiveaways > 0 
      ? Math.round(totalServerSize / totalGiveaways) 
      : 0;
    
    // Ping usage stats
    const pingUsageStats = {
      everyone: allGiveaways.filter(g => g.ourPing === '@everyone').length,
      here: allGiveaways.filter(g => g.ourPing === '@here').length,
      other: allGiveaways.filter(g => 
        g.ourPing !== '@everyone' && g.ourPing !== '@here'
      ).length
    };
    
    // Monthly giveaways
    const monthlyData = new Map();
    
    allGiveaways.forEach(g => {
      const date = new Date(g.requestedAt);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const monthName = date.toLocaleString('default', { month: 'long' });
      const key = `${monthName} ${date.getFullYear()}`;
      
      if (!monthlyData.has(key)) {
        monthlyData.set(key, { month: key, count: 0 });
      }
      
      const monthData = monthlyData.get(key);
      monthData.count++;
    });
    
    const monthlyGiveaways = Array.from(monthlyData.values())
      .sort((a, b) => {
        // Parse the month names to sort chronologically
        const [aMonth, aYear] = a.month.split(' ');
        const [bMonth, bYear] = b.month.split(' ');
        
        if (aYear !== bYear) {
          return parseInt(aYear) - parseInt(bYear);
        }
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(aMonth) - months.indexOf(bMonth);
      });
    
    // Popular servers
    const serverData = new Map();
    
    allGiveaways.forEach(g => {
      if (!serverData.has(g.serverName)) {
        serverData.set(g.serverName, { serverName: g.serverName, count: 0 });
      }
      
      const data = serverData.get(g.serverName);
      data.count++;
    });
    
    const popularServers = Array.from(serverData.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 servers
    
    return {
      totalGiveaways,
      completedGiveaways,
      pendingGiveaways,
      deniedGiveaways,
      averageTimeToApproval,
      averageServerSize,
      pingUsageStats,
      monthlyGiveaways,
      popularServers
    };
  }
  
  // End of getGiveawayPerformanceStats method
}

// Switch to using DatabaseStorage
export const storage = new DatabaseStorage();
