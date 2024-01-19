import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import * as math from 'mathjs';
import { findCryptoAccountInUserAccountByAddress, isHex, RouteBuilder, SendParams } from '@decentralizedauthority/nodewallet-util-browser';
import swal from 'sweetalert';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { calledFromContentScript } from '../util';

export const Send = () => {

  const {
    walletId,
    networkId,
    chainId,
    address,
  } = useParams<Partial<SendParams>>();

  const location = useLocation();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);
  const {
    activeChain,
    accountBalances,
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);
  const fromContentScript = calledFromContentScript(location);

  const [ toAddress, setToAddress ] = useState('');
  const [ toAddressError, setToAddressError ] = useState('');
  const [ amount, setAmount ] = useState('');
  // const [ amountError, setAmountError ] = useState('');
  const [ memo, setMemo ] = useState('');
  const [ disableSubmit, setDisableSubmit ] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const amount = queryParams.get('amount') || '';
    const recipient = queryParams.get('recipient') || '';
    const memo = queryParams.get('memo') || '';
    if(amount && recipient) {
      setAmount(amount);
      setToAddress(recipient);
      setMemo(memo);
    }
  }, []);

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

  const accountDetailRoute = RouteBuilder.accountDetail.generateFullPath({
    walletId,
    networkId,
    chainId,
    address,
  })

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if(disableSubmit) {
        return;
      } else {
        setDisableSubmit(true);
      }
      let preppedAmount = amount.trim();
      try {
        if(!math.largerEq(
          math.bignumber(balance).minus(math.bignumber('0.01')),
          math.bignumber(preppedAmount),
        )) {
          throw new Error('Amount must be less than your balance.');
        }
      } catch(err) {
        setDisableSubmit(false);
        throw new Error('Invalid amount.');
      }

      const preppedAddress = toAddress.trim();
      if(!isHex(preppedAddress)) {
        setToAddressError('Invalid address.');
        setDisableSubmit(false);
        return;
      }

      const preppedMemo = memo.trim();

      const modalText = `You are about to send ${preppedAmount} POKT to the following address:\n\n${preppedAddress}\n\nPlease confirm that you want to continue.`;

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
      if(!confirmed) {
        setDisableSubmit(false);
        return;
      }
      const res = await api.sendTransaction({
        accountId: cryptoAccount.id,
        amount: preppedAmount,
        recipient: toAddress,
        memo: preppedMemo,
      });
      if('error' in res) {
        if(fromContentScript) {
          await swal({
            title: 'Oops!',
            text: res.error.message,
            icon: 'error',
          });
          window.close();
        } else {
          errorHandler.handle(res.error);
          setDisableSubmit(false);
          return;
        }
      } else if(res.result.txid) {
        // ToDo move to api
        await chrome.runtime.sendMessage({
          type: 'txid',
          payload: res.result.txid,
        });
        await swal({
          title: 'Success!',
          icon: 'success',
          text: `Your transaction has been successfully submitted to the network. The transaction ID is:\n\n${res.result.txid}`,
        });
        if(fromContentScript) {
          window.close();
        } else {
          navigate(accountDetailRoute);
        }
      }
      setDisableSubmit(false);
    } catch(err: any) {
      errorHandler.handle(err);
      setDisableSubmit(false);
    }
  };
  const onCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if(fromContentScript) {
      window.close();
    } else {
      navigate(-1);
    }
  };

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
    buttonContainer: {
      gap: '.75em',
    },
    button: {
      flex: 1,
      flexBasis: '1px',
    },
  };

  return (
    <Container className={'nw-bg-gradient-vertical'}>
      <BalanceCard
        walletId={walletId}
        account={cryptoAccount}
        hideButtons={true}
        backRoute={accountDetailRoute}
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
                readOnly={fromContentScript}
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
                spellCheck={false}
                className={'form-control font-monospace'}
                id={'address'}
                value={toAddress}
                placeholder={`Enter recipient POKT ${activeChain.toLowerCase()} address`}
                readOnly={fromContentScript}
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
                readOnly={fromContentScript}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            <div className={'d-flex flex-row justify-content-start'} style={styles.buttonContainer}>
              <button
                type={'button'}
                onClick={onCancelClick}
                className={'btn btn-secondary text-uppercase'}
                style={styles.button}
                disabled={disableSubmit}
              >{'Cancel'}</button>
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
