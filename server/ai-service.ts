import OpenAI from "openai";
import { storage } from "./storage";
import type { Habit, HabitEntry, AiNudge } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserContext {
  habits: Habit[];
  recentEntries: HabitEntry[];
  streaks: { [habitId: string]: number };
  completionRates: { [habitId: string]: number };
  todaysCompletions: number;
  totalHabits: number;
}

export class AiService {
  async generatePersonalizedNudge(userId: string): Promise<AiNudge | null> {
    try {
      const context = await this.getUserContext(userId);
      
      if (context.habits.length === 0) {
        return null; // No habits to generate nudges for
      }

      const prompt = this.buildNudgePrompt(context);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an AI habit coach that provides personalized, motivational, and actionable nudges to help users build lasting habits. Be encouraging, specific, and helpful. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Validate and create the nudge
      const nudgeData = {
        userId,
        habitId: result.habitId || null,
        type: result.type || 'motivation',
        title: result.title || 'Keep it up!',
        message: result.message || 'You\'re doing great with your habits!',
        actionLabel: result.actionLabel || null
      };

      return await storage.createAiNudge(nudgeData);
    } catch (error) {
      console.error('AI nudge generation error:', error);
      return null;
    }
  }

  async generateDailyMicroChallenge(userId: string): Promise<AiNudge | null> {
    try {
      const context = await this.getUserContext(userId);
      
      if (context.habits.length === 0) {
        return null;
      }

      const prompt = this.buildChallengePrompt(context);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an AI wellness coach that creates personalized micro-challenges to help users develop healthy habits. Create small, actionable challenges that can be completed in 5-15 minutes. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      const challengeData = {
        userId,
        habitId: result.habitId || null,
        type: 'challenge' as const,
        title: result.title || 'Daily Challenge',
        message: result.message || 'Try this simple challenge today!',
        actionLabel: result.actionLabel || 'Complete Challenge'
      };

      return await storage.createAiNudge(challengeData);
    } catch (error) {
      console.error('AI challenge generation error:', error);
      return null;
    }
  }

  async generateMotivationalMessage(userId: string, habitId?: string): Promise<AiNudge | null> {
    try {
      const context = await this.getUserContext(userId);
      const targetHabit = habitId ? context.habits.find(h => h.id === habitId) : null;
      
      const prompt = this.buildMotivationPrompt(context, targetHabit);
      
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a supportive AI coach that provides encouraging and personalized motivational messages. Be warm, understanding, and inspiring while keeping messages concise. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      const motivationData = {
        userId,
        habitId: habitId || null,
        type: 'motivation' as const,
        title: result.title || 'You\'re doing great!',
        message: result.message || 'Keep up the excellent work on your habits!',
        actionLabel: result.actionLabel || null
      };

      return await storage.createAiNudge(motivationData);
    } catch (error) {
      console.error('AI motivation generation error:', error);
      return null;
    }
  }

  async generateHabitSuggestions(userId: string, category?: string): Promise<string[]> {
    try {
      const context = await this.getUserContext(userId);
      
      const prompt = `Based on the user's existing habits and patterns, suggest 5 new healthy habits they could adopt.

Current habits:
${context.habits.map(h => `- ${h.name} (${h.category})`).join('\n')}

${category ? `Focus on ${category} category.` : ''}

Provide suggestions that complement their existing habits and are realistic to maintain. Each suggestion should be specific and actionable.

Respond with JSON: { "suggestions": ["habit1", "habit2", "habit3", "habit4", "habit5"] }`;

      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are a wellness expert that suggests personalized habits based on user patterns. Provide specific, actionable habit suggestions. Respond with JSON in the exact format requested."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.suggestions || [];
    } catch (error) {
      console.error('AI habit suggestions error:', error);
      return [];
    }
  }

