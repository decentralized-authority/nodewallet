import escapeRegExp from 'lodash/escapeRegExp';
import { generateSalt } from 'pbw-utils';
import { defaultAES256GCMConfig } from 'pbw-constants';

export const startBackground = () => {
  console.log('generateSalt', generateSalt(defaultAES256GCMConfig.keyLength));
  console.log(escapeRegExp('background.js'));
};
