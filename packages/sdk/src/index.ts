import { EventEmitter } from 'events';
import { PocketProvider } from './pocket-provider';
import { PocketNetwork } from '@nodewallet/content-bridge';

export { ChainType } from '@nodewallet/constants';

// export interface NodeWalletSDKEvent {
//   'accountsChanged': (account: string[]) => void;
//   'chainChanged': (chainId: string) => void;
//   'connect': (connectInfo: {account: string, chainId: string}) => void;
//   'disconnect': (error: {message: string}) => void;
// }
//
// export declare interface NodeWalletSDK {
//   on<U extends keyof NodeWalletSDKEvent>(
//     event: U, listener: NodeWalletSDKEvent[U]
//   ): this;
// }
//
// export interface NodeWalletSDK extends EventEmitter {
//   connect(): Promise<string[]>;
//   isConnected(): boolean;
//   isNodeWallet(): boolean;
// }

export interface GetPocketOptions {
  connectTimeout?: number;
  requestTimeout?: number;
}

export class NodeWalletSDK {

  _connectTimeout: number = 30000;
  _requestTimeout: number = 30000;

  constructor(options?: GetPocketOptions) {
    if(options) {
      this._connectTimeout = options.connectTimeout || this._connectTimeout;
      this._requestTimeout = options.requestTimeout || this._requestTimeout;
    }
  }

  getPocket(): Promise<PocketProvider> {
    return new Promise<PocketProvider>((resolve, reject) => {
      let timedOut = false;
      const timeout = setTimeout(() => {
        timedOut = true;
        reject(new Error('Timed out'));
      }, 30000);
      let interval = setInterval(() => {
        const pocketNetwork = window.pocketNetwork as PocketNetwork;
        if(timedOut) {
          clearInterval(interval);
        } else if(pocketNetwork) {
          clearTimeout(timeout);
          resolve(new PocketProvider(pocketNetwork, this._requestTimeout));
        }
      }, 10);
    });
  }

}

// (async function() {
//
//   const sdk = new NodeWalletSDK({
//     connectTimeout: 30000,
//     requestTimeout: 30000,
//   });
//
//   const pocket = await sdk.getPocket();
//   const address = await pocket.connect();
//   console.log('Connected to NodeWallet', address);
//   const balance = await pocket.getBalance(address);
//   console.log('Balance', balance);
//   const blockHeight = await pocket.getBlockNumber();
//   console.log('Block height', blockHeight);
//   const block = await pocket.getBlock(blockHeight);
//   console.log('Block', block);
//
// })();
