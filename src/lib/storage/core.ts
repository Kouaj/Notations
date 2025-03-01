import { IDBStorage } from './interfaces';
import { User, Reseau, Parcelle, HistoryRecord, Note } from '@/shared/schema';

// Implémentation de base pour le stockage local
class LocalStorage implements IDBStorage {
  private users: User[] = [];
  private reseaux: Reseau[] = [];
  private parcelles: Parcelle[] = [];
  private history: HistoryRecord[] = [];
  private notes: Note[] = [];
  
  private currentUser: User | null = null;
  private selectedReseau: Reseau | null = null;
  private selectedParcelle: Parcelle | null = null;
  
  // Utilisateurs
  async getCurrentUser(): Promise<User | null> {
    return this.currentUser;
  }
  
  async saveUser(user: User): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    
    this.currentUser = user;
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return this.users;
  }
  
  async getUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }
  
  // Réseaux
  async getReseaux(): Promise<Reseau[]> {
    return this.reseaux;
  }
  
  async getReseauById(id: number): Promise<Reseau | null> {
    return this.reseaux.find(reseau => reseau.id === id) || null;
  }
  
  async saveReseau(reseau: Reseau): Promise<Reseau> {
    const existingIndex = this.reseaux.findIndex(r => r.id === reseau.id);
    
    if (existingIndex >= 0) {
      this.reseaux[existingIndex] = reseau;
    } else {
      this.reseaux.push(reseau);
    }
    
    return reseau;
  }
  
  async getSelectedReseau(): Promise<Reseau | null> {
    return this.selectedReseau;
  }
  
  async setSelectedReseau(reseau: Reseau): Promise<void> {
    this.selectedReseau = reseau;
  }
  
  // Parcelles
  async getParcelles(): Promise<Parcelle[]> {
    return this.parcelles;
  }
  
  async getParcelleById(id: number): Promise<Parcelle | null> {
    return this.parcelles.find(parcelle => parcelle.id === id) || null;
  }
  
  async getParcellesByReseau(reseauId: number): Promise<Parcelle[]> {
    return this.parcelles.filter(parcelle => parcelle.reseauId === reseauId);
  }
  
  async saveParcelle(parcelle: Parcelle): Promise<Parcelle> {
    const existingIndex = this.parcelles.findIndex(p => p.id === parcelle.id);
    
    if (existingIndex >= 0) {
      this.parcelles[existingIndex] = parcelle;
    } else {
      this.parcelles.push(parcelle);
    }
    
    return parcelle;
  }
  
  async getSelectedParcelle(): Promise<Parcelle | null> {
    return this.selectedParcelle;
  }
  
  async setSelectedParcelle(parcelle: Parcelle): Promise<void> {
    this.selectedParcelle = parcelle;
  }
  
  // Historique et notations
  async getHistory(): Promise<HistoryRecord[]> {
    return this.history;
  }
  
  async getHistoryByUser(userId: number): Promise<HistoryRecord[]> {
    return this.history.filter(record => record.userId === userId);
  }
  
  async getHistoryByParcelle(parcelleId: number): Promise<HistoryRecord[]> {
    return this.history.filter(record => record.parcelleId === parcelleId);
  }
  
  async getHistoryByReseau(reseauId: number): Promise<HistoryRecord[]> {
    return this.history.filter(record => record.reseauId === reseauId);
  }
  
  async saveHistory(record: HistoryRecord): Promise<HistoryRecord> {
    const existingIndex = this.history.findIndex(r => r.id === record.id);
    
    if (existingIndex >= 0) {
      this.history[existingIndex] = record;
    } else {
      this.history.push(record);
    }
    
    return record;
  }
  
  async saveNotation(record: HistoryRecord): Promise<HistoryRecord> {
    return this.saveHistory(record);
  }
  
  // Notes
  async getNotes(): Promise<Note[]> {
    return this.notes;
  }
  
  async getNotesByHistoryRecord(historyRecordId: number): Promise<Note[]> {
    return this.notes.filter(note => note.historyRecordId === historyRecordId);
  }
  
  async saveNote(note: Note): Promise<Note> {
    const existingIndex = this.notes.findIndex(n => n.id === note.id);
    
    if (existingIndex >= 0) {
      this.notes[existingIndex] = note;
    } else {
      this.notes.push(note);
    }
    
    return note;
  }
  
  // Réinitialisation
  async resetDatabase(): Promise<void> {
    this.users = [];
    this.reseaux = [];
    this.parcelles = [];
    this.history = [];
    this.notes = [];
    
    this.currentUser = null;
    this.selectedReseau = null;
    this.selectedParcelle = null;
  }
}

// Exporter une instance unique
export const localStorage = new LocalStorage();
