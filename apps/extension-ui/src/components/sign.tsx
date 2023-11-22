import React, { useContext, useEffect, useState } from 'react';
import { BalanceCard } from './shared/balance-card';
import { Container } from './shared/container';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { findCryptoAccountInUserAccountByAddress, RouteBuilder, SignParams } from '@nodewallet/util-browser';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { calledFromContentScript } from '../util';
import swal from 'sweetalert';

export const Sign = () => {

  const {
    walletId,
    networkId,
    chainId,
    address,
  } = useParams<Partial<SignParams>>();

  const location = useLocation();
  const navigate = useNavigate();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);
  const {
    userAccount,
  } = useSelector(({ appState }: RootState) => appState);
  const fromContentScript = calledFromContentScript(location);

  const [ message, setMessage ] = useState<string>('');
  const [ disableSubmit, setDisableSubmit ] = useState<boolean>(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const message = queryParams.get('message') || '';
    if(message) {
      setMessage(message);
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
  });

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if(disableSubmit) {
        return;
      } else {
        setDisableSubmit(true);
      }
      console.log('onSubmit!');
      setDisableSubmit(false);
      const res = await api.signMessage({
        accountId: cryptoAccount.id,
        message,
      });
      if('error' in res) {
        errorHandler.handle(res.error);
        setDisableSubmit(false);
        return;
      } else if(res.result.signature) {
        if(fromContentScript) {
          // ToDo move to api
          await chrome.runtime.sendMessage({
            type: 'signature',
            payload: res.result.signature,
          });
          window.close();
        } else {
          await swal({
            icon: 'success',
            title: 'Signature',
            text: res.result.signature,
          });
          navigate(-1);
        }
      }
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
      <h4 className={'text-uppercase pt-2 pb-2 ps-2 pe-2'}>Sign Message</h4>
      <div className={'flex-grow-1 position-relative'}>
        <form onSubmit={onSubmit} className={'ps-2 pe-2 position-absolute top-0 bottom-0 start-0 end-0 overflow-y-auto overflow-x-hidden'}>
          <div className={'mb-3'}>

            <div className={'mb-3'}>
              <label htmlFor={'message'} className={'form-label'}>Message</label>
              <textarea
                className={'form-control'}
                id={'message'}
                value={message}
                placeholder={'Enter message'}
                style={{resize: 'vertical'}}
                readOnly={fromContentScript}
                onChange={(e) => setMessage(e.target.value)}
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
                className={'btn btn-primary text-uppercase'}
                style={styles.button}
                disabled={disableSubmit || !message}
              >{'Sign Message'}</button>
            </div>

          </div>
        </form>
      </div>
    </Container>
  );
};
