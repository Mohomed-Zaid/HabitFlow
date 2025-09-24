import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ProgressData {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title: string;
  type?: "line" | "bar";
}

export default function ProgressChart({ data, title, type = "line" }: ProgressChartProps) {
  const renderChart = () => {
    if (type === "bar") {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            fontSize={12}
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-muted-foreground">
                      Completed: {payload[0].payload.completed}/{payload[0].payload.total}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {payload[0].value}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="percentage" 
            fill="hsl(var(--primary))"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      );
    }

    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="date" 
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          fontSize={12}
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
          domain={[0, 100]}
        />
        <Tooltip 
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    Completed: {payload[0].payload.completed}/{payload[0].payload.total}
                  </p>
                  <p className="text-sm text-primary font-medium">
                    {payload[0].value}%
                  </p>
                </div>
              );
            }
            return null;
          }}
        />
        <Line 
          type="monotone" 
          dataKey="percentage" 
          stroke="hsl(var(--primary))" 
          strokeWidth={3}
          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    );
  };

  return (
    <Card data-testid="card-progress-chart">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg" data-testid="text-chart-title">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64" data-testid="container-chart">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}