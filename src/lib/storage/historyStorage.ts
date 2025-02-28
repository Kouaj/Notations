
import { HistoryRecord } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class HistoryStorage extends BaseStorage {
  async getHistory(): Promise<HistoryRecord[]> {
    return this.performTransaction(
      STORES.HISTORY,
      'readonly',
      store => store.getAll()
    );
  }

  async getHistoryByUser(userId: string): Promise<HistoryRecord[]> {
    const history = await this.getHistory();
    return history.filter(h => h.userId === userId);
  }

  async saveHistory(record: HistoryRecord): Promise<void> {
    await this.performTransaction(
      STORES.HISTORY,
      'readwrite',
      store => store.put(record)
    );
  }

  async deleteHistory(id: number): Promise<void> {
    await this.performTransaction(
      STORES.HISTORY,
      'readwrite',
      store => store.delete(id)
    );
  }

  async savePhoto(photo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(photo);
    });
  }
}
