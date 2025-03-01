
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
  
  // Check if current route is an auth route
  const isAuthRoute = location.startsWith('/auth');
  
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await storage.getCurrentUser();
      setCurrentUser(user);
    };
    
    if (!isAuthRoute) {
      fetchUser();
    }
  }, [isAuthRoute]);
  
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
            {() => <ProtectedRoute component={Home} />}
          </Route>
          <Route path="/parcelles">
            {() => <ProtectedRoute component={Parcelles} />}
          </Route>
          <Route path="/reseaux">
            {() => <ProtectedRoute component={Reseaux} />}
          </Route>
          <Route path="/history">
            {() => <ProtectedRoute component={History} />}
          </Route>
          {!isAuthRoute && <Route component={NotFound} />}
        </Switch>
      </main>
      
      {!isAuthRoute && <Navigation />}
    </div>
  );
}
