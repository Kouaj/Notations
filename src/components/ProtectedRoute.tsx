
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
        const user = await storage.getCurrentUser();
        if (!user) {
          setLocation('/auth/login');
          setIsAuthenticated(false);
        } else {
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
    // Loading state
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin mr-2">&#8635;</div> Chargement...
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Redirect is handled in useEffect
  }

  return <Component />;
}
