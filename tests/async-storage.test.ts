import {describe, it, expect, afterEach, vi} from 'vitest';
import AsyncStorage from '../src/async-storage.js';
import 'fake-indexeddb/auto'; // Automatically mocks indexedDB

describe('AsyncStorage', () => {
  let asyncStorage: AsyncStorage;

  afterEach(async () => {
    vi.clearAllMocks(); // Reset mock call history
    await asyncStorage?.clear(); // Ensure the store is empty
  });

  describe('initialization', () => {
    it('should create a database with the provided name and store', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      const db = await asyncStorage['_initDB']();
      expect(db.name).toBe('testDB');
      expect(db.objectStoreNames.contains('testStore')).toBe(true);
    });

    it('should handle database open errors', async () => {
      const mockRequest = {
        onsuccess: null,
        onerror: null,
        error: new Error('Failed to open database'),
        result: undefined,
      };

      const originalOpen = indexedDB.open;
      indexedDB.open = vi.fn().mockImplementation(() => {
        setTimeout(() => {
          if (mockRequest.onerror) {
            // @ts-ignore
            mockRequest.onerror({target: mockRequest});
          }
        }, 0);
        return mockRequest;
      });

      const asyncStorage = new AsyncStorage('testDB', 'testStore');

      await expect(asyncStorage['_initDB']()).rejects.toThrow('Failed to open database');

      indexedDB.open = originalOpen;
    });
  });

  describe('setItem', () => {
    it('should store a value under the specified key', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      await asyncStorage.setItem('testKey', 'testValue');
      const value = await asyncStorage.getItem('testKey');
      expect(value).toBe('testValue');
    });

    it('should handle put errors', async () => {
      const originalOpen = indexedDB.open;
      indexedDB.open = vi.fn().mockImplementation(() => {
        const mockRequest = {
          onsuccess: null,
          onerror: null,
          result: {
            transaction: vi.fn().mockImplementation(() => {
              throw new Error('Failed to put item');
            }),
          },
        };
        setTimeout(() => {
          if (mockRequest.onsuccess) {
            // @ts-ignore
            mockRequest.onsuccess({ target: mockRequest });
          }
        }, 0);
        return mockRequest;
      });

      const asyncStorage = new AsyncStorage('testDB', 'testStore');
      await expect(asyncStorage.setItem('testKey', 'testValue')).rejects.toThrow('Failed to put item');

      indexedDB.open = originalOpen;
    });
  });

  describe('getItem', () => {
    it('should retrieve a value by key', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      await asyncStorage.setItem('testKey', {name: 'test'});
      const result = await asyncStorage.getItem('testKey');
      expect(result).toEqual({name: 'test'});
    });

    it('should return null when key is not found', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      const result = await asyncStorage.getItem('nonExistentKey');
      expect(result).toBeNull();
    });

    it('should handle get errors', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      // Temporarily override transaction to simulate failure
      const originalTransaction = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = vi.fn().mockImplementation(() => {
        throw new Error('Failed to get item');
      });

      await expect(asyncStorage.getItem('testKey')).rejects.toThrow('Failed to get item');

      // Restore original
      IDBDatabase.prototype.transaction = originalTransaction;
    });
  });

  describe('removeItem', () => {
    it('should remove an item by key', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      await asyncStorage.setItem('testKey', 'testValue');
      await asyncStorage.removeItem('testKey');
      const result = await asyncStorage.getItem('testKey');
      expect(result).toBeNull();
    });

    it('should handle delete errors', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      // Temporarily override transaction to simulate failure
      const originalTransaction = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = vi.fn().mockImplementation(() => {
        throw new Error('Failed to delete item');
      });

      await expect(asyncStorage.removeItem('testKey')).rejects.toThrow('Failed to delete item');

      // Restore original
      IDBDatabase.prototype.transaction = originalTransaction;
    });
  });

  describe('clear', () => {
    it('should clear all items from the store', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      await asyncStorage.setItem('key1', 'value1');
      await asyncStorage.setItem('key2', 'value2');
      await asyncStorage.clear();
      const value1 = await asyncStorage.getItem('key1');
      const value2 = await asyncStorage.getItem('key2');
      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });

    it('should handle clear errors', async () => {
      asyncStorage = new AsyncStorage('testDB', 'testStore');
      // Temporarily override transaction to simulate failure
      const originalTransaction = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = vi.fn().mockImplementation(() => {
        throw new Error('Failed to clear store');
      });

      await expect(asyncStorage.clear()).rejects.toThrow('Failed to clear store');

      // Restore original
      IDBDatabase.prototype.transaction = originalTransaction;
    });
  });
});