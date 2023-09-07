import React, { useContext, useEffect, useState } from 'react';
import { Container } from './shared/container';
import { useDispatch } from 'react-redux';
import { setActiveView, setUserAccount } from '../reducers/app-reducer';
import { AppView } from '../constants';
import { ApiContext } from '../hooks/api-context';
import { ErrorHandlerContext } from '../hooks/error-handler-context';
import { joinMnemonic, splitMnemonic } from '@nodewallet/util-browser';
import swal from 'sweetalert';

export const NewHdWallet = () => {

  const dispatch = useDispatch();
  const api = useContext(ApiContext);
  const errorHandler = useContext(ErrorHandlerContext);

  const [ mnemonic, setMnemonic ] = useState<string[]>([]);

  useEffect(() => {
    api.generateMnemonic()
      .then((res) => {
        if('error' in res) {
          errorHandler.handle(res.error);
        } else {
          setMnemonic(splitMnemonic(res.result));
        }
      })
      .catch(err => errorHandler.handle(err));
  }, [dispatch, api, errorHandler]);

  const onBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setActiveView({activeView: AppView.SELECT_NEW_WALLET_TYPE}));
  };

  const onCopyClick = async (e: React.MouseEvent) => {
    try {
      e.preventDefault();
      await navigator.clipboard.writeText(joinMnemonic(mnemonic));
    } catch(err: any) {
      errorHandler.handle(err);
    }
  };

  const onSavedClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const insertRes = await api.insertHdWallet({mnemonic: joinMnemonic(mnemonic)});
    if('error' in insertRes) {
      await swal({
        icon: 'error',
        title: insertRes.error.message,
      });
      return;
    }
    // const newWallet = insertRes.result;
    const updatedUserAccount = await api.getUserAccount();
    if('error' in updatedUserAccount) {
      errorHandler.handle(updatedUserAccount.error);
      return;
    } else if(updatedUserAccount.result) {
      await swal({
        icon: 'success',
        title: 'New HD Wallet created successfully!',
      });
      dispatch(setUserAccount({userAccount: updatedUserAccount.result}));
      dispatch(setActiveView({activeView: AppView.MANAGE_WALLETS}));
    }
  };

  console.log('mnemonic', mnemonic);

  const rowLength = 6;

  return (
    <Container>
      <h3 className={'ps-2 pe-2'}><a href={'#'} onClick={onBackClick} title={'Go back to wallets'}><i className={'mdi mdi-arrow-left-top-bold'} /></a> New HD Wallet</h3>
      <div className={'flex-grow-1 ms-2 me-2 mt-3 position-relative'}>
        <div className={'position-absolute top-0 bottom-0 start-0 end-0 overflow-x-hidden overflow-y-auto'}>
          {
            mnemonic
              .reduce((arr, word) => {
                let lastIdx = arr.length === 0 ? 0 : arr.length - 1;
                if(!arr[lastIdx]) {
                  arr.push([]);
                }
                if(arr[lastIdx].length < rowLength) {
                  arr[lastIdx].push(word);
                } else {
                  arr.push([word]);
                }
                return arr;
              }, [] as string[][])
              .map((words, i) => {
                return (
                  <div key={`words${i}`} className={`d-flex flex-row justify-content-start align-items-center ${i > 0 ? 'mt-4' : ''}`}>
                    {words
                      .map((word, ii) => {
                        return (
                          <div key={word} className={'flex-grow-1 flex-basis-1 text-center'}>
                            <div className={'text-center'}>
                              <div className={'font-monospace'}>{(i * rowLength) + ii + 1}</div>
                              <div className={'fs-4'}>
                                <strong>{word}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                );
              })
          }

          <div className={`${mnemonic.length === 0 ? 'd-none' : ''} text-center mt-4 fs-4`}>
            <a href={'#'} title={'Copy seed phrase'} onClick={onCopyClick}><i className={'mdi mdi-content-copy'} /> Copy seed phrase</a>
          </div>

          <div className={`${mnemonic.length === 0 ? 'd-none' : ''} mt-4 ms-2 me-2 mb-2`}>
            <button className={'d-block w-100 btn btn-primary btn-lg'} onClick={onSavedClick}>I have saved the passphrase</button>
          </div>

        </div>
      </div>


    </Container>
  );
};
