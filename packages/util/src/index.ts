export * from './encryption';

export const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
