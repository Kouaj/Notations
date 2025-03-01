import { User, Parcelle, Reseau, History } from '@/shared/schema';
import { openDB, DBSchema } from 'idb';

export const DB_NAME = 'app-db';
export const DB_VERSION = 2;

export enum STORES {
  USERS = 'users',
  CURRENT_USER = 'current_user',
  PARCELLES = 'parcelles',
  RESEAUX = 'reseaux',
  HISTORY = 'history',
}

interface AppDB extends DBSchema {
  [STORES.USERS]: {
    key: string;
    value: User;
  };
  [STORES.CURRENT_USER]: {
    key: string;
    value: User;
  };
  [STORES.PARCELLES]: {
    key: string;
    value: Parcelle;
  };
   [STORES.RESEAUX]: {
    key: string;
    value: Reseau;
  };
  [STORES.HISTORY]: {
    key: string;
    value: History;
  };
}

export class BaseStorage {
  dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.dbPromise = null;
  }

  // Méthode explicite d'initialisation
  initDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      console.log(`Initialisation de la base de données ${DB_NAME} avec version ${DB_VERSION}`);
      this.dbPromise = this.openDatabase();
    }
    return this.dbPromise;
  }

  protected openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!indexedDB) {
        reject(new Error("IndexedDB non pris en charge par ce navigateur"));
        return;
      }

      console.log(`Ouverture de la base de données ${DB_NAME} avec version ${DB_VERSION}`);
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        console.log(`Mise à niveau de la base de données de la version ${event.oldVersion} à ${event.newVersion}`);
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer les object stores s'ils n'existent pas déjà
        if (!db.objectStoreNames.contains(STORES.USERS)) {
          console.log(`Création du magasin d'objets ${STORES.USERS}`);
          db.createObjectStore(STORES.USERS, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORES.CURRENT_USER)) {
          console.log(`Création du magasin d'objets ${STORES.CURRENT_USER}`);
          db.createObjectStore(STORES.CURRENT_USER);
        }

        if (!db.objectStoreNames.contains(STORES.PARCELLES)) {
          console.log(`Création du magasin d'objets ${STORES.PARCELLES}`);
          db.createObjectStore(STORES.PARCELLES, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORES.RESEAUX)) {
          console.log(`Création du magasin d'objets ${STORES.RESEAUX}`);
          db.createObjectStore(STORES.RESEAUX, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          console.log(`Création du magasin d'objets ${STORES.HISTORY}`);
          db.createObjectStore(STORES.HISTORY, { keyPath: "id", autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log(`Base de données ${DB_NAME} ouverte avec succès`);
        resolve(db);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBOpenDBRequest).error;
        console.error(`Erreur lors de l'ouverture de la base de données: ${error?.message || "Erreur inconnue"}`);
        reject(error);
      };
    });
  }

  protected async performTransaction<T>(
    storeName: STORES,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => Promise<T>
  ): Promise<T> {
    if (!this.dbPromise) {
      console.warn("La base de données n'est pas initialisée. Tentative d'initialisation...");
      await this.initDB();
    }

    const db = await this.dbPromise;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      operation(store)
        .then(result => {
          transaction.oncomplete = () => resolve(result);
          transaction.onerror = () => {
            console.error(`Transaction error on ${storeName}:`, transaction.error);
            reject(transaction.error);
          };
        })
        .catch(error => {
          console.error(`Operation error on ${storeName}:`, error);
          reject(error);
        });
    });
  }
}
