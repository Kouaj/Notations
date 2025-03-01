
import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function FallbackPage() {
  const [_, setLocation] = useLocation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Bienvenue sur AgriApp</h1>
        
        <div className="space-y-4">
          <p className="text-center text-gray-700">
            Application de suivi et notation des maladies viticoles
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <Button 
              variant="outline"
              onClick={() => setLocation("/auth/login")}
              className="w-full"
            >
              Connexion
            </Button>
            
            <Button 
              onClick={() => setLocation("/auth/register")}
              className="w-full"
            >
              Inscription
            </Button>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-4">
            Version de secours - Mode développement
          </div>
        </div>
      </div>
    </div>
  );
}
