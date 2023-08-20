import escapeRegExp from 'lodash/escapeRegExp';
import { generateSalt } from '@nodewallet/util';
import { defaultAES256GCMConfig } from '@nodewallet/constants';

export const startBackground = () => {
  console.log('generateSalt', generateSalt(defaultAES256GCMConfig.keyLength));
  console.log(escapeRegExp('background.js'));
};
