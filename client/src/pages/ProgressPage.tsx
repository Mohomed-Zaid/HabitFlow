import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressChart from "@/components/ProgressChart";
import StatsCard from "@/components/StatsCard";
import { BarChart3, TrendingUp, Calendar, Flame, Target, Trophy } from "lucide-react";

// todo: remove mock functionality
const weeklyData = [
  { date: "Mon", completed: 3, total: 4, percentage: 75 },
  { date: "Tue", completed: 4, total: 4, percentage: 100 },
  { date: "Wed", completed: 2, total: 4, percentage: 50 },
  { date: "Thu", completed: 4, total: 4, percentage: 100 },
  { date: "Fri", completed: 3, total: 4, percentage: 75 },
  { date: "Sat", completed: 4, total: 4, percentage: 100 },
  { date: "Sun", completed: 3, total: 4, percentage: 75 }
];

// todo: remove mock functionality
const monthlyData = [
  { date: "Week 1", completed: 22, total: 28, percentage: 79 },
  { date: "Week 2", completed: 26, total: 28, percentage: 93 },
  { date: "Week 3", completed: 24, total: 28, percentage: 86 },
  { date: "Week 4", completed: 27, total: 28, percentage: 96 }
];

// todo: remove mock functionality  
const habitStats = [
  { name: "Drink Water", streak: 12, completion: 85 },
  { name: "Reading", streak: 8, completion: 92 },
  { name: "Meditation", streak: 15, completion: 88 },
  { name: "Exercise", streak: 5, completion: 71 }
];

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-background pb-20" data-testid="page-progress">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
              Progress Analytics
            </h1>
          </div>
          <p className="text-muted-foreground" data-testid="text-page-subtitle">
            Track your habit-building journey
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="Overall Score"
            value="84%"
            subtitle="this month"
            icon={Trophy}
            trend={{ value: 8, isPositive: true }}
            color="text-yellow-600"
          />
          <StatsCard
            title="Best Streak"
            value={15}
            subtitle="days"
            icon={Flame}
            color="text-orange-600"
          />
          <StatsCard
            title="Active Habits"
            value={4}
            subtitle="tracking"
            icon={Target}
            color="text-primary"
          />
          <StatsCard
            title="This Week"
            value="86%"
            subtitle="completion"
            icon={TrendingUp}
            trend={{ value: 12, isPositive: true }}
            color="text-green-600"
          />
        </div>

        {/* Charts */}
        <div className="space-y-4">
          <ProgressChart
            data={weeklyData}
            title="Weekly Progress"
            type="line"
          />
          
          <ProgressChart
            data={monthlyData}
            title="Monthly Overview"
            type="bar"
          />
        </div>

        {/* Habit Breakdown */}
        <Card className="hover-elevate" data-testid="card-habit-breakdown">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Habit Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habitStats.map((habit, index) => (
              <div key={index} className="space-y-2" data-testid={`habit-stat-${index}`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-foreground" data-testid={`text-habit-name-${index}`}>
                      {habit.name}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-orange-600" />
                        {habit.streak} days
                      </span>
                      <span>{habit.completion}% complete</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={habit.completion >= 80 ? "default" : "secondary"}
                      data-testid={`badge-completion-${index}`}
                    >
                      {habit.completion}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${habit.completion}%` }}
                    data-testid={`progress-bar-${index}`}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover-elevate" data-testid="card-insights">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-foreground" data-testid="text-insight-title">
                Your best performance day
              </h4>
              <p className="text-sm text-muted-foreground" data-testid="text-insight-content">
                Tuesdays show your highest completion rate at 95%. Consider scheduling challenging habits on this day.
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full" data-testid="button-more-insights">
              View More Insights
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}