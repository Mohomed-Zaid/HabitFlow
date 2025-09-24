import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface HabitFormData {
  name: string;
  description: string;
  category: string;
  targetDays: number;
}

interface HabitFormProps {
  onSubmit: (habit: HabitFormData) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

const categories = [
  "Health & Fitness",
  "Productivity", 
  "Learning",
  "Mindfulness",
  "Social",
  "Creative",
  "Other"
];

export default function HabitForm({ onSubmit, onCancel, isOpen = true }: HabitFormProps) {
  const [formData, setFormData] = useState<HabitFormData>({
    name: "",
    description: "",
    category: "",
    targetDays: 30
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.category) {
      onSubmit(formData);
      console.log('New habit created:', formData);
      setFormData({ name: "", description: "", category: "", targetDays: 30 });
    }
  };

  const handleCancel = () => {
    setFormData({ name: "", description: "", category: "", targetDays: 30 });
    onCancel?.();
    console.log('Habit form cancelled');
  };

  if (!isOpen) return null;

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="card-habit-form">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold" data-testid="text-form-title">
          Create New Habit
        </CardTitle>
        {onCancel && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            data-testid="button-cancel-form"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" data-testid="label-habit-name">
              Habit Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Drink 8 glasses of water"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              data-testid="input-habit-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" data-testid="label-habit-description">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Why is this habit important to you?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              data-testid="textarea-habit-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" data-testid="label-habit-category">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger data-testid="select-habit-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDays" data-testid="label-target-days">
              Target Days
            </Label>
            <Input
              id="targetDays"
              type="number"
              min="1"
              max="365"
              value={formData.targetDays}
              onChange={(e) => setFormData(prev => ({ ...prev, targetDays: parseInt(e.target.value) || 30 }))}
              data-testid="input-target-days"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" data-testid="button-create-habit">
              <Plus className="h-4 w-4 mr-2" />
              Create Habit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}