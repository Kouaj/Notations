
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ContinueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (shouldContinue: boolean) => void;
}

export function ContinueDialog({
  open,
  onOpenChange,
  onContinue
}: ContinueDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Poursuivre la notation ?</AlertDialogTitle>
          <AlertDialogDescription>
            Souhaitez-vous faire une nouvelle notation sur cette parcelle ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onContinue(false)}>
            Non, voir l'historique
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onContinue(true)}>
            Oui, poursuivre
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
