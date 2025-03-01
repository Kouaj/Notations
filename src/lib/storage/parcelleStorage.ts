
import { Parcelle } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class ParcelleStorage extends BaseStorage {
  async getParcelles(): Promise<Parcelle[]> {
    return this.performTransaction(
      STORES.PARCELLES,
      'readonly',
      store => store.getAll()
    );
  }

  async getParcellesByUser(userId: string): Promise<Parcelle[]> {
    const parcelles = await this.getParcelles();
    return parcelles.filter(p => p.userId === userId);
  }

  async getParcellesByReseau(reseauId: number, userId: string): Promise<Parcelle[]> {
    const parcelles = await this.getParcellesByUser(userId);
    return parcelles.filter(p => p.reseauId === reseauId);
  }

  async saveParcelle(parcelle: Parcelle): Promise<void> {
    await this.performTransaction(
      STORES.PARCELLES,
      'readwrite',
      store => store.put(parcelle)
    );
  }

  async deleteParcelle(id: number): Promise<void> {
    await this.performTransaction(
      STORES.PARCELLES,
      'readwrite',
      store => store.delete(id)
    );
  }

  async updateParcelle(parcelle: Parcelle): Promise<void> {
    await this.performTransaction(
      STORES.PARCELLES,
      'readwrite',
      store => store.put(parcelle)
    );
  }

  async setSelectedParcelle(parcelle: Parcelle | null): Promise<void> {
    await this.performTransaction(
      STORES.SELECTED_PARCELLE,
      'readwrite',
      store => store.put(parcelle, 'current')
    );
  }

  async getSelectedParcelle(): Promise<Parcelle | null> {
    return this.performTransaction(
      STORES.SELECTED_PARCELLE,
      'readonly',
      store => store.get('current')
    );
  }
}
