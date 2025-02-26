
import { z } from "zod";

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
  partie: "feuilles" | "grappe";
  date: string;
}

export interface HistoryRecord {
  id: number;
  parcelleName: string;
  placetteId: number;
  notes: Note[];
  count: number;
  frequency: Record<string, number>;
  intensity: Record<string, number>;
  date: string;
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
      date: z.string()
    }))
  }))
});
