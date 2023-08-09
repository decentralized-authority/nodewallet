import React from 'react';
import { Container } from './shared/container';
import { WalletCard } from './shared/wallet-card';
import { generateFakeAddress } from '../util';

export const ManageWallets = () => {
  return (
    <Container>
      <h3 className={'ps-2 pe-2'}>Manage wallets</h3>
      <div className={'flex-grow-1 position-relative'}>
        <div className={'position-absolute top-0 start-0 end-0 bottom-0 overflow-x-hidden overflow-y-auto'}>
          <WalletCard title={'HD Wallet 2'} addresses={[generateFakeAddress(), generateFakeAddress(), generateFakeAddress()]} />
          <WalletCard title={'Legacy Wallet 1'} addresses={[generateFakeAddress()]} hideAddButton={true} />
          <WalletCard title={'HD Wallet 1'} addresses={[generateFakeAddress(), generateFakeAddress()]} />
        </div>
      </div>
      <div className={'d-flex flex-row justify-content-start p-2'}>
        <button className={'btn btn-primary flex-grow-1 me-2'}><i className={'mdi mdi-upload'} /> Import wallet</button>
        <button className={'btn btn-primary flex-grow-1'}><i className={'mdi mdi-plus-thick'} /> New HD wallet</button>
      </div>
    </Container>
  );
};
