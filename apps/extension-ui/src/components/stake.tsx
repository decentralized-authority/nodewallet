import React, { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { Container } from './shared/container';
import { BalanceCard } from './shared/balance-card';
import * as math from 'mathjs';
import {
  findCryptoAccountInUserAccountByAddress,
  isHex,
  RouteBuilder,
  StakeParams,
} from '@nodewallet/util-browser';
import swal from 'sweetalert';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { calledFromContentScript, truncateAddress } from '../util';

export const Stake = () => {

  const {
    walletId,
    networkId,
    chainId,
    address,
  } = useParams<Partial<StakeParams>>();

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

  const [ operatorPublicKey, setOperatorPublicKey ] = useState('');
  const [ operatorPublicKeyError, setOperatorPublicKeyError ] = useState('');
  const [ chains, setChains ] = useState<string>('');
  const [ serviceURL, setServiceURL ] = useState('');
  const [ serviceUrlError, setServiceUrlError ] = useState('');
  const [ amount, setAmount ] = useState('');
  // const [ amountError, setAmountError ] = useState('');
  const [ disableSubmit, setDisableSubmit ] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const amount = queryParams.get('amount') || '';
    const operator = queryParams.get('operator') || '';
    const chains = queryParams.get('chains') || '';
    const serviceURL = queryParams.get('serviceurl') || '';
    if (amount && operator && serviceURL) {
      setAmount(amount);
      setOperatorPublicKey(operator);
      setChains(chains
        .split(',')
        .map((chain) => chain.trim())
        .filter((chain) => !!chain)
        .join(',')
      );
      setServiceURL(serviceURL);
    }
  }, []);

  if (!userAccount || !walletId || !networkId || !chainId || !address) {
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

      const preppedOperator = operatorPublicKey.trim();
      if(!isHex(operatorPublicKey)) {
        setOperatorPublicKeyError('Invalid public key.');
        setDisableSubmit(false);
        return;
      }

      const preppedServiceURL = serviceURL.trim();
      if(!preppedServiceURL) {
        setServiceUrlError('Invalid service URL.');
        setDisableSubmit(false);
        return;
      }

      const preppedChains = chains
        .trim()
        .split(',')
        .map((chain) => chain.trim())
        .filter((chain) => !!chain);

      const modalText = `You are about to stake ${preppedAmount} POKT for the following account:\n${cryptoAccount.address}\n\nWith Node Operator:\n${truncateAddress(preppedOperator)}\n\nService URL:\n${preppedServiceURL}\n\nAnd chains:\n${preppedChains.join(', ')}\n\nPlease confirm that you want to continue.`;

      const confirmed = await swal({
        title: 'Confirm Stake Node',
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
      } else {
        console.log('confirmed');
      }
      const res = await api.stakeNode({
        accountId: cryptoAccount.id,
        amount: preppedAmount,
        operatorPublicKey: preppedOperator,
        serviceURL: preppedServiceURL,
        chains: preppedChains,
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
          text: `Your stake transaction has been successfully submitted to the network. The transaction ID is:\n\n${res.result.txid}`,
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
      <h4 className={'text-uppercase pt-2 pb-2 ps-2 pe-2'}>{cryptoAccount.network} Node Stake</h4>
      <div className={'flex-grow-1 position-relative'}>
        <form onSubmit={onSubmit} className={'ps-2 pe-2 position-absolute top-0 bottom-0 start-0 end-0 overflow-y-auto overflow-x-hidden'}>
          <div className={'mb-1'}>

            <div className={'mb-1'}>
              <label htmlFor={'amount'} className={'form-label'}>Amount to stake</label>
              <input
                type={'number'}
                className={'form-control form-control-sm font-monospace'}
                id={'amount'}
                value={amount}
                placeholder={'Enter amount of POKT to stake'}
                autoFocus={true}
                readOnly={fromContentScript}
                onChange={(e) => setAmount(e.target.value)}
              />
              {!amountGood ?
                <div className={'form-text text-danger'}>{'Amount must be less than your balance.'}</div> : null}
            </div>

            <div className={'mb-1'}>
              <label htmlFor={'serviceurl'} className={'form-label'}>Service URL</label>
              <input
                type={'text'}
                spellCheck={false}
                className={'form-control form-control-sm font-monospace'}
                id={'serviceurl'}
                value={serviceURL}
                placeholder={'Enter service URL'}
                readOnly={fromContentScript}
                onChange={(e) => setServiceURL(e.target.value.trim())}
              />
              {serviceUrlError ? <div className={'form-text text-danger'}>{serviceUrlError}</div> : null}
            </div>

            <div className={'mb-1'}>
              <label htmlFor={'chains'} className={'form-label'}>Chains</label>
              <input
                type={'text'}
                spellCheck={false}
                className={'form-control form-control-sm font-monospace'}
                id={'chains'}
                value={chains}
                placeholder={'Enter chains, separated by comma'}
                readOnly={fromContentScript}
                onChange={(e) => setChains(e.target.value.trim())}
              />
              {serviceUrlError ? <div className={'form-text text-danger'}>{serviceUrlError}</div> : null}
            </div>

            <div className={'mb-3'}>
              <label htmlFor={'operator'} className={'form-label'}>Operator Public Key</label>
              <textarea
                rows={1}
                spellCheck={false}
                className={'form-control form-control-sm'}
                id={'operator'}
                value={operatorPublicKey}
                placeholder={'Enter hex-encoded operator public key'}
                style={{resize: 'vertical'}}
                readOnly={fromContentScript}
                onChange={(e) => setOperatorPublicKey(e.target.value.trim())}
                onBlur={() => {
                  if (operatorPublicKey && isHex(operatorPublicKey)) {
                    setOperatorPublicKeyError('');
                  } else if (operatorPublicKey && !isHex(operatorPublicKey)) {
                    setOperatorPublicKeyError('Invalid operator public key.');
                  }
                }}
              />
              {operatorPublicKeyError ? <div className={'form-text text-danger'}>{operatorPublicKeyError}</div> : null}
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
                disabled={disableSubmit || !amountGood || !operatorPublicKey || !amount || !serviceURL}
              >{`Stake ${amount} POKT`}</button>
            </div>

          </div>
        </form>
      </div>
    </Container>
  );
};
