
import { UserStorage } from './userStorage';
import { ReseauStorage } from './reseauStorage';
import { ParcelleStorage } from './parcelleStorage';
import { HistoryStorage } from './historyStorage';
import { IDBStorage } from './interfaces';

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

  async saveUser(user) {
    return this.userStorage.saveUser(user);
  }

  async getUserById(id) {
    return this.userStorage.getUserById(id);
  }

  async getCurrentUser() {
    return this.userStorage.getCurrentUser();
  }

  async setCurrentUser(user) {
    return this.userStorage.setCurrentUser(user);
  }

  async deleteUser(id) {
    await this.userStorage.deleteUser(id);
  }

  // Réseau methods
  async getReseaux() {
    return this.reseauStorage.getReseaux();
  }

  async getReseauxByUser(userId) {
    return this.reseauStorage.getReseauxByUser(userId);
  }

  async saveReseau(reseau) {
    return this.reseauStorage.saveReseau(reseau);
  }

  async deleteReseau(id) {
    return this.reseauStorage.deleteReseau(id);
  }

  async updateReseau(reseau) {
    return this.reseauStorage.updateReseau(reseau);
  }

  async setSelectedReseau(reseau) {
    return this.reseauStorage.setSelectedReseau(reseau);
  }

  async getSelectedReseau() {
    return this.reseauStorage.getSelectedReseau();
  }

  // Parcelle methods
  async getParcelles() {
    return this.parcelleStorage.getParcelles();
  }

  async getParcellesByUser(userId) {
    return this.parcelleStorage.getParcellesByUser(userId);
  }

  async getParcellesByReseau(reseauId, userId) {
    return this.parcelleStorage.getParcellesByReseau(reseauId, userId);
  }

  async saveParcelle(parcelle) {
    return this.parcelleStorage.saveParcelle(parcelle);
  }

  async deleteParcelle(id) {
    return this.parcelleStorage.deleteParcelle(id);
  }

  async updateParcelle(parcelle) {
    return this.parcelleStorage.updateParcelle(parcelle);
  }

  async setSelectedParcelle(parcelle) {
    return this.parcelleStorage.setSelectedParcelle(parcelle);
  }

  async getSelectedParcelle() {
    return this.parcelleStorage.getSelectedParcelle();
  }

  // History methods
  async getHistory() {
    return this.historyStorage.getHistory();
  }

  async getHistoryByUser(userId) {
    return this.historyStorage.getHistoryByUser(userId);
  }

  async saveHistory(record) {
    return this.historyStorage.saveHistory(record);
  }

  async deleteHistory(id) {
    return this.historyStorage.deleteHistory(id);
  }
}

// Export a singleton instance of the storage
export const storage = new IndexedDBStorage();

// Re-export necessary constants
export { DB_NAME, DB_VERSION, STORES } from './core';