  private async getUserContext(userId: string): Promise<UserContext> {
    const habits = await storage.getUserHabits(userId);
    const today = new Date().toISOString().split('T')[0];
    const todaysEntries = await storage.getUserHabitEntriesForDate(userId, today);
    
    // Get recent entries for all habits
    const recentEntries: HabitEntry[] = [];
    const streaks: { [habitId: string]: number } = {};
    const completionRates: { [habitId: string]: number } = {};

    for (const habit of habits) {
      const entries = await storage.getHabitEntries(habit.id, userId, 30);
      recentEntries.push(...entries);
      
      streaks[habit.id] = await storage.calculateHabitStreak(habit.id, userId);
      
      const completedEntries = entries.filter(e => e.completed);
      completionRates[habit.id] = entries.length > 0 
        ? Math.round((completedEntries.length / entries.length) * 100) 
        : 0;
    }

    return {
      habits,
      recentEntries,
      streaks,
      completionRates,
      todaysCompletions: todaysEntries.filter(e => e.completed).length,
      totalHabits: habits.length
    };
  }

  private buildNudgePrompt(context: UserContext): string {
    const strugglingHabits = context.habits.filter(h => 
      (context.completionRates[h.id] || 0) < 70 || (context.streaks[h.id] || 0) < 3
    );
    
    const successfulHabits = context.habits.filter(h => 
      (context.completionRates[h.id] || 0) >= 80 && (context.streaks[h.id] || 0) >= 7
    );

    return `Generate a personalized nudge for a user working on habit building.

User's habits and performance:
${context.habits.map(h => `- ${h.name} (${h.category}): ${context.streaks[h.id] || 0} day streak, ${context.completionRates[h.id] || 0}% completion rate`).join('\n')}

Today's progress: ${context.todaysCompletions}/${context.totalHabits} habits completed

${strugglingHabits.length > 0 ? `Struggling habits: ${strugglingHabits.map(h => h.name).join(', ')}` : ''}
${successfulHabits.length > 0 ? `Successful habits: ${successfulHabits.map(h => h.name).join(', ')}` : ''}

Generate an appropriate nudge type (motivation, reminder, tip, or challenge) with a personalized message that addresses their current situation. If focusing on a specific habit, include the habitId.

Respond with JSON: {
  "type": "motivation|reminder|tip|challenge",
  "title": "engaging title",
  "message": "personalized message (2-3 sentences)",
  "habitId": "habit_id_or_null",
  "actionLabel": "action_button_text_or_null"
}`;
  }

  private buildChallengePrompt(context: UserContext): string {
    return `Create a micro-challenge for a habit-building user.

User's current habits:
${context.habits.map(h => `- ${h.name} (${h.category})`).join('\n')}

Today's completion: ${context.todaysCompletions}/${context.totalHabits}

Create a small, achievable challenge (5-15 minutes) that either:
1. Supports an existing habit
2. Introduces a complementary wellness practice
3. Helps overcome a common habit-building obstacle

Make it specific, actionable, and engaging.

Respond with JSON: {
  "title": "challenge title",
  "message": "clear challenge description and why it helps",
  "habitId": "related_habit_id_or_null", 
  "actionLabel": "Complete Challenge"
}`;
  }

  private buildMotivationPrompt(context: UserContext, targetHabit?: Habit | null): string {
    if (targetHabit) {
      const streak = context.streaks[targetHabit.id] || 0;
      const completionRate = context.completionRates[targetHabit.id] || 0;
      
      return `Generate a motivational message for a specific habit.

Habit: ${targetHabit.name} (${targetHabit.category})
Current streak: ${streak} days
Completion rate: ${completionRate}%

Create an encouraging message that acknowledges their progress and motivates them to continue. Be specific to their habit and performance.

Respond with JSON: {
  "title": "motivational title",
  "message": "encouraging message (2-3 sentences)",
  "actionLabel": "optional_action_text_or_null"
}`;
    }

    return `Generate a general motivational message for a user's habit journey.

Overall progress: ${context.todaysCompletions}/${context.totalHabits} habits completed today
Active habits: ${context.habits.length}
Strongest habits: ${context.habits.filter(h => (context.streaks[h.id] || 0) > 7).map(h => h.name).join(', ') || 'Building momentum'}

Create an encouraging message about their overall progress and habit-building journey.

Respond with JSON: {
  "title": "motivational title", 
  "message": "encouraging message about their journey (2-3 sentences)",
  "actionLabel": null
}`;
  }
}

export const aiService = new AiService();