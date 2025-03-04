
import React from "react";
import { Switch, Route, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import UserMenu from "@/components/UserMenu";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/home";
import Parcelles from "@/pages/parcelles";
import Reseaux from "@/pages/reseaux";
import History from "@/pages/history";
import NotFound from "@/pages/not-found";

export default function AppLayout() {
  const [location] = useLocation();
  
  // Vérifier si la route actuelle est une route d'authentification
  const isAuthRoute = location.startsWith('/auth');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {!isAuthRoute && (
        <header className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-3 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Notations Viticoles</h1>
            <UserMenu />
          </div>
        </header>
      )}
      
      <main className="container mx-auto px-3 py-2 pb-20">
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
          {!isAuthRoute && <Route><NotFound /></Route>}
        </Switch>
      </main>
      
      {!isAuthRoute && <Navigation />}
    </div>
  );
}
