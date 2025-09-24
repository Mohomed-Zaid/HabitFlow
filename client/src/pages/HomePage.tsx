import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HabitCard from "@/components/HabitCard";
import AiNudgeCard from "@/components/AiNudgeCard";
import StatsCard from "@/components/StatsCard";
import ThemeToggle from "@/components/ThemeToggle";
import { Target, Flame, Trophy, TrendingUp, Bell, Sparkles } from "lucide-react";

// todo: remove mock functionality
const mockHabits = [
  {
    id: "1",
    name: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day",
    category: "Health & Fitness",
    streak: 7,
    completed: false,
    completionRate: 78,
    targetDays: 30,
    color: "#10b981"
  },
  {
    id: "2", 
    name: "Read for 30 minutes",
    description: "Expand knowledge and vocabulary",
    category: "Learning",
    streak: 12,
    completed: true,
    completionRate: 85,
    targetDays: 30,
    color: "#8b5cf6"
  },
  {
    id: "3",
    name: "10 minute morning meditation",
    description: "Start the day with mindfulness",
    category: "Mindfulness",
    streak: 5,
    completed: true,
    completionRate: 92,
    targetDays: 21,
    color: "#06b6d4"
  }
];

// todo: remove mock functionality
const mockNudges = [
  {
    id: "1",
    type: "motivation" as const,
    title: "You're doing amazing!",
    message: "7-day streak on water intake! Your body thanks you for staying hydrated. Ready to make it 8?",
    habitName: "Drink 8 glasses of water",
    actionLabel: "Track Today",
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: "2",
    type: "challenge" as const,
    title: "Micro-challenge: Mindful Breathing",
    message: "Take 3 deep breaths right now. Focus on the sensation of air entering and leaving your lungs.",
    actionLabel: "Complete Challenge",
    timestamp: new Date(Date.now() - 60 * 60 * 1000)
  }
];

export default function HomePage() {
  const [habits, setHabits] = useState(mockHabits);
  const [nudges, setNudges] = useState(mockNudges);

  const handleToggleHabit = (id: string, completed: boolean) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, completed } : habit
    ));
  };

  const handleNudgeAction = (id: string, action: "accept" | "dismiss") => {
    setNudges(prev => prev.filter(nudge => nudge.id !== id));
  };

  const completedToday = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const overallStreak = Math.max(...habits.map(h => h.streak));

  return (
    <div className="min-h-screen bg-background pb-20" data-testid="page-home">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground" data-testid="text-app-title">
                HabitFlow
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="text-date">
                {new Date().toLocaleDateString([], { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Daily Overview */}
        <div className="grid grid-cols-3 gap-3">
          <StatsCard
            title="Today"
            value={`${completedToday}/${totalHabits}`}
            subtitle="completed"
            icon={Target}
            color="text-primary"
          />
          <StatsCard
            title="Best Streak"
            value={overallStreak}
            subtitle="days"
            icon={Flame}
            color="text-orange-600"
          />
          <StatsCard
            title="Success Rate"
            value="84%"
            subtitle="this week"
            icon={Trophy}
            trend={{ value: 12, isPositive: true }}
            color="text-yellow-600"
          />
        </div>

        {/* AI Nudges */}
        {nudges.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground" data-testid="text-nudges-title">
                AI Insights
              </h2>
            </div>
            {nudges.map(nudge => (
              <AiNudgeCard
                key={nudge.id}
                nudge={nudge}
                onAction={handleNudgeAction}
              />
            ))}
          </div>
        )}

        {/* Today's Habits */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground" data-testid="text-habits-title">
              Today's Habits
            </h2>
            <Badge variant="secondary" data-testid="badge-habits-count">
              {completedToday}/{totalHabits} complete
            </Badge>
          </div>
          
          <div className="space-y-3">
            {habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleComplete={handleToggleHabit}
                onMenuAction={(id, action) => console.log(`Menu action: ${action} for habit: ${id}`)}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="hover-elevate" data-testid="card-quick-actions">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-view-progress">
              View detailed progress
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" data-testid="button-ai-recommendations">
              Get AI recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}