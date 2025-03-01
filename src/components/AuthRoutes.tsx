
import React, { useEffect, useState } from "react";
import { Route, useLocation } from "wouter";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { storage } from "@/lib/storage";

/**
 * Composant pour gérer les routes d'authentification
 */
export default function AuthRoutes() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await storage.getCurrentUser();
        if (user) {
          console.log("AuthRoutes: Utilisateur déjà connecté");
          setIsAuthenticated(true);
        } else {
          console.log("AuthRoutes: Aucun utilisateur connecté");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("AuthRoutes: Erreur lors de la vérification de l'authentification", error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Rediriger si l'utilisateur est déjà connecté et essaie d'accéder aux pages d'auth
  const AuthRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
      if (isAuthenticated) {
        console.log("AuthRedirectWrapper: Utilisateur déjà connecté, redirection vers /");
        setLocation('/');
      }
    }, [isAuthenticated]);
    
    return <>{children}</>;
  };

  return (
    <>
      <Route path="/auth/login">
        <AuthRedirectWrapper>
          <Login />
        </AuthRedirectWrapper>
      </Route>
      <Route path="/auth/register">
        <AuthRedirectWrapper>
          <Register />
        </AuthRedirectWrapper>
      </Route>
      <Route path="/auth">
        {() => {
          useEffect(() => {
            console.log("Redirection vers /auth/login");
            setLocation('/auth/login');
          }, []);
          return null;
        }}
      </Route>
    </>
  );
}
