
import { User, Parcelle, Reseau, HistoryRecord, History } from '@/shared/schema';
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export const DB_NAME = 'app-db';
export const DB_VERSION = 2;

export enum STORES {
  USERS = 'users',
  CURRENT_USER = 'current_user',
  PARCELLES = 'parcelles',
  RESEAUX = 'reseaux',
  HISTORY = 'history',
  SELECTED_RESEAU = 'selected_reseau',
  SELECTED_PARCELLE = 'selected_parcelle'
}

export interface AppDB extends DBSchema {
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
  [STORES.SELECTED_RESEAU]: {
    key: string;
    value: Reseau;
  };
  [STORES.SELECTED_PARCELLE]: {
    key: string;
    value: Parcelle;
  };
}

export class BaseStorage {
  private db: IDBPDatabase<AppDB> | null = null;
  public dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

  constructor() {
    this.db = null;
    this.dbPromise = null;
  }

  // Méthode explicite d'initialisation
  async initDB(): Promise<IDBPDatabase<AppDB>> {
    if (!this.dbPromise) {
      console.log(`Initialisation de la base de données ${DB_NAME} avec version ${DB_VERSION}`);
      this.dbPromise = this.openDatabase();
      this.db = await this.dbPromise;
    }
    return this.dbPromise;
  }

  protected openDatabase(): Promise<IDBPDatabase<AppDB>> {
    return openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`Mise à niveau de la base de données de la version ${oldVersion} à ${newVersion}`);
        
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
        
        if (!db.objectStoreNames.contains(STORES.SELECTED_RESEAU)) {
          console.log(`Création du magasin d'objets ${STORES.SELECTED_RESEAU}`);
          db.createObjectStore(STORES.SELECTED_RESEAU);
        }
        
        if (!db.objectStoreNames.contains(STORES.SELECTED_PARCELLE)) {
          console.log(`Création du magasin d'objets ${STORES.SELECTED_PARCELLE}`);
          db.createObjectStore(STORES.SELECTED_PARCELLE);
        }
      }
    });
  }

  protected async performTransaction<T>(
    storeName: STORES,
    mode: 'readonly' | 'readwrite',
    operation: (store: any) => Promise<T> | T
  ): Promise<T> {
    if (!this.dbPromise) {
      console.warn("La base de données n'est pas initialisée. Tentative d'initialisation...");
      await this.initDB();
    }

    const db = await this.dbPromise;
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    
    try {
      const result = await operation(store);
      await tx.done;
      return result;
    } catch (error) {
      console.error(`Erreur lors de la transaction sur ${storeName}:`, error);
      throw error;
    }
  }
}
