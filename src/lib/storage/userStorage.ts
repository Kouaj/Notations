
import { User } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class UserStorage extends BaseStorage {
  async getUsers(): Promise<User[]> {
    try {
      return this.performTransaction(
        STORES.USERS,
        'readonly',
        store => store.getAll()
      );
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async saveUser(user: User): Promise<User> {
    try {
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => store.put(user)
      );
      return user; // Assurons-nous de retourner l'utilisateur créé
    } catch (error) {
      console.error("Error saving user:", error);
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
      return this.performTransaction(
        STORES.CURRENT_USER,
        'readonly',
        store => store.get('current')
      );
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async setCurrentUser(user: User | null): Promise<void> {
    try {
      await this.performTransaction(
        STORES.CURRENT_USER,
        'readwrite',
        store => store.put(user, 'current')
      );
    } catch (error) {
      console.error("Error setting current user:", error);
      throw error;
    }
  }

  async clearAllUsers(): Promise<void> {
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
      console.log("All users have been cleared successfully");
    } catch (error) {
      console.error("Error clearing users:", error);
      throw error;
    }
  }
}
