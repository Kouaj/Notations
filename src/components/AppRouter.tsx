
import React, { useEffect, useState } from "react";
import { Router, Switch, Route } from "wouter";
import AppLayout from "@/components/AppLayout";
import { storage } from "@/lib/storage";
import ResetUsersButton from "@/components/ResetUsersButton";
import { useHashLocation } from "@/hooks/useHashLocation";

/**
 * Composant principal de routage de l'application
 * Version simplifiée sans authentification
 */
export default function AppRouter() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialisation sans vérification d'authentification
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("AppRouter: Initialisation de l'application");
        
        // Initialisation explicite de la base de données
        const db = await storage.initDB();
        console.log("AppRouter: Base de données initialisée avec succès", db);
        
        // Créer un utilisateur par défaut si aucun n'existe
        const users = await storage.getUsers();
        if (users.length === 0) {
          console.log("AppRouter: Création d'un utilisateur par défaut");
          const defaultUser = {
            id: "default-user",
            name: "Utilisateur",
            email: "user@example.com"
          };
          await storage.saveUser(defaultUser);
          await storage.setCurrentUser(defaultUser);
        } else {
          // Utiliser le premier utilisateur existant
          await storage.setCurrentUser(users[0]);
        }
        
        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        setIsInitialized(true);
        setIsLoading(false);
      }
    };
    
    initApp();
  }, []);

  // Afficher un état de chargement pendant l'initialisation
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
        <Route path="/:rest*">
          <AppLayout />
        </Route>
      </Switch>
    </Router>
  );
}
