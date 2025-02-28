
import { User } from '@/shared/schema';
import { BaseStorage, STORES } from './core';

export class UserStorage extends BaseStorage {
  async getUsers(): Promise<User[]> {
    return this.performTransaction(
      STORES.USERS,
      'readonly',
      store => store.getAll()
    );
  }

  async saveUser(user: User): Promise<void> {
    await this.performTransaction(
      STORES.USERS,
      'readwrite',
      store => store.put(user)
    );
  }

  async getUserById(id: string): Promise<User | null> {
    return this.performTransaction(
      STORES.USERS,
      'readonly',
      store => store.get(id)
    );
  }

  async getCurrentUser(): Promise<User | null> {
    return this.performTransaction(
      STORES.CURRENT_USER,
      'readonly',
      store => store.get('current')
    );
  }

  async setCurrentUser(user: User | null): Promise<void> {
    await this.performTransaction(
      STORES.CURRENT_USER,
      'readwrite',
      store => store.put(user, 'current')
    );
  }
}
