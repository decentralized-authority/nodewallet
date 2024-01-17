export * from './api';
export * from './user';
export * from './wallet';
export * from './content-api';

export interface AccountTransaction {
  hash: string
  received: boolean
  amount: string
  type: string
  height: string
  index: number
}
