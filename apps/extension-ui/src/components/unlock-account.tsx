import React, { useContext, useState } from 'react';
import { Container } from './shared/container';
import { useDispatch } from 'react-redux';
import { setUserAccount, setUserStatus } from '../reducers/app-reducer';
import { isTab, isValidPassword } from '../util';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import isNull from 'lodash/isNull';
import { UserStatus } from '@nodewallet/constants';
import { useNavigate } from 'react-router-dom';
import {
  findCryptoAccountInUserAccount,
  findCryptoAccountInUserAccountByAddress, getAccountDetailParamsFromUserAccount,
  RouteBuilder
} from '@nodewallet/util-browser';

export const UnlockAccount = () => {

  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);
  const navigate = useNavigate();

  const [ disableSubmit, setDisableSubmit ] = useState(false);
  const [ passwordError, setPasswordError ] = useState('');
  const [ password, setPassword ] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if(disableSubmit) {
        return;
      }
      setDisableSubmit(true);
      const res = await api.unlockUserAccount({password});
      if('error' in res) {
        setPasswordError(res.error.message);
        setDisableSubmit(false);
      } else if(isNull(res.result)) {
        setPasswordError('Invalid password.');
        setDisableSubmit(false);
      } else {
        const userAccount = res.result;
        console.log('userAccount', userAccount);
        dispatch(setUserAccount({
          userAccount,
        }));
        dispatch(setUserStatus({userStatus: UserStatus.UNLOCKED}));
        if(userAccount.wallets.length === 0) {
          if(isTab()) {
            navigate(RouteBuilder.selectNewWalletType.fullPath());
          } else {
            await api.startNewWallet();
            window.close();
          }
        } else {
          const activeAccountRes = await api.getActiveAccount();
          if('error' in activeAccountRes) {
            errorHandler.handle(activeAccountRes.error);
          } else {
            if(activeAccountRes.result) {
              const account = findCryptoAccountInUserAccount(userAccount, activeAccountRes.result);
              if(account) {
                const accountDetailParams = getAccountDetailParamsFromUserAccount(userAccount, account.id);
                if(accountDetailParams) {
                  navigate(RouteBuilder.accountDetail.generateFullPath(accountDetailParams));
                } else {
                  navigate(RouteBuilder.wallets.fullPath());
                }
              } else {
                navigate(RouteBuilder.wallets.fullPath());
              }
            } else {
              navigate(RouteBuilder.wallets.fullPath());
            }
          }
        }
      }
    } catch(err: any) {
      errorHandler.handle(err);
      setDisableSubmit(false);
    }
  };

  return (
    <Container className={'flex-column justify-content-start align-items-center p-2'}>
      <h1 className={'mt-3 mb-3'}>Unlock Account</h1>
      <form className={'w-100 overflow-y-hidden overflow-x-hidden flex-grow-1 d-flex flex-column justify-content-center'} onSubmit={onSubmit}>
        <div className={'row justify-content-center'}>
          <div className={'col-lg-6 col-md-8'}>

            <div>
              <label htmlFor={'password'} className={'form-label'}>Password</label>
              <input
                type={'password'}
                className={'form-control'}
                id={'password'}
                value={password}
                placeholder={'Enter user password'}
                autoFocus={true}
                onBlur={() => {
                  if(passwordError && isValidPassword(password)) {
                    setPasswordError('');
                  }
                }}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError ? <div className={'form-text text-danger'}>{passwordError}</div> : null}
            </div>

          </div>
        </div>
        <div className={'d-flex flex-row justify-content-center'}>
          <button
            type={'submit'}
            className={'btn btn-primary btn-lg mt-4 mb-4'}
            disabled={disableSubmit || !password}
          >Unlock</button>
        </div>
      </form>
    </Container>
  );
};
