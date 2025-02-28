
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

  async getSystemLogs(): Promise<SystemLog[]> {
    return this.performTransaction(
      STORES.SYSTEM_LOGS,
      'readonly',
      store => store.getAll()
    );
  }

  async addSystemLog(log: SystemLog): Promise<void> {
    await this.performTransaction(
      STORES.SYSTEM_LOGS,
      'readwrite',
      store => store.put(log)
    );
  }
}

export interface SystemLog {
  id: number;
  action: string;
  details: string;
  userId: string;
  timestamp: number;
}
