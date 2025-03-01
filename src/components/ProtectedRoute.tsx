
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();
  const redirectAttempted = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("ProtectedRoute: Vérification de l'authentification...");
        
        // Vérifier dans IndexedDB et localStorage
        const user = await storage.getCurrentUser();
        console.log("ProtectedRoute: Résultat de la vérification:", user);
        
        if (!user) {
          console.log("ProtectedRoute: Aucun utilisateur trouvé, redirection vers la connexion");
          setIsAuthenticated(false);
          
          // Éviter les redirections en boucle
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            
            // Utiliser setLocation au lieu de manipulation directe de l'URL
            setLocation('/auth/login');
          }
        } else {
          console.log("ProtectedRoute: Utilisateur authentifié:", user.name);
          setIsAuthenticated(true);
          redirectAttempted.current = false;
        }
      } catch (error) {
        console.error("ProtectedRoute: Erreur lors de la vérification de l'authentification:", error);
        
        // Vérifier le localStorage comme solution de secours
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          console.log("ProtectedRoute: Utilisateur trouvé dans localStorage");
          setIsAuthenticated(true);
          redirectAttempted.current = false;
        } else {
          setIsAuthenticated(false);
          
          // Éviter les redirections en boucle
          if (!redirectAttempted.current) {
            redirectAttempted.current = true;
            setLocation('/auth/login');
          }
        }
      }
    };
    
    checkAuth();
  }, [setLocation]);

  // Afficher un état de chargement avec animation
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-purple-800 font-medium">Vérification de l'authentification...</p>
      </div>
    );
  }

  // Laisser la redirection se produire
  if (isAuthenticated === false) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <p className="text-purple-800">Redirection vers la page de connexion...</p>
      </div>
    );
  }

  // Rendre le composant uniquement si authentifié
  return <Component />;
}
