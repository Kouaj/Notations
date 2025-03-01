
import { UserStorage } from './userStorage';
import { ReseauStorage } from './reseauStorage';
import { ParcelleStorage } from './parcelleStorage';
import { HistoryStorage } from './historyStorage';
import { IDBStorage } from './interfaces';
import { User, Reseau, Parcelle, HistoryRecord } from '@/shared/schema';
import { IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, STORES, AppDB } from './core';

// Aggregate class that implements all storage interfaces
class IndexedDBStorage implements IDBStorage {
  private userStorage = new UserStorage();
  private reseauStorage = new ReseauStorage();
  private parcelleStorage = new ParcelleStorage();
  private historyStorage = new HistoryStorage();

  // Initialisation de la base de données
  async initDB(): Promise<IDBPDatabase<AppDB>> {
    try {
      console.log("Storage: Initialisation de la base de données");
      const db = await this.userStorage.initDB();
      console.log("Storage: Base de données initialisée avec succès");
      return db;
    } catch (error) {
      console.error("Storage: Erreur lors de l'initialisation de la base de données", error);
      throw error;
    }
  }

  // User methods
  async getUsers() {
    try {
      console.log("Storage interface: Getting users");
      const users = await this.userStorage.getUsers();
      console.log("Storage interface: Retrieved users:", users);
      return users;
    } catch (error) {
      console.error("Error getting users:", error);
      return [];
    }
  }

  async saveUser(user: User) {
    try {
      if (!user || !user.id || !user.email || !user.name) {
        console.error("Storage interface: Invalid user data provided:", user);
        throw new Error("Invalid user data - Missing required fields");
      }
      
      console.log("Storage interface: Saving user", user);
      const savedUser = await this.userStorage.saveUser(user);
      console.log("Storage interface: User saved successfully", savedUser);
      
      // Vérifions que l'utilisateur a bien été sauvegardé
      const users = await this.getUsers();
      const userExists = users.some(u => u.id === user.id);
      
      if (!userExists) {
        console.error("Storage interface: User was not saved properly in the database");
        throw new Error("User was not saved properly");
      }
      
      return savedUser;
    } catch (error) {
      console.error("Error in storage interface while saving user:", error);
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      console.log("Storage interface: Getting user by ID", id);
      const user = await this.userStorage.getUserById(id);
      console.log("Storage interface: Retrieved user by ID:", user);
      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  async getCurrentUser() {
    try {
      console.log("Storage interface: Getting current user");
      const user = await this.userStorage.getCurrentUser();
      console.log("Storage interface: Current user", user);
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async setCurrentUser(user: User | null) {
    try {
      console.log("Storage interface: Setting current user", user);
      await this.userStorage.setCurrentUser(user);
      
      // Vérifiez que l'utilisateur actuel a été correctement défini
      if (user) {
        const currentUser = await this.getCurrentUser();
        if (!currentUser || currentUser.id !== user.id) {
          console.error("Storage interface: Current user was not set properly");
          throw new Error("Current user was not set properly");
        }
      }
      
      console.log("Storage interface: Current user set successfully");
    } catch (error) {
      console.error("Error setting current user:", error);
      throw error;
    }
  }

  async clearAllUsers() {
    try {
      console.log("Storage interface: Clearing all users");
      const result = await this.userStorage.clearAllUsers();
      
      // Vérifions que les utilisateurs ont bien été supprimés
      const users = await this.getUsers();
      const currentUser = await this.getCurrentUser();
      
      if (users.length > 0 || currentUser !== null) {
        console.error("Storage interface: Not all users were cleared properly");
        console.log("Remaining users:", users);
        console.log("Current user after clear:", currentUser);
        return false;
      }
      
      console.log("Storage interface: All users cleared, result:", result);
      return result;
    } catch (error) {
      console.error("Error clearing all users:", error);
      return false;
    }
  }

  // Réseau methods
  async getReseaux() {
    try {
      return await this.reseauStorage.getReseaux();
    } catch (error) {
      console.error("Error getting reseaux:", error);
      return [];
    }
  }

  async getReseauxByUser(userId: string) {
    return this.reseauStorage.getReseauxByUser(userId);
  }

  async saveReseau(reseau: Reseau) {
    await this.reseauStorage.saveReseau(reseau);
    return reseau;
  }

  async deleteReseau(id: number) {
    return this.reseauStorage.deleteReseau(id);
  }

  async updateReseau(reseau: Reseau) {
    return this.reseauStorage.updateReseau(reseau);
  }

  async setSelectedReseau(reseau: Reseau | null) {
    return this.reseauStorage.setSelectedReseau(reseau);
  }

  async getSelectedReseau() {
    try {
      return await this.reseauStorage.getSelectedReseau();
    } catch (error) {
      console.error("Error getting selected reseau:", error);
      return null;
    }
  }

  // Parcelle methods
  async getParcelles() {
    try {
      return await this.parcelleStorage.getParcelles();
    } catch (error) {
      console.error("Error getting parcelles:", error);
      return [];
    }
  }

  async getParcellesByUser(userId: string) {
    return this.parcelleStorage.getParcellesByUser(userId);
  }

  async getParcellesByReseau(reseauId: number, userId: string) {
    return this.parcelleStorage.getParcellesByReseau(reseauId, userId);
  }

  async saveParcelle(parcelle: Parcelle) {
    await this.parcelleStorage.saveParcelle(parcelle);
    return parcelle;
  }

  async deleteParcelle(id: number) {
    return this.parcelleStorage.deleteParcelle(id);
  }

  async updateParcelle(parcelle: Parcelle) {
    return this.parcelleStorage.updateParcelle(parcelle);
  }

  async setSelectedParcelle(parcelle: Parcelle | null) {
    return this.parcelleStorage.setSelectedParcelle(parcelle);
  }

  async getSelectedParcelle() {
    try {
      return await this.parcelleStorage.getSelectedParcelle();
    } catch (error) {
      console.error("Error getting selected parcelle:", error);
      return null;
    }
  }

  // History methods
  async getHistory() {
    try {
      return await this.historyStorage.getHistory();
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  }

  async getHistoryByUser(userId: string) {
    return this.historyStorage.getHistoryByUser(userId);
  }

  async saveHistory(record: HistoryRecord) {
    await this.historyStorage.saveHistory(record);
    return record;
  }

  async deleteHistory(id: number) {
    return this.historyStorage.deleteHistory(id);
  }

  // Method to save photos added to comments
  async savePhoto(photo: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve('');
        }
      };
      reader.readAsDataURL(photo);
    });
  }
}

// Export a singleton instance of the storage
export const storage = new IndexedDBStorage();

// Re-export necessary constants
export { DB_NAME, DB_VERSION, STORES } from './core';
export type { AppDB } from './core';
