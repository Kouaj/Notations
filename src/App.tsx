
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRouter } from "@/components/AppRouter";

function App() {
  console.log("📱 App component rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-container">
          <AppRouter />
          <Toaster />
          <Sonner />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
