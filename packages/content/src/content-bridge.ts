import { EventEmitter } from 'events';

export interface ContentBridge extends EventEmitter {

  send(method: string, params?: any[]): Promise<any>

}
