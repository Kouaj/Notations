
import React, { useEffect, useState } from "react";
import { Router, Switch, Route, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { storage } from "@/lib/storage";

// Configuration optimisée pour wouter avec GitHub Pages
export const useHashLocation = () => {
  const [loc, setLoc] = useState(() => {
    // Initialiser avec le hash actuel ou la route par défaut
    return window.location.hash.slice(1) || "/";
  });

  useEffect(() => {
    // Fonction pour mettre à jour l'emplacement basé sur le hash
    const handler = () => {
      const hash = window.location.hash.slice(1);
      console.log("Hash changé:", hash);
      setLoc(hash || "/");
    };

    // S'assurer que nous avons un hash initial si nous sommes à la racine
    if (!window.location.hash) {
      console.log("Pas de hash détecté, définition du hash initial");
      window.location.hash = "#/";
    }

    window.addEventListener("hashchange", handler);
    handler(); // Initialiser avec le hash actuel
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to) => {
    console.log("Navigation vers:", to);
    window.location.hash = to;
  };

  return [loc, navigate];
};

export default function AppRouter() {
  const [isInitialized, setIsInitialized] = useState(false);

  // Vérification initiale de l'authentification et redirection
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("AppRouter: Vérification de l'authentification initiale");
        const user = await storage.getCurrentUser();
        
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
      <Switch>
        <Route path="/auth/login">
          <Login />
        </Route>
        <Route path="/auth/register">
          <Register />
        </Route>
        <Route path="/auth">
          {() => {
            const [, setLocation] = useLocation();
            useEffect(() => {
              console.log("Redirection vers /auth/login");
              setLocation('/auth/login');
            }, [setLocation]);
            return null;
          }}
        </Route>
        <Route path="/:rest*">
          <AppLayout />
        </Route>
      </Switch>
    </Router>
  );
}
