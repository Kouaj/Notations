
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { useLocation } from 'wouter';
import { storage } from '@/lib/storage';
import { User } from '@/shared/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserIcon, LogOutIcon, ChevronDownIcon } from 'lucide-react';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await storage.getCurrentUser();
        setUser(currentUser || null);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await storage.clearCurrentUser();
      await storage.setSelectedParcelle(null);
      await storage.setSelectedReseau(null);
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      navigate('/auth/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-indigo-200 animate-pulse"></div>;
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/auth/login')}
          className="bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50">
          Connexion
        </Button>
        <Button onClick={() => navigate('/auth/register')}
          className="bg-indigo-600 hover:bg-indigo-700">
          Inscription
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
          <UserIcon className="h-4 w-4" />
          <span className="hidden md:inline-block">{user.name || user.email}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border border-indigo-100 shadow-lg">
        <div className="px-3 py-2 text-sm font-medium">
          {user.name && <div className="truncate text-indigo-800">{user.name}</div>}
          <div className="truncate text-xs text-indigo-600">{user.email}</div>
        </div>
        
        <DropdownMenuSeparator className="bg-indigo-100" />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer hover:bg-red-50">
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
