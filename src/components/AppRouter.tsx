
import React, { useEffect, useState } from "react";
import { Router, Switch, Route, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Configuration optimisée pour wouter avec GitHub Pages
export const useHashLocation = (): [string, (to: string) => void] => {
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

  const navigate = (to: string) => {
    console.log("Navigation vers:", to);
    window.location.hash = to;
  };

  return [loc, navigate];
};

// Composant pour réinitialiser les utilisateurs
function ResetUsersButton() {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  
  const handleReset = async () => {
    if (isResetting) return; // Éviter les clics multiples
    
    try {
      setIsResetting(true);
      console.log("Début de la réinitialisation des utilisateurs...");
      
      // Première étape - vérifier les utilisateurs existants
      const usersBefore = await storage.getUsers();
      console.log("Utilisateurs avant réinitialisation:", usersBefore);
      
      // Effacer tous les utilisateurs
      const success = await storage.clearAllUsers();
      console.log("Résultat de la réinitialisation:", success);
      
      // Vérifier après effacement
      const usersAfter = await storage.getUsers();
      console.log("Utilisateurs après réinitialisation:", usersAfter);
      
      if (success && usersAfter.length === 0) {
        toast({
          title: "Réinitialisation réussie",
          description: "Tous les utilisateurs ont été supprimés. Redirection en cours..."
        });
        
        // Nettoyer tout le localStorage également
        localStorage.clear();
        
        // Attendre un peu avant de rediriger
        setTimeout(() => {
          console.log("Redirection vers la page de connexion...");
          window.location.hash = "#/auth/login";
          // Force reload pour s'assurer que tout est nettoyé
          setTimeout(() => window.location.reload(), 100);
        }, 1500);
      } else {
        console.error("La réinitialisation n'a pas fonctionné comme prévu");
        toast({
          title: "Erreur",
          description: "La réinitialisation n'a pas complètement fonctionné. Veuillez réessayer.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        variant="destructive" 
        onClick={handleReset}
        size="sm"
        disabled={isResetting}
      >
        {isResetting ? "Réinitialisation..." : "Réinitialiser tous les utilisateurs"}
      </Button>
    </div>
  );
}

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
      <ResetUsersButton />
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
