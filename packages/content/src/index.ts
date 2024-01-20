import { PocketNetwork } from './pocket-network';
import { API } from './api';
import { Messager } from '@decentralizedauthority/nodewallet-util-browser';

declare global {
  interface Window {
    pocketNetwork: any
    prevPocketNetwork: any
  }
}

export const startContent = () => {
  const messager = new Messager(chrome.runtime);
  const api = new API(messager);
  const pocketNetwork = new PocketNetwork(api);
  let key = '';
  window.addEventListener('message', async (event) => {
    const { data } = event;
    const { type = '', id = '' } = data;
    if(type === 'pocket-network' && event.origin === window.location.origin) {
      const responseType = `${type}-${id}`;
      try {
        if(!key) {
          if(data.key) {
            key = data.key;
          } else {
            throw new Error('Invalid key');
          }
        } else if(key !== data.key) {
          throw new Error('Invalid key');
        } else if(!id) {
          throw new Error('Missing id');
        }
        const { method, params } = data;
        const res = await pocketNetwork.send(method, params);
        window.postMessage({
          type: responseType,
          response: {
            result: res,
          },
        });
      } catch(err: any) {
        window.postMessage({
          type: responseType,
          response: {
            error: {
              message: err.message,
              stack: err.stack,
            },
          },
        });
      }
    }
  });
};

export * from './pocket-network';
export * from './content-bridge';
