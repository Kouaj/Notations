
import React from "react";
import { Router, Route } from "wouter";
import Home from "@/pages/home";
import Reseaux from "@/pages/reseaux";
import Parcelles from "@/pages/parcelles";
import History from "@/pages/history";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import NotFound from "@/pages/not-found";
import FallbackPage from "@/pages/fallback";
import { Navigation } from "./Navigation";

// Version simplifiée du ProtectedRoute pour débloquer le développement
const SimpleProtectedRoute = ({ component: Component }) => {
  console.log("🔒 SimpleProtectedRoute rendering component:", Component.name || "Unknown");
  return (
    <>
      <Navigation />
      <Component />
    </>
  );
};

export function AppRouter() {
  console.log("🧭 AppRouter rendering - Should display routes soon");
  
  return (
    <Router>
      <div className="app-content">
        <Route path="/" component={() => {
          console.log("👋 Tentative de rendu de la route Accueil '/'");
          return <SimpleProtectedRoute component={Home} />;
        }} />
        <Route path="/reseaux" component={() => <SimpleProtectedRoute component={Reseaux} />} />
        <Route path="/parcelles" component={() => <SimpleProtectedRoute component={Parcelles} />} />
        <Route path="/history" component={() => <SimpleProtectedRoute component={History} />} />
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/register" component={RegisterPage} />
        <Route path="/fallback" component={FallbackPage} />
        <Route path="/:rest*" component={NotFound} />
      </div>
    </Router>
  );
}
