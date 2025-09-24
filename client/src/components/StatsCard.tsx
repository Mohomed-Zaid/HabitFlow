import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  color = "text-primary" 
}: StatsCardProps) {
  return (
    <Card className="hover-elevate" data-testid={`card-stats-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground" data-testid="text-stats-title">
              {title}
            </p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground" data-testid="text-stats-value">
                {value}
              </p>
              {subtitle && (
                <p className="text-sm text-muted-foreground" data-testid="text-stats-subtitle">
                  {subtitle}
                </p>
              )}
              {trend && (
                <p className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`} data-testid="text-stats-trend">
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </p>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full bg-primary/10 ${color}`}>
            <Icon className="h-6 w-6" data-testid="icon-stats" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}