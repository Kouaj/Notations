import { User, Reseau, Parcelle, HistoryRecord } from "@/shared/schema";
import { IDBStorage } from "./interfaces";

class IndexedDBStorage implements IDBStorage {
  db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = window.indexedDB.open('notationsDB', 1);

      request.onerror = () => {
        console.error("Failed to open DB", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;

        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('reseaux')) {
          db.createObjectStore('reseaux', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('parcelles')) {
          db.createObjectStore('parcelles', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // User methods
  async getUser(id: number): Promise<User | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const objectStore = transaction.objectStore('users');
      const request = objectStore.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error("Failed to get user", request.error);
        reject(request.error);
      };
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const objectStore = transaction.objectStore('users');
      const index = objectStore.index('email');
      const request = index.get(email);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error("Failed to get user by email", request.error);
        reject(request.error);
      };
    });
  }

  async saveUser(user: User): Promise<User> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const objectStore = transaction.objectStore('users');
      const request = objectStore.put(user);

      request.onsuccess = () => {
        resolve(user);
      };

      request.onerror = () => {
        console.error("Failed to save user", request.error);
        reject(request.error);
      };
    });
    return user; // Retourner l'utilisateur après sauvegarde
  }

  // Reseau methods
  async getReseaux(userId: number): Promise<Reseau[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reseaux'], 'readonly');
      const objectStore = transaction.objectStore('reseaux');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const reseaux = request.result.filter(reseau => reseau.userId === userId);
        resolve(reseaux);
      };

      request.onerror = () => {
        console.error("Failed to get reseaux", request.error);
        reject(request.error);
      };
    });
  }

  async getReseau(id: number): Promise<Reseau | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reseaux'], 'readonly');
      const objectStore = transaction.objectStore('reseaux');
      const request = objectStore.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error("Failed to get reseau", request.error);
        reject(request.error);
      };
    });
  }

  async saveReseau(reseau: Reseau): Promise<Reseau> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['reseaux'], 'readwrite');
      const objectStore = transaction.objectStore('reseaux');
      const request = objectStore.put(reseau);

      request.onsuccess = () => {
        resolve(reseau);
      };

      request.onerror = () => {
        console.error("Failed to save reseau", request.error);
        reject(request.error);
      };
    });
    return reseau; // Retourner le réseau après sauvegarde
  }

  // Parcelle methods
  async getParcelles(userId: number): Promise<Parcelle[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['parcelles'], 'readonly');
      const objectStore = transaction.objectStore('parcelles');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const parcelles = request.result.filter(parcelle => parcelle.userId === userId);
        resolve(parcelles);
      };

      request.onerror = () => {
        console.error("Failed to get parcelles", request.error);
        reject(request.error);
      };
    });
  }

  async getParcelle(id: number): Promise<Parcelle | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['parcelles'], 'readonly');
      const objectStore = transaction.objectStore('parcelles');
      const request = objectStore.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error("Failed to get parcelle", request.error);
        reject(request.error);
      };
    });
  }

  async getParcellesByReseau(reseauId: number, userId?: number): Promise<Parcelle[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['parcelles'], 'readonly');
      const objectStore = transaction.objectStore('parcelles');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        let parcelles = request.result.filter(parcelle => parcelle.reseauId === reseauId);
		if (userId) {
			parcelles = parcelles.filter(parcelle => parcelle.userId === userId);
		}
        resolve(parcelles);
      };

      request.onerror = () => {
        console.error("Failed to get parcelles by reseau", request.error);
        reject(request.error);
      };
    });
  }

  async saveParcelle(parcelle: Parcelle): Promise<Parcelle> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['parcelles'], 'readwrite');
      const objectStore = transaction.objectStore('parcelles');
      const request = objectStore.put(parcelle);

      request.onsuccess = () => {
        resolve(parcelle);
      };

      request.onerror = () => {
        console.error("Failed to save parcelle", request.error);
        reject(request.error);
      };
    });
    return parcelle; // Retourner la parcelle après sauvegarde
  }

  // History methods
  async getHistory(userId: number): Promise<HistoryRecord[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readonly');
      const objectStore = transaction.objectStore('history');
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const history = request.result.filter(record => record.userId === userId);
        resolve(history);
      };

      request.onerror = () => {
        console.error("Failed to get history", request.error);
        reject(request.error);
      };
    });
  }

  async getHistoryRecord(id: number): Promise<HistoryRecord | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readonly');
      const objectStore = transaction.objectStore('history');
      const request = objectStore.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error("Failed to get history record", request.error);
        reject(request.error);
      };
    });
  }

  async saveHistory(record: HistoryRecord): Promise<HistoryRecord> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['history'], 'readwrite');
      const objectStore = transaction.objectStore('history');
      const request = objectStore.put(record);

      request.onsuccess = () => {
        resolve(record);
      };

      request.onerror = () => {
        console.error("Failed to save history record", request.error);
        reject(request.error);
      };
    });
    return record; // Retourner l'enregistrement après sauvegarde
  }

  // Alias pour saveHistory pour compatibilité
  async saveNotation(record: HistoryRecord): Promise<HistoryRecord> {
    return this.saveHistory(record);
  }

  // Méthode pour sauvegarder une photo
  async savePhoto(photoData: string, filename: string): Promise<string> {
    console.log("Saving photo:", filename);
    // Logique pour stocker l'image
    return filename; // Retourner le nom du fichier ou une URL
  }
}

const storage: IDBStorage = new IndexedDBStorage();

export default storage;
