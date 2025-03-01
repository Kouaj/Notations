
import React, { useEffect } from "react";
import { Router, Route, useLocation } from "wouter";
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
  
  useEffect(() => {
    console.log("Current route:", location);
  }, [location]);

  return (
    <Router>
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      <Route path="/reseaux">
        <ProtectedRoute component={Reseaux} />
      </Route>
      <Route path="/parcelles">
        <ProtectedRoute component={Parcelles} />
      </Route>
      <Route path="/history">
        <ProtectedRoute component={History} />
      </Route>
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/:rest*" component={NotFound} />
    </Router>
  );
}
