
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();
  
  console.log("ProtectedRoute rendering, auth state:", isAuthenticated);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      try {
        const user = await storage.getCurrentUser();
        console.log("Current user:", user);
        if (!user) {
          console.log("No user found, redirecting to login");
          setLocation('/auth/login');
          setIsAuthenticated(false);
        } else {
          console.log("User authenticated:", user.email);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setLocation('/auth/login');
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    console.log("Showing loading state");
    // Loading state
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin mr-2">&#8635;</div> Chargement...
      </div>
    );
  }

  if (isAuthenticated === false) {
    console.log("Not authenticated, should redirect");
    return null; // Redirect is handled in useEffect
  }

  console.log("Rendering protected component");
  return <Component />;
}
