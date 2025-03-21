/**
 * A simple asynchronous storage wrapper using IndexedDB.
 */
export class AsyncStorage {
  private readonly dbName: string;
  private readonly storeName: string;
  private db: IDBDatabase | null;

  constructor(dbName: string = 'asyncStorageDB', storeName: string = 'store') {
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
  }

  /**
   * Initializes the IndexedDB database if not already initialized.
   * @returns {Promise<IDBDatabase>} The database instance.
   */
  private async _initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };

      request.onsuccess = (event: Event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Stores a key-value pair in the database.
   * @param {string} key - The key to store the value under.
   * @param {any} value - The value to store.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async setItem(key: string, value: any): Promise<void> {
    const db = await this._initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieves a value from the database by key.
   * @template T - The expected return type.
   * @param {string} key - The key to retrieve the value for.
   * @returns {Promise<T | null>} Resolves with the value, or null if not found.
   */
  async getItem<T>(key: string): Promise<T | null> {
    const db = await this._initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve((request.result as T) ?? null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Removes an entry from the database by key.
   * @param {string} key - The key to remove.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async removeItem(key: string): Promise<void> {
    const db = await this._initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clears all data from the database.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async clear(): Promise<void> {
    const db = await this._initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}