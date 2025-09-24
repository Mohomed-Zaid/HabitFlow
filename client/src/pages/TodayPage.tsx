import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HabitCard from "@/components/HabitCard";
import { Calendar, CheckCircle2, Clock, Target } from "lucide-react";

// todo: remove mock functionality
const mockTodayHabits = [
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
  },
  {
    id: "4",
    name: "Take evening walk",
    description: "Get some fresh air and light exercise",
    category: "Health & Fitness",
    streak: 3,
    completed: false,
    completionRate: 65,
    targetDays: 30,
    color: "#10b981"
  }
];

export default function TodayPage() {
  const [habits, setHabits] = useState(mockTodayHabits);

  const handleToggleHabit = (id: string, completed: boolean) => {
    setHabits(prev => prev.map(habit => 
      habit.id === id ? { ...habit, completed } : habit
    ));
  };

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background pb-20" data-testid="page-today">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
              Today's Focus
            </h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            {new Date().toLocaleDateString([], { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="hover-elevate" data-testid="card-progress-overview">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground" data-testid="text-progress-title">
                  Daily Progress
                </h3>
                <Badge 
                  variant={completionPercentage >= 75 ? "default" : "secondary"}
                  data-testid="badge-completion-percentage"
                >
                  {completionPercentage}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto" />
                  <p className="text-sm font-medium text-foreground" data-testid="text-completed-count">
                    {completedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center space-y-1">
                  <Clock className="h-6 w-6 text-orange-600 mx-auto" />
                  <p className="text-sm font-medium text-foreground" data-testid="text-remaining-count">
                    {totalCount - completedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                </div>
                <div className="text-center space-y-1">
                  <Target className="h-6 w-6 text-primary mx-auto" />
                  <p className="text-sm font-medium text-foreground" data-testid="text-total-count">
                    {totalCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Habits List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-habits-section-title">
            Today's Habits
          </h2>
          
          {/* Pending Habits */}
          {habits.filter(h => !h.completed).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground" data-testid="text-pending-habits">
                Pending ({habits.filter(h => !h.completed).length})
              </h3>
              {habits.filter(h => !h.completed).map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleComplete={handleToggleHabit}
                  onMenuAction={(id, action) => console.log(`Menu action: ${action} for habit: ${id}`)}
                />
              ))}
            </div>
          )}

          {/* Completed Habits */}
          {habits.filter(h => h.completed).length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground" data-testid="text-completed-habits">
                Completed ({habits.filter(h => h.completed).length})
              </h3>
              {habits.filter(h => h.completed).map(habit => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleComplete={handleToggleHabit}
                  onMenuAction={(id, action) => console.log(`Menu action: ${action} for habit: ${id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Motivational Message */}
        {completionPercentage === 100 && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover-elevate" data-testid="card-celebration">
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <div className="text-4xl">🎉</div>
                <h3 className="font-semibold text-foreground" data-testid="text-celebration-title">
                  Amazing work!
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-celebration-message">
                  You've completed all your habits for today. Keep up the great momentum!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}