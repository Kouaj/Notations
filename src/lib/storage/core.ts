
// Core IndexedDB functionality
export const DB_NAME = 'agricultureDB';
export const DB_VERSION = 5; // Version 5 confirmée
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
      try {
        // Force la fermeture de toute connexion existante
        this.closeExistingConnections();
        
        // Utilisation explicite de la version configurée
        console.log(`Initialisation de la base de données avec la version: ${DB_VERSION}`);
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
          console.error("Database error:", request.error);
          
          // Vérifier si c'est une erreur de version
          if (request.error && (
              request.error.name === "VersionError" || 
              request.error.message?.includes("version")
          )) {
            console.warn("⚠️ Erreur de version détectée lors de l'initialisation, tentative de récupération...");
            this.handleVersionError();
            return;
          }
          reject(request.error);
        };

        request.onsuccess = () => {
          const db = request.result;
          console.log(`Base de données ${DB_NAME} ouverte avec succès, version: ${db.version}`);
          
          // Vérification de cohérence de version
          if (db.version !== DB_VERSION) {
            console.warn(`⚠️ La version de la base de données (${db.version}) ne correspond pas à la version configurée (${DB_VERSION})`);
            this.handleVersionError();
            return;
          }
          
          // Écouter les erreurs de blocage
          db.onversionchange = () => {
            console.log("Une autre onglet tente de mettre à jour la base de données, fermeture...");
            db.close();
            window.location.reload();
          };
          
          resolve(db);
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

  // Méthode pour fermer toute connexion existante
  private closeExistingConnections() {
    try {
      const databases = indexedDB.databases();
      databases.then(dbs => {
        dbs.forEach(db => {
          if (db.name === DB_NAME) {
            console.log(`Fermeture de la connexion à ${DB_NAME}`);
            indexedDB.deleteDatabase(DB_NAME); // Force la fermeture en tentant de supprimer
          }
        });
      }).catch(err => {
        console.warn("Impossible de lister les bases de données:", err);
      });
    } catch (error) {
      console.warn("La méthode databases() n'est pas supportée:", error);
    }
  }

  // Méthode pour gérer les erreurs de version
  private handleVersionError() {
    console.warn("🔄 Tentative de récupération suite à une erreur de version...");
    
    // Suppression forcée de la base de données et rechargement
    try {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      
      deleteRequest.onsuccess = () => {
        console.log("🗑️ Base de données supprimée avec succès, rechargement...");
        localStorage.setItem('db_reset_timestamp', Date.now().toString());
        window.location.reload();
      };
      
      deleteRequest.onerror = () => {
        console.error("❌ Impossible de supprimer la base de données");
        window.location.reload(); // Tenter de recharger quand même
      };
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de la base de données:", error);
      window.location.reload(); // Tenter de recharger quand même
    }
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
