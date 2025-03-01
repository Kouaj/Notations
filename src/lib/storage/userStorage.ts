
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
    try {
      console.log("clearAllUsers: Nouvelle approche pour effacer toutes les données utilisateur");
      
      // Obtenir une référence directe à la base de données
      const db = await this.getDB();
      
      // 1. Vider le store CURRENT_USER avec une transaction dédiée
      return new Promise((resolve) => {
        try {
          console.log("clearAllUsers: Phase 1 - Nettoyage de CURRENT_USER");
          const tx1 = db.transaction(STORES.CURRENT_USER, 'readwrite');
          const currentUserStore = tx1.objectStore(STORES.CURRENT_USER);
          
          const clearReq1 = currentUserStore.clear();
          
          clearReq1.onsuccess = () => {
            console.log("clearAllUsers: CURRENT_USER vidé avec succès");
            
            // 2. Vider le store USERS avec une nouvelle transaction
            try {
              console.log("clearAllUsers: Phase 2 - Nettoyage de USERS");
              const tx2 = db.transaction(STORES.USERS, 'readwrite');
              const usersStore = tx2.objectStore(STORES.USERS);
              
              const clearReq2 = usersStore.clear();
              
              clearReq2.onsuccess = () => {
                console.log("clearAllUsers: USERS vidé avec succès");
                
                // 3. Nettoyer localStorage
                console.log("clearAllUsers: Phase 3 - Nettoyage de localStorage");
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('user_') && key.endsWith('_password')) {
                    console.log(`clearAllUsers: Suppression de la clé localStorage: ${key}`);
                    localStorage.removeItem(key);
                    // Reculer l'index car nous venons de supprimer un élément
                    i--;
                  }
                }
                
                console.log("clearAllUsers: Nettoyage complet terminé, vérification...");
                
                // Vérifier le résultat avec des promesses indépendantes pour éviter toute contamination
                setTimeout(async () => {
                  try {
                    // Vérification indépendante des utilisateurs
                    const remainingUsersCheck = await this.performTransaction(
                      STORES.USERS,
                      'readonly',
                      store => store.getAll()
                    );
                    
                    // Vérification indépendante de l'utilisateur actuel
                    const currentUserCheck = await this.performTransaction(
                      STORES.CURRENT_USER,
                      'readonly',
                      store => store.get('current')
                    );
                    
                    console.log("clearAllUsers: Résultat de vérification - Utilisateurs restants:", remainingUsersCheck?.length || 0);
                    console.log("clearAllUsers: Résultat de vérification - Utilisateur actuel:", currentUserCheck);
                    
                    const success = (!remainingUsersCheck || remainingUsersCheck.length === 0) && !currentUserCheck;
                    console.log("clearAllUsers: Résultat global:", success ? "SUCCÈS" : "ÉCHEC");
                    
                    resolve(success);
                  } catch (verifyError) {
                    console.error("clearAllUsers: Erreur lors de la vérification finale:", verifyError);
                    resolve(false);
                  }
                }, 300); // Petit délai pour assurer que les transactions sont terminées
              };
              
              clearReq2.onerror = (event) => {
                console.error("clearAllUsers: Erreur lors du nettoyage de USERS:", event);
                resolve(false);
              };
              
            } catch (error2) {
              console.error("clearAllUsers: Erreur lors de la création de la transaction USERS:", error2);
              resolve(false);
            }
          };
          
          clearReq1.onerror = (event) => {
            console.error("clearAllUsers: Erreur lors du nettoyage de CURRENT_USER:", event);
            resolve(false);
          };
          
        } catch (error1) {
          console.error("clearAllUsers: Erreur lors de la création de la transaction CURRENT_USER:", error1);
          resolve(false);
        }
      });
      
    } catch (mainError) {
      console.error("clearAllUsers: Erreur principale:", mainError);
      return false;
    }
  }
}
