import HabitForm from '../HabitForm';

export default function HabitFormExample() {
  return (
    <HabitForm
      onSubmit={(habit) => console.log('New habit:', habit)}
      onCancel={() => console.log('Form cancelled')}
      isOpen={true}
    />
  );
}