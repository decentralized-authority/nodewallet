export class Messager {

  _runtime: typeof chrome.runtime;
  _handlers: {[eventName: string]: (res: any)=>Promise<any>} = {};

  constructor(runtime: typeof chrome.runtime) {
    this._runtime = runtime;
    this._listener = this._listener.bind(this);
    runtime.onMessage.addListener(this._listener);
  }

  async _listener(message: {eventName: string, body: any}, sender: chrome.runtime.MessageSender, sendResponse: (res: any)=>void) {
    const { eventName, body } = message;
    if (this._handlers[eventName]) {
      const res = await this._handlers[eventName](body);
      sendResponse(res);
    }
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

  async send(eventName: string, body: any): Promise<any> {
    return this._runtime.sendMessage({eventName, body});
  }

}
