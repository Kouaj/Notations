
import React from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
}

export default function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const [, setLocation] = useLocation();
  
  console.log("🔒 ProtectedRoute rendering - Mode de développement activé");

  // En mode développement, on permet l'accès sans authentification
  const isDevMode = true;
  
  if (isDevMode) {
    console.log("🔓 Mode développement: authentification contournée");
    return <Component />;
  }
  
  // Code normal pour la production (qui ne sera pas exécuté en dev)
  const checkAuth = async () => {
    try {
      const user = await storage.getCurrentUser();
      if (!user) {
        console.log("👤 Aucun utilisateur trouvé, redirection vers /auth/login");
        setLocation('/auth/login');
        return false;
      }
      return true;
    } catch (error) {
      console.error("❌ Erreur de vérification d'auth:", error);
      setLocation('/auth/login');
      return false;
    }
  };
  
  checkAuth();
  
  return <Component />;
}
