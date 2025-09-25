import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { 
  type User, 
  type InsertUser, 
  type Habit, 
  type InsertHabit,
  type HabitEntry,
  type InsertHabitEntry,
  type AiNudge,
  type InsertAiNudge,
  type UserStats,
  type Session,
  type PasswordResetToken,
  users,
  habits,
  habitEntries,
  aiNudges,
  userStats,
  sessions,
  passwordResetTokens
} from "@shared/schema";

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Authentication methods
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  
  // Session methods
  createSession(userId: string, expiresAt: Date, data?: any): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  cleanExpiredSessions(): Promise<number>;
  
  // Password reset methods
  createPasswordResetToken(userId: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenAsUsed(tokenId: string): Promise<boolean>;

  // Habit methods
  getUserHabits(userId: string): Promise<Habit[]>;
  getHabit(id: string, userId: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit & { userId: string }): Promise<Habit>;
  updateHabit(id: string, userId: string, updates: Partial<InsertHabit>): Promise<Habit | undefined>;
  deleteHabit(id: string, userId: string): Promise<boolean>;

  // Habit entry methods
  getHabitEntry(habitId: string, userId: string, date: string): Promise<HabitEntry | undefined>;
  createOrUpdateHabitEntry(entry: InsertHabitEntry & { userId: string }): Promise<HabitEntry>;
  getHabitEntries(habitId: string, userId: string, limit?: number): Promise<HabitEntry[]>;
  getUserHabitEntriesForDate(userId: string, date: string): Promise<HabitEntry[]>;

  // AI nudge methods
  getUserAiNudges(userId: string, limit?: number): Promise<AiNudge[]>;
  createAiNudge(nudge: InsertAiNudge & { userId: string }): Promise<AiNudge>;
  markNudgeAsRead(id: string, userId: string): Promise<boolean>;
  dismissNudge(id: string, userId: string): Promise<boolean>;

  // Stats methods
  getUserStats(userId: string): Promise<UserStats | undefined>;
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats>;
  calculateHabitStreak(habitId: string, userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await this.hashPassword(insertUser.password);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }
    
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Authentication methods
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Session methods
  async createSession(userId: string, expiresAt: Date, data?: any): Promise<Session> {
    const crypto = await import('crypto');
    const sessionId = `sess_${crypto.randomUUID()}`;
    const result = await db.insert(sessions).values({
      id: sessionId,
      userId,
      expiresAt,
      data: data || {}
    }).returning();
    return result[0];
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const result = await db.select().from(sessions)
      .where(and(
        eq(sessions.id, sessionId),
        sql`expires_at > NOW()`
      ))
      .limit(1);
    return result[0];
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await db.delete(sessions)
      .where(eq(sessions.id, sessionId))
      .returning();
    return result.length > 0;
  }

  async cleanExpiredSessions(): Promise<number> {
    const result = await db.delete(sessions)
      .where(sql`expires_at <= NOW()`)
      .returning();
    return result.length;
  }

  // Password reset methods
  async createPasswordResetToken(userId: string, expiresAt: Date): Promise<PasswordResetToken> {
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const result = await db.insert(passwordResetTokens).values({
      userId,
      token,
      expiresAt
    }).returning();
    return result[0];
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const result = await db.select().from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        sql`expires_at > NOW()`
      ))
      .limit(1);
    return result[0];
  }

  async markPasswordResetTokenAsUsed(tokenId: string): Promise<boolean> {
    const result = await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, tokenId))
      .returning();
    return result.length > 0;
  }

  // Habit methods
  async getUserHabits(userId: string): Promise<Habit[]> {
    return db.select().from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
      .orderBy(desc(habits.createdAt));
  }

  async getHabit(id: string, userId: string): Promise<Habit | undefined> {
    const result = await db.select().from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);
    return result[0];
  }

  async createHabit(habit: InsertHabit & { userId: string }): Promise<Habit> {
    const result = await db.insert(habits).values(habit).returning();
    
    // Update user stats
    await this.updateUserHabitCounts(habit.userId);
    
    return result[0];
  }

  async updateHabit(id: string, userId: string, updates: Partial<InsertHabit>): Promise<Habit | undefined> {
    const result = await db.update(habits)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    const result = await db.update(habits)
      .set({ isActive: false })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    
    if (result.length > 0) {
      await this.updateUserHabitCounts(userId);
      return true;
    }
    return false;
  }

  // Habit entry methods
  async getHabitEntry(habitId: string, userId: string, date: string): Promise<HabitEntry | undefined> {
    const result = await db.select().from(habitEntries)
      .where(and(
        eq(habitEntries.habitId, habitId),
        eq(habitEntries.userId, userId),
        eq(habitEntries.date, date)
      ))
      .limit(1);
    return result[0];
  }

  async createOrUpdateHabitEntry(entry: InsertHabitEntry & { userId: string }): Promise<HabitEntry> {
    const existing = await this.getHabitEntry(entry.habitId, entry.userId, entry.date);
    
    if (existing) {
      const result = await db.update(habitEntries)
        .set({ completed: entry.completed, notes: entry.notes })
        .where(eq(habitEntries.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(habitEntries).values(entry).returning();
      return result[0];
    }
  }

  async getHabitEntries(habitId: string, userId: string, limit = 30): Promise<HabitEntry[]> {
    return db.select().from(habitEntries)
      .where(and(eq(habitEntries.habitId, habitId), eq(habitEntries.userId, userId)))
      .orderBy(desc(habitEntries.date))
      .limit(limit);
  }

  async getUserHabitEntriesForDate(userId: string, date: string): Promise<HabitEntry[]> {
    return db.select().from(habitEntries)
      .where(and(eq(habitEntries.userId, userId), eq(habitEntries.date, date)));
  }

  // AI nudge methods
  async getUserAiNudges(userId: string, limit = 10): Promise<AiNudge[]> {
    return db.select().from(aiNudges)
      .where(and(eq(aiNudges.userId, userId), eq(aiNudges.isDismissed, false)))
      .orderBy(desc(aiNudges.createdAt))
      .limit(limit);
  }

  async createAiNudge(nudge: InsertAiNudge & { userId: string }): Promise<AiNudge> {
    const result = await db.insert(aiNudges).values(nudge).returning();
    return result[0];
  }

  async markNudgeAsRead(id: string, userId: string): Promise<boolean> {
    const result = await db.update(aiNudges)
      .set({ isRead: true })
      .where(and(eq(aiNudges.id, id), eq(aiNudges.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async dismissNudge(id: string, userId: string): Promise<boolean> {
    const result = await db.update(aiNudges)
      .set({ isDismissed: true })
      .where(and(eq(aiNudges.id, id), eq(aiNudges.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Stats methods
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const result = await db.select().from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    
    if (existing) {
      const result = await db.update(userStats)
        .set({ ...stats, updatedAt: sql`now()` })
        .where(eq(userStats.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userStats)
        .values({ userId, ...stats })
        .returning();
      return result[0];
    }
  }

  async calculateHabitStreak(habitId: string, userId: string): Promise<number> {
    const entries = await db.select().from(habitEntries)
      .where(and(
        eq(habitEntries.habitId, habitId),
        eq(habitEntries.userId, userId),
        eq(habitEntries.completed, true)
      ))
      .orderBy(desc(habitEntries.date));

    if (entries.length === 0) return 0;

    // Sort dates in descending order (most recent first)
    const completedDates = entries.map(e => e.date).sort().reverse();
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Start checking from today or yesterday (allow for streaks that ended yesterday)
    let currentDate = today;
    if (!completedDates.includes(today) && completedDates.includes(yesterdayStr)) {
      currentDate = yesterdayStr;
    }
    
    // If neither today nor yesterday is completed, no active streak
    if (!completedDates.includes(currentDate)) {
      return 0;
    }
    
    // Count backwards from the starting date
    let checkDate = new Date(currentDate);
    for (const completedDate of completedDates) {
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (completedDate === dateStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (completedDate < dateStr) {
        // We've found a gap in the streak
        break;
      }
      // If completedDate > dateStr, continue looking for the matching date
    }

    return streak;
  }

  // Helper method to update user habit counts
  private async updateUserHabitCounts(userId: string): Promise<void> {
    const userHabits = await this.getUserHabits(userId);
    const totalEntries = await db.select().from(habitEntries)
      .where(and(eq(habitEntries.userId, userId), eq(habitEntries.completed, true)));

    await this.updateUserStats(userId, {
      totalHabits: userHabits.length,
      activeHabits: userHabits.length,
      totalCompletions: totalEntries.length
    });
  }
}

export const storage = new DatabaseStorage();
