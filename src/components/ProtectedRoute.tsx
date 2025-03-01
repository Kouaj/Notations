
import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();
  
  console.log("ProtectedRoute rendering, initial state:", { isAuthenticated, isLoading });

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      console.log("Vérifiation de l'authentification...");
      
      try {
        // Pour débloquer le développement, utilisons une authentification simulée
        // Décommentez cette ligne pour tester sans authentification:
        // setIsAuthenticated(true); setIsLoading(false); return;
        
        const user = await storage.getCurrentUser();
        console.log("Utilisateur actuel:", user);
        
        if (!user) {
          console.log("Aucun utilisateur trouvé, redirection vers /auth/login");
          setIsAuthenticated(false);
          setLocation('/auth/login');
        } else {
          console.log("Utilisateur authentifié:", user.email);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erreur de vérification d'auth:", error);
        setIsAuthenticated(false);
        setLocation('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  if (isLoading) {
    console.log("Affichage de l'état de chargement");
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin text-primary text-2xl mb-3">⟳</div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    console.log("Non authentifié, redirection effectuée");
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  console.log("Rendu du composant protégé");
  return <Component />;
}
