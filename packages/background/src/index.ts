import escapeRegExp from 'lodash/escapeRegExp';
import { generateSalt } from 'pbw-util';

export const startBackground = () => {
  console.log('generateSalt', generateSalt());
  console.log(escapeRegExp('background.js'));
};
