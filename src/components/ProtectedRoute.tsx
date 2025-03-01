
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
      const user = await storage.getCurrentUser();
      if (!user) {
        // Redirection vers la page de connexion
        setLocation('/auth/login');
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isAuthenticated === null) {
    // État de chargement
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (isAuthenticated === false) {
    return null; // La redirection est gérée dans useEffect
  }

  return <Component />;
}
