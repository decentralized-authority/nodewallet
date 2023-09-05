import { UserWallet } from './wallet';
import { AppLang } from '@nodewallet/constants';

export interface UserSettings {
  showTestnets: boolean
}
export interface UserAccount {
  language: AppLang,
  tosAccepted: string // ISO date string
  settings: UserSettings
  wallets: UserWallet[]
}
