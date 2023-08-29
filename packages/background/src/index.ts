import { BackgroundListener, defaultSeedBits } from '@nodewallet/constants';
import { Logger } from './logger';
import { generateMnemonic } from '@nodewallet/wallet-utils';

let loggerInstance: Logger|null = null;

const getLogger = (): Logger => {
  if(!loggerInstance) {
    loggerInstance = new Logger(chrome.storage.local);
  }
  return loggerInstance;
};

export const startBackground = () => {
  const logger = getLogger();
  logger.info('Started logger!');
  console.log('typeof Buffer', typeof Buffer);
};

chrome.runtime.onInstalled.addListener(({ reason }) => {
  const logger = getLogger();
  if(reason === 'install') {
    logger.info('Installed nodewallet!');
  }
});

const asyncFunc = async () => {
  const something = 'anything';
  await new Promise(resolve => setTimeout(resolve, 100));
  return something;
}

chrome.runtime.onMessage.addListener(async (message: {key: string, val: any}, sender, sendResponse) => {
  switch(message.key) {
    case BackgroundListener.GET_LOGS: {
      const logger = getLogger();
      const logs = logger.getLogs();
      sendResponse({ logs });
      break;
    } case 'GENERATE_MNEMONIC': {
      const mnemonic = await generateMnemonic(defaultSeedBits);
      sendResponse({ mnemonic });
      break;
    }
  }
});
