
import { User, Reseau, Parcelle, HistoryRecord } from "@/shared/schema";

export interface IDBStorage {
  // User methods
  getUser(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  saveUser(user: User): Promise<User>;
  
  // Reseau methods
  getReseaux(userId: number): Promise<Reseau[]>;
  getReseau(id: number): Promise<Reseau | null>;
  saveReseau(reseau: Reseau): Promise<Reseau>;
  
  // Parcelle methods
  getParcelles(userId: number): Promise<Parcelle[]>;
  getParcelle(id: number): Promise<Parcelle | null>;
  getParcellesByReseau(reseauId: number, userId?: number): Promise<Parcelle[]>;
  saveParcelle(parcelle: Parcelle): Promise<Parcelle>;
  
  // History methods
  getHistory(userId: number): Promise<HistoryRecord[]>;
  getHistoryRecord(id: number): Promise<HistoryRecord | null>;
  saveHistory(record: HistoryRecord): Promise<HistoryRecord>;
  
  // Aliases for compatibility
  saveNotation(record: HistoryRecord): Promise<HistoryRecord>;
  
  // Photo methods
  savePhoto(photoData: string, filename: string): Promise<string>;
}
