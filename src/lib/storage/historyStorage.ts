
import { HistoryRecord } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class HistoryStorage extends BaseStorage {
  async getHistory(): Promise<HistoryRecord[]> {
    try {
      const history = await this.performTransaction(
        STORES.HISTORY,
        'readonly',
        store => store.getAll()
      );
      return history || [];
    } catch (error) {
      console.error("Error getting history:", error);
      return [];
    }
  }

  async getHistoryByUser(userId: string): Promise<HistoryRecord[]> {
    try {
      const history = await this.getHistory();
      return history.filter(record => record.userId === userId);
    } catch (error) {
      console.error("Error getting history by user:", error);
      return [];
    }
  }

  async saveHistory(record: HistoryRecord): Promise<void> {
    try {
      await this.performTransaction(
        STORES.HISTORY,
        'readwrite',
        store => store.add(record)
      );
    } catch (error) {
      console.error("Error saving history record:", error);
      throw error;
    }
  }

  async deleteHistory(id: number): Promise<void> {
    try {
      await this.performTransaction(
        STORES.HISTORY,
        'readwrite',
        store => store.delete(id)
      );
    } catch (error) {
      console.error("Error deleting history record:", error);
      throw error;
    }
  }
}
