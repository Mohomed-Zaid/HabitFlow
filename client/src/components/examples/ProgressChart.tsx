import ProgressChart from '../ProgressChart';

export default function ProgressChartExample() {
  const sampleData = [
    { date: "Mon", completed: 3, total: 4, percentage: 75 },
    { date: "Tue", completed: 4, total: 4, percentage: 100 },
    { date: "Wed", completed: 2, total: 4, percentage: 50 },
    { date: "Thu", completed: 4, total: 4, percentage: 100 },
    { date: "Fri", completed: 3, total: 4, percentage: 75 },
    { date: "Sat", completed: 4, total: 4, percentage: 100 },
    { date: "Sun", completed: 3, total: 4, percentage: 75 }
  ];

  return (
    <ProgressChart 
      data={sampleData}
      title="Weekly Progress"
      type="line"
    />
  );
}