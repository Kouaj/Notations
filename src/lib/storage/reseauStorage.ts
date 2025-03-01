
import { Reseau } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class ReseauStorage extends BaseStorage {
  async getReseaux(): Promise<Reseau[]> {
    try {
      const reseaux = await this.performTransaction(
        STORES.RESEAUX,
        'readonly',
        store => store.getAll()
      );
      return reseaux || [];
    } catch (error) {
      console.error("Error getting reseaux:", error);
      return [];
    }
  }

  async getReseauxByUser(userId: string): Promise<Reseau[]> {
    try {
      const reseaux = await this.getReseaux();
      return reseaux.filter(reseau => reseau.userId === userId);
    } catch (error) {
      console.error("Error getting reseaux by user:", error);
      return [];
    }
  }

  async saveReseau(reseau: Reseau): Promise<void> {
    try {
      await this.performTransaction(
        STORES.RESEAUX,
        'readwrite',
        store => store.put(reseau)
      );
    } catch (error) {
      console.error("Error saving reseau:", error);
      throw error;
    }
  }

  async deleteReseau(id: number): Promise<void> {
    try {
      await this.performTransaction(
        STORES.RESEAUX,
        'readwrite',
        store => store.delete(id)
      );
    } catch (error) {
      console.error("Error deleting reseau:", error);
      throw error;
    }
  }

  async updateReseau(reseau: Reseau): Promise<void> {
    try {
      await this.performTransaction(
        STORES.RESEAUX,
        'readwrite',
        store => store.put(reseau)
      );
    } catch (error) {
      console.error("Error updating reseau:", error);
      throw error;
    }
  }

  async setSelectedReseau(reseau: Reseau | null): Promise<void> {
    try {
      await this.performTransaction(
        STORES.SELECTED_RESEAU,
        'readwrite',
        store => {
          if (!reseau) {
            return store.clear();
          }
          return store.put(reseau, 'current');
        }
      );
    } catch (error) {
      console.error("Error setting selected reseau:", error);
      throw error;
    }
  }

  async getSelectedReseau(): Promise<Reseau | null> {
    try {
      const reseau = await this.performTransaction(
        STORES.SELECTED_RESEAU,
        'readonly',
        store => store.get('current')
      );
      return reseau || null;
    } catch (error) {
      console.error("Error getting selected reseau:", error);
      return null;
    }
  }
}
