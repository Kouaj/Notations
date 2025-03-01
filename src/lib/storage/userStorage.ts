
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
      console.log("Starting to clear all users...");
      
      // Utiliser les transactions de BaseStorage pour vider les stores
      try {
        await this.performTransaction(
          STORES.CURRENT_USER,
          'readwrite',
          store => {
            console.log("Clearing CURRENT_USER store");
            return store.clear();
          }
        );
        console.log("Successfully cleared CURRENT_USER store");
      } catch (error) {
        console.error("Error clearing CURRENT_USER store:", error);
      }
      
      try {
        await this.performTransaction(
          STORES.USERS,
          'readwrite',
          store => {
            console.log("Clearing USERS store");
            return store.clear();
          }
        );
        console.log("Successfully cleared USERS store");
      } catch (error) {
        console.error("Error clearing USERS store:", error);
      }
      
      // Effacer également les mots de passe stockés dans localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_') && key.endsWith('_password')) {
          keysToRemove.push(key);
        }
      }
      
      // Supprimer les clés collectées (pour éviter les problèmes d'index lors de la suppression)
      keysToRemove.forEach(key => {
        console.log("Removing localStorage item:", key);
        localStorage.removeItem(key);
      });
      
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
