import { z } from "zod";

export type NotationType = "maladie" | "pheno" | "ravageur" | "recouvrement" | "analyse_sols" | "vers_terre" | "pollinisateur" | "pot_barber";
export type PartiePlante = "feuilles" | "grappe";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Reseau {
  id: number;
  name: string;
  userId: string;
}

export interface Parcelle {
  id: number;
  name: string;
  reseauId: number;
  reseauName: string;
  userId: string;
  placettes: Placette[];
}

export interface Placette {
  id: number;
  name: string;
  parcelleId: number;
  notes: Note[];
}

export interface Note {
  mildiou: number;
  oidium: number;
  BR: number;
  botrytis: number;
  partie: PartiePlante;
  type?: NotationType;
  date: string;
  // Nouveaux champs pour types spécifiques
  hauteurIR?: number;
  hauteurCavaillon?: number;
  nbVDT?: number;
  fait?: boolean;
}

export interface HistoryRecord {
  id: number;
  parcelleName: string;
  parcelleId: number;
  reseauName: string;
  reseauId: number;
  placetteId: number;
  notes: Note[];
  count: number;
  frequency: Record<string, number>;
  intensity: Record<string, number>;
  type: NotationType;
  partie: PartiePlante;
  date: string;
  userId: string;
  // Nouveaux champs pour types spécifiques
  hauteurIR?: number;
  hauteurCavaillon?: number;
  nbVDT?: number;
  fait?: boolean;
}

export interface HistoryGroup {
  parcelleName: string;
  parcelleId: number;
  date: string;
  formattedDate: string;
  records: HistoryRecord[];
}

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional()
});

export const reseauSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  userId: z.string()
});

export const parcelleSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  reseauId: z.number(),
  reseauName: z.string(),
  userId: z.string(),
  placettes: z.array(z.object({
    id: z.number(),
    name: z.string().min(1),
    parcelleId: z.number(),
    notes: z.array(z.object({
      mildiou: z.number(),
      oidium: z.number(),
      BR: z.number(),
      botrytis: z.number(),
      partie: z.enum(["feuilles", "grappe"]),
      type: z.enum(["maladie", "pheno", "ravageur"]).optional(),
      date: z.string()
    }))
  }))
});
