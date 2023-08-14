import * as bip39 from 'bip39';
import { defaultSeedBits } from 'pbw-constants';

/**
 * Generate a mnemonic seed phrase
 * @param strength The strength of the seed phrase in bits
 */
export const generateMnemonic = (strength: number = defaultSeedBits): string[] => {
  const wordlist = bip39.wordlists.EN;
  return bip39
    .generateMnemonic(strength, undefined, wordlist)
    .trim()
    .split(/\s/)
    .map((w) => w.trim())
    .filter((w) => !!w);
};
