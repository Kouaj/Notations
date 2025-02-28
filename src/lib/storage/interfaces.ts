
import { Parcelle, Reseau, HistoryRecord, User } from '@/shared/schema';

// Storage interface for IndexedDB operations
export interface IDBStorage {
  // Users
  getUsers(): Promise<User[]>;
  saveUser(user: User): Promise<void>;
  getUserById(id: string): Promise<User | null>;
  getCurrentUser(): Promise<User | null>;
  setCurrentUser(user: User | null): Promise<void>;
  
  // Réseaux
  getReseaux(): Promise<Reseau[]>;
  getReseauxByUser(userId: string): Promise<Reseau[]>;
  saveReseau(reseau: Reseau): Promise<void>;
  deleteReseau(id: number): Promise<void>;
  updateReseau(reseau: Reseau): Promise<void>;
  setSelectedReseau(reseau: Reseau | null): Promise<void>;
  getSelectedReseau(): Promise<Reseau | null>;
  
  // Parcelles
  getParcelles(): Promise<Parcelle[]>;
  getParcellesByUser(userId: string): Promise<Parcelle[]>;
  getParcellesByReseau(reseauId: number, userId: string): Promise<Parcelle[]>;
  saveParcelle(parcelle: Parcelle): Promise<void>;
  deleteParcelle(id: number): Promise<void>;
  updateParcelle(parcelle: Parcelle): Promise<void>;
  setSelectedParcelle(parcelle: Parcelle | null): Promise<void>;
  getSelectedParcelle(): Promise<Parcelle | null>;
  
  // Historique
  getHistory(): Promise<HistoryRecord[]>;
  getHistoryByUser(userId: string): Promise<HistoryRecord[]>;
  saveHistory(record: HistoryRecord): Promise<void>;
  deleteHistory(id: number): Promise<void>;
}
