import { StorageManager } from './storage-manager';
import { LocalStorageKey } from '@decentralizedauthority/nodewallet-constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import EventEmitter from 'events';
import LocalStorageArea = chrome.storage.LocalStorageArea;

dayjs.extend(utc);

export class Logger extends EventEmitter {

  static events = {
    INFO: 'INFO',
    ERROR: 'ERROR',
  };

  _storage: LocalStorageArea|null = null;
  _logs: string[];
  _maxLogs = 1000;

  constructor(storage: LocalStorageArea|null = null, prevLogs: string[] = []) {
    super();
    if(storage) {
      this._storage = storage;
    }
    this._logs = prevLogs;
  }

  _checkLength(): void {
    while(this._logs.length > this._maxLogs) {
      this._logs.shift();
    }
  }

  _save(): void {
    if(this._storage) {
      this._storage.set({[LocalStorageKey.LOGS]: this._logs})
        .catch(console.error);
    }
  }

  _getTimestamp(): string {
    return dayjs.utc().toISOString();
  }

  info(message: string) {
    const entry = `info: ${message} {"timestamp":"${this._getTimestamp()}"}`;
    console.log(entry);
    this._logs.push(entry);
    this.emit(Logger.events.INFO, entry);
    this._checkLength();
    this._save();
  }

  error(message: string) {
    const entry = `error: ${message} {"timestamp":"${this._getTimestamp()}"}`;
    console.error(entry);
    this._logs.push(entry);
    this.emit(Logger.events.ERROR, entry);
    this._checkLength();
    this._save();
  }

  getLogs(): string[] {
    return [...this._logs];
  }

}
