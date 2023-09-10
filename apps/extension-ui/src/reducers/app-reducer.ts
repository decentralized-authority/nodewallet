import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserAccount } from '@nodewallet/types';
import { ChainType, UserStatus } from '@nodewallet/constants';

type AccountBalances = {[id: string]: string}

export interface AppState {
  userStatus: UserStatus|''
  userAccount: UserAccount|null
  locale: string
  windowWidth: number
  windowHeight: number
  activeAccount: string
  accountBalances: AccountBalances
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
  setActiveChain,
} = appSlice.actions;

export default appSlice.reducer;
