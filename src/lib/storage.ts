
import { Parcelle, Reseau, HistoryRecord, User } from '@/shared/schema';

// Constants for IndexedDB
export const DB_NAME = 'agricultureDB';
export const DB_VERSION = 4; // Incrémenté pour ajouter le store users
export const STORES = {
  USERS: 'users',
  RESEAUX: 'reseaux',
  PARCELLES: 'parcelles',
  HISTORY: 'history',
  SELECTED_PARCELLE: 'selectedParcelle',
  SELECTED_RESEAU: 'selectedReseau',
  CURRENT_USER: 'currentUser'
} as const;

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

// Implementation of the storage interface
class IndexedDBStorage implements IDBStorage {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("Database error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORES.USERS)) {
          db.createObjectStore(STORES.USERS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.RESEAUX)) {
          db.createObjectStore(STORES.RESEAUX, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.PARCELLES)) {
          db.createObjectStore(STORES.PARCELLES, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.SELECTED_PARCELLE)) {
          db.createObjectStore(STORES.SELECTED_PARCELLE);
        }

        if (!db.objectStoreNames.contains(STORES.SELECTED_RESEAU)) {
          db.createObjectStore(STORES.SELECTED_RESEAU);
        }

        if (!db.objectStoreNames.contains(STORES.CURRENT_USER)) {
          db.createObjectStore(STORES.CURRENT_USER);
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  private async performTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error(`Error in transaction for store ${storeName}:`, error);
        reject(error);
      }
    });
  }

  // Users
  async getUsers(): Promise<User[]> {
    return this.performTransaction(
      STORES.USERS,
      'readonly',
      store => store.getAll()
    );
  }

  async saveUser(user: User): Promise<void> {
    await this.performTransaction(
      STORES.USERS,
      'readwrite',
      store => store.put(user)
    );
  }

  async getUserById(id: string): Promise<User | null> {
    return this.performTransaction(
      STORES.USERS,
      'readonly',
      store => store.get(id)
    );
  }

  async getCurrentUser(): Promise<User | null> {
    return this.performTransaction(
      STORES.CURRENT_USER,
      'readonly',
      store => store.get('current')
    );
  }

  async setCurrentUser(user: User | null): Promise<void> {
    await this.performTransaction(
      STORES.CURRENT_USER,
      'readwrite',
      store => store.put(user, 'current')
    );
  }

  // Réseaux
  async getReseaux(): Promise<Reseau[]> {
    return this.performTransaction(
      STORES.RESEAUX,
      'readonly',
      store => store.getAll()
    );
  }

  async getReseauxByUser(userId: string): Promise<Reseau[]> {
    const reseaux = await this.getReseaux();
    return reseaux.filter(r => r.userId === userId);
  }

  async saveReseau(reseau: Reseau): Promise<void> {
    await this.performTransaction(
      STORES.RESEAUX,
      'readwrite',
      store => store.put(reseau)
    );
  }

  async deleteReseau(id: number): Promise<void> {
    await this.performTransaction(
      STORES.RESEAUX,
      'readwrite',
      store => store.delete(id)
    );
  }

  async updateReseau(reseau: Reseau): Promise<void> {
    await this.performTransaction(
      STORES.RESEAUX,
      'readwrite',
      store => store.put(reseau)
    );
  }

  async setSelectedReseau(reseau: Reseau | null): Promise<void> {
    await this.performTransaction(
      STORES.SELECTED_RESEAU,
      'readwrite',
      store => store.put(reseau, 'current')
    );
  }

  async getSelectedReseau(): Promise<Reseau | null> {
    return this.performTransaction(
      STORES.SELECTED_RESEAU,
      'readonly',
      store => store.get('current')
    );
  }

  // Parcelles
  async getParcelles(): Promise<Parcelle[]> {
    return this.performTransaction(
      STORES.PARCELLES,
      'readonly',
      store => store.getAll()
    );
  }

  async getParcellesByUser(userId: string): Promise<Parcelle[]> {
    const parcelles = await this.getParcelles();
    return parcelles.filter(p => p.userId === userId);
  }

  async getParcellesByReseau(reseauId: number, userId: string): Promise<Parcelle[]> {
    const parcelles = await this.getParcellesByUser(userId);
    return parcelles.filter(p => p.reseauId === reseauId);
  }

  async saveParcelle(parcelle: Parcelle): Promise<void> {
    await this.performTransaction(
      STORES.PARCELLES,
      'readwrite',
      store => store.put(parcelle)
    );
  }

  async deleteParcelle(id: number): Promise<void> {
    await this.performTransaction(
      STORES.PARCELLES,
      'readwrite',
      store => store.delete(id)
    );
  }

  async updateParcelle(parcelle: Parcelle): Promise<void> {
    await this.performTransaction(
      STORES.PARCELLES,
      'readwrite',
      store => store.put(parcelle)
    );
  }

  async setSelectedParcelle(parcelle: Parcelle | null): Promise<void> {
    await this.performTransaction(
      STORES.SELECTED_PARCELLE,
      'readwrite',
      store => store.put(parcelle, 'current')
    );
  }

  async getSelectedParcelle(): Promise<Parcelle | null> {
    return this.performTransaction(
      STORES.SELECTED_PARCELLE,
      'readonly',
      store => store.get('current')
    );
  }

  // Historique
  async getHistory(): Promise<HistoryRecord[]> {
    return this.performTransaction(
      STORES.HISTORY,
      'readonly',
      store => store.getAll()
    );
  }

  async getHistoryByUser(userId: string): Promise<HistoryRecord[]> {
    const history = await this.getHistory();
    return history.filter(h => h.userId === userId);
  }

  async saveHistory(record: HistoryRecord): Promise<void> {
    await this.performTransaction(
      STORES.HISTORY,
      'readwrite',
      store => store.put(record)
    );
  }

  async deleteHistory(id: number): Promise<void> {
    await this.performTransaction(
      STORES.HISTORY,
      'readwrite',
      store => store.delete(id)
    );
  }
}

// Export a singleton instance of the storage
export const storage = new IndexedDBStorage();
