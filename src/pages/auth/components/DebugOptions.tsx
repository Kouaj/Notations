import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { storage } from '@/lib/storage';

export default function DebugOptions() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const resetDatabase = async () => {
    try {
      console.log("Tentative de réinitialisation de la base de données...");
      setIsLoading(true);
      
      const success = await storage.clearAllUsers();
      
      if (success) {
        console.log("Base de données réinitialisée avec succès");
        toast({
          title: "Base de données réinitialisée",
          description: "Toutes les données utilisateur ont été effacées",
          variant: "success"
        });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        console.error("Échec de la réinitialisation de la base de données");
        toast({
          title: "Erreur",
          description: "Impossible de réinitialiser la base de données",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <details className="text-sm text-gray-500">
        <summary className="cursor-pointer hover:text-purple-600">Options de débogage</summary>
        <div className="mt-2 pt-2 border-t border-dashed border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Ces options sont uniquement pour le développement et le débogage.</p>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full mt-2"
            onClick={resetDatabase}
          >
            Réinitialiser la base de données
          </Button>
        </div>
      </details>
    </div>
  );
}
