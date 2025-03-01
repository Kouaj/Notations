
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
        console.log("Vérification de l'authentification...");
        const user = await storage.getCurrentUser();
        console.log("Résultat de la vérification d'authentification:", user);
        
        if (!user) {
          console.log("Aucun utilisateur trouvé, redirection vers la connexion");
          setIsAuthenticated(false);
          setLocation('/auth/login');
        } else {
          console.log("Utilisateur authentifié:", user.name);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setIsAuthenticated(false);
        setLocation('/auth/login');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Afficher un état de chargement
  if (isAuthenticated === null) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  // Laisser la redirection se produire
  if (isAuthenticated === false) {
    return null;
  }

  // Rendre le composant uniquement si authentifié
  return <Component />;
}
