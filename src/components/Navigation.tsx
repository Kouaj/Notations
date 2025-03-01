
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User } from "@/shared/schema";
import { storage } from "@/lib/storage";
import UserMenu from "./UserMenu";

export function Navigation() {
  const [location] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await storage.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      }
    };
    
    loadUser();
  }, []);
  
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="link" className={location === "/" ? "font-bold" : ""}>
              Accueil
            </Button>
          </Link>
          <Link href="/reseaux">
            <Button variant="link" className={location === "/reseaux" ? "font-bold" : ""}>
              Réseaux
            </Button>
          </Link>
          <Link href="/parcelles">
            <Button variant="link" className={location === "/parcelles" ? "font-bold" : ""}>
              Parcelles
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="link" className={location === "/history" ? "font-bold" : ""}>
              Historique
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center">
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
