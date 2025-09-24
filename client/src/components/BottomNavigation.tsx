import { Button } from "@/components/ui/button";
import { Home, Calendar, BarChart3, User, Plus } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavigationProps {
  onNewHabit?: () => void;
}

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/today", icon: Calendar, label: "Today" },
  { path: "/progress", icon: BarChart3, label: "Progress" },
  { path: "/profile", icon: User, label: "Profile" }
];

export default function BottomNavigation({ onNewHabit }: BottomNavigationProps) {
  const [location, navigate] = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    console.log(`Navigated to: ${path}`);
  };

  const handleNewHabit = () => {
    onNewHabit?.();
    console.log('New habit button clicked');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="container-bottom-navigation">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            if (index === 2) {
              // Insert the plus button in the middle
              return (
                <div key="middle" className="flex items-center gap-2">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="flex-col h-12 px-3"
                    onClick={() => handleNavigation(item.path)}
                    data-testid={`button-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    <span className={`text-xs ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </Button>
                  
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={handleNewHabit}
                    data-testid="button-new-habit"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              );
            }
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="flex-col h-12 px-3"
                onClick={() => handleNavigation(item.path)}
                data-testid={`button-nav-${item.label.toLowerCase()}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span className={`text-xs ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}