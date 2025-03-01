
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

// Pour l'implémentation simplifiée, on va retirer la vérification isAdmin

export function Navigation() {
  const [location] = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await storage.getCurrentUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  return (
    <nav className="flex items-center p-4 border-b">
      <div className="flex space-x-4 items-center">
        <Link href="/">
          <Button variant={location === "/" ? "default" : "ghost"}>
            Accueil
          </Button>
        </Link>
        {currentUser && (
          <>
            <Link href="/reseaux">
              <Button variant={location === "/reseaux" ? "default" : "ghost"}>
                Réseaux
              </Button>
            </Link>
            <Link href="/parcelles">
              <Button variant={location === "/parcelles" ? "default" : "ghost"}>
                Parcelles
              </Button>
            </Link>
            <Link href="/history">
              <Button variant={location === "/history" ? "default" : "ghost"}>
                Historique
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
