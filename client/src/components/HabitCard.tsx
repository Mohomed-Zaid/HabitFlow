import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MoreHorizontal, Target, Flame, Calendar } from "lucide-react";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  streak: number;
  completed: boolean;
  completionRate: number;
  targetDays: number;
  color: string;
}

interface HabitCardProps {
  habit: Habit;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onMenuAction?: (id: string, action: string) => void;
}

export default function HabitCard({ habit, onToggleComplete, onMenuAction }: HabitCardProps) {
  const [isCompleted, setIsCompleted] = useState(habit.completed);

  const handleToggleComplete = () => {
    const newCompleted = !isCompleted;
    setIsCompleted(newCompleted);
    onToggleComplete?.(habit.id, newCompleted);
    console.log(`Habit ${habit.name} marked as ${newCompleted ? 'completed' : 'incomplete'}`);
  };

  const handleMenuClick = () => {
    onMenuAction?.(habit.id, 'menu');
    console.log(`Menu clicked for habit: ${habit.name}`);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-habit-${habit.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
              className="mt-1"
              data-testid={`checkbox-habit-${habit.id}`}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground mb-1" data-testid={`text-habit-name-${habit.id}`}>
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-sm text-muted-foreground mb-2" data-testid={`text-habit-description-${habit.id}`}>
                  {habit.description}
                </p>
              )}
              <Badge variant="secondary" className="text-xs" data-testid={`badge-category-${habit.id}`}>
                {habit.category}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMenuClick}
            data-testid={`button-menu-${habit.id}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-orange-600">
                <Flame className="h-4 w-4" />
                <span className="font-medium" data-testid={`text-streak-${habit.id}`}>
                  {habit.streak} day streak
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span data-testid={`text-target-${habit.id}`}>
                  {habit.targetDays} days
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium" data-testid={`text-progress-${habit.id}`}>
                {habit.completionRate}%
              </span>
            </div>
            <Progress 
              value={habit.completionRate} 
              className="h-2" 
              data-testid={`progress-habit-${habit.id}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}