
import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import UserMenu from "@/components/UserMenu";
import Home from "@/pages/home";
import Parcelles from "@/pages/parcelles";
import Reseaux from "@/pages/reseaux";
import History from "@/pages/history";
import NotFound from "@/pages/not-found";
import { storage } from "@/lib/storage";
import { User } from "@/shared/schema";

export default function AppLayout() {
  const [location] = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("AppLayout: Récupération de l'utilisateur actuel");
        
        // Récupérer l'utilisateur depuis le stockage
        const user = await storage.getCurrentUser();
        console.log("AppLayout: Utilisateur actuel:", user);
        
        if (user) {
          setCurrentUser(user);
        } else {
          console.log("AppLayout: Aucun utilisateur trouvé, création d'un utilisateur par défaut");
          
          // Créer un utilisateur par défaut
          const defaultUser = {
            id: "default-user",
            name: "Utilisateur",
            email: "user@example.com"
          };
          
          await storage.saveUser(defaultUser);
          await storage.setCurrentUser(defaultUser);
          setCurrentUser(defaultUser);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("AppLayout: Erreur lors de la récupération de l'utilisateur:", error);
        
        // Créer un utilisateur par défaut en cas d'erreur
        const defaultUser = {
          id: "default-user",
          name: "Utilisateur",
          email: "user@example.com"
        };
        
        try {
          await storage.saveUser(defaultUser);
          await storage.setCurrentUser(defaultUser);
          setCurrentUser(defaultUser);
        } catch (innerError) {
          console.error("AppLayout: Erreur lors de la création de l'utilisateur par défaut:", innerError);
        }
        
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  
  // Si toujours en chargement, afficher l'indicateur de chargement avec animation
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-purple-50 to-white">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-purple-800 font-medium">Chargement de l'application...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {currentUser && (
        <header className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-2 shadow-md">
          <div className="container mx-auto px-3 flex justify-between items-center">
            <h1 className="text-lg font-bold">Notations Viticoles</h1>
            {currentUser && <UserMenu user={currentUser} />}
          </div>
        </header>
      )}
      
      <main className="container mx-auto px-2 py-1 pb-16">
        <Switch>
          <Route path="/">
            <Home />
          </Route>
          <Route path="/parcelles">
            <Parcelles />
          </Route>
          <Route path="/reseaux">
            <Reseaux />
          </Route>
          <Route path="/history">
            <History />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
      
      {currentUser && <Navigation />}
    </div>
  );
}
