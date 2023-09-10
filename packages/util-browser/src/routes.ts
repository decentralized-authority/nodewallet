import { ChainType, CoinType } from '@nodewallet/constants';

export class RouteMeta {
  readonly _path: string = '';
  path(): string {
    return this._path;
  }
  fullPath(): string {
    return `/${this.path()}`;
  }
  generateFullPath(params: any): string {
    return this.fullPath();
  }
  generatePathPattern(): RegExp {
    const pattStr = this.fullPath()
      .replace(/:[^/]+/g, '[^/]+')
      .replace(/\//g, '\\/');
    return new RegExp(`^${pattStr}\\/?$`);
  }
}

export interface AccountDetailParams {
  walletId: string;
  networkId: CoinType;
  chainId: ChainType;
  address: string;
}
export interface SendParams extends AccountDetailParams {}
export class AccountDetailRoute extends RouteMeta {

  readonly _path = 'wallets/:walletId/network/:networkId/chain/:chainId/account/:address';
  generateFullPath(params: AccountDetailParams): string {
    return this.fullPath()
      .replace(':walletId', params.walletId)
      .replace(':networkId', params.networkId)
      .replace(':chainId', params.chainId)
      .replace(':address', params.address);
  }
}
export class NewHdWalletRoute extends RouteMeta {
  readonly _path = 'new-hd-wallet';
}
export class RegisterAccountRoute extends RouteMeta {
  readonly _path = 'register-account';
}
export class SelectNewWalletTypeRoute extends RouteMeta {
  readonly _path = 'select-new-wallet-type';
}
export class SendRoute extends RouteMeta {
  readonly _path = 'wallets/:walletId/network/:networkId/chain/:chainId/account/:address/send';
  generateFullPath(params: AccountDetailParams): string {
    return this.fullPath()
      .replace(':walletId', params.walletId)
      .replace(':networkId', params.networkId)
      .replace(':chainId', params.chainId)
      .replace(':address', params.address);
  }
}
export class TosRoute extends RouteMeta {
  readonly _path = 'tos';
}
export class UnlockRoute extends RouteMeta {
  readonly _path = '/';
  fullPath() {
    return this.path();
  }
}
export class WalletsRoute extends RouteMeta {
  readonly _path = 'wallets';
}

export class RouteBuilder {
  static accountDetail = new AccountDetailRoute();
  static newHdWallet = new NewHdWalletRoute();
  static registerAccount = new RegisterAccountRoute();
  static selectNewWalletType = new SelectNewWalletTypeRoute();
  static send = new SendRoute();
  static tos = new TosRoute();
  static unlock = new UnlockRoute();
  static wallets = new WalletsRoute();
}
