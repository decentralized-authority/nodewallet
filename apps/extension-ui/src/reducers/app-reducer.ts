import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AccountTransaction, UserAccount } from '@decentralizedauthority/nodewallet-types';
import { ChainType, UserStatus } from '@decentralizedauthority/nodewallet-constants';
import { PricingMultipliers } from '../modules/pricing';

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
  activeTabOrigin: string
  pricingMultipliers: PricingMultipliers
  version: string
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
  activeTabOrigin: '',
  pricingMultipliers: {},
  version: '',
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
    setActiveTabOrigin: (state, action: PayloadAction<{activeTabOrigin: string}>) => {
      state.activeTabOrigin = action.payload.activeTabOrigin;
    },
    setPricingMultipliers: (state, action: PayloadAction<{pricingMultipliers: PricingMultipliers}>) => {
      state.pricingMultipliers = action.payload.pricingMultipliers;
    },
    setVersion: (state, action: PayloadAction<{version: string}>) => {
      state.version = action.payload.version;
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
  setActiveTabOrigin,
  setPricingMultipliers,
  setVersion,
} = appSlice.actions;

export default appSlice.reducer;
