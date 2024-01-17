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
export interface StakeParams extends AccountDetailParams {}
export interface SignParams extends AccountDetailParams {}
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
export class StakeRoute extends RouteMeta {
  readonly _path = 'wallets/:walletId/network/:networkId/chain/:chainId/account/:address/stake';
  generateFullPath(params: AccountDetailParams): string {
    return this.fullPath()
      .replace(':walletId', params.walletId)
      .replace(':networkId', params.networkId)
      .replace(':chainId', params.chainId)
      .replace(':address', params.address);
  }
}
export class SignRoute extends RouteMeta {
  readonly _path = 'wallets/:walletId/network/:networkId/chain/:chainId/account/:address/sign';
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
export class OpenPopupInfoRoute extends RouteMeta {
  readonly _path = 'open-popup-info';
}
export class ConnectRoute extends RouteMeta {
  readonly _path = 'connect';
}
export class SelectAccountRoute extends RouteMeta {
  readonly _path = 'select-account';
}
export class SettingsRoute extends RouteMeta {
  readonly _path = 'settings';
}

export class RouteBuilder {
  static accountDetail = new AccountDetailRoute();
  static newHdWallet = new NewHdWalletRoute();
  static registerAccount = new RegisterAccountRoute();
  static selectNewWalletType = new SelectNewWalletTypeRoute();
  static send = new SendRoute();
  static stake = new StakeRoute();
  static sign = new SignRoute();
  static tos = new TosRoute();
  static unlock = new UnlockRoute();
  static wallets = new WalletsRoute();
  static openPopupInfo = new OpenPopupInfoRoute();
  static connect = new ConnectRoute();
  static selectAccount = new SelectAccountRoute();
  static settings = new SettingsRoute();
}
