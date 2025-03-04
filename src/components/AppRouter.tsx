
import React, { useEffect } from "react";
import { Router, Switch, Route, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { storage } from "@/lib/storage";

// Configuration améliorée pour le hook de localisation avec hash
export const useHashLocation = () => {
  const [loc, setLoc] = React.useState(() => window.location.hash.slice(1) || "/");

  React.useEffect(() => {
    // Fonction pour mettre à jour la localisation basée sur le hash
    const handler = () => {
      const hash = window.location.hash.slice(1);
      setLoc(hash || "/");
    };

    // Gérer le cas d'un rechargement de page sans hash
    if (window.location.hash === "" && window.location.pathname !== "/") {
      window.location.hash = window.location.pathname;
    }

    window.addEventListener("hashchange", handler);
    // Initialiser avec le hash actuel
    handler();
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return [loc, navigate] as [string, (to: string) => void];
};

export default function AppRouter() {
  const [, setLocation] = useLocation();
  
  // Vérification de l'authentification au chargement initial
  useEffect(() => {
    const checkAuth = async () => {
      const user = await storage.getCurrentUser();
      // Si aucun utilisateur n'est connecté, rediriger vers la page de connexion
      if (!user) {
        setLocation('/auth/login');
      }
    };
    
    checkAuth();
  }, [setLocation]);

  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/auth/login">
          <Login />
        </Route>
        <Route path="/auth/register">
          <Register />
        </Route>
        {/* Route par défaut pour /auth qui redirige vers /auth/login */}
        <Route path="/auth">
          {() => {
            useEffect(() => {
              setLocation('/auth/login');
            }, []);
            return null;
          }}
        </Route>
        {/* Route principale qui inclut la mise en page de l'application */}
        <Route path="/:rest*">
          {(params: { rest?: string }) => {
            // Si on est sur la racine, vérifier l'authentification
            if (params && params.rest === undefined) {
              useEffect(() => {
                const checkRootAuth = async () => {
                  const user = await storage.getCurrentUser();
                  if (!user) {
                    setLocation('/auth/login');
                  }
                };
                checkRootAuth();
              }, []);
            }
            return <AppLayout />;
          }}
        </Route>
      </Switch>
    </Router>
  );
}
