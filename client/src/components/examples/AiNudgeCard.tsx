import AiNudgeCard from '../AiNudgeCard';

export default function AiNudgeCardExample() {
  const sampleNudge = {
    id: "1",
    type: "motivation" as const,
    title: "Great job on your streak!",
    message: "You've completed your water drinking habit for 7 days straight. Keep up the amazing work! Small consistent actions lead to big results.",
    habitName: "Drink 8 glasses of water",
    actionLabel: "Continue Streak",
    timestamp: new Date()
  };

  return (
    <AiNudgeCard 
      nudge={sampleNudge}
      onAction={(id, action) => console.log(`Nudge ${id} ${action}ed`)}
    />
  );
}