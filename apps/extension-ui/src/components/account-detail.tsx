import React from 'react';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import { TransactionList } from './shared/transaction-list';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { routes } from '../constants';
import { useParams } from 'react-router-dom';
import { ChainType, CoinType } from '@nodewallet/constants';
import { findCryptoAccountInUserAccountByAddress } from '@nodewallet/util-browser';

export const AccountDetail = () => {

  const {
    walletId,
    networkId,
    chainId,
    address,
  } = useParams<{walletId: string, networkId: CoinType, chainId: ChainType, address: string}>();

  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  if(!userAccount || !walletId || !networkId || !chainId || !address) {
    return null;
  }

  const cryptoAccount = findCryptoAccountInUserAccountByAddress(
    userAccount,
    walletId,
    networkId,
    chainId,
    address,
  );

  if(!cryptoAccount) {
    return null;
  }

  return (
    <Container>
      <BalanceCard
        walletId={walletId}
        account={cryptoAccount}
        backRoute={'/' + routes.WALLETS}
      />
      <TransactionList />
    </Container>
  );
};
