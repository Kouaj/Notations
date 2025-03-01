
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

  // Vérification initiale de l'authentification et redirection
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AppRouter: Vérification de l'authentification initiale");
        
        // Initialisation explicite de la base de données
        const db = await storage.initDB();
        console.log("AppRouter: Base de données initialisée avec succès", db);
        
        const user = await storage.getCurrentUser();
        console.log("AppRouter: Utilisateur actuel:", user);
        
        // Éviter les redirections automatiques - vérifions l'URL actuelle
        const currentPath = window.location.hash.slice(1) || "/";
        console.log("AppRouter: Chemin actuel:", currentPath);
        
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Afficher un état de chargement pendant la vérification
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-purple-800 font-medium">Initialisation de l'application...</p>
      </div>
    );
  }

  return (
    <Router hook={useHashLocation}>
      <div className="fixed top-2 right-2 z-50">
        <ResetUsersButton />
      </div>
      <Switch>
        <Route path="/auth/login">
          <AuthRoutes />
        </Route>
        <Route path="/auth/register">
          <AuthRoutes />
        </Route>
        <Route path="/auth">
          <AuthRoutes />
        </Route>
        <Route path="/:rest*">
          <AppLayout />
        </Route>
      </Switch>
    </Router>
  );
}
