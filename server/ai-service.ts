import OpenAI from "openai";
import { storage } from "./storage";
import type { Habit, HabitEntry, AiNudge } from "@shared/schema";

// Check for API key at startup
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OpenAI API key not found. AI features will return mock responses.');
}

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

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

      // If no OpenAI API key, use mock response
      if (!openai) {
        return await this.generateMockNudge(userId, context);
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

      const rawContent = response.choices[0].message.content;
      if (!rawContent) {
        throw new Error('Empty response from OpenAI');
      }

      let result;
      try {
        result = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI JSON response:', rawContent);
        throw new Error('Invalid JSON response from OpenAI');
      }
      
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
      // Fallback to mock nudge on error
      const context = await this.getUserContext(userId);
      return await this.generateMockNudge(userId, context);
    }
  }

  async generateDailyMicroChallenge(userId: string): Promise<AiNudge | null> {
    try {
      const context = await this.getUserContext(userId);
      
      if (context.habits.length === 0) {
        return null;
      }

      // If no OpenAI API key, use mock response
      if (!openai) {
        return await this.generateMockChallenge(userId, context);
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

      const rawContent = response.choices[0].message.content;
      if (!rawContent) {
        throw new Error('Empty response from OpenAI');
      }

      let result;
      try {
        result = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI JSON response:', rawContent);
        throw new Error('Invalid JSON response from OpenAI');
      }
      
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
      const context = await this.getUserContext(userId);
      return await this.generateMockChallenge(userId, context);
    }
  }

  async generateMotivationalMessage(userId: string, habitId?: string): Promise<AiNudge | null> {
    try {
      const context = await this.getUserContext(userId);
      const targetHabit = habitId ? context.habits.find(h => h.id === habitId) : null;
      
      // If no OpenAI API key, use mock response
      if (!openai) {
        return await this.generateMockMotivation(userId, context, targetHabit);
      }
      
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

      const rawContent = response.choices[0].message.content;
      if (!rawContent) {
        throw new Error('Empty response from OpenAI');
      }

      let result;
      try {
        result = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI JSON response:', rawContent);
        throw new Error('Invalid JSON response from OpenAI');
      }
      
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
      const context = await this.getUserContext(userId);
      const targetHabit = habitId ? context.habits.find(h => h.id === habitId) : null;
      return await this.generateMockMotivation(userId, context, targetHabit);
    }
  }

  async generateHabitSuggestions(userId: string, category?: string): Promise<string[]> {
    try {
      const context = await this.getUserContext(userId);
      
      // If no OpenAI API key, use mock suggestions
      if (!openai) {
        return this.getMockHabitSuggestions(category);
      }
      
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

      const rawContent = response.choices[0].message.content;
      if (!rawContent) {
        throw new Error('Empty response from OpenAI');
      }

      let result;
      try {
        result = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('Failed to parse OpenAI JSON response:', rawContent);
        throw new Error('Invalid JSON response from OpenAI');
      }
      
      return result.suggestions || [];
    } catch (error) {
      console.error('AI habit suggestions error:', error);
      return this.getMockHabitSuggestions(category);
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

  // Mock methods for when OpenAI API is not available
  private async generateMockNudge(userId: string, context: UserContext): Promise<AiNudge> {
    const mockNudges = [
      {
        type: 'motivation' as const,
        title: 'You\'re building momentum!',
        message: 'Every small step counts. Keep up the great work with your daily habits.',
        habitId: null,
        actionLabel: null
      },
      {
        type: 'reminder' as const,
        title: 'Don\'t forget your habits today',
        message: 'Take a moment to check in with your habits. Consistency is key to lasting change.',
        habitId: null,
        actionLabel: 'Check Habits'
      },
      {
        type: 'tip' as const,
        title: 'Pro Tip: Stack your habits',
        message: 'Try linking new habits to existing routines. After you brush your teeth, do 5 minutes of meditation.',
        habitId: null,
        actionLabel: null
      }
    ];

    const randomNudge = mockNudges[Math.floor(Math.random() * mockNudges.length)];
    
    return await storage.createAiNudge({
      userId,
      ...randomNudge
    });
  }

  private async generateMockChallenge(userId: string, context: UserContext): Promise<AiNudge> {
    const mockChallenges = [
      {
        title: '5-Minute Energy Boost',
        message: 'Take 5 deep breaths and do 10 jumping jacks to energize your day.',
        actionLabel: 'Complete Challenge'
      },
      {
        title: 'Gratitude Moment',
        message: 'Write down 3 things you\'re grateful for today. Focus on small, everyday moments.',
        actionLabel: 'Complete Challenge'
      },
      {
        title: 'Hydration Check',
        message: 'Drink a full glass of water and notice how refreshed you feel afterwards.',
        actionLabel: 'Complete Challenge'
      },
      {
        title: 'Mindful Minute',
        message: 'Spend 60 seconds focusing only on your breathing. Let thoughts pass without judgment.',
        actionLabel: 'Complete Challenge'
      }
    ];

    const randomChallenge = mockChallenges[Math.floor(Math.random() * mockChallenges.length)];
    
    return await storage.createAiNudge({
      userId,
      habitId: null,
      type: 'challenge',
      ...randomChallenge
    });
  }

  private async generateMockMotivation(userId: string, context: UserContext, targetHabit?: Habit | null): Promise<AiNudge> {
    if (targetHabit) {
      const streak = context.streaks[targetHabit.id] || 0;
      
      return await storage.createAiNudge({
        userId,
        habitId: targetHabit.id,
        type: 'motivation',
        title: `${targetHabit.name} Progress`,
        message: streak > 0 
          ? `Great job on your ${streak}-day streak with ${targetHabit.name}! You're building lasting change.`
          : `Every expert was once a beginner. Start your ${targetHabit.name} journey today!`,
        actionLabel: null
      });
    }

    return await storage.createAiNudge({
      userId,
      habitId: null,
      type: 'motivation',
      title: 'Your Habit Journey',
      message: `You've completed ${context.todaysCompletions} out of ${context.totalHabits} habits today. Progress, not perfection!`,
      actionLabel: null
    });
  }

  private getMockHabitSuggestions(category?: string): string[] {
    const suggestions = {
      fitness: [
        'Take the stairs instead of the elevator',
        '10 pushups every morning',
        'Walk for 15 minutes after lunch',
        'Stretch for 5 minutes before bed',
        'Do desk exercises every 2 hours'
      ],
      nutrition: [
        'Eat a piece of fruit with breakfast',
        'Drink a glass of water before each meal',
        'Pack a healthy snack for work',
        'Eat vegetables with dinner',
        'Take a daily vitamin'
      ],
      mindfulness: [
        'Practice 5 minutes of deep breathing',
        'Write one sentence in a gratitude journal',
        'Meditate for 10 minutes',
        'Practice mindful eating for one meal',
        'Do a body scan before sleep'
      ],
      productivity: [
        'Make your bed every morning',
        'Plan your top 3 priorities each day',
        'Clear your desk at the end of workday',
        'Review your day in the evening',
        'Prepare tomorrow\'s clothes the night before'
      ],
      sleep: [
        'Set a consistent bedtime',
        'Turn off screens 1 hour before bed',
        'Read for 15 minutes before sleep',
        'Keep a sleep diary',
        'Avoid caffeine after 2 PM'
      ]
    };

    if (category && suggestions[category as keyof typeof suggestions]) {
      return suggestions[category as keyof typeof suggestions];
    }

    // Return a mix if no specific category or category not found
    return [
      'Drink 8 glasses of water daily',
      'Take a 10-minute walk after meals',
      'Write down 3 goals each morning',
      'Practice gratitude before bed',
      'Spend 5 minutes organizing your space'
    ];
  }
}

export const aiService = new AiService();