import { ChainType, KeyType } from '@nodewallet/constants';

export interface ChainMeta {
  chain: ChainType
  bip44Type: number
  derivationPath: string
  keyType: KeyType,
}
