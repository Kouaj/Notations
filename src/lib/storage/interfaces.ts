
import { User, Reseau, Parcelle, HistoryRecord, Note } from '@/shared/schema';

export interface IDBStorage {
  // Utilisateurs
  getCurrentUser: () => Promise<User | null>;
  saveUser: (user: User) => Promise<User>;
  getUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | null>;
  setCurrentUser: (user: User | null) => Promise<void>;
  
  // Réseaux
  getReseaux: () => Promise<Reseau[]>;
  getReseauById: (id: number) => Promise<Reseau | null>;
  saveReseau: (reseau: Reseau) => Promise<Reseau>;
  getSelectedReseau: () => Promise<Reseau | null>;
  setSelectedReseau: (reseau: Reseau) => Promise<void>;
  
  // Parcelles
  getParcelles: () => Promise<Parcelle[]>;
  getParcelleById: (id: number) => Promise<Parcelle | null>;
  getParcellesByReseau: (reseauId: number) => Promise<Parcelle[]>;
  saveParcelle: (parcelle: Parcelle) => Promise<Parcelle>;
  getSelectedParcelle: () => Promise<Parcelle | null>;
  setSelectedParcelle: (parcelle: Parcelle | null) => Promise<void>;
  
  // Historique et notations
  getHistory: () => Promise<HistoryRecord[]>;
  getHistoryByUser: (userId: string) => Promise<HistoryRecord[]>;
  getHistoryByParcelle: (parcelleId: number) => Promise<HistoryRecord[]>;
  getHistoryByReseau: (reseauId: number) => Promise<HistoryRecord[]>;
  saveHistory: (record: HistoryRecord) => Promise<HistoryRecord>;
  saveNotation: (record: HistoryRecord) => Promise<HistoryRecord>; // Alias pour saveHistory
  
  // Notes et photos
  getNotes: () => Promise<Note[]>;
  getNotesByHistoryRecord: (historyRecordId: number) => Promise<Note[]>;
  saveNote: (note: Note) => Promise<Note>;
  
  // Réinitialisation (pour dev)
  resetDatabase: () => Promise<void>;
}
