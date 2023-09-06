import React, { useContext, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import { CryptoAccount } from '@nodewallet/types';
import { setActiveView } from '../reducers/app-reducer';
import { AppView } from '../constants';
import * as math from 'mathjs';
import { isValidPassword } from '../util';
import { isHex } from '@nodewallet/util-browser';
import swal from 'sweetalert';

export const Send = () => {

  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);
  const dispatch = useDispatch();
  const {
    activeAccount,
    activeChain,
    accountBalances,
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);

  const [ toAddress, setToAddress ] = useState('');
  const [ toAddressError, setToAddressError ] = useState('');
  const [ amount, setAmount ] = useState('');
  const [ amountError, setAmountError ] = useState('');
  const [ memo, setMemo ] = useState('');
  const [ disableSubmit, setDisableSubmit ] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      let preppedAmount = amount.trim();
      try {
        if(!math.largerEq(
          math.bignumber(balance).minus(math.bignumber('0.01')),
          math.bignumber(preppedAmount),
        )) {
          throw new Error('Amount must be less than your balance.');
        }
      } catch(err) {
        throw new Error('Invalid amount.');
      }

      const preppedAddress = toAddress.trim();
      if(!isHex(preppedAddress)) {
        setToAddressError('Invalid address.');
        return;
      }

      const preppedMemo = memo.trim();

      const modalText = `You are about to send ${preppedAmount} POKT to the following address:\n\n${preppedAddress}.\n\nPlease confirm that you want to continue.`;

      const confirmed = await swal({
        title: 'Confirm Transaction',
        icon: 'warning',
        text: modalText,
        buttons: {
          cancel: {
            text: 'Cancel',
            visible: true,
          },
          confirm: {
            text: 'Confirm',
            visible: true,
            closeModal: false,
          }
        }
      });

    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  if(!userAccount || !activeAccount) {
    return null;
  }

  let cryptoAccount: CryptoAccount|null = null;
  for(const wallet of userAccount.wallets) {
    for(const walletAccount of wallet.accounts) {
      for(const ca of walletAccount.accounts) {
        if(ca.id === activeAccount) {
          cryptoAccount = ca;
          break;
        }
      }
    }
  }

  if(!cryptoAccount) {
    return null;
  }

  const balance = accountBalances[cryptoAccount.id] || '0';
  let amountGood: boolean;
  try {
    amountGood = !amount || !!(math.largerEq(
      math.bignumber(balance).minus(math.bignumber('0.01')),
      math.bignumber(amount)
    ));
  } catch(err) {
    amountGood = false;
  }

  const styles = {
    button: {
      minWidth: 120,
    },
  };

  return (
    <Container>
      <BalanceCard
        account={cryptoAccount}
        hideButtons={true}
        onBack={() => dispatch(setActiveView({activeView: AppView.ACCOUNT_DETAIL}))}
      />
      <h4 className={'text-uppercase pt-2 pb-2 ps-2 pe-2'}>Send {cryptoAccount.network}</h4>
      <div className={'flex-grow-1 position-relative'}>
        <form onSubmit={onSubmit} className={'ps-2 pe-2 position-absolute top-0 bottom-0 start-0 end-0 overflow-y-auto overflow-x-hidden'}>
          <div className={'mb-3'}>

            <div className={'mb-2'}>
              <label htmlFor={'amount'} className={'form-label'}>Amount to send</label>
              <input
                type={'number'}
                className={'form-control font-monospace'}
                id={'amount'}
                value={amount}
                placeholder={'Enter amount of POKT to send'}
                autoFocus={true}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={() => {
                  if(toAddressError && isHex(toAddress)) {
                    setToAddressError('');
                  } else if(toAddress && !isHex(toAddress)) {
                    setToAddressError('Invalid address.');
                  }
                }}
              />
              {!amountGood ? <div className={'form-text text-danger'}>{'Amount must be less than your balance.'}</div> : null}
            </div>

            <div className={'mb-2'}>
              <label htmlFor={'address'} className={'form-label'}>Recipient Address</label>
              <input
                type={'text'}
                className={'form-control font-monospace'}
                id={'address'}
                value={toAddress}
                placeholder={`Enter recipient POKT ${activeChain.toLowerCase()} address`}
                onChange={(e) => setToAddress(e.target.value.trim())}
                onBlur={() => {
                  if(toAddressError && isHex(toAddress)) {
                    setToAddressError('');
                  } else if(toAddress && !isHex(toAddress)) {
                    setToAddressError('Invalid address.');
                  }
                }}
              />
              {toAddressError ? <div className={'form-text text-danger'}>{toAddressError}</div> : null}
            </div>

            <div className={'mb-3'}>
              <label htmlFor={'memo'} className={'form-label'}>Memo</label>
              <textarea
                className={'form-control'}
                id={'memo'}
                value={memo}
                placeholder={'Enter optional memo'}
                style={{resize: 'vertical'}}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            <div className={'d-flex flex-row justify-content-center'}>
              <button
                type={'submit'}
                className={'btn btn-primary'}
                style={styles.button}
                disabled={disableSubmit || !amountGood || !toAddress || !amount}
              >{`Send ${amount} POKT`}</button>
            </div>

          </div>
        </form>
      </div>
    </Container>
  );
};
