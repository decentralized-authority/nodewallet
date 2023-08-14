import LocalStorageArea = chrome.storage.LocalStorageArea;
import StorageArea = chrome.storage.StorageArea;

export class StorageManager {

  _queue: (() => Promise<any>)[] = [];

  _running = false;

  _run() {
    this._running = true;
    const fn = this._queue.shift();
    if(fn) {
      fn()
        .then(() => {
          this._run();
        })
        .catch(() => {
          this._run();
        });
    } else {
      this._running = false;
    }
  }

  _queueFunc(fn: () => Promise<any>) {
    this._queue.push(fn);
    if(!this._running)
      this._run();
  }

  storage: StorageArea;

  constructor(storage = chrome.storage.local) {
    this.storage = storage;
  }

  clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._queueFunc(async () => {
        try {
          await this.storage.clear();
          resolve();
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this._queueFunc(async () => {
        try {
          const res = await this.storage.get(key);
          resolve(res[key]);
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  batchGet(keys: string[]): Promise<{[key: string]: any}> {
    return new Promise((resolve, reject) => {
      this._queueFunc(async () => {
        try {
          const res = await this.storage.get(keys);
          resolve(res);
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  set(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this._queueFunc(async () => {
        try {
          await this.storage.set({[key]: value});
          resolve();
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  batchSet(keyValuePairs: {[key: string]: any}): Promise<void> {
    return new Promise((resolve, reject) => {
      this._queueFunc(async () => {
        try {
          await this.storage.set(keyValuePairs);
          resolve();
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  remove(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._queueFunc(async () => {
        try {
          await this.storage.remove(key);
          resolve();
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  batchRemove(keys: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this._queueFunc(async () => {
        try {
          await this.storage.remove(keys);
          resolve();
        } catch(err) {
          reject(err);
        }
      });
    });
  }

}
