
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const user = await storage.getCurrentUser();
        console.log("Auth check result:", user);
        
        if (!user) {
          console.log("No user found, redirecting to login");
          setIsAuthenticated(false);
          setLocation('/auth/login');
        } else {
          console.log("User authenticated:", user.name);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setLocation('/auth/login');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    // Loading state
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (isAuthenticated === false) {
    // We'll let the redirect happen
    return null;
  }

  // Only render the component if authenticated
  return <Component />;
}
