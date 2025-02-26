
export interface Parcelle {
  id: number;
  name: string;
  placettes: Placette[];
}

export interface Placette {
  id: number;
  name: string;
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
