import { createContext } from 'react';
import { API } from '../modules/api';
import { Messager } from '@nodewallet/util-browser';

export const ApiContext = createContext(new API(new Messager(chrome.runtime)));
