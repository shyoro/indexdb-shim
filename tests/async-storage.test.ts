import { test, beforeEach } = require('node:test');
import assert from 'node:assert/strict';
import 'fake-indexeddb/global';
import {AsyncStorage} from '../src/async-storage';

let storage: AsyncStorage;

beforeEach(() => {
  storage = new AsyncStorage();
});

test('should store and retrieve a value', async () => {
  await storage.setItem('testKey', 'testValue');
  const result = await storage.getItem<string>('testKey');
  assert.strictEqual(result, 'testValue');
});

test('should return null for non-existent key', async () => {
  const result = await storage.getItem<string>('nonExistentKey');
  assert.strictEqual(result, null);
});

test('should remove a value', async () => {
  await storage.setItem('deleteKey', 'toDelete');
  await storage.removeItem('deleteKey');
  const result = await storage.getItem<string>('deleteKey');
  assert.strictEqual(result, null);
});

test('should clear all values', async () => {
  await storage.setItem('key1', 'value1');
  await storage.setItem('key2', 'value2');
  await storage.clear();
  const result1 = await storage.getItem<string>('key1');
  const result2 = await storage.getItem<string>('key2');
  assert.strictEqual(result1, null);
  assert.strictEqual(result2, null);
});
