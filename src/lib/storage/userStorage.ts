
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
      return users;
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async saveUser(user: User): Promise<User> {
    try {
      console.log("Attempting to save user to IndexedDB:", user);
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => store.put(user)
      );
      console.log("User saved successfully to IndexedDB:", user);
      return user;
    } catch (error) {
      console.error("Error saving user to IndexedDB:", error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return this.performTransaction(
        STORES.USERS,
        'readonly',
        store => store.get(id)
      );
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
      return user;
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
        store => store.put(user, 'current')
      );
      console.log("Current user set successfully in database");
    } catch (error) {
      console.error("Error setting current user:", error);
      throw error;
    }
  }

  async clearAllUsers(): Promise<boolean> {
    try {
      console.log("Clearing all users from database...");
      
      // Vider la table des utilisateurs
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => store.clear()
      );
      
      // Vider également l'utilisateur actuel
      await this.performTransaction(
        STORES.CURRENT_USER,
        'readwrite',
        store => store.clear()
      );
      
      // Vérifier que les utilisateurs ont bien été supprimés
      const remainingUsers = await this.getUsers();
      const currentUser = await this.getCurrentUser();
      
      console.log("After clearing - Remaining users:", remainingUsers);
      console.log("After clearing - Current user:", currentUser);
      
      if (remainingUsers.length === 0 && !currentUser) {
        console.log("All users have been cleared successfully");
        return true;
      } else {
        console.error("Failed to clear all users completely");
        return false;
      }
    } catch (error) {
      console.error("Error clearing users:", error);
      return false;
    }
  }
}
