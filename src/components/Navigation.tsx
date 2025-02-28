
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { storage } from "@/lib/storage";
import { User } from "@/shared/schema";

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await storage.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const adminCheck = await storage.isAdmin(currentUser);
        setIsAdmin(adminCheck);
      }
    };
    
    checkAuth();
  }, []);

  if (!user) return null;

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mb-8">
      <Link href="/">
        <a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
          Accueil
        </a>
      </Link>
      <Link href="/reseaux">
        <a className={`text-sm font-medium transition-colors hover:text-primary ${location.includes('/reseaux') ? 'text-primary' : 'text-muted-foreground'}`}>
          Réseaux
        </a>
      </Link>
      <Link href="/parcelles">
        <a className={`text-sm font-medium transition-colors hover:text-primary ${location.includes('/parcelles') ? 'text-primary' : 'text-muted-foreground'}`}>
          Parcelles
        </a>
      </Link>
      <Link href="/history">
        <a className={`text-sm font-medium transition-colors hover:text-primary ${location.includes('/history') ? 'text-primary' : 'text-muted-foreground'}`}>
          Historique
        </a>
      </Link>
      {isAdmin && (
        <Link href="/admin">
          <a className={`text-sm font-medium transition-colors hover:text-primary ${location.includes('/admin') ? 'text-primary' : 'text-muted-foreground'}`}>
            Admin
          </a>
        </Link>
      )}
    </nav>
  );
}
