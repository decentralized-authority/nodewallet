import React, { useContext, useState } from 'react';
import { Container } from './shared/container';
import { useDispatch } from 'react-redux';
import { setUserAccount, setUserStatus } from '../reducers/app-reducer';
import { PASSWORD_MIN_LENGTH } from '../constants';
import { isValidPassword } from '../util';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { UserStatus } from '@decentralizedauthority/nodewallet-constants';
import { useNavigate } from 'react-router-dom';
import { RouteBuilder } from '@decentralizedauthority/nodewallet-util-browser';

export const RegisterAccount = () => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);

  const [ disableSubmit, setDisableSubmit ] = useState(false);
  const [ passwordError, setPasswordError ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ passwordRepeat, setPasswordRepeat ] = useState('');
  const [ passwordRecoveryNoticeChecked, setPasswordRecoveryNoticeChecked ] = useState(false);

  const onRegisterClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    try {
      e.preventDefault();
      if(disableSubmit) {
        return;
      }
      if(!isValidPassword(password)) {
        setPasswordError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters in length.`);
        return;
      }
      setDisableSubmit(true);
      const res = await api.registerUser({password});
      if('error' in res) {
        errorHandler.handle(res.error);
        setDisableSubmit(false);
      } else {
        dispatch(setUserAccount({
          userAccount: res.result,
        }));
        dispatch(setUserStatus({userStatus: UserStatus.UNLOCKED}));
        navigate(RouteBuilder.selectNewWalletType.fullPath());
      }
    } catch(err: any) {
      errorHandler.handle(err);
      setDisableSubmit(false);
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
        disabled={disableSubmit || !passwordRecoveryNoticeChecked || !password || password !== passwordRepeat}
        onClick={onRegisterClick}
      >Register account</button>
    </Container>
  );
};
