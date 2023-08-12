import * as bip39 from 'bip39';

export const generateMnemonic = (): string[] => {
  const wordlist = bip39.wordlists.EN;
  return bip39
    .generateMnemonic(256, undefined, wordlist)
    .trim()
    .split(/\s/)
    .map((w) => w.trim())
    .filter((w) => !!w);
};
