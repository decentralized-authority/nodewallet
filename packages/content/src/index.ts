import { pocketNetwork } from './pocket-network';

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
  window.pocketNetwork = pocketNetwork;
};
