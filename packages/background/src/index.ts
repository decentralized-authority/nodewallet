import { BackgroundListener, defaultSeedBits } from '@nodewallet/constants';
import { Logger } from './logger';
import { generateMnemonic } from '@nodewallet/wallet-utils';
import { Messager } from '@nodewallet/util';

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
  const messager = new Messager(chrome.runtime);

  messager.register(BackgroundListener.GET_LOGS, async () => {
    const logger = getLogger();
    const logs = logger.getLogs();
    return { logs };
  });

  messager.register(BackgroundListener.GENERATE_MNEMONIC, async () => {
    const mnemonic = await generateMnemonic(defaultSeedBits);
    return { mnemonic };
  });

};

// chrome.runtime.onInstalled.addListener(({ reason }) => {
//   const logger = getLogger();
//   if(reason === 'install') {
//     logger.info('Installed nodewallet!');
//   }
// });
