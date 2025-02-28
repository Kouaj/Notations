import React, { useEffect, useState } from "react";
import { Switch, Route, Router, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Parcelles from "@/pages/parcelles";
import Reseaux from "@/pages/reseaux";
import History from "@/pages/history";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserMenu from "@/components/UserMenu";
import { storage } from "@/lib/storage";
import { User } from "@/shared/schema";
import { BookOpen, Network, Map, History as HistoryIcon } from "lucide-react";

// Configuration for wouter to work with GitHub Pages
const useHashLocation = () => {
  const [loc, setLoc] = React.useState(window.location.hash.slice(1) || "/");

  React.useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.slice(1);
      setLoc(hash || "/");
    };

    window.addEventListener("hashchange", handler);
    handler(); // Initialize with current hash
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return [loc, navigate] as [string, (to: string) => void];
};

function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-lg">
      <div className="container mx-auto px-4 py-1">
        <Tabs value={location} onValueChange={setLocation} className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-16">
            <TabsTrigger value="/" className="flex flex-col items-center justify-center space-y-1 py-2">
              <BookOpen size={20} />
              <span className="text-xs">Notation</span>
            </TabsTrigger>
            <TabsTrigger value="/reseaux" className="flex flex-col items-center justify-center space-y-1 py-2">
              <Network size={20} />
              <span className="text-xs">Réseaux</span>
            </TabsTrigger>
            <TabsTrigger value="/parcelles" className="flex flex-col items-center justify-center space-y-1 py-2">
              <Map size={20} />
              <span className="text-xs">Parcelles</span>
            </TabsTrigger>
            <TabsTrigger value="/history" className="flex flex-col items-center justify-center space-y-1 py-2">
              <HistoryIcon size={20} />
              <span className="text-xs">Historique</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

// Protected route wrapper
interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await storage.getCurrentUser();
      if (!user) {
        setLocation('/auth/login');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    // Loading state
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (isAuthenticated === false) {
    return null; // Redirect is handled in useEffect
  }

  return <Component />;
}

function AppRoutes() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Quick fix for initial blank page when navigating directly to the app
    if (location === "/") {
      setLocation("/home");
    }
  }, [location, setLocation]);

  return (
    <>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/reseaux" component={Reseaux} />
        <Route path="/parcelles" component={Parcelles} />
        <Route path="/history" component={History} />
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function RouterContent() {
  const [, setLocation] = useLocation();
  
  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const user = await storage.getCurrentUser();
      // If no user is logged in, redirect to login page
      if (!user) {
        setLocation('/auth/login');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/auth/login">
          {() => <Login />}
        </Route>
        <Route path="/auth/register">
          {() => <Register />}
        </Route>
        <Route path="/auth">
          {() => {
            const [, setLocation] = useLocation();
            useEffect(() => {
              setLocation('/auth/login');
            }, [setLocation]);
            return null;
          }}
        </Route>
        <Route>
          {(params: { pathname?: string } | undefined) => {
            // Only render Navigation for non-auth routes
            const pathname = params ? params.pathname || '' : '';
            const isAuthRoute = pathname.startsWith('/auth');
            
            return (
              <>
                {!isAuthRoute && (
                  <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 shadow-md">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                      <h1 className="text-xl font-bold">Notations Viticoles</h1>
                      <UserMenu />
                    </div>
                  </header>
                )}
                <main className="container mx-auto px-4 py-6 pb-24">
                  <Switch>
                    <Route path="/">
                      {() => <ProtectedRoute component={Home} />}
                    </Route>
                    <Route path="/parcelles">
                      {() => <ProtectedRoute component={Parcelles} />}
                    </Route>
                    <Route path="/reseaux">
                      {() => <ProtectedRoute component={Reseaux} />}
                    </Route>
                    <Route path="/history">
                      {() => <ProtectedRoute component={History} />}
                    </Route>
                    {!isAuthRoute && <Route component={NotFound} />}
                  </Switch>
                </main>
                {!isAuthRoute && <Navigation />}
              </>
            );
          }}
        </Route>
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router hook={useHashLocation}>
          <RouterContent />
        </Router>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
