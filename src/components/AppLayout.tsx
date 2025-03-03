
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
  console.log("AppLayout current location:", location);
  
  // Vérifier si la route actuelle est une route d'authentification
  const isAuthRoute = location.startsWith('/auth');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {!isAuthRoute && (
        <header className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white py-2 shadow-md">
          <div className="container mx-auto px-3 flex justify-between items-center">
            <h1 className="text-lg font-bold">Notations Viticoles</h1>
            <UserMenu />
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
          <Route>
            {/* Only show NotFound if not on an auth route */}
            {!isAuthRoute && <NotFound />}
          </Route>
        </Switch>
      </main>
      
      {!isAuthRoute && <Navigation />}
    </div>
  );
}
