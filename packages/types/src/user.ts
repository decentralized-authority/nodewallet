import { UserWallet } from './wallet';
import { AppLang } from '@nodewallet/constants';

export interface AllowedOrigin {
  date: string
  origin: string
  host: string
}
export interface UserSettings {
  showTestnets: boolean
}
export interface UserAccount {
  language: AppLang,
  tosAccepted: string // ISO date string
  allowedOrigins: AllowedOrigin[]
  settings: UserSettings
  wallets: UserWallet[]
}
