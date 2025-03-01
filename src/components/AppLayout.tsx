
import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import UserMenu from "@/components/UserMenu";
import ProtectedRoute from "@/components/ProtectedRoute";
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
  
  // Vérifier si la route actuelle est une route d'authentification
  const isAuthRoute = location.startsWith('/auth');
  
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
          console.log("AppLayout: Aucun utilisateur trouvé, vérification du localStorage");
          
          // Vérifier le localStorage comme solution de secours
          const storedUser = localStorage.getItem('current_user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              console.log("AppLayout: Utilisateur trouvé dans localStorage:", parsedUser);
              
              // Synchroniser avec IndexedDB
              await storage.setCurrentUser(parsedUser);
              setCurrentUser(parsedUser);
            } catch (e) {
              console.error("AppLayout: Erreur lors de l'analyse du JSON:", e);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("AppLayout: Erreur lors de la récupération de l'utilisateur:", error);
        
        // Vérifier le localStorage comme solution de secours
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setCurrentUser(parsedUser);
          } catch (e) {
            console.error("AppLayout: Erreur lors de l'analyse du JSON:", e);
          }
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
      {!isAuthRoute && currentUser && (
        <header className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-2 shadow-md">
          <div className="container mx-auto px-3 flex justify-between items-center">
            <h1 className="text-lg font-bold">Notations Viticoles</h1>
            <UserMenu user={currentUser} />
          </div>
        </header>
      )}
      
      <main className="container mx-auto px-2 py-1 pb-16">
        <Switch>
          <Route path="/">
            <ProtectedRoute component={Home} />
          </Route>
          <Route path="/parcelles">
            <ProtectedRoute component={Parcelles} />
          </Route>
          <Route path="/reseaux">
            <ProtectedRoute component={Reseaux} />
          </Route>
          <Route path="/history">
            <ProtectedRoute component={History} />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
      
      {!isAuthRoute && currentUser && <Navigation />}
    </div>
  );
}
