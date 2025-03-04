
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();
  
  console.log("ProtectedRoute check started");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("ProtectedRoute checking authentication");
        const user = await storage.getCurrentUser();
        console.log("ProtectedRoute user check result:", !!user);
        
        if (!user) {
          // Redirection vers la page de connexion
          console.log("ProtectedRoute redirecting to login");
          setLocation('/auth/login');
          setIsAuthenticated(false);
        } else {
          console.log("ProtectedRoute authentication successful");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("ProtectedRoute auth error:", error);
        setLocation('/auth/login');
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    // État de chargement
    console.log("ProtectedRoute showing loading state");
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    console.log("ProtectedRoute not authenticated, returning null");
    return null; // La redirection est gérée dans useEffect
  }

  console.log("ProtectedRoute rendering protected component");
  return <Component />;
}
