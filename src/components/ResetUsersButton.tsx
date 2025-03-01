
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check } from "lucide-react";

export default function ResetUsersButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await storage.clearAllUsers();
      
      // Créer un utilisateur par défaut
      const defaultUser = {
        id: "default-user",
        name: "Utilisateur",
        email: "user@example.com"
      };
      
      await storage.saveUser(defaultUser);
      await storage.setCurrentUser(defaultUser);
      
      setResetSuccess(true);
      
      // Recharger la page après un délai
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setShowConfirmDialog(true)}
      >
        Réinitialiser les utilisateurs
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Réinitialiser tous les utilisateurs?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action va supprimer tous les utilisateurs et les données associées.
              Elle est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} disabled={isResetting}>
              {isResetting ? "Réinitialisation..." : resetSuccess ? (
                <span className="flex items-center">
                  <Check className="mr-1 h-4 w-4" />
                  Succès
                </span>
              ) : "Confirmer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
