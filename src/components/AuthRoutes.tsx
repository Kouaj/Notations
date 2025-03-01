
import React, { useEffect } from "react";
import { Route, useLocation } from "wouter";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

/**
 * Composant pour gérer les routes d'authentification
 */
export default function AuthRoutes() {
  return (
    <>
      <Route path="/auth/login">
        <Login />
      </Route>
      <Route path="/auth/register">
        <Register />
      </Route>
      <Route path="/auth">
        {() => <AuthRedirect />}
      </Route>
    </>
  );
}

/**
 * Composant pour rediriger de /auth vers /auth/login
 */
function AuthRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    console.log("Redirection vers /auth/login");
    setLocation('/auth/login');
  }, [setLocation]);
  return null;
}
