import { UserWallet } from './wallet';

export interface UserSettings {
  showTestnets: boolean
}
export interface UserAccount {
  tosAccepted: string // ISO date string
  settings: UserSettings
  wallets: UserWallet[]
}
