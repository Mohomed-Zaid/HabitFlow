import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" data-testid="page-not-found">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <div className="text-6xl">🧭</div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-404-title">
              Page Not Found
            </h1>
            <p className="text-muted-foreground" data-testid="text-404-description">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/")} 
              className="w-full"
              data-testid="button-home"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button 
              variant="outline" 
              onClick={() => console.log('Search functionality would go here')}
              className="w-full"
              data-testid="button-search"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Habits
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
