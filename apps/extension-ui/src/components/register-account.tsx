import React, { useContext, useState } from 'react';
import { Container } from './shared/container';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setUserAccount, setActiveView } from '../reducers/app-reducer';
import { AppView, PASSWORD_MIN_LENGTH } from '../constants';
import { isValidPassword } from '../util';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';

export const RegisterAccount = () => {

  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);

  // const {
  //   userAccount,
  // } = useSelector(({ appState }: RootState) => appState);

  const [ passwordError, setPasswordError ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordRepeat, setPasswordRepeat ] = useState('');
  const [ passwordRecoveryNoticeChecked, setPasswordRecoveryNoticeChecked ] = useState(false);

  const onRegisterClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      e.preventDefault();
      if(!isValidPassword(password)) {
        setPasswordError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters in length.`);
        return;
      }
      const res = await api.registerUser({password});
      if('error' in res) {
        errorHandler.handle(res.error);
      } else {
        console.log('userAccount', res.result);
        dispatch(setUserAccount({
          userAccount: res.result,
        }));
        dispatch(setActiveView({activeView: AppView.SELECT_NEW_WALLET_TYPE}));
      }
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  return (
    <Container className={'flex-column justify-content-start align-items-center p-2'}>
      <h1 className={'mt-3'}>Register User Account</h1>
      <p className={'text-center'}>All user data stored in NodeWallet is encrypted. Please enter and confirm a password which will be used to decrypt and unlock your user data. The password must be at least {PASSWORD_MIN_LENGTH} characters in length. NodeWallet cannot recover lost or forgotten passwords.</p>
      <form className={'w-100 overflow-y-auto overflow-x-hidden'}>
        <div className={'row justify-content-center'}>
          <div className={'col-lg-6 col-md-8'}>

            <div className={'mb-3'}>
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

            <div className={'mb-3'}>
              <label htmlFor={'password-repeat'} className={'form-label'}>Confirm Password</label>
              <input
                type={'password'}
                className={'form-control'}
                id={'password-repeat'}
                value={passwordRepeat}
                placeholder={'Re-enter password'}
                onChange={(e) => setPasswordRepeat(e.target.value)}
              />
            </div>

            <div className={'form-check'}>
              <input
                className={'form-check-input'}
                type={'checkbox'}
                value={''}
                id={'cannot-recover-password'}
                checked={passwordRecoveryNoticeChecked}
                onChange={(e) => setPasswordRecoveryNoticeChecked(e.target.checked)}
              />
              <label className={'form-check-label'} htmlFor={'cannot-recover-password'}>I understand that NodeWallet cannot recover lost or forgotten passwords.</label>
            </div>

          </div>
        </div>
      </form>
      <button
        className={'btn btn-primary btn-lg mt-4 mb-4'}
        disabled={!passwordRecoveryNoticeChecked || !password || password !== passwordRepeat}
        onClick={onRegisterClick}
      >Register account</button>
    </Container>
  );
};