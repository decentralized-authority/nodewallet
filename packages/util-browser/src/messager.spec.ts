import should from 'should';
import { Messager } from './messager';

class FakeRuntime {

  _listeners: any[] = [];

  onMessage = {
    addListener: (callback: (message: {eventName: string, body: any}, sender: chrome.runtime.MessageSender, sendResponse: (res: any)=>void)=>void): void => {
      this._listeners.push(callback);
    },
    removeListener: (callback: (message: {eventName: string, body: any}, sender: chrome.runtime.MessageSender, sendResponse: (res: any)=>void)=>void): void => {
      this._listeners = this._listeners.filter(l => l !== callback);
    },
  }

  async sendMessage(message: {eventName: string, body: any}): Promise<any> {
    const [ listener ] = this._listeners;
    return await new Promise(resolve => {
      listener(message, {}, resolve);
    });
  }

}

describe('Messager', function() {

  describe('register()', function() {
    it('should register an event listener', async function() {
      const runtime = new FakeRuntime();
      // @ts-ignore
      const messager = new Messager(runtime);
      const func = async () => {};
      const eventName = 'testEvent';
      messager.register(eventName, func);
      should(messager._handlers[eventName]).equal(func);
    });
  });

  describe('unregister()', function() {
    const runtime = new FakeRuntime();
    // @ts-ignore
    const messager = new Messager(runtime);
    const eventName0 = 'testEvent0';
    messager._handlers[eventName0] = async () => {};
    const eventName1 = 'testEvent1';
    const testFunc1 = async () => {};
    messager._handlers[eventName1] = testFunc1;
    messager.unregister(eventName0);
    should(messager._handlers[eventName0]).equal(undefined);
    should(messager._handlers[eventName1]).equal(testFunc1);
  });

  describe('unload()', function() {
    it('should remove all event listeners', async function() {
      const runtime = new FakeRuntime();
      // @ts-ignore
      const messager = new Messager(runtime);
      runtime._listeners.length.should.equal(1);
      const func = async () => {};
      const eventName = 'testEvent';
      messager._handlers[eventName] = func;
      messager.unload();
      runtime._listeners.length.should.equal(0);
      Object.keys(messager._handlers).length.should.equal(0);
    });
  });

  describe('send()', function() {
    it('should send a message to a listener', async function() {
      const runtime = new FakeRuntime();
      // @ts-ignore
      const messager = new Messager(runtime);
      const expectedReturn = {some: 'value'};
      const func = async () => {
        return expectedReturn;
      };
      const eventName = 'testEvent';
      messager.register(eventName, func);
      const body = {test: 'test'};
      const res = await messager.send(eventName, body);
      should(res).deepEqual(expectedReturn);
    });
  });

});
