
import React from "react";
import { Switch, Route, Router } from "wouter";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

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
      <div className="container mx-auto px-4">
        <Tabs value={location} onValueChange={setLocation} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="/reseaux">Réseaux</TabsTrigger>
            <TabsTrigger value="/parcelles">Parcelles</TabsTrigger>
            <TabsTrigger value="/">Notation</TabsTrigger>
            <TabsTrigger value="/history">Historique</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

function RouterContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/parcelles" component={Parcelles} />
          <Route path="/reseaux" component={Reseaux} />
          <Route path="/history" component={History} />
          <Route component={NotFound} />
        </Switch>
      </main>
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
