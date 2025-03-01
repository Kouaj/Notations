
import React, { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRouter } from "@/components/AppRouter";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("App component mounted");
    
    // Simuler un délai pour s'assurer que tout est chargé correctement
    const timer = setTimeout(() => {
      setIsLoaded(true);
      console.log("App fully loaded");
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isLoaded ? (
          <>
            <AppRouter />
            <Toaster />
            <Sonner />
          </>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin mr-2">⟳</div> Chargement...
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
