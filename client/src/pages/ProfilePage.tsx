import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Target, Flame, Trophy, Bell, Moon, Smartphone } from "lucide-react";

// todo: remove mock functionality
const achievements = [
  { id: 1, title: "First Week", description: "Complete 7 days of any habit", icon: "🎯", earned: true },
  { id: 2, title: "Hydration Hero", description: "30-day water drinking streak", icon: "💧", earned: true },
  { id: 3, title: "Knowledge Seeker", description: "Read for 21 consecutive days", icon: "📚", earned: false },
  { id: 4, title: "Zen Master", description: "50-day meditation streak", icon: "🧘", earned: false }
];

// todo: remove mock functionality
const userStats = {
  totalHabits: 12,
  activeHabits: 4,
  longestStreak: 15,
  totalDays: 45,
  successRate: 84
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-20" data-testid="page-profile">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
              Profile
            </h1>
          </div>
        </div>

        {/* User Info */}
        <Card className="hover-elevate" data-testid="card-user-info">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16" data-testid="avatar-user">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-user-name">
                  Jane Doe
                </h2>
                <p className="text-sm text-muted-foreground" data-testid="text-user-subtitle">
                  Habit Builder since March 2024
                </p>
                <Badge variant="secondary" data-testid="badge-user-level">
                  Level 3 • Dedicated
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Card className="hover-elevate" data-testid="card-stats-overview">
          <CardHeader>
            <CardTitle className="text-lg">Your Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                <Target className="h-6 w-6 text-primary mx-auto" />
                <p className="text-2xl font-bold text-foreground" data-testid="text-stat-active-habits">
                  {userStats.activeHabits}
                </p>
                <p className="text-xs text-muted-foreground">Active Habits</p>
              </div>
              <div className="text-center space-y-1">
                <Flame className="h-6 w-6 text-orange-600 mx-auto" />
                <p className="text-2xl font-bold text-foreground" data-testid="text-stat-longest-streak">
                  {userStats.longestStreak}
                </p>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </div>
              <div className="text-center space-y-1">
                <Trophy className="h-6 w-6 text-yellow-600 mx-auto" />
                <p className="text-2xl font-bold text-foreground" data-testid="text-stat-success-rate">
                  {userStats.successRate}%
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
              <div className="text-center space-y-1">
                <User className="h-6 w-6 text-green-600 mx-auto" />
                <p className="text-2xl font-bold text-foreground" data-testid="text-stat-total-days">
                  {userStats.totalDays}
                </p>
                <p className="text-xs text-muted-foreground">Total Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="hover-elevate" data-testid="card-achievements">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  achievement.earned 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-muted/30 border-muted'
                }`}
                data-testid={`achievement-${achievement.id}`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1 space-y-1">
                  <h4 className={`font-medium ${
                    achievement.earned ? 'text-foreground' : 'text-muted-foreground'
                  }`} data-testid={`text-achievement-title-${achievement.id}`}>
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-muted-foreground" data-testid={`text-achievement-description-${achievement.id}`}>
                    {achievement.description}
                  </p>
                </div>
                {achievement.earned && (
                  <Badge variant="default" data-testid={`badge-earned-${achievement.id}`}>
                    Earned
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="hover-elevate" data-testid="card-settings">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" data-testid="button-notifications">
              <Bell className="h-4 w-4 mr-3" />
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-app-preferences">
              <Smartphone className="h-4 w-4 mr-3" />
              App Preferences
            </Button>
            <Button variant="ghost" className="w-full justify-start" data-testid="button-account">
              <User className="h-4 w-4 mr-3" />
              Account Settings
            </Button>
          </CardContent>
        </Card>

        {/* AI Coaching */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 hover-elevate" data-testid="card-ai-coaching">
          <CardHeader>
            <CardTitle className="text-lg">AI Coaching Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground" data-testid="text-ai-insight">
              Based on your progress, you're most consistent with morning habits. 
              Consider adding a new evening routine to balance your day.
            </p>
            <Button variant="outline" size="sm" className="w-full" data-testid="button-get-recommendations">
              Get Personalized Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}