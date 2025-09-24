import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import HomePage from "@/pages/HomePage";
import TodayPage from "@/pages/TodayPage";
import ProgressPage from "@/pages/ProgressPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/BottomNavigation";
import HabitForm from "@/components/HabitForm";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/today" component={TodayPage} />
      <Route path="/progress" component={ProgressPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showHabitForm, setShowHabitForm] = useState(false);

  const handleNewHabit = () => {
    setShowHabitForm(true);
  };

  const handleHabitFormSubmit = (habitData: any) => {
    console.log('New habit created:', habitData);
    setShowHabitForm(false);
    // todo: remove mock functionality - integrate with backend
  };

  const handleHabitFormCancel = () => {
    setShowHabitForm(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <div className="min-h-screen bg-background">
            <Router />
            <BottomNavigation onNewHabit={handleNewHabit} />
            
            {/* Modal overlay for habit form */}
            {showHabitForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="modal-habit-form">
                <HabitForm
                  onSubmit={handleHabitFormSubmit}
                  onCancel={handleHabitFormCancel}
                  isOpen={showHabitForm}
                />
              </div>
            )}
          </div>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
