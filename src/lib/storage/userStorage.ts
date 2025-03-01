
import { User } from '@/shared/schema';
import { BaseStorage, STORES, DB_NAME, DB_VERSION } from './core';

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
    console.log("🚀 Début de la réinitialisation complète des utilisateurs");
    
    // Étape 1: Suppression complète de la base de données
    try {
      // On ferme d'abord toute connexion existante
      const dbPromise = this.dbPromise;
      if (dbPromise) {
        const db = await dbPromise.catch(() => null);
        if (db) {
          db.close();
          console.log("Base de données fermée avec succès");
        }
      }
      
      // Supprimer complètement la base de données
      return new Promise((resolve) => {
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        
        deleteRequest.onsuccess = () => {
          console.log("🎉 Base de données supprimée avec succès");
          
          // Étape 2: Nettoyer localStorage
          console.log("Nettoyage de localStorage");
          const toRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('user_') && key?.endsWith('_password')) {
              toRemove.push(key);
            }
          }
          
          // Supprimer les clés identifiées
          toRemove.forEach(key => {
            console.log(`Suppression de la clé localStorage: ${key}`);
            localStorage.removeItem(key);
          });
          
          // Étape 3: Recréer la base de données
          console.log("Recréation de la base de données");
          // Forcer la réinitialisation de la promise pour recréer la base de données
          this.dbPromise = this.initDB();
          
          // Vérifier que la base est recréée correctement
          this.dbPromise.then(() => {
            console.log("✅ Base de données recréée avec succès");
            
            // Vérifier que tout est bien réinitialisé après un court délai
            setTimeout(async () => {
              try {
                const users = await this.getUsers();
                const currentUser = await this.getCurrentUser();
                
                if (users.length === 0 && !currentUser) {
                  console.log("✅ Réinitialisation complète confirmée");
                  resolve(true);
                } else {
                  console.error("❌ Échec de la réinitialisation complète");
                  console.log("Users restants:", users);
                  console.log("Current user:", currentUser);
                  resolve(false);
                }
              } catch (error) {
                console.error("Erreur lors de la vérification finale:", error);
                resolve(false);
              }
            }, 500);
          }).catch(error => {
            console.error("Erreur lors de la recréation de la base de données:", error);
            resolve(false);
          });
        };
        
        deleteRequest.onerror = (event) => {
          console.error("❌ Erreur lors de la suppression de la base de données:", event);
          resolve(false);
        };
      });
    } catch (error) {
      console.error("❌ Erreur critique lors de la réinitialisation:", error);
      return false;
    }
  }
}
