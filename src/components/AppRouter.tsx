import React from "react";
import { Router, Route } from "wouter";
import Home from "@/pages/home";
import Reseaux from "@/pages/reseaux";
import Parcelles from "@/pages/parcelles";
import History from "@/pages/history";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import NotFound from "@/pages/notFound";
import ProtectedRoute from "./ProtectedRoute";
import Admin from "@/pages/admin";

export function AppRouter() {
  return (
    <Router>
      <ProtectedRoute component={Home} path="/" />
      <ProtectedRoute component={Reseaux} path="/reseaux" />
      <ProtectedRoute component={Parcelles} path="/parcelles" />
      <ProtectedRoute component={History} path="/history" />
      <ProtectedRoute component={Admin} path="/admin" />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route component={NotFound} />
    </Router>
  );
}
