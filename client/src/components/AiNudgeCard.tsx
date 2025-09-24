import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Check } from "lucide-react";

export interface AiNudge {
  id: string;
  type: "motivation" | "reminder" | "challenge" | "tip";
  title: string;
  message: string;
  habitName?: string;
  actionLabel?: string;
  timestamp: Date;
}

interface AiNudgeCardProps {
  nudge: AiNudge;
  onAction?: (id: string, action: "accept" | "dismiss") => void;
}

const nudgeTypeColors = {
  motivation: "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20",
  reminder: "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 dark:from-orange-950/30 dark:to-yellow-950/30 dark:border-orange-800/30",
  challenge: "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-800/30",
  tip: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 dark:from-blue-950/30 dark:to-cyan-950/30 dark:border-blue-800/30"
};

const nudgeTypeIcons = {
  motivation: "💪",
  reminder: "⏰", 
  challenge: "🎯",
  tip: "💡"
};

export default function AiNudgeCard({ nudge, onAction }: AiNudgeCardProps) {
  const handleAction = (action: "accept" | "dismiss") => {
    onAction?.(nudge.id, action);
    console.log(`AI nudge ${action}ed: ${nudge.title}`);
  };

  return (
    <Card 
      className={`${nudgeTypeColors[nudge.type]} hover-elevate`}
      data-testid={`card-nudge-${nudge.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <Badge 
                variant="secondary" 
                className="text-xs capitalize"
                data-testid={`badge-nudge-type-${nudge.id}`}
              >
                {nudgeTypeIcons[nudge.type]} {nudge.type}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAction("dismiss")}
            className="h-6 w-6"
            data-testid={`button-dismiss-${nudge.id}`}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-foreground" data-testid={`text-nudge-title-${nudge.id}`}>
            {nudge.title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-nudge-message-${nudge.id}`}>
            {nudge.message}
          </p>
          {nudge.habitName && (
            <Badge variant="outline" className="text-xs" data-testid={`badge-habit-name-${nudge.id}`}>
              {nudge.habitName}
            </Badge>
          )}
        </div>

        {nudge.actionLabel && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() => handleAction("accept")}
              className="flex-1"
              data-testid={`button-accept-${nudge.id}`}
            >
              <Check className="h-3 w-3 mr-1" />
              {nudge.actionLabel}
            </Button>
          </div>
        )}

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/40">
          <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${nudge.id}`}>
            {nudge.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}