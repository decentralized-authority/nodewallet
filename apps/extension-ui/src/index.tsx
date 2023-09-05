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

window.Buffer = Buffer;

const start = () => {

  const errorHandler = new ErrorHandler();
  const messager = new Messager(chrome.runtime);

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <ErrorHandlerContext.Provider value={errorHandler}>
      <ApiContext.Provider value={new API(messager)}>
        <Provider store={store}>
          <App />
        </Provider>
      </ApiContext.Provider>
    </ErrorHandlerContext.Provider>
  );
};
start();
