
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Parcelles from "@/pages/parcelles";
import History from "@/pages/history";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";

function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <div className="w-full border-b">
      <div className="container mx-auto px-4">
        <Tabs value={location} onValueChange={setLocation} className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="/parcelles">Parcelles</TabsTrigger>
            <TabsTrigger value="/">Notation</TabsTrigger>
            <TabsTrigger value="/history">Historique</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/parcelles" component={Parcelles} />
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
        <Router />
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
