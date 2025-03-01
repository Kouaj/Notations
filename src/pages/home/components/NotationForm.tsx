
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { useLocation } from "wouter";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CancelDialog } from "./CancelDialog";
import { HistoryRecord, NotationType, PartiePlante } from "@/shared/schema";

const formSchema = z.object({
  parcelId: z.number(),
  date: z.string().min(1, {
    message: "La date est obligatoire.",
  }),
  type: z.enum(["maladie", "pheno", "ravageur", "recouvrement", "analyse_sols", "vers_terre", "pollinisateur", "pot_barber", "commentaire"] as const),
  partie: z.enum(["feuilles", "grappe"] as const),
  commentaire: z.string().optional(),
});

interface NotationFormProps {
  onCancel: () => void;
  parcelleId?: number;
  onNotationSaved: (newNotation: HistoryRecord) => void;
}

type FormState = z.infer<typeof formSchema>;

export function NotationForm({ onCancel, parcelleId, onNotationSaved }: NotationFormProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormState>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parcelId: parcelleId || 0,
      date: new Date().toISOString().split('T')[0],
      type: "maladie" as NotationType,
      partie: "feuilles" as PartiePlante,
      commentaire: '',
    },
    mode: "onChange",
  });

  const onSubmit = async (values: FormState) => {
    setIsSaving(true);
    try {
      const user = await storage.getCurrentUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Impossible de récupérer l'utilisateur actuel.",
          variant: "destructive",
        });
        return;
      }

      // Récupérer les informations de parcelle et réseau
      const selectedParcelle = await storage.getSelectedParcelle();
      const selectedReseau = await storage.getSelectedReseau();

      if (!selectedParcelle || !selectedReseau) {
        toast({
          title: "Erreur",
          description: "Parcelle ou réseau non sélectionné.",
          variant: "destructive",
        });
        return;
      }

      const newNotation: HistoryRecord = {
        id: Date.now(),
        parcelleName: selectedParcelle.name,
        parcelleId: selectedParcelle.id,
        reseauName: selectedReseau.name,
        reseauId: selectedReseau.id,
        placetteId: 0, // À définir correctement
        notes: [],
        count: 0,
        frequency: {},
        intensity: {},
        type: values.type,
        partie: values.partie,
        date: values.date,
        userId: user.id,
        commentaire: values.commentaire
      };

      await storage.saveNotation(newNotation);

      toast({
        title: "Succès",
        description: "Notation enregistrée avec succès.",
      });

      onNotationSaved(newNotation);
      navigate('/');

    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement de la notation:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement de la notation.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelConfirmation = () => {
    setCancelDialogOpen(true);
  };

  const handleCancel = () => {
    setCancelDialogOpen(false);
  };

  const handleConfirmCancel = () => {
    setCancelDialogOpen(false);
    onCancel();
  };

  return (
    <div className="container mx-auto py-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de notation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="maladie">Maladie</SelectItem>
                    <SelectItem value="pheno">Phénologie</SelectItem>
                    <SelectItem value="ravageur">Ravageur</SelectItem>
                    <SelectItem value="recouvrement">Recouvrement</SelectItem>
                    <SelectItem value="analyse_sols">Analyse des sols</SelectItem>
                    <SelectItem value="vers_terre">Vers de terre</SelectItem>
                    <SelectItem value="pollinisateur">Pollinisateur</SelectItem>
                    <SelectItem value="pot_barber">Pot Barber</SelectItem>
                    <SelectItem value="commentaire">Commentaire</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="partie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Partie de la plante</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une partie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="feuilles">Feuilles</SelectItem>
                    <SelectItem value="grappe">Grappe</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commentaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commentaire</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Informations complémentaires"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelConfirmation}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </Form>

      <CancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleConfirmCancel}
        onCancel={handleCancel}
      />
    </div>
  );
}
