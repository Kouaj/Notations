
import { User } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class UserStorage extends BaseStorage {
  async getUsers(): Promise<User[]> {
    try {
      const users = await this.performTransaction(
        STORES.USERS,
        'readonly',
        store => store.getAll()
      );
      console.log("Retrieved users:", users);
      return users || [];
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async saveUser(user: User): Promise<User> {
    if (!user || !user.id || !user.email || !user.name) {
      console.error("Invalid user data:", user);
      throw new Error("Invalid user data - Missing required fields");
    }

    try {
      console.log("Saving user with valid data:", user);
      
      // Utilisons la méthode put pour tous les cas (nouveau ou mise à jour)
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => store.put(user)
      );
      
      // Vérifier que l'utilisateur a bien été sauvegardé
      const savedUser = await this.getUserById(user.id);
      if (!savedUser) {
        throw new Error("Failed to save user: User not found after save operation");
      }
      
      console.log("User saved successfully:", savedUser);
      
      // Stocker également dans localStorage pour persistance lors des actualisations
      localStorage.setItem('current_user', JSON.stringify(user));
      
      return savedUser;
    } catch (error) {
      console.error("Failed to save user:", error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    if (!id) {
      console.error("getUserById: Invalid ID provided");
      return null;
    }
    
    try {
      const user = await this.performTransaction(
        STORES.USERS,
        'readonly',
        store => store.get(id)
      );
      console.log("getUserById result:", user);
      return user || null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      // D'abord, essayer de récupérer depuis IndexedDB
      let user = await this.performTransaction(
        STORES.CURRENT_USER,
        'readonly',
        store => store.get('current')
      );
      
      // Si aucun utilisateur n'est trouvé, essayer localStorage comme solution de secours
      if (!user) {
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          try {
            user = JSON.parse(storedUser);
            // Vérifier que l'utilisateur a des propriétés valides
            if (user && user.id && user.email) {
              // Synchroniser avec IndexedDB
              await this.setCurrentUser(user);
            }
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            return null;
          }
        }
      }
      
      console.log("Current user:", user);
      return user || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      
      // En cas d'erreur, essayer le localStorage comme solution de secours
      try {
        const storedUser = localStorage.getItem('current_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user && user.id && user.email) {
            return user;
          }
        }
      } catch (e) {
        console.error("Fallback also failed:", e);
      }
      
      return null;
    }
  }

  async setCurrentUser(user: User | null): Promise<void> {
    try {
      console.log("Setting current user:", user);
      
      // Mettre à jour IndexedDB
      await this.performTransaction(
        STORES.CURRENT_USER,
        'readwrite',
        async store => {
          // Si on efface l'utilisateur actuel
          if (!user) {
            localStorage.removeItem('current_user');
            return await store.clear();
          }
          // Sinon on le met à jour
          localStorage.setItem('current_user', JSON.stringify(user));
          return await store.put(user, 'current');
        }
      );
      console.log("Current user set successfully");
    } catch (error) {
      console.error("Error setting current user:", error);
      
      // Toujours maintenir localStorage à jour, même en cas d'erreur avec IndexedDB
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('current_user');
      }
    }
  }

  async clearAllUsers(): Promise<boolean> {
    console.log("🧹 Début de la réinitialisation complète des utilisateurs");
    
    try {
      // 1. Fermer toute connexion existante à la base de données
      if (this.dbPromise) {
        const db = await this.dbPromise.catch(() => null);
        if (db) {
          db.close();
          console.log("🔒 Base de données fermée avec succès");
        }
      }
      
      // 2. Supprimer complètement la base de données
      return new Promise((resolve) => {
        // Stockage d'un timestamp pour éviter les boucles de rechargement
        const lastResetTimestamp = localStorage.getItem('db_reset_timestamp');
        const currentTime = Date.now();
        
        if (lastResetTimestamp && (currentTime - parseInt(lastResetTimestamp)) < 10000) {
          console.warn("⚠️ Tentative de réinitialisation trop fréquente, attente...");
          setTimeout(() => {
            resolve(false);
          }, 2000);
          return;
        }
        
        localStorage.setItem('db_reset_timestamp', currentTime.toString());
        
        const DB_NAME = 'viticole-app-db';
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        
        deleteRequest.onerror = (event) => {
          console.error("❌ Erreur lors de la suppression de la base de données:", event);
          resolve(false);
        };
        
        deleteRequest.onblocked = (event) => {
          console.warn("⚠️ La suppression de la base de données est bloquée:", event);
          setTimeout(() => {
            window.location.reload(); // Forcer un rechargement après un délai
          }, 1000);
        };
        
        deleteRequest.onsuccess = () => {
          console.log("🗑️ Base de données supprimée avec succès");
          
          // 3. Nettoyer localStorage (mot de passe stocké)
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.includes('_password') || key === 'current_user') {
              keysToRemove.push(key);
            }
          }
          
          // Suppression des clés
          keysToRemove.forEach(key => {
            localStorage.removeItem(key);
            console.log(`🧹 Suppression de la clé localStorage: ${key}`);
          });
          
          // 4. Recréer la base de données avec des magasins vides
          console.log(`Recréation de la base de données`);
          this.dbPromise = this.initDB();
          
          this.dbPromise
            .then(() => {
              console.log("✅ Base de données recréée avec succès");
              resolve(true);
            })
            .catch((error) => {
              console.error("❌ Erreur lors de la recréation de la base de données:", error);
              resolve(false);
            });
        };
      });
    } catch (error) {
      console.error("❌ Erreur critique lors de la réinitialisation:", error);
      return false;
    }
  }
}
