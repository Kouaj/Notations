
// Core IndexedDB functionality
export const DB_NAME = 'agricultureDB';
export const DB_VERSION = 5;
export const STORES = {
  USERS: 'users',
  RESEAUX: 'reseaux',
  PARCELLES: 'parcelles',
  HISTORY: 'history',
  SELECTED_PARCELLE: 'selectedParcelle',
  SELECTED_RESEAU: 'selectedReseau',
  CURRENT_USER: 'currentUser',
  SYSTEM_LOGS: 'systemLogs'
} as const;

// Base storage handler class
export class BaseStorage {
  protected dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  protected initDB(): Promise<IDBDatabase> {
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

        if (!db.objectStoreNames.contains(STORES.SYSTEM_LOGS)) {
          const logStore = db.createObjectStore(STORES.SYSTEM_LOGS, { keyPath: 'id', autoIncrement: true });
          logStore.createIndex('userId', 'userId', { unique: false });
          logStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  protected async getDB(): Promise<IDBDatabase> {
    return this.dbPromise;
  }

  protected async performTransaction<T>(
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
}
