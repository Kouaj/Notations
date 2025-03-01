
import React, { useEffect } from "react";
import { Router, Switch, Route, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { storage } from "@/lib/storage";

// Configuration optimisée pour wouter avec GitHub Pages
export const useHashLocation = () => {
  const [loc, setLoc] = React.useState(window.location.hash.slice(1) || "/");

  React.useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.slice(1);
      setLoc(hash || "/");
    };

    window.addEventListener("hashchange", handler);
    handler(); // Initialiser avec le hash actuel
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return [loc, navigate] as [string, (to: string) => void];
};

export default function AppRouter() {
  // Ajoutons un effet pour rediriger depuis la racine vers /auth/login si l'utilisateur n'est pas connecté
  useEffect(() => {
    // S'assurer que le hash initial est défini si nous sommes à la racine sans hash
    if (!window.location.hash && window.location.pathname === "/") {
      const checkAuth = async () => {
        try {
          const user = await storage.getCurrentUser();
          if (user) {
            window.location.hash = "/";
          } else {
            window.location.hash = "/auth/login";
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l'authentification:", error);
          window.location.hash = "/auth/login";
        }
      };
      
      checkAuth();
    }
  }, []);

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
