import { EventEmitter } from 'events';
import { ContentBridge, NodeWalletMethod } from '@decentralizedauthority/nodewallet-content';
import { PocketNetworkMethod } from '@decentralizedauthority/nodewallet-content';
import * as uuid from 'uuid';

let key = uuid.v4();
let callbacks: {[id: string]: (res: any)=>void} = {};

window.addEventListener('message', async (event) => {
  const idPatt = /^pocket-network-([0-9a-f\-]+)$/;
  const { data } = event;
  const { type = '', response } = data as {type: string, response: any};
  const matches = type.match(idPatt);
  if(matches) {
    const [ , id ] = matches;
    if(callbacks[id]) {
      callbacks[id](response);
      delete callbacks[id];
    }
  }
});

export class PocketNetwork extends EventEmitter implements ContentBridge {

  async send(method: PocketNetworkMethod|NodeWalletMethod, params?: any[]): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const id = uuid.v4();
      callbacks[id] = (res) => {
        if('error' in res) {
          console.error(res.error);
          reject(new Error(res.error.message));
        } else if('result' in res) {
          resolve(res.result);
        } else {
          resolve({});
        }
      };
      window.postMessage({
        type: 'pocket-network',
        id,
        key,
        method,
        params: params || [],
      });
    });
  }

}

export const startContentBridge = () => {
  console.log('Inject NodeWallet content script');
  if(window.pocketNetwork) {
    window.prevPocketNetwork = window.pocketNetwork;
  }
  window.pocketNetwork = new PocketNetwork();
};
