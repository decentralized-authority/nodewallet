import { ChainType, CoinType } from '@nodewallet/constants';

export interface CryptoAccount {
  name: string
  network: CoinType
  chain: ChainType
  derivationPath: string
  idx: number
  address: string
  privateKey?: string
  publicKey: string
}
export interface WalletAccount {
  network: CoinType
  chain: ChainType
  accounts: CryptoAccount[]
}
export interface UserWallet {
  id: string
  name: string
  createdAt: string // ISO data string
  legacy: boolean // true if it is not an HD wallet
  accounts: WalletAccount[]
}
