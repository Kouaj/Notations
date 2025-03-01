
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsChecking(true);
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
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Rediriger si l'utilisateur est déjà connecté et essaie d'accéder aux pages d'auth
  const AuthRedirectWrapper = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
      if (isAuthenticated && !isChecking) {
        console.log("AuthRedirectWrapper: Utilisateur déjà connecté, redirection vers /");
        setLocation('/');
      }
    }, [isAuthenticated, isChecking]);
    
    if (isChecking) {
      return <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>;
    }
    
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
            if (!isChecking) {
              console.log("Redirection vers /auth/login");
              setLocation('/auth/login');
            }
          }, [isChecking]);
          
          if (isChecking) {
            return <div className="flex justify-center items-center h-screen">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>;
          }
          
          return null;
        }}
      </Route>
    </>
  );
}
