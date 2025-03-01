
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
  const [isLoading, setIsLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Vérification initiale de l'authentification et redirection
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AppRouter: Vérification de l'authentification initiale");
        
        // Ajouter un délai pour éviter les problèmes de course
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = await storage.getCurrentUser();
        console.log("AppRouter: Utilisateur actuel:", user);
        
        // Eviter les redirections automatiques - vérifions l'URL actuelle
        const currentPath = window.location.hash.slice(1) || "/";
        console.log("AppRouter: Chemin actuel:", currentPath);
        
        // Ne faites une redirection que si nous sommes à la racine ou sur une page non-auth
        if (!initialCheckDone) {
          if (currentPath === "/" || currentPath === "") {
            if (user) {
              console.log("Utilisateur authentifié, redirection vers la page d'accueil");
              window.location.hash = "#/";
            } else {
              console.log("Aucun utilisateur, redirection vers login");
              window.location.hash = "#/auth/login";
            }
          }
          setInitialCheckDone(true);
        }
        
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        if (!initialCheckDone) {
          window.location.hash = "#/auth/login";
          setInitialCheckDone(true);
        }
        setIsInitialized(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [initialCheckDone]);

  // Afficher un état de chargement pendant la vérification
  if (isLoading) {
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
