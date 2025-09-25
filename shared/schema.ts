import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  targetDays: integer("target_days").notNull().default(30),
  color: text("color").default("#10b981"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const habitEntries = pgTable("habit_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  completed: boolean("completed").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiNudges = pgTable("ai_nudges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  habitId: varchar("habit_id").references(() => habits.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // motivation, reminder, challenge, tip
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionLabel: text("action_label"),
  isRead: boolean("is_read").notNull().default(false),
  isDismissed: boolean("is_dismissed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalHabits: integer("total_habits").notNull().default(0),
  activeHabits: integer("active_habits").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  totalCompletions: integer("total_completions").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHabitSchema = createInsertSchema(habits).pick({
  name: true,
  description: true,
  category: true,
  targetDays: true,
  color: true,
});

export const insertHabitEntrySchema = createInsertSchema(habitEntries).pick({
  habitId: true,
  date: true,
  completed: true,
  notes: true,
});

export const insertAiNudgeSchema = createInsertSchema(aiNudges).pick({
  habitId: true,
  type: true,
  title: true,
  message: true,
  actionLabel: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;

export type HabitEntry = typeof habitEntries.$inferSelect;
export type InsertHabitEntry = z.infer<typeof insertHabitEntrySchema>;

export type AiNudge = typeof aiNudges.$inferSelect;
export type InsertAiNudge = z.infer<typeof insertAiNudgeSchema>;

export type UserStats = typeof userStats.$inferSelect;
