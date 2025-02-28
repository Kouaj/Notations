
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
    <div className="w-full border-b">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Tabs value={location} onValueChange={setLocation} className="flex-1">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="/reseaux">Réseaux</TabsTrigger>
            <TabsTrigger value="/parcelles">Parcelles</TabsTrigger>
            <TabsTrigger value="/">Notation</TabsTrigger>
            <TabsTrigger value="/history">Historique</TabsTrigger>
          </TabsList>
        </Tabs>
        <UserMenu />
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
            // Fix: Add proper type checking for params and pathname property
            const pathname = params ? params.pathname || '' : '';
            const isAuthRoute = pathname.startsWith('/auth');
            
            return (
              <>
                {!isAuthRoute && <Navigation />}
                <main className="container mx-auto px-4 py-6">
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
