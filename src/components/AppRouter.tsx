
import React, { useEffect, useState } from "react";
import { Router, Route, useLocation, Switch } from "wouter";
import Home from "@/pages/home";
import Reseaux from "@/pages/reseaux";
import Parcelles from "@/pages/parcelles";
import History from "@/pages/history";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import NotFound from "@/pages/not-found";
import ProtectedRoute from "./ProtectedRoute";

export function AppRouter() {
  const [location] = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    console.log("AppRouter mounted, current route:", location);
    setIsReady(true);
  }, [location]);

  if (!isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin mr-2">⟳</div> Chargement des routes...
      </div>
    );
  }

  return (
    <Router>
      <div className="app-content">
        <Route path="/" component={() => <ProtectedRoute component={Home} />} />
        <Route path="/reseaux" component={() => <ProtectedRoute component={Reseaux} />} />
        <Route path="/parcelles" component={() => <ProtectedRoute component={Parcelles} />} />
        <Route path="/history" component={() => <ProtectedRoute component={History} />} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
        <Route path="/:rest*" component={NotFound} />
      </div>
    </Router>
  );
}
