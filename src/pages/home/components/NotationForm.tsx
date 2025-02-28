import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";
import { useRouter } from "wouter";
import {
  Form,
  FormControl,
  FormDescription,
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
import { HistoryRecord } from "@/shared/schema";

const formSchema = z.object({
  parcelId: z.string().min(2, {
    message: "L'identifiant de la parcelle doit comporter au moins 2 caractères.",
  }),
  date: z.string().min(1, {
    message: "La date est obligatoire.",
  }),
  soilType: z.string().min(1, {
    message: "Le type de sol est obligatoire.",
  }),
  cropType: z.string().min(1, {
    message: "Le type de culture est obligatoire.",
  }),
  yieldEstimate: z.string().optional(),
  notes: z.string().optional(),
});

interface NotationFormProps {
  onCancel: () => void;
  parcelId?: string;
  onNotationSaved: (newNotation: HistoryRecord) => void;
}

type FormState = z.infer<typeof formSchema>;

export function NotationForm({ onCancel, parcelId, onNotationSaved }: NotationFormProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormState>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parcelId: parcelId || '',
      date: new Date().toISOString().split('T')[0],
      soilType: '',
      cropType: '',
      yieldEstimate: '',
      notes: '',
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

      const newNotation: HistoryRecord = {
        id: Math.random().toString(36).substring(7),
        parcelId: values.parcelId,
        date: new Date(values.date).getTime(),
        soilType: values.soilType,
        cropType: values.cropType,
        yieldEstimate: values.yieldEstimate || "N/A",
        notes: values.notes || "N/A",
        userId: user.id,
        userName: user.name || "N/A",
        timestamp: Date.now(),
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
            name="parcelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identifiant de la parcelle</FormLabel>
                <FormControl>
                  <Input placeholder="ID de la parcelle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            name="soilType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de sol</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type de sol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="argileux">Argileux</SelectItem>
                    <SelectItem value="limoneux">Limoneux</SelectItem>
                    <SelectItem value="sableux">Sableux</SelectItem>
                    <SelectItem value="tourbeux">Tourbeux</SelectItem>
                    <SelectItem value="calcaire">Calcaire</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cropType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de culture</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type de culture" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mais">Maïs</SelectItem>
                    <SelectItem value="ble">Blé</SelectItem>
                    <SelectItem value="soja">Soja</SelectItem>
                    <SelectItem value="orge">Orge</SelectItem>
                    <SelectItem value="tournesol">Tournesol</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="yieldEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimation du rendement</FormLabel>
                <FormControl>
                  <Input placeholder="Estimation du rendement" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
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
