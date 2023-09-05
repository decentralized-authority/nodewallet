import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppView } from '../constants';
import { UserAccount } from '@nodewallet/types';
import { UserStatus } from '@nodewallet/constants';

export interface AppState {
  userStatus: UserStatus|''
  userAccount: UserAccount|null
  locale: string
  activeView: AppView
  windowWidth: number
  windowHeight: number
  activeAccount: string
}
const getInitialState = (): AppState => ({
  userStatus: '',
  userAccount: null,
  locale: 'en-US',
  activeView: AppView.BLANK,
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
  activeAccount: '',
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
    setActiveView: (state, action: PayloadAction<{activeView: AppView}>) => {
      state.activeView = action.payload.activeView;
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
  }
});

export const {
  setUserStatus,
  setUserAccount,
  setActiveView,
  setWindowHeight,
  setWindowWidth,
  setActiveAccount,
} = appSlice.actions;

export default appSlice.reducer;
