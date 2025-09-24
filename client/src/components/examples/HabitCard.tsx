import HabitCard from '../HabitCard';

export default function HabitCardExample() {
  const sampleHabit = {
    id: "1",
    name: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day for better health",
    category: "Health & Fitness",
    streak: 7,
    completed: false,
    completionRate: 78,
    targetDays: 30,
    color: "#10b981"
  };

  return (
    <HabitCard 
      habit={sampleHabit}
      onToggleComplete={(id, completed) => console.log(`Habit ${id} ${completed ? 'completed' : 'uncompleted'}`)}
      onMenuAction={(id, action) => console.log(`Menu action ${action} for habit ${id}`)}
    />
  );
}