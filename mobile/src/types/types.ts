// Shared types for HabitFlow Mobile App
// Matches the backend schema definitions

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: string;
  targetDays: number;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields from backend
  completed?: boolean;
  streak?: number;
  completionRate?: number;
}

export interface HabitEntry {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface AiNudge {
  id: string;
  userId: string;
  habitId?: string;
  type: 'motivation' | 'reminder' | 'challenge' | 'tip';
  title: string;
  message: string;
  actionLabel?: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}

export interface UserStats {
  id: string;
  userId: string;
  totalHabits: number;
  activeHabits: number;
  longestStreak: number;
  currentStreak: number;
  totalCompletions: number;
  updatedAt: string;
}

// Form types for creating/updating data
export interface CreateHabitData {
  name: string;
  description?: string;
  category: string;
  targetDays: number;
  color: string;
}

export interface UpdateHabitData {
  name?: string;
  description?: string;
  category?: string;
  targetDays?: number;
  color?: string;
}

export interface CreateHabitEntryData {
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

// UI-specific types
export interface NavigationProps {
  navigation: any; // Replace with proper navigation types when using React Navigation
}

export interface ScreenProps extends NavigationProps {
  route: any;
}

// Habit categories for consistency
export const HABIT_CATEGORIES = [
  'fitness',
  'nutrition', 
  'mindfulness',
  'productivity',
  'sleep',
  'learning',
  'social',
  'creative',
  'health',
  'finance'
] as const;

export type HabitCategory = typeof HABIT_CATEGORIES[number];

// Predefined habit colors
export const HABIT_COLORS = [
  '#10b981', // Emerald (default)
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
] as const;

export type HabitColor = typeof HABIT_COLORS[number];

// AI Nudge types for better type safety
export const AI_NUDGE_TYPES = [
  'motivation',
  'reminder', 
  'challenge',
  'tip'
] as const;

export type AiNudgeType = typeof AI_NUDGE_TYPES[number];

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Progress tracking types
export interface HabitProgress {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  totalCompletions: number;
  recentEntries: HabitEntry[];
}

export interface WeeklyProgress {
  week: string; // ISO week (YYYY-WW)
  completions: number;
  totalPossible: number;
  completionRate: number;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM
  completions: number;
  totalPossible: number;
  completionRate: number;
  bestStreak: number;
}

// Notification types (for future push notifications)
export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'nudge' | 'achievement' | 'challenge';
  title: string;
  message: string;
  habitId?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

// Achievement types (for future gamification)
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string; // e.g., "complete 7 days in a row"
  earnedAt?: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: string;
  achievement: Achievement;
}