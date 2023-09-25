import { createPocketNetwork } from './pocket-network';
import { API } from './api';

declare global {
  interface Window {
    pocketNetwork: any
    prevPocketNetwork: any
  }
}

export const startContent = () => {
  console.log('Inject NodeWallet content script');
  if(window.pocketNetwork) {
    window.prevPocketNetwork = window.pocketNetwork;
  }
  const api = new API();
  window.pocketNetwork = createPocketNetwork(api);
};
