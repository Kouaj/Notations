
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Composant pour réinitialiser tous les utilisateurs
 */
export default function ResetUsersButton() {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleReset = async () => {
    if (isResetting) return; // Éviter les clics multiples
    
    try {
      setIsResetting(true);
      console.log("Début de la réinitialisation des utilisateurs...");
      
      // Approche radicale: supprimer toutes les données
      localStorage.clear();
      
      // Effacer la base de données IndexedDB
      const request = indexedDB.deleteDatabase('LovableDemoDatabase');
      
      request.onsuccess = function() {
        console.log("Base de données IndexedDB supprimée avec succès");
        toast({
          title: "Réinitialisation réussie",
          description: "Toutes les données ont été supprimées. Redirection en cours...",
          variant: "success"
        });
        
        // Forcer un rechargement complet
        setTimeout(() => {
          console.log("Redirection...");
          window.location.href = window.location.origin + window.location.pathname;
        }, 1500);
      };
      
      request.onerror = function(event) {
        console.error("Erreur lors de la suppression de la base de données:", event);
        toast({
          title: "Erreur",
          description: "La réinitialisation n'a pas fonctionné. Veuillez réessayer.",
          variant: "destructive"
        });
        setIsResetting(false);
      };
    } catch (error) {
      console.error("Erreur lors de la réinitialisation des utilisateurs:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la réinitialisation",
        variant: "destructive"
      });
      setIsResetting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="destructive" 
            size="sm"
            disabled={isResetting}
          >
            Réinitialiser tous les utilisateurs
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser tous les utilisateurs</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va supprimer tous les utilisateurs et effacer les données de connexion.
              Cette opération est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              disabled={isResetting}
            >
              {isResetting ? "Réinitialisation..." : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
