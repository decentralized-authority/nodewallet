import * as bip39 from 'bip39';
import { defaultSeedBits } from '@nodewallet/constants';

export const getWordlist = (lang: string): string[] => {
  let wordlist: string[]|undefined = bip39.wordlists[lang.toUpperCase()];
  if(!wordlist) {
    wordlist = bip39.wordlists.EN;
  }
  return wordlist;
};

/**
 * Generate a mnemonic seed phrase
 * @param strength The strength of the seed phrase in bits
 * @param lang The wordlist language
 */
export const generateMnemonic = async (strength: number = defaultSeedBits, lang = 'EN'): Promise<string> => {
  const wordlist = getWordlist(lang);
  return bip39.generateMnemonic(strength, undefined, wordlist);
};

export const mnemonicToSeed = async (mnemonic: string): Promise<string> => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return seed.toString('hex');
};

export const mnemonicToEntropy = async (mnemonic: string, lang = 'EN'): Promise<string> => {
  const wordlist = getWordlist(lang);
  return bip39.mnemonicToEntropy(mnemonic, wordlist);
};

export const entropyToMnemonic = async (entropy: string, lang = 'EN'): Promise<string> => {
  const wordlist = getWordlist(lang);
  return bip39.entropyToMnemonic(entropy, wordlist);
};

export const isValidMnemonic = (mnemonic: string, lang = 'EN'): boolean => {
  const wordlist = getWordlist(lang);
  return bip39.validateMnemonic(mnemonic, wordlist);
};
