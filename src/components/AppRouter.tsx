
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
      console.log("Hash changed to:", window.location.hash);
      const hash = window.location.hash.slice(1);
      setLoc(hash || "/");
    };

    // Gérer le cas d'un rechargement de page sans hash
    if (window.location.hash === "") {
      console.log("Setting initial hash to:", window.location.pathname);
      window.location.hash = window.location.pathname === "/" ? "/" : window.location.pathname;
    }

    window.addEventListener("hashchange", handler);
    // Initialiser avec le hash actuel
    handler();
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    console.log("Navigating to:", to);
    window.location.hash = to;
  };

  return [loc, navigate] as [string, (to: string) => void];
};

export default function AppRouter() {
  const [location, setLocation] = useLocation();
  
  console.log("Current location:", location);
  
  // Vérification de l'authentification au chargement initial
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      try {
        const user = await storage.getCurrentUser();
        console.log("Current user:", user);
        // Si aucun utilisateur n'est connecté, rediriger vers la page de connexion
        if (!user) {
          console.log("No user found, redirecting to login");
          setLocation('/auth/login');
        }
      } catch (error) {
        console.error("Auth check error:", error);
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
              console.log("Auth route, redirecting to login");
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
                  console.log("Root route, checking auth");
                  try {
                    const user = await storage.getCurrentUser();
                    console.log("Root auth check, current user:", user);
                    if (!user) {
                      console.log("No user at root, redirecting to login");
                      setLocation('/auth/login');
                    }
                  } catch (error) {
                    console.error("Root auth check error:", error);
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
