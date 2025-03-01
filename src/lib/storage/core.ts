
import { IDBStorage } from './interfaces';
import { User, Reseau, Parcelle, HistoryRecord, Note } from '@/shared/schema';

// Constants for IndexedDB
export const DB_NAME = 'vitiapp_db';
export const DB_VERSION = 1;

// Store names
export const STORES = {
  USERS: 'users',
  CURRENT_USER: 'currentUser',
  RESEAUX: 'reseaux',
  SELECTED_RESEAU: 'selectedReseau',
  PARCELLES: 'parcelles',
  SELECTED_PARCELLE: 'selectedParcelle',
  HISTORY: 'history',
  NOTES: 'notes'
};

// Base storage class with transaction helper
export class BaseStorage {
  async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open database'));

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        
        try {
          const request = callback(store);

          request.onsuccess = () => {
            resolve(request.result);
          };

          request.onerror = () => {
            reject(request.error);
          };
        } catch (error) {
          reject(error);
        }
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(STORES.CURRENT_USER)) {
          db.createObjectStore(STORES.CURRENT_USER);
        }
        
        if (!db.objectStoreNames.contains(STORES.RESEAUX)) {
          db.createObjectStore(STORES.RESEAUX, { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains(STORES.SELECTED_RESEAU)) {
          db.createObjectStore(STORES.SELECTED_RESEAU);
        }
        
        if (!db.objectStoreNames.contains(STORES.PARCELLES)) {
          db.createObjectStore(STORES.PARCELLES, { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains(STORES.SELECTED_PARCELLE)) {
          db.createObjectStore(STORES.SELECTED_PARCELLE);
        }
        
        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          db.createObjectStore(STORES.HISTORY, { keyPath: 'id', autoIncrement: true });
        }
        
        if (!db.objectStoreNames.contains(STORES.NOTES)) {
          db.createObjectStore(STORES.NOTES, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }
}

// Fallback implementation using localStorage for development
export class LocalStorage implements IDBStorage {
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
  
  async getUserById(id: string): Promise<User | null> {
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
      // Auto-increment ID if not provided
      if (!reseau.id) {
        reseau.id = this.reseaux.length > 0 
          ? Math.max(...this.reseaux.map(r => r.id)) + 1 
          : 1;
      }
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
      // Auto-increment ID if not provided
      if (!parcelle.id) {
        parcelle.id = this.parcelles.length > 0 
          ? Math.max(...this.parcelles.map(p => p.id)) + 1 
          : 1;
      }
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
  
  async getHistoryByUser(userId: string): Promise<HistoryRecord[]> {
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
      // Auto-increment ID if not provided
      if (!record.id) {
        record.id = this.history.length > 0 
          ? Math.max(...this.history.map(r => r.id)) + 1 
          : 1;
      }
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
    // Note doesn't have historyRecordId in the schema, so we'll need to modify this later
    return this.notes;
  }
  
  async saveNote(note: Note): Promise<Note> {
    // Note doesn't have id in the schema, so we'll need to modify these lines
    // For now, we'll just add the note to the array
    this.notes.push(note);
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

  // Additional method needed by the interface
  async setCurrentUser(user: User | null): Promise<void> {
    this.currentUser = user;
  }
}

// Export an instance of the localStorage for development
export const localStorage = new LocalStorage();
