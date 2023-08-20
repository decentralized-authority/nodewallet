import * as bip39 from 'bip39';
import { defaultSeedBits } from '@nodewallet/constants';
import { Mnemonic } from 'ethers';

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

export const mnemonicToSeed = (mnemonic: string): String => {
  return Mnemonic.fromPhrase(mnemonic).computeSeed();
};

export const mnemonicToEntropy = (mnemonic: string): String => {
  return Mnemonic.fromPhrase(mnemonic).entropy;
};

export const entropyToMnemonic = (entropy: string): String => {
  return Mnemonic.fromEntropy(entropy).phrase;
}

export const isValidMnemonic = (mnemonic: string): boolean => {
  return Mnemonic.isValidMnemonic(mnemonic);
};
