import should from 'should';
import { StorageManager } from './storage-manager';
import isArray from 'lodash/isArray';

describe('StorageManager', function() {

  let fakeStorage: FakeStorage;
  let storageManager: StorageManager;

  before(async function() {
    fakeStorage = new FakeStorage();
    // @ts-ignore
    storageManager = new StorageManager(fakeStorage);
  });

  describe('._queueFunc()', async function() {
    it(`should run Promise-return functions consecutively`, async function() {
      const timeouts = [ 500, 100, 300, 200, 10, 100 ];
      const callOrder: number[] = [];
      await new Promise<void>((outerResolve) => {
        const funcs = timeouts
          .map((timeout) => {
            return () => new Promise<void>((resolve) => {
              setTimeout(() => {
                callOrder.push(timeout);
                resolve();
                if(callOrder.length === timeouts.length) {
                  outerResolve();
                }
              }, timeout);
            });
          });
        for(const func of funcs) {
          storageManager._queueFunc(func);
        }
      });
      for(let i = 0; i < timeouts.length; i++) {
        should(callOrder[i]).equal(timeouts[i]);
      }
    });
  });

  describe('.set()', function() {
    it('should set an item in storage', async function() {
      const testKey = 'testKey';
      const testValue = 'testValue';
      await storageManager.set(testKey, testValue);
      should(fakeStorage._data[testKey]).equal(testValue);
    });
  });

  describe('.batchSet()', function() {
    it('should set multiple items in storage', async function() {
      const items: {[key: string]: any} = {
        key1: 'val1',
        key2: 'val2',
        key3: 'val3',
      };
      await storageManager.batchSet(items);
      for(const [ key, val ] of Object.entries(items)) {
        should(fakeStorage._data[key]).equal(items[key]);
      }
    });
  });

  describe('.get()', function() {
    it('should get an item from storage', async function() {
      const keyToGet = 'keyToGet';
      const valueToGet = 'valueToGet';
      fakeStorage._data[keyToGet] = valueToGet;
      const res = await storageManager.get(keyToGet);
      should(res).equal(valueToGet);
    });
  });

  describe('.batchGet()', function() {
    it('should get multiple items from storage', async function() {
      const items: {[key: string]: any} = {
        key1: 'val1',
        key2: 'val2',
        key3: 'val3',
      };
      Object.assign(fakeStorage._data, items);
      const res = await storageManager.batchGet(Object.keys(items));
      should(res).be.an.Object();
      for(const [ key, val ] of Object.entries(items)) {
        should(res[key]).equal(items[key]);
      }
    });
  });

  describe('.remove()', function() {
    it('should remove an item from storage', async function() {
      const keyToRemove = 'keyToRemove';
      fakeStorage._data[keyToRemove] = 'valueToRemove';
      await storageManager.remove(keyToRemove);
      Object.keys(fakeStorage._data).should.not.containEql(keyToRemove);
    });
  });

  describe('.batchRemove()', function() {
    it('should remove multiple items from storage', async function() {
      const itemsToRemove = {
        keyToRemove1: 'valueToRemove1',
        keyToRemove2: 'valueToRemove2',
        keyToRemove3: 'valueToRemove3',
      };
      Object.assign(fakeStorage._data, itemsToRemove);
      await storageManager.batchRemove(Object.keys(itemsToRemove));
      for(const keyToRemove of Object.keys(itemsToRemove)) {
        Object.keys(fakeStorage._data).should.not.containEql(keyToRemove);
      }
    });
  });

  describe('.clear()', function() {
    it('should remove all items from storage', async function() {
      await storageManager.clear();
      should(Object.keys(fakeStorage._data).length).equal(0);
    });
  });

});

class FakeStorage {

  _data: {[key: string]: any} = {};

  async clear() {
    this._data = {};
  }
  async get(key: string|string[]): Promise<any> {
    if(isArray(key)) {
      return key
        .reduce((acc, k) => {
          return {
            ...acc,
            [k]: this._data[k],
          };
        }, {} as {[key: string]: any});
    } else {
      return {
        [key]: this._data[key],
      };
    }
  }
  async set(keyValuePairs: {[key: string]: any}) {
    Object.assign(this._data, keyValuePairs);
  }
  async remove(key: string|string[]) {
    if(isArray(key)) {
      for(const k of key) {
        delete this._data[k];
      }
    } else {
      delete this._data[key];
    }
  }

}
