import StatsCard from '../StatsCard';
import { Target } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <StatsCard
      title="Current Streak"
      value={12}
      subtitle="days"
      icon={Target}
      trend={{ value: 15, isPositive: true }}
      color="text-orange-600"
    />
  );
}