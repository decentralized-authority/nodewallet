import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { Provider } from 'react-redux';
import { store } from './store';
import { App } from './app';
import { Buffer } from 'buffer';
import { ErrorHandlerContext } from './hooks/error-handler-context';
import { ErrorHandler } from './modules/error-handler';
import { ApiContext } from './hooks/api-context';
import { API } from './modules/api';
import { Messager, RouteBuilder } from '@decentralizedauthority/nodewallet-util-browser';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { TOS } from './components/tos';
import { ErrorView } from './components/error-view';
import { UnlockAccount } from './components/unlock-account';
import { ManageWallets } from './components/manage-wallets';
import { AccountDetail } from './components/account-detail';
import { Send } from './components/send';
import { Stake } from './components/stake';
import { SelectNewWalletType } from './components/select-new-wallet-type';
import { RegisterAccount } from './components/register-account';
import { NewHdWallet } from './components/new-hd-wallet';
import { OpenPopupInfo } from './components/open-popup-info';
import { Connect } from './components/connect';
import { Settings } from './components/settings';
import { Sign } from './components/sign';

window.Buffer = Buffer;

const start = () => {

  const errorHandler = new ErrorHandler();
  const messager = new Messager(chrome.runtime);

  const router = createHashRouter([
    {
      path: RouteBuilder.unlock.path(),
      element: <App />,
      errorElement: <ErrorView />,
      children: [
        {
          index: true,
          element: <UnlockAccount />,
        },
        {
          path: RouteBuilder.registerAccount.path(),
          element: <RegisterAccount />,
        },
        {
          path: RouteBuilder.tos.path(),
          element: <TOS />,
        },
        {
          path: RouteBuilder.selectNewWalletType.path(),
          element: <SelectNewWalletType />,
        },
        {
          path: RouteBuilder.newHdWallet.path(),
          element: <NewHdWallet />,
        },
        {
          path: RouteBuilder.send.path(),
          element: <Send />,
        },
        {
          path: RouteBuilder.stake.path(),
          element: <Stake />,
        },
        {
          path: RouteBuilder.sign.path(),
          element: <Sign />,
        },
        {
          path: RouteBuilder.accountDetail.path(),
          element: <AccountDetail />,
        },
        {
          path: RouteBuilder.wallets.path(),
          element: <ManageWallets />,
        },
        {
          path: RouteBuilder.tos.path(),
          element: <TOS />,
        },
        {
          path: RouteBuilder.openPopupInfo.path(),
          element: <OpenPopupInfo />,
        },
        {
          path: RouteBuilder.connect.path(),
          element: <Connect />,
        },
        {
          path: RouteBuilder.selectAccount.path(),
          element: <ManageWallets selectAccount={true} />,
        },
        {
          path: RouteBuilder.settings.path(),
          element: <Settings />,
        },
      ],
    },
  ]);

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <ErrorHandlerContext.Provider value={errorHandler}>
      <ApiContext.Provider value={new API(messager)}>
        <Provider store={store}>
          <RouterProvider router={router} />
        </Provider>
      </ApiContext.Provider>
    </ErrorHandlerContext.Provider>
  );
};
start();
