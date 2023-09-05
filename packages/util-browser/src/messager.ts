import { ErrorResult } from '@nodewallet/types';

export class Messager {

  _runtime: typeof chrome.runtime;
  _handlers: {[eventName: string]: (res: any)=>Promise<any>} = {};

  constructor(runtime: typeof chrome.runtime, listen = false) {
    this._runtime = runtime;
    if(listen) {
      this._listener = this._listener.bind(this);
      runtime.onMessage.addListener(this._listener);
    }
  }

  _listener(message: {eventName: string, body: any}, sender: chrome.runtime.MessageSender, sendResponse: (res: any)=>void) {
    const { eventName, body } = message;
    if(this._handlers[eventName]) {
      this._handlers[eventName](body)
        .then(res => sendResponse(res))
        .catch(err => sendResponse({
          error: {
            message: err.message,
            stack: err.stack,
          }
        }));
    } else {
      let errResult: ErrorResult = {
        error: {
          message: `Event ${eventName} not registered.`,
          stack: '',
        },
      };
      sendResponse(errResult);
    }
    return true;
  }

  unload(): void {
    this._handlers = {};
    this._runtime.onMessage.removeListener(this._listener);
  }

  register(eventName: string, callback: (res: any)=>Promise<any>): void {
    if(this._handlers[eventName]) {
      throw new Error(`Event ${eventName} already registered.`);
    }
    this._handlers[eventName] = callback;
  }

  unregister(eventName: string): void {
    delete this._handlers[eventName]
  }

  async send(eventName: string, body: any = {}): Promise<any> {
    return this._runtime.sendMessage({eventName, body});
  }

}
