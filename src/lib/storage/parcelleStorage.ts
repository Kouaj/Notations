
import { Parcelle } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class ParcelleStorage extends BaseStorage {
  async getParcelles(): Promise<Parcelle[]> {
    try {
      const parcelles = await this.performTransaction(
        STORES.PARCELLES,
        'readonly',
        store => store.getAll()
      );
      return parcelles || [];
    } catch (error) {
      console.error("Error getting parcelles:", error);
      return [];
    }
  }

  async getParcellesByUser(userId: string): Promise<Parcelle[]> {
    try {
      const parcelles = await this.getParcelles();
      return parcelles.filter(parcelle => parcelle.userId === userId);
    } catch (error) {
      console.error("Error getting parcelles by user:", error);
      return [];
    }
  }

  async getParcellesByReseau(reseauId: number, userId: string): Promise<Parcelle[]> {
    try {
      const parcelles = await this.getParcellesByUser(userId);
      return parcelles.filter(parcelle => parcelle.reseauId === reseauId);
    } catch (error) {
      console.error("Error getting parcelles by reseau:", error);
      return [];
    }
  }

  async saveParcelle(parcelle: Parcelle): Promise<void> {
    try {
      await this.performTransaction(
        STORES.PARCELLES,
        'readwrite',
        store => store.put(parcelle)
      );
    } catch (error) {
      console.error("Error saving parcelle:", error);
      throw error;
    }
  }

  async deleteParcelle(id: number): Promise<void> {
    try {
      await this.performTransaction(
        STORES.PARCELLES,
        'readwrite',
        store => store.delete(id)
      );
    } catch (error) {
      console.error("Error deleting parcelle:", error);
      throw error;
    }
  }

  async updateParcelle(parcelle: Parcelle): Promise<void> {
    try {
      await this.performTransaction(
        STORES.PARCELLES,
        'readwrite',
        store => store.put(parcelle)
      );
    } catch (error) {
      console.error("Error updating parcelle:", error);
      throw error;
    }
  }

  async setSelectedParcelle(parcelle: Parcelle | null): Promise<void> {
    try {
      await this.performTransaction(
        STORES.SELECTED_PARCELLE,
        'readwrite',
        store => {
          if (!parcelle) {
            return store.clear();
          }
          return store.put(parcelle, 'current');
        }
      );
    } catch (error) {
      console.error("Error setting selected parcelle:", error);
      throw error;
    }
  }

  async getSelectedParcelle(): Promise<Parcelle | null> {
    try {
      const parcelle = await this.performTransaction(
        STORES.SELECTED_PARCELLE,
        'readonly',
        store => store.get('current')
      );
      return parcelle || null;
    } catch (error) {
      console.error("Error getting selected parcelle:", error);
      return null;
    }
  }
}
