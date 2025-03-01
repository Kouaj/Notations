
import React, { useEffect } from "react";
import { Router, Switch, Route, useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { storage } from "@/lib/storage";

// Configuration for wouter to work with GitHub Pages
export const useHashLocation = () => {
  const [loc, setLoc] = React.useState(window.location.hash.slice(1) || "/");

  React.useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.slice(1);
      setLoc(hash || "/");
    };

    window.addEventListener("hashchange", handler);
    handler(); // Initialize with current hash
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
  };

  return [loc, navigate] as [string, (to: string) => void];
};

export default function AppRouter() {
  // The Router component will use our custom hash location hook
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/auth/login">
          <Login />
        </Route>
        <Route path="/auth/register">
          <Register />
        </Route>
        <Route path="/auth">
          {() => {
            const [, setLocation] = useLocation();
            useEffect(() => {
              setLocation('/auth/login');
            }, [setLocation]);
            return null;
          }}
        </Route>
        <Route path="/:rest*">
          <AppLayout />
        </Route>
      </Switch>
    </Router>
  );
}
