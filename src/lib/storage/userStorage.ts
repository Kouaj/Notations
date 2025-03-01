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
      console.log("clearAllUsers: Starting to clear all user data");
      
      // 1. Effacer CURRENT_USER store
      console.log("clearAllUsers: Clearing CURRENT_USER store");
      await this.performTransaction(
        STORES.CURRENT_USER,
        'readwrite',
        store => store.clear()
      );
      
      // 2. Effacer USERS store
      console.log("clearAllUsers: Clearing USERS store");
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => store.clear()
      );
      
      // 3. Effacer les mots de passe dans localStorage
      console.log("clearAllUsers: Clearing user passwords from localStorage");
      const passwordKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_') && key.endsWith('_password')) {
          passwordKeys.push(key);
        }
      }
      
      passwordKeys.forEach(key => {
        console.log(`clearAllUsers: Removing localStorage key: ${key}`);
        localStorage.removeItem(key);
      });
      
      // 4. Vérifier que tout a été effacé correctement
      const remainingUsers = await this.getUsers();
      const currentUser = await this.getCurrentUser();
      
      const success = remainingUsers.length === 0 && currentUser === null;
      console.log(`clearAllUsers: Verification - users cleared: ${remainingUsers.length === 0}, current user cleared: ${currentUser === null}`);
      
      if (!success) {
        console.error("clearAllUsers: Failed to completely clear users data");
        return false;
      }
      
      console.log("clearAllUsers: Successfully cleared all user data");
      return true;
    } catch (error) {
      console.error("clearAllUsers: Error while clearing user data:", error);
      return false;
    }
  }
}
