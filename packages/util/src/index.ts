export * from './encryption';
export * from './messager';

export const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
