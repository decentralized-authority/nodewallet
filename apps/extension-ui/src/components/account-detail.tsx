import React, { useContext, useEffect } from 'react';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import { TransactionList } from './shared/transaction-list';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AccountDetailParams,
  findCryptoAccountInUserAccountByAddress,
  prepFilename,
  RouteBuilder
} from '@nodewallet/util-browser';
import swal from 'sweetalert';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { ApiContext } from '../hooks/api-context';
import { ChainType } from '@nodewallet/constants';

export const AccountDetail = () => {

  const navigate = useNavigate();
  const errorHandler = useContext(ErrorHandlerContext);
  const api = useContext(ApiContext);
  const {
    walletId,
    networkId,
    chainId,
    address,
  } = useParams<Partial<AccountDetailParams>>();

  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  useEffect(() => {
    if(userAccount?.settings.hideTestnets && chainId === ChainType.TESTNET) {
      navigate(RouteBuilder.wallets.fullPath());
    }
  }, [chainId, navigate, userAccount?.settings.hideTestnets]);

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

  const onViewClick = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      if(!cryptoAccount) {
        return;
      }
      const password = await swal({
        title: 'Unlock private key',
        content: {
          element: 'input',
          attributes: {
            type: 'password',
            placeholder: 'Enter user password',
            style: 'color:#333',
          },
        },
        buttons: {
          cancel: {
            text: 'Cancel',
            visible: true,
          },
          confirm: {
            text: 'View Key',
            visible: true,
            closeModal: false,
          },
        },
        closeOnClickOutside: false,
        closeOnEsc: false,
      });
      if(password) {
        const prepped = password.trim();
        const res = await api.exportPrivateKey({
          password: prepped,
          accountId: cryptoAccount.id,
        });
        if('error' in res) {
          errorHandler.handle(res.error);
        } else {
          await swal({
            title: 'Private Key',
            text: res.result,
          });
        }
      } else {
        //@ts-ignore
        swal.close();
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };
  const onExportClick = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      if(!cryptoAccount) {
        return;
      }
      const password = await swal({
        title: 'Unlock private key',
        content: {
          element: 'input',
          attributes: {
            type: 'password',
            placeholder: 'Enter user password',
            style: 'color:#333',
          },
        },
        buttons: {
          cancel: {
            text: 'Cancel',
            visible: true,
          },
          confirm: {
            text: 'Export Key',
            visible: true,
            closeModal: false,
          },
        },
        closeOnClickOutside: false,
        closeOnEsc: false,
      });
      if(password) {
        const prepped = password.trim();
        const res = await api.exportKeyfile({
          password: prepped,
          keyfilePassword: prepped,
          accountId: cryptoAccount.id,
        });
        if('error' in res) {
          errorHandler.handle(res.error);
        } else {
          const blob = new Blob([res.result], {type: 'application/json;charset=utf-8'});
          const url = URL.createObjectURL(blob);
          await api.saveFile({
            filename: `${prepFilename(cryptoAccount.name)}.json`,
            url,
          });
        }
      } else {
        //@ts-ignore
        swal.close();
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  const styles = {
    bottomButton: {
      flexBasis: '1px',
    },
  };

  if(!cryptoAccount) {
    return null;
  }

  return (
    <Container className={'nw-bg-gradient-vertical'}>
      <BalanceCard
        walletId={walletId}
        account={cryptoAccount}
        backRoute={RouteBuilder.wallets.fullPath()}
      />
      <TransactionList
        account={cryptoAccount}
      />
      <div className={'d-flex flex-row justify-content-start p-2'}>
        <button className={'btn btn-outline-primary flex-grow-1 me-2'} style={styles.bottomButton} onClick={onViewClick}><i className={'mdi mdi-key-variant'} /> View Private Key</button>
        <button className={'btn btn-outline-primary flex-grow-1'} style={styles.bottomButton} onClick={onExportClick}><i className={'mdi mdi-export'} /> Export Keyfile</button>
      </div>
    </Container>
  );
};
