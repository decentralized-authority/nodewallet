import './css/sakura-dark.css';
import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Buffer } from 'buffer';
import { App } from './app';
// import { AppContainer as App } from './app-hooks';

window.Buffer = Buffer;

const start = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <App />
  );
};
start();
