
import { UserStorage } from './userStorage';
import { ReseauStorage } from './reseauStorage';
import { ParcelleStorage } from './parcelleStorage';
import { HistoryStorage } from './historyStorage';
import { IDBStorage } from './interfaces';
import { User, Reseau, Parcelle, HistoryRecord } from '@/shared/schema';

// Aggregate class that implements all storage interfaces
class IndexedDBStorage implements IDBStorage {
  private userStorage = new UserStorage();
  private reseauStorage = new ReseauStorage();
  private parcelleStorage = new ParcelleStorage();
  private historyStorage = new HistoryStorage();

  // User methods
  async getUsers() {
    return this.userStorage.getUsers();
  }

  async saveUser(user: User) {
    await this.userStorage.saveUser(user);
    return user;
  }

  async getUserById(id: string) {
    return this.userStorage.getUserById(id);
  }

  async getCurrentUser() {
    try {
      return await this.userStorage.getCurrentUser();
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  async setCurrentUser(user: User | null) {
    try {
      return await this.userStorage.setCurrentUser(user);
    } catch (error) {
      console.error("Error setting current user:", error);
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
