import { User, Reseau, Parcelle, HistoryRecord } from "@/shared/schema";
import { openDB, DBSchema } from 'idb';

interface MyDatabase extends DBSchema {
  users: {
    key: string;
    value: User;
  };
  reseaux: {
    key: number;
    value: Reseau;
    indexes: { 'by-user': string };
  };
  parcelles: {
    key: number;
    value: Parcelle;
    indexes: { 'by-reseau': number, 'by-user': string };
  };
  history: {
    key: number;
    value: HistoryRecord;
    indexes: { 'by-user': string, 'by-parcelle': number };
  };
  selectedReseau: {
    key: string;
    value: Reseau;
  };
  selectedParcelle: {
    key: string;
    value: Parcelle;
  };
}

const DB_NAME = 'notations-db';
const DB_VERSION = 1;

async function initializeDatabase() {
  return openDB<MyDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const usersStore = db.createObjectStore('users', { keyPath: 'id' });
      }

      // Reseaux store
      if (!db.objectStoreNames.contains('reseaux')) {
        const reseauxStore = db.createObjectStore('reseaux', { keyPath: 'id', autoIncrement: true });
        reseauxStore.createIndex('by-user', 'userId');
      }

      // Parcelles store
      if (!db.objectStoreNames.contains('parcelles')) {
        const parcellesStore = db.createObjectStore('parcelles', { keyPath: 'id', autoIncrement: true });
        parcellesStore.createIndex('by-reseau', 'reseauId');
        parcellesStore.createIndex('by-user', 'userId');
      }

      // History store
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('by-user', 'userId');
        historyStore.createIndex('by-parcelle', 'parcelleId');
      }
      
      // Selected Reseau store
      if (!db.objectStoreNames.contains('selectedReseau')) {
        const selectedReseauStore = db.createObjectStore('selectedReseau', { keyPath: 'id' });
      }
      
      // Selected Parcelle store
      if (!db.objectStoreNames.contains('selectedParcelle')) {
        const selectedParcelleStore = db.createObjectStore('selectedParcelle', { keyPath: 'id' });
      }
    }
  });
}

// Initialize the database
let dbPromise = initializeDatabase();

export const storage = {
  saveUser: async (user: User) => {
    const db = await dbPromise;
    await db.put('users', user);
  },
  getCurrentUser: async (): Promise<User | undefined> => {
    const db = await dbPromise;
    const users = await db.getAll('users');
    return users[0]; // Assuming only one user is logged in at a time
  },
  clearCurrentUser: async () => {
    const db = await dbPromise;
    await db.clear('users');
  },
  saveReseau: async (reseau: Reseau) => {
    const db = await dbPromise;
    return await db.put('reseaux', reseau);
  },
  getReseaux: async (userId?: string): Promise<Reseau[]> => {
    const db = await dbPromise;
    if (userId) {
      const reseaux = await db.getAll('reseaux', IDBKeyRange.only(userId), 'by-user');
      return reseaux;
    } else {
      return await db.getAll('reseaux');
    }
  },
  deleteReseau: async (id: number) => {
    const db = await dbPromise;
    await db.delete('reseaux', id);
  },
  saveParcelle: async (parcelle: Parcelle) => {
    const db = await dbPromise;
    return await db.put('parcelles', parcelle);
  },
  getParcelles: async (reseauId?: number, userId?: string): Promise<Parcelle[]> => {
    const db = await dbPromise;
    if (reseauId) {
      const parcelles = await db.getAll('parcelles', IDBKeyRange.only(reseauId), 'by-reseau');
      return parcelles;
    } else if (userId) {
      const parcelles = await db.getAll('parcelles', IDBKeyRange.only(userId), 'by-user');
      return parcelles;
    }
    else {
      return await db.getAll('parcelles');
    }
  },
  deleteParcelle: async (id: number) => {
    const db = await dbPromise;
    await db.delete('parcelles', id);
  },
  saveHistory: async (record: HistoryRecord) => {
    const db = await dbPromise;
    await db.put('history', record);
  },
   getHistory: async (parcelleId?: number, userId?: string): Promise<HistoryRecord[]> => {
    const db = await dbPromise;
    if (parcelleId) {
      const history = await db.getAll('history', IDBKeyRange.only(parcelleId), 'by-parcelle');
      return history;
    } else if (userId) {
      const history = await db.getAll('history', IDBKeyRange.only(userId), 'by-user');
      return history;
    }
    else {
      return await db.getAll('history');
    }
  },
  deleteHistory: async (id: number) => {
    const db = await dbPromise;
    await db.delete('history', id);
  },
  setSelectedReseau: async (reseau: Reseau | null) => {
    const db = await dbPromise;
    if (reseau) {
      await db.put('selectedReseau', reseau);
    } else {
      await db.clear('selectedReseau');
    }
  },
  getSelectedReseau: async (): Promise<Reseau | undefined> => {
    const db = await dbPromise;
    const reseaux = await db.getAll('selectedReseau');
    return reseaux[0];
  },
  setSelectedParcelle: async (parcelle: Parcelle | null) => {
    const db = await dbPromise;
    if (parcelle) {
      await db.put('selectedParcelle', parcelle);
    } else {
      await db.clear('selectedParcelle');
    }
  },
  getSelectedParcelle: async (): Promise<Parcelle | undefined> => {
    const db = await dbPromise;
    const parcelles = await db.getAll('selectedParcelle');
    return parcelles[0];
  },
  savePhoto: async (photo: File): Promise<string> => {
    // Convert the photo to a data URL for storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          // Here we would typically save to a database or storage service
          // For now, we'll just return the data URL
          resolve(event.target.result);
        } else {
          reject(new Error("Failed to read photo"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Error reading photo"));
      };
      reader.readAsDataURL(photo);
    });
  }
};
