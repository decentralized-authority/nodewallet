import { UserWallet } from './wallet';
import { AppLang } from '@decentralizedauthority/nodewallet-constants';

export interface AllowedOrigin {
  date: string
  origin: string
  host: string
}
export interface UserSettings {
  hideTestnets: boolean
  lockTimeout: number // in minutes
}
export interface UserAccount {
  language: AppLang,
  tosAccepted: string // ISO date string
  allowedOrigins: AllowedOrigin[]
  settings: UserSettings
  wallets: UserWallet[]
}
