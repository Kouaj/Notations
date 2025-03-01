
import React from 'react';
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

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await storage.setCurrentUser(null);
      await storage.setSelectedParcelle(null);
      await storage.setSelectedReseau(null);
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      setLocation('/auth/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserIcon className="h-4 w-4" />
          <span className="hidden md:inline-block">{user.name || user.email}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-sm font-medium">
          {user.name && <div className="truncate">{user.name}</div>}
          <div className="truncate text-xs text-muted-foreground">{user.email}</div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
