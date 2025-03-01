
import React from "react";
import { User } from "@/shared/schema";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";

// Assurez-vous que UserMenu reçoit un prop 'user'
interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await storage.setCurrentUser(null);
    setLocation("/auth/login");
  };

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium hidden md:inline-block">
        {user.name}
      </span>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        Déconnexion
      </Button>
    </div>
  );
}
