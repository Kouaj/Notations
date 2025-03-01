
// Core IndexedDB functionality
export const DB_NAME = 'agricultureDB';
export const DB_VERSION = 5; // Updated from 4 to 5
export const STORES = {
  USERS: 'users',
  RESEAUX: 'reseaux',
  PARCELLES: 'parcelles',
  HISTORY: 'history',
  SELECTED_PARCELLE: 'selectedParcelle',
  SELECTED_RESEAU: 'selectedReseau',
  CURRENT_USER: 'currentUser'
} as const;

// Base storage handler class
export class BaseStorage {
  protected dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  protected initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // S'assurer que la base de données est bien fermée avant de l'ouvrir
      try {
        // Utilisation explicite de la version configurée
        console.log(`Initialisation de la base de données avec la version: ${DB_VERSION}`);
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
          console.error("Database error:", request.error);
          // Vérifier si c'est une erreur de version
          if (request.error && request.error.name === "VersionError") {
            console.warn("⚠️ Erreur de version détectée lors de l'initialisation, rechargement...");
            window.location.reload();
            return;
          }
          reject(request.error);
        };

        request.onsuccess = () => {
          console.log(`Base de données ${DB_NAME} ouverte avec succès, version: ${request.result.version}`);
          resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
          console.log(`Mise à niveau de la base de données à la version: ${DB_VERSION}`);
          const db = (event.target as IDBOpenDBRequest).result;

          // Création des object stores si nécessaire
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
      } catch (error) {
        console.error("Erreur critique lors de l'initialisation de la base de données:", error);
        reject(error);
      }
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
        request.onerror = () => {
          console.error(`Error in transaction for store ${storeName}:`, request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error(`Error in transaction for store ${storeName}:`, error);
        reject(error);
      }
    });
  }
}
