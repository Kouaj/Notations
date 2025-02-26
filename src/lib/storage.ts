
import { Parcelle, HistoryRecord } from '@/shared/schema';

// Constants for IndexedDB
export const DB_NAME = 'agricultureDB';
export const DB_VERSION = 2;
export const STORES = {
  PARCELLES: 'parcelles',
  HISTORY: 'history',
  SELECTED_PARCELLE: 'selectedParcelle'
} as const;

// Storage interface for IndexedDB operations
export interface IDBStorage {
  getParcelles(): Promise<Parcelle[]>;
  saveParcelle(parcelle: Parcelle): Promise<void>;
  deleteParcelle(id: number): Promise<void>;
  updateParcelle(parcelle: Parcelle): Promise<void>;
  getHistory(): Promise<HistoryRecord[]>;
  saveHistory(record: HistoryRecord): Promise<void>;
  deleteHistory(id: number): Promise<void>;
  setSelectedParcelle(parcelle: Parcelle | null): Promise<void>;
  getSelectedParcelle(): Promise<Parcelle | null>;
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

        if (!db.objectStoreNames.contains(STORES.PARCELLES)) {
          db.createObjectStore(STORES.PARCELLES, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          db.createObjectStore(STORES.HISTORY, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORES.SELECTED_PARCELLE)) {
          db.createObjectStore(STORES.SELECTED_PARCELLE);
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

  async getParcelles(): Promise<Parcelle[]> {
    return this.performTransaction(
      STORES.PARCELLES,
      'readonly',
      store => store.getAll()
    );
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

  async getHistory(): Promise<HistoryRecord[]> {
    return this.performTransaction(
      STORES.HISTORY,
      'readonly',
      store => store.getAll()
    );
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
}

// Export a singleton instance of the storage
export const storage = new IndexedDBStorage();
