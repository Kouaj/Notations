
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
      
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => {
          const request = store.put(user);
          return request;
        }
      );
      
      console.log("User saved successfully:", user);
      return user;
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
      return user;
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
      console.log("Starting to clear all users...");
      
      // Vérifier les données avant effacement
      const beforeUsers = await this.getUsers();
      const beforeCurrentUser = await this.getCurrentUser();
      console.log("Before clearing - users count:", beforeUsers.length);
      console.log("Before clearing - current user exists:", !!beforeCurrentUser);
      
      // Effacer tous les utilisateurs
      await this.performTransaction(
        STORES.USERS,
        'readwrite',
        store => {
          console.log("Clearing USERS store...");
          return store.clear();
        }
      );
      
      // Effacer l'utilisateur actuel
      await this.performTransaction(
        STORES.CURRENT_USER,
        'readwrite',
        store => {
          console.log("Clearing CURRENT_USER store...");
          return store.clear();
        }
      );
      
      // Vérifier après effacement
      const afterUsers = await this.getUsers();
      const afterCurrentUser = await this.getCurrentUser();
      console.log("After clearing - users count:", afterUsers.length);
      console.log("After clearing - current user exists:", !!afterCurrentUser);
      
      const success = afterUsers.length === 0 && !afterCurrentUser;
      console.log("Clear operation success:", success);
      
      return success;
    } catch (error) {
      console.error("Error in clearAllUsers:", error);
      return false;
    }
  }
}
