
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
      
      // Effacer l'utilisateur actuel d'abord
      await this.performTransaction(
        STORES.CURRENT_USER,
        'readwrite',
        store => {
          console.log("Clearing CURRENT_USER store...");
          return store.clear();
        }
      );
      
      // Ensuite effacer tous les utilisateurs
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => {
          console.log("Clearing USERS store...");
          return store.clear();
        }
      );
      
      // Vérifier après effacement
      const afterUsers = await this.getUsers();
      const afterCurrentUser = await this.getCurrentUser();
      
      console.log("After clearing - users count:", afterUsers.length);
      console.log("After clearing - current user exists:", !!afterCurrentUser);
      
      // Effacer également les mots de passe stockés dans localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('user_') && key.endsWith('_password')) {
          console.log("Removing localStorage item:", key);
          localStorage.removeItem(key);
        }
      }
      
      const success = afterUsers.length === 0 && !afterCurrentUser;
      console.log("Clear operation success:", success);
      
      return success;
    } catch (error) {
      console.error("Error in clearAllUsers:", error);
      return false;
    }
  }
}
