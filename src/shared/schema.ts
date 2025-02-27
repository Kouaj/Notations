
import { z } from "zod";

export type NotationType = "maladie" | "pheno" | "ravageur";
export type PartiePlante = "feuilles" | "grappe";

export interface Parcelle {
  id: number;
  name: string;
  reseau: string;
  placettes: Placette[];
}

export interface Placette {
  id: number;
  name: string;
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
}

export interface HistoryRecord {
  id: number;
  parcelleName: string;
  parcelleId: number;
  placetteId: number;
  notes: Note[];
  count: number;
  frequency: Record<string, number>;
  intensity: Record<string, number>;
  type: NotationType;
  partie: PartiePlante;
  date: string;
}

export interface HistoryGroup {
  parcelleName: string;
  parcelleId: number;
  date: string;
  formattedDate: string;
  records: HistoryRecord[];
}

export const parcelleSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  reseau: z.string(),
  placettes: z.array(z.object({
    id: z.number(),
    name: z.string().min(1),
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
