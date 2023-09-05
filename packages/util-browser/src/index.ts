export * from './messager';

export const splitMnemonic = (mnemonic: string): string[] => {
  return mnemonic
    .split(/\s+/g)
    .map(s => s.trim())
    .filter(s => !!s);
};
export const joinMnemonic = (mnemonic: string[]): string => {
  return mnemonic.join(' ');
};
export const prepMnemonic = (mnemonic: string): string => {
  return joinMnemonic(splitMnemonic(mnemonic));
}
export const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
