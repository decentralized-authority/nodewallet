import React from 'react';
import { Container } from './shared/container';
import { useDispatch } from 'react-redux';
import { setActiveView } from '../reducers/app-reducer';
import { appView } from '../constants';

export const NewHdWallet = () => {

  const dispatch = useDispatch();

  const mnemonic = [
    'word',
    'word',
    'word',
    'word',
    'word',
    'word',
    'word',
    'word',
    'word',
    'word',
    'word',
    'word',
  ];

  const onBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setActiveView({activeView: appView.MANAGE_WALLETS}));
  };

  const onSavedClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(setActiveView({activeView: appView.MANAGE_WALLETS}));
  };

  return (
    <Container>
      <h3 className={'ps-2 pe-2'}><a href={'#'} onClick={onBackClick} title={'Go back to wallets'}><i className={'mdi mdi-arrow-left-top-bold'} /></a> New HD Wallet</h3>
      <div className={'ms-2 me-2 pt-3'}>

        <div className={'d-flex flex-row justify-content-start align-items-center'}>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>1.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[0]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>2.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[1]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>3.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[2]}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={'d-flex flex-row justify-content-start align-items-center mt-3'}>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>4.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[3]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>5.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[4]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>6.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[5]}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={'d-flex flex-row justify-content-start align-items-center mt-3'}>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>7.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[6]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>8.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[7]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>9.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[8]}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className={'d-flex flex-row justify-content-start align-items-center mt-3'}>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>10.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[9]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>11.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[10]}</strong>
              </div>
            </div>
          </div>
          <div className={'flex-grow-1 flex-basis-1 text-center'}>
            <div className={'text-center'}>
              <div>12.</div>
              <div className={'fs-4'}>
                <strong>{mnemonic[11]}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className={'text-center mt-4 fs-4'}>
        <a href={'#'} title={'Copy seed phrase'}><i className={'mdi mdi-content-copy'} /> Copy seed phrase</a>
      </div>

      <div className={'mt-4 ms-2 me-2'}>
        <button className={'d-block w-100 btn btn-primary btn-lg'} onClick={onSavedClick}>I have saved the passphrase</button>
      </div>

    </Container>
  );
};
