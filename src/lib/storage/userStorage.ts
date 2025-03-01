
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
      
      // Vérifier si l'email existe déjà
      const existingUsers = await this.getUsers();
      const emailExists = existingUsers.some(u => u.email === user.email && u.id !== user.id);
      
      if (emailExists) {
        console.error("Email already exists:", user.email);
        throw new Error("Email already exists");
      }
      
      // Utilisez put avec la clé explicite pour garantir la sauvegarde
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => store.put(user, user.id)
      );
      
      // Vérifier que l'utilisateur a bien été sauvegardé
      const savedUser = await this.getUserById(user.id);
      if (!savedUser) {
        throw new Error("Failed to save user: User not found after save operation");
      }
      
      console.log("User saved successfully:", savedUser);
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
      const user = await this.performTransaction(
        STORES.CURRENT_USER,
        'readonly',
        store => store.get('current')
      );
      console.log("Current user from database:", user);
      return user || null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async setCurrentUser(user: User | null): Promise<void> {
    try {
      console.log("Setting current user in database:", user);
      await this.performTransaction(
        STORES.CURRENT_USER,
        'readwrite',
        store => {
          // Si on efface l'utilisateur actuel
          if (!user) {
            return store.clear();
          }
          // Sinon on le met à jour
          return store.put(user, 'current');
        }
      );
      console.log("Current user set successfully in database");
    } catch (error) {
      console.error("Error setting current user:", error);
      throw error;
    }
  }

  async clearAllUsers(): Promise<boolean> {
    try {
      console.log("Starting to clear all users...");
      
      // Cette fonction sera utilisée pour vider un store
      const clearStore = async (storeName: string) => {
        return new Promise<void>((resolve, reject) => {
          const request = indexedDB.open(DB_NAME, DB_VERSION);
          
          request.onerror = (event) => {
            console.error(`Error opening database to clear ${storeName}:`, event);
            reject(new Error(`Failed to open database for clearing ${storeName}`));
          };
          
          request.onsuccess = (event) => {
            const db = request.result;
            try {
              const transaction = db.transaction(storeName, 'readwrite');
              const store = transaction.objectStore(storeName);
              
              const clearRequest = store.clear();
              
              clearRequest.onsuccess = () => {
                console.log(`Successfully cleared ${storeName} store`);
                resolve();
              };
              
              clearRequest.onerror = (evt) => {
                console.error(`Error clearing ${storeName}:`, evt);
                reject(new Error(`Failed to clear ${storeName}`));
              };
              
              transaction.oncomplete = () => {
                db.close();
              };
            } catch (error) {
              console.error(`Transaction error clearing ${storeName}:`, error);
              db.close();
              reject(error);
            }
          };
        });
      };
      
      // Nettoyer un par un chaque store
      await clearStore(STORES.CURRENT_USER);
      await clearStore(STORES.USERS);
      
      // Effacer également les mots de passe stockés dans localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_') && key.endsWith('_password')) {
          console.log("Removing localStorage item:", key);
          localStorage.removeItem(key);
          i--; // Ajuster l'index car nous venons de supprimer un élément
        }
      }
      
      // Vérifier après effacement
      const users = await this.getUsers();
      const currentUser = await this.getCurrentUser();
      
      console.log("After clearing - users count:", users.length);
      console.log("After clearing - current user exists:", !!currentUser);
      
      const success = users.length === 0 && !currentUser;
      console.log("Clear operation success:", success);
      
      if (!success) {
        console.error("Failed to completely clear users - some data remains");
      }
      
      return success;
    } catch (error) {
      console.error("Error in clearAllUsers:", error);
      return false;
    }
  }
}
