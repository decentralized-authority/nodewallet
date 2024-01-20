import { ChainType, KeyType } from '@decentralizedauthority/nodewallet-constants';

export interface ChainMeta {
  chain: ChainType
  bip44Type: number
  derivationPath: string
  keyType: KeyType,
}
