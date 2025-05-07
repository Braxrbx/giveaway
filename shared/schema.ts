import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  discordId: text("discord_id"),
  isStaff: boolean("is_staff").default(false),
  isAdmin: boolean("is_admin").default(false),
  avatarUrl: text("avatar_url")
});

export const giveawayRequests = pgTable("giveaway_requests", {
  id: serial("id").primaryKey(),
  requesterUserId: text("requester_user_id").notNull(),
  requesterUsername: text("requester_username").notNull(),
  serverName: text("server_name").notNull(),
  serverInvite: text("server_invite").notNull(),
  memberCount: integer("member_count").notNull(),
  ourPing: text("our_ping").notNull(),
  theirPing: text("their_ping").notNull(),
  prize: text("prize").notNull(),
  requestedAt: timestamp("requested_at").notNull(),
  status: text("status").notNull(), // pending, approved, denied, posted, cancelled
  approvedAt: timestamp("approved_at"),
  deniedAt: timestamp("denied_at"),
  postedAt: timestamp("posted_at"),
  scheduledFor: timestamp("scheduled_for"),
  approvalMessage: text("approval_message"),
  denialReason: text("denial_reason")
});

export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  giveawayId: integer("giveaway_id").notNull(),
  staffUserId: text("staff_user_id").notNull(),
  staffUsername: text("staff_username").notNull(),
  serverName: text("server_name").notNull(),
  inviteCode: text("invite_code").notNull(),
  uses: integer("uses").default(0),
  createdAt: timestamp("created_at").notNull(),
  lastUpdated: timestamp("last_updated").notNull()
});

export const pingStatus = pgTable("ping_status", {
  id: serial("id").primaryKey(),
  everyone: timestamp("everyone"), // last time @everyone was used
  here: timestamp("here"), // last time @here was used
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  discordId: true,
  isStaff: true,
  isAdmin: true,
  avatarUrl: true,
});

export const insertGiveawayRequestSchema = createInsertSchema(giveawayRequests).omit({
  id: true,
});

export const insertInviteSchema = createInsertSchema(invites).omit({
  id: true,
});

export const insertPingStatusSchema = createInsertSchema(pingStatus).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGiveawayRequest = z.infer<typeof insertGiveawayRequestSchema>;
export type GiveawayRequest = typeof giveawayRequests.$inferSelect;

export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type Invite = typeof invites.$inferSelect;

export type InsertPingStatus = z.infer<typeof insertPingStatusSchema>;
export type PingStatus = typeof pingStatus.$inferSelect;
