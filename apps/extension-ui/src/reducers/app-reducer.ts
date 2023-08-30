import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppView } from '../constants';
import { UserAccount } from '@nodewallet/constants';

export interface AppState {
  accountRegistered: boolean|null,
  userAccount: UserAccount|null,
  locale: string,
  activeView: AppView
  windowWidth: number
  windowHeight: number
}
const getInitialState = (): AppState => ({
  accountRegistered: null,
  userAccount: null,
  locale: 'en-US',
  activeView: AppView.ACCOUNT_DETAIL,
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
});
export const appSlice = createSlice({
  name: 'appState',
  initialState: getInitialState(),
  reducers: {
    setAccountRegistered: (state, action: PayloadAction<{accountRegistered: boolean}>) => {
      state.accountRegistered = action.payload.accountRegistered;
    },
    setUserAccount: (state, action: PayloadAction<{userAccount: UserAccount}>) => {
      state.userAccount = action.payload.userAccount;
    },
    setActiveView: (state, action: PayloadAction<{activeView: AppView}>) => {
      state.activeView = action.payload.activeView;
    },
    setWindowHeight: (state, action: PayloadAction<{windowHeight: number}>) => {
      state.windowHeight = action.payload.windowHeight;
    },
    setWindowWidth: (state, action: PayloadAction<{windowWidth: number}>) => {
      state.windowWidth = action.payload.windowWidth;
    },
  }
});

export const {
  setAccountRegistered,
  setUserAccount,
  setActiveView,
  setWindowHeight,
  setWindowWidth
} = appSlice.actions;

export default appSlice.reducer;
