
import { Reseau } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class ReseauStorage extends BaseStorage {
  async getReseaux(): Promise<Reseau[]> {
    return this.performTransaction(
      STORES.RESEAUX,
      'readonly',
      store => store.getAll()
    );
  }

  async getReseauxByUser(userId: string): Promise<Reseau[]> {
    const reseaux = await this.getReseaux();
    return reseaux.filter(r => r.userId === userId);
  }

  async saveReseau(reseau: Reseau): Promise<void> {
    await this.performTransaction(
      STORES.RESEAUX,
      'readwrite',
      store => store.put(reseau)
    );
  }

  async deleteReseau(id: number): Promise<void> {
    await this.performTransaction(
      STORES.RESEAUX,
      'readwrite',
      store => store.delete(id)
    );
  }

  async updateReseau(reseau: Reseau): Promise<void> {
    await this.performTransaction(
      STORES.RESEAUX,
      'readwrite',
      store => store.put(reseau)
    );
  }

  async setSelectedReseau(reseau: Reseau | null): Promise<void> {
    await this.performTransaction(
      STORES.SELECTED_RESEAU,
      'readwrite',
      store => store.put(reseau, 'current')
    );
  }

  async getSelectedReseau(): Promise<Reseau | null> {
    return this.performTransaction(
      STORES.SELECTED_RESEAU,
      'readonly',
      store => store.get('current')
    );
  }
}
