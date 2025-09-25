import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import { insertHabitSchema, insertHabitEntrySchema, insertAiNudgeSchema } from "@shared/schema";
import { z } from "zod";

// For demo purposes, we'll use a hardcoded user ID
// In a real app, this would come from authentication
const DEMO_USER_ID = "demo-user-123";

// Simple notification system using in-memory storage
interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'notification' | 'nudge' | 'challenge';
  title: string;
  message: string;
  habitId?: string;
  actionUrl?: string;
  timestamp: string;
  read: boolean;
}

const notifications = new Map<string, Notification[]>();

// Store the actual demo user ID for periodic operations
let demoUserId: string | null = null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize demo user with idempotent seeding
  app.use(async (req, res, next) => {
    try {
      // Try to find existing demo user by username
      let user = await storage.getUserByUsername("demo-user");
      
      if (!user) {
        try {
          // Create demo user only if it doesn't exist
          user = await storage.createUser({
            username: "demo-user",
            password: "hashed_demo_password_placeholder" // In production, this would be properly hashed
          });
          console.log('Created demo user with ID:', user.id);
        } catch (createError: any) {
          // If user creation fails due to duplicate key, try to fetch again
          if (createError.code === '23505') {
            user = await storage.getUserByUsername("demo-user");
            if (!user) {
              throw createError; // Re-throw if still can't find user
            }
          } else {
            throw createError; // Re-throw other errors
          }
        }
      }
      
      // Store the demo user ID for periodic operations
      if (!demoUserId) {
        demoUserId = user.id;
        console.log('Stored demo user ID for periodic operations:', demoUserId);
      }
      
      req.userId = user.id;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      // If we can't create or find the demo user, this is a critical error
      return res.status(500).json({ error: 'Failed to initialize user session' });
    }
  });

  // Habit routes
  app.get("/api/habits", async (req, res) => {
    try {
      const habits = await storage.getUserHabits(req.userId);
      
      // Enhance habits with current completion status and streak
      const today = new Date().toISOString().split('T')[0];
      const enhancedHabits = await Promise.all(habits.map(async (habit) => {
        const todayEntry = await storage.getHabitEntry(habit.id, req.userId, today);
        const streak = await storage.calculateHabitStreak(habit.id, req.userId);
        const entries = await storage.getHabitEntries(habit.id, req.userId, 30);
        const completedEntries = entries.filter(e => e.completed);
        const completionRate = entries.length > 0 ? Math.round((completedEntries.length / entries.length) * 100) : 0;

        return {
          ...habit,
          completed: todayEntry?.completed || false,
          streak,
          completionRate
        };
      }));

      res.json(enhancedHabits);
    } catch (error) {
      console.error('Get habits error:', error);
      res.status(500).json({ error: 'Failed to fetch habits' });
    }
  });

  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit({
        ...validatedData,
        userId: req.userId
      });
      res.status(201).json(habit);
    } catch (error) {
      console.error('Create habit error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create habit' });
      }
    }
  });

  app.put("/api/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(id, req.userId, validatedData);
      
      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
      }
      
      res.json(habit);
    } catch (error) {
      console.error('Update habit error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid input', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to update habit' });
      }
    }
  });

  app.delete("/api/habits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteHabit(id, req.userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Habit not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Delete habit error:', error);
      res.status(500).json({ error: 'Failed to delete habit' });
    }
  });

  // Habit tracking routes
  app.post("/api/habits/:id/toggle", async (req, res) => {
    try {
      const { id: habitId } = req.params;
      const { completed, date, notes } = req.body;
      
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const entry = await storage.createOrUpdateHabitEntry({
        habitId,
        userId: req.userId,
        date: targetDate,
        completed: completed !== undefined ? completed : true,
        notes
      });

      res.json(entry);
    } catch (error) {
      console.error('Toggle habit error:', error);
      res.status(500).json({ error: 'Failed to update habit entry' });
    }
  });

  app.get("/api/habits/:id/entries", async (req, res) => {
    try {
      const { id: habitId } = req.params;
      const limit = parseInt(req.query.limit as string) || 30;
      
      const entries = await storage.getHabitEntries(habitId, req.userId, limit);
      res.json(entries);
    } catch (error) {
      console.error('Get habit entries error:', error);
      res.status(500).json({ error: 'Failed to fetch habit entries' });
    }
  });

  // Progress analytics routes
  app.get("/api/progress/weekly", async (req, res) => {
    try {
      const today = new Date();
      const weeklyData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const entries = await storage.getUserHabitEntriesForDate(req.userId, dateStr);
        const userHabits = await storage.getUserHabits(req.userId);
        const completed = entries.filter(e => e.completed).length;
        const total = userHabits.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        weeklyData.push({
          date: date.toLocaleDateString([], { weekday: 'short' }),
          completed,
          total,
          percentage
        });
      }

      res.json(weeklyData);
    } catch (error) {
      console.error('Get weekly progress error:', error);
      res.status(500).json({ error: 'Failed to fetch weekly progress' });
    }
  });

  app.get("/api/progress/monthly", async (req, res) => {
    try {
      const today = new Date();
      const monthlyData = [];

      for (let week = 3; week >= 0; week--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (week * 7) - 6);
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() - (week * 7));

        let totalCompleted = 0;
        let totalPossible = 0;

        for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const entries = await storage.getUserHabitEntriesForDate(req.userId, dateStr);
          const userHabits = await storage.getUserHabits(req.userId);
          totalCompleted += entries.filter(e => e.completed).length;
          totalPossible += userHabits.length;
        }

        const percentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

        monthlyData.push({
          date: `Week ${4 - week}`,
          completed: totalCompleted,
          total: totalPossible,
          percentage
        });
      }

      res.json(monthlyData);
    } catch (error) {
      console.error('Get monthly progress error:', error);
      res.status(500).json({ error: 'Failed to fetch monthly progress' });
    }
  });

  // User stats route
  app.get("/api/stats", async (req, res) => {
    try {
      let stats = await storage.getUserStats(req.userId);
      const habits = await storage.getUserHabits(req.userId);
      
      if (!stats) {
        stats = await storage.updateUserStats(req.userId, {
          totalHabits: habits.length,
          activeHabits: habits.length,
          longestStreak: 0,
          currentStreak: 0,
          totalCompletions: 0
        });
      }

      // Calculate current streak across all habits
      const today = new Date().toISOString().split('T')[0];
      const todayEntries = await storage.getUserHabitEntriesForDate(req.userId, today);
      const completedToday = todayEntries.filter(e => e.completed).length;

      res.json({
        ...stats,
        completedToday,
        totalHabitsToday: habits.length,
        todayCompletionRate: habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to fetch user stats' });
    }
  });

  // AI Nudges routes
  app.get("/api/nudges", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const nudges = await storage.getUserAiNudges(req.userId, limit);
      res.json(nudges);
    } catch (error) {
      console.error('Get nudges error:', error);
      res.status(500).json({ error: 'Failed to fetch AI nudges' });
    }
  });

  app.post("/api/nudges/:id/dismiss", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.dismissNudge(id, req.userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Nudge not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Dismiss nudge error:', error);
      res.status(500).json({ error: 'Failed to dismiss nudge' });
    }
  });

  app.post("/api/nudges/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNudgeAsRead(id, req.userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Nudge not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Mark nudge as read error:', error);
      res.status(500).json({ error: 'Failed to mark nudge as read' });
    }
  });

  // AI-powered features
  app.post("/api/ai/generate-nudge", async (req, res) => {
    try {
      const nudge = await aiService.generatePersonalizedNudge(req.userId);
      
      if (!nudge) {
        return res.status(404).json({ error: 'Unable to generate nudge - no habits found' });
      }
      
      res.json(nudge);
    } catch (error) {
      console.error('Generate AI nudge error:', error);
      res.status(500).json({ error: 'Failed to generate AI nudge' });
    }
  });

  app.post("/api/ai/generate-challenge", async (req, res) => {
    try {
      const challenge = await aiService.generateDailyMicroChallenge(req.userId);
      
      if (!challenge) {
        return res.status(404).json({ error: 'Unable to generate challenge - no habits found' });
      }
      
      res.json(challenge);
    } catch (error) {
      console.error('Generate AI challenge error:', error);
      res.status(500).json({ error: 'Failed to generate AI challenge' });
    }
  });

  app.post("/api/ai/motivate", async (req, res) => {
    try {
      const { habitId } = req.body;
      const motivation = await aiService.generateMotivationalMessage(req.userId, habitId);
      
      if (!motivation) {
        return res.status(500).json({ error: 'Unable to generate motivation message' });
      }
      
      res.json(motivation);
    } catch (error) {
      console.error('Generate AI motivation error:', error);
      res.status(500).json({ error: 'Failed to generate motivation message' });
    }
  });

  app.get("/api/ai/habit-suggestions", async (req, res) => {
    try {
      const { category } = req.query;
      const suggestions = await aiService.generateHabitSuggestions(
        req.userId, 
        category as string
      );
      
      res.json({ suggestions });
    } catch (error) {
      console.error('Generate habit suggestions error:', error);
      res.status(500).json({ error: 'Failed to generate habit suggestions' });
    }
  });

  // Automatic AI nudge generation (could be triggered by cron job)
  app.post("/api/ai/auto-generate-nudges", async (req, res) => {
    try {
      // Generate a personalized nudge
      const nudge = await aiService.generatePersonalizedNudge(req.userId);
      
      // 30% chance to also generate a micro-challenge
      let challenge = null;
      if (Math.random() < 0.3) {
        challenge = await aiService.generateDailyMicroChallenge(req.userId);
      }

      const results = {
        nudge: nudge ? nudge.id : null,
        challenge: challenge ? challenge.id : null
      };

      res.json(results);
    } catch (error) {
      console.error('Auto-generate nudges error:', error);
      res.status(500).json({ error: 'Failed to auto-generate nudges' });
    }
  });

  // Helper functions for notifications
  function addNotification(userId: string, notification: Omit<Notification, 'id' | 'userId' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    if (!notifications.has(userId)) {
      notifications.set(userId, []);
    }
    
    const userNotifications = notifications.get(userId)!;
    userNotifications.unshift(newNotification); // Add to front
    
    // Keep only last 50 notifications per user
    if (userNotifications.length > 50) {
      userNotifications.splice(50);
    }

    return newNotification;
  }

  // Notification endpoints
  app.get("/api/notifications", async (req, res) => {
    try {
      const userNotifications = notifications.get(req.userId) || [];
      const unreadCount = userNotifications.filter(n => !n.read).length;
      
      res.json({
        notifications: userNotifications,
        unreadCount
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const userNotifications = notifications.get(req.userId) || [];
      const notification = userNotifications.find(n => n.id === id);
      
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      
      notification.read = true;
      res.json({ success: true });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const userNotifications = notifications.get(req.userId) || [];
      userNotifications.forEach(n => n.read = true);
      res.json({ success: true });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  });

  // Reminder/Notification endpoints
  app.post("/api/reminders/schedule", async (req, res) => {
    try {
      const { habitId, time, message } = req.body;
      
      const notification = addNotification(req.userId, {
        type: 'reminder',
        title: 'Habit Reminder',
        message: message || 'Time to check your habits!',
        habitId
      });

      res.json({ success: true, notification });
    } catch (error) {
      console.error('Schedule reminder error:', error);
      res.status(500).json({ error: 'Failed to schedule reminder' });
    }
  });

  app.post("/api/notifications/send", async (req, res) => {
    try {
      const { type, title, message, actionUrl, habitId } = req.body;
      
      const notification = addNotification(req.userId, {
        type: type || 'notification',
        title,
        message,
        actionUrl,
        habitId
      });

      res.json({ success: true, notification });
    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Generate AI nudge and create notification
  app.post("/api/ai/request-nudge", async (req, res) => {
    try {
      const nudge = await aiService.generatePersonalizedNudge(req.userId);
      
      if (nudge) {
        const notification = addNotification(req.userId, {
          type: 'nudge',
          title: nudge.title,
          message: nudge.message,
          habitId: nudge.habitId || undefined
        });
        
        res.json({ nudge, notification });
      } else {
        res.status(404).json({ error: 'Unable to generate nudge' });
      }
    } catch (error) {
      console.error('Request AI nudge error:', error);
      res.status(500).json({ error: 'Failed to generate nudge' });
    }
  });

  const httpServer = createServer(app);

  // Schedule periodic AI nudge generation (every hour for demo)
  setInterval(async () => {
    try {
      // Only run if we have a demo user ID stored
      if (!demoUserId) {
        console.log('No demo user ID available for periodic nudge generation');
        return;
      }
      
      const userNotifications = notifications.get(demoUserId) || [];
      const recentNudges = userNotifications.filter(n => 
        n.type === 'nudge' && 
        new Date(n.timestamp).getTime() > Date.now() - (60 * 60 * 1000) // Last hour
      );
      
      // Only generate if no recent nudges
      if (recentNudges.length === 0) {
        const nudge = await aiService.generatePersonalizedNudge(demoUserId);
        if (nudge) {
          addNotification(demoUserId, {
            type: 'nudge',
            title: nudge.title,
            message: nudge.message,
            habitId: nudge.habitId || undefined
          });
          console.log(`Generated periodic AI nudge for user ${demoUserId}`);
        }
      }
    } catch (error) {
      console.error('Periodic AI nudge generation error:', error);
    }
  }, 60 * 60 * 1000); // 1 hour

  return httpServer;
}

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
