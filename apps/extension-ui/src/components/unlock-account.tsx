import React, { useContext, useState } from 'react';
import { Container } from './shared/container';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUserAccount, setActiveView } from '../reducers/app-reducer';
import { AppView, PASSWORD_MIN_LENGTH } from '../constants';
import { isTab, isValidPassword } from '../util';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import isNull from 'lodash/isNull';

export const UnlockAccount = () => {

  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);

  const [ passwordError, setPasswordError ] = useState('');
  const [ password, setPassword ] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const res = await api.unlockUserAccount({password});
      if('error' in res) {
        setPasswordError(res.error.message);
      } else if(isNull(res.result)) {
        setPasswordError('Invalid password.');
      } else {
        const userAccount = res.result;
        dispatch(setUserAccount({
          userAccount,
        }));
        if(userAccount.wallets.length === 0) {
          if(isTab()) {
            dispatch(setActiveView({activeView: AppView.SELECT_NEW_WALLET_TYPE}));
          } else {
            await api.startNewWallet();
            window.close();
          }
        } else {
          dispatch(setActiveView({activeView: AppView.MANAGE_WALLETS}));
        }
      }
    } catch(err: any) {
      errorHandler.handle(err);
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
            disabled={!password}
          >Unlock</button>
        </div>
      </form>
    </Container>
  );
};
