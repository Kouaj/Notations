
import React, { useEffect, useState } from "react";
import { Router, Switch, Route } from "wouter";
import AppLayout from "@/components/AppLayout";
import { storage } from "@/lib/storage";
import ResetUsersButton from "@/components/ResetUsersButton";
import AuthRoutes from "@/components/AuthRoutes";
import { useHashLocation } from "@/hooks/useHashLocation";

/**
 * Composant principal de routage de l'application
 */
export default function AppRouter() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Vérification initiale de l'authentification et redirection
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AppRouter: Vérification de l'authentification initiale");
        const user = await storage.getCurrentUser();
        console.log("AppRouter: Utilisateur actuel:", user);
        
        // Si aucun hash n'est défini ou si nous sommes à la racine sans hash
        if (!window.location.hash || window.location.hash === "#/" || window.location.hash === "#") {
          if (user) {
            console.log("Utilisateur authentifié, redirection vers la page d'accueil");
            window.location.hash = "#/";
          } else {
            console.log("Aucun utilisateur, redirection vers login");
            window.location.hash = "#/auth/login";
          }
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        window.location.hash = "#/auth/login";
        setIsInitialized(true);
      }
    };
    
    checkAuth();
  }, []);

  // Afficher un état de chargement pendant la vérification
  if (!isInitialized) {
    return <div className="flex justify-center items-center h-screen">Initialisation de l'application...</div>;
  }

  return (
    <Router hook={useHashLocation}>
      <ResetUsersButton />
      <Switch>
        <AuthRoutes />
        <Route path="/:rest*">
          <AppLayout />
        </Route>
      </Switch>
    </Router>
  );
}
