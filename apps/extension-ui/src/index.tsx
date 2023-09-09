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
import { Messager } from '@nodewallet/util-browser';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { TOS } from './components/tos';
import { ErrorView } from './components/error-view';
import { routes } from './constants';
import { UnlockAccount } from './components/unlock-account';
import { ManageWallets } from './components/manage-wallets';
import { AccountDetail } from './components/account-detail';
import { Send } from './components/send';

window.Buffer = Buffer;

const start = () => {

  const errorHandler = new ErrorHandler();
  const messager = new Messager(chrome.runtime);

  const router = createHashRouter([
    {
      path: routes.ROOT,
      element: <App />,
      errorElement: <ErrorView />,
      children: [
        {
          index: true,
          element: <UnlockAccount />,
        },
        {
          path: routes.TOS,
          element: <TOS />,
        },
        {
          path: routes.SEND,
          element: <Send />,
        },
        {
          path: routes.ACCOUNT_DETAIL,
          element: <AccountDetail />,
        },
        {
          path: routes.WALLETS,
          element: <ManageWallets />,
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
