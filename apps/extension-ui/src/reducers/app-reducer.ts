import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountTransaction, UserAccount } from '@nodewallet/types';
import { ChainType, UserStatus } from '@nodewallet/constants';

export type AccountBalances = {[id: string]: string}
export type AccountTransactions = {[id: string]: AccountTransaction[]}

export interface AppState {
  userStatus: UserStatus|''
  userAccount: UserAccount|null
  locale: string
  windowWidth: number
  windowHeight: number
  activeAccount: string
  accountBalances: AccountBalances
  accountTransactions: AccountTransactions
  activeChain: ChainType
}
const getInitialState = (): AppState => ({
  userStatus: '',
  userAccount: null,
  locale: 'en-US',
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
  activeAccount: '',
  accountBalances: {},
  accountTransactions: {},
  activeChain: ChainType.MAINNET,
});
export const appSlice = createSlice({
  name: 'appState',
  initialState: getInitialState(),
  reducers: {
    setUserStatus: (state, action: PayloadAction<{userStatus: UserStatus}>) => {
      state.userStatus = action.payload.userStatus;
    },
    setUserAccount: (state, action: PayloadAction<{userAccount: UserAccount}>) => {
      state.userAccount = action.payload.userAccount;
    },
    setWindowHeight: (state, action: PayloadAction<{windowHeight: number}>) => {
      state.windowHeight = action.payload.windowHeight;
    },
    setWindowWidth: (state, action: PayloadAction<{windowWidth: number}>) => {
      state.windowWidth = action.payload.windowWidth;
    },
    setActiveAccount: (state, action: PayloadAction<{activeAccount: string}>) => {
      state.activeAccount = action.payload.activeAccount;
    },
    setAccountBalances: (state, action: PayloadAction<{accountBalances: AccountBalances}>) => {
      state.accountBalances = action.payload.accountBalances;
    },
    setAccountTransactions: (state, action: PayloadAction<{accountTransactions: AccountTransactions}>) => {
      state.accountTransactions = action.payload.accountTransactions;
    },
    setActiveChain: (state, action: PayloadAction<{activeChain: ChainType}>) => {
      state.activeChain = action.payload.activeChain;
    },
  }
});

export const {
  setUserStatus,
  setUserAccount,
  setWindowHeight,
  setWindowWidth,
  setActiveAccount,
  setAccountBalances,
  setAccountTransactions,
  setActiveChain,
} = appSlice.actions;

export default appSlice.reducer;
