
import { User, Reseau, Parcelle, HistoryRecord, Note } from '@/shared/schema';
import { IDBStorage } from './interfaces';
import { localStorage, DB_NAME, DB_VERSION, STORES } from './core';

// For now, we'll use the localStorage implementation directly
// Later, this can be replaced with IndexedDB implementation
class IndexedDBStorage implements IDBStorage {
  // User methods
  async getUsers(): Promise<User[]> {
    return localStorage.getUsers();
  }

  async saveUser(user: User): Promise<User> {
    return localStorage.saveUser(user);
  }

  async getUserById(id: string): Promise<User | null> {
    return localStorage.getUserById(id);
  }

  async getCurrentUser(): Promise<User | null> {
    return localStorage.getCurrentUser();
  }

  async setCurrentUser(user: User | null): Promise<void> {
    return localStorage.setCurrentUser(user);
  }

  // Réseau methods
  async getReseaux(): Promise<Reseau[]> {
    return localStorage.getReseaux();
  }

  async getReseauById(id: number): Promise<Reseau | null> {
    return localStorage.getReseauById(id);
  }

  async saveReseau(reseau: Reseau): Promise<Reseau> {
    return localStorage.saveReseau(reseau);
  }

  async setSelectedReseau(reseau: Reseau): Promise<void> {
    return localStorage.setSelectedReseau(reseau);
  }

  async getSelectedReseau(): Promise<Reseau | null> {
    return localStorage.getSelectedReseau();
  }

  // Parcelle methods
  async getParcelles(): Promise<Parcelle[]> {
    return localStorage.getParcelles();
  }

  async getParcelleById(id: number): Promise<Parcelle | null> {
    return localStorage.getParcelleById(id);
  }

  async getParcellesByReseau(reseauId: number): Promise<Parcelle[]> {
    return localStorage.getParcellesByReseau(reseauId);
  }

  async saveParcelle(parcelle: Parcelle): Promise<Parcelle> {
    return localStorage.saveParcelle(parcelle);
  }

  async setSelectedParcelle(parcelle: Parcelle | null): Promise<void> {
    return localStorage.setSelectedParcelle(parcelle);
  }

  async getSelectedParcelle(): Promise<Parcelle | null> {
    return localStorage.getSelectedParcelle();
  }

  // History methods
  async getHistory(): Promise<HistoryRecord[]> {
    return localStorage.getHistory();
  }

  async getHistoryByUser(userId: string): Promise<HistoryRecord[]> {
    return localStorage.getHistoryByUser(userId);
  }

  async getHistoryByParcelle(parcelleId: number): Promise<HistoryRecord[]> {
    return localStorage.getHistoryByParcelle(parcelleId);
  }

  async getHistoryByReseau(reseauId: number): Promise<HistoryRecord[]> {
    return localStorage.getHistoryByReseau(reseauId);
  }

  async saveHistory(record: HistoryRecord): Promise<HistoryRecord> {
    return localStorage.saveHistory(record);
  }

  // Notes methods
  async getNotes(): Promise<Note[]> {
    return localStorage.getNotes();
  }

  async getNotesByHistoryRecord(historyRecordId: number): Promise<Note[]> {
    return localStorage.getNotesByHistoryRecord(historyRecordId);
  }

  async saveNote(note: Note): Promise<Note> {
    return localStorage.saveNote(note);
  }

  // Alias for saveHistory for compatibility
  async saveNotation(record: HistoryRecord): Promise<HistoryRecord> {
    return localStorage.saveNotation(record);
  }

  // Reset method
  async resetDatabase(): Promise<void> {
    return localStorage.resetDatabase();
  }
}

// Export a singleton instance of the storage
export const storage = new IndexedDBStorage();

// Re-export necessary constants
export { DB_NAME, DB_VERSION, STORES } from './core';
