import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { appView } from '../constants';

export interface AppState {
  locale: string,
  activeView: string
  windowWidth: number
  windowHeight: number
}
const getInitialState = (): AppState => ({
  locale: 'en-US',
  activeView: appView.ACCOUNT_DETAIL,
  windowWidth: window.innerWidth,
  windowHeight: window.innerHeight,
});
export const appSlice = createSlice({
  name: 'appState',
  initialState: getInitialState(),
  reducers: {
    setActiveView: (state, action: PayloadAction<{activeView: string}>) => {
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

export const { setActiveView, setWindowHeight, setWindowWidth } = appSlice.actions;

export default appSlice.reducer;
