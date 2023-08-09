import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { appView } from '../constants';

export interface AppState {
  locale: string,
  activeView: string
}
const getInitialState = (): AppState => ({
  locale: 'en-US',
  activeView: appView.ACCOUNT_DETAIL,
});
export const appSlice = createSlice({
  name: 'appState',
  initialState: getInitialState(),
  reducers: {
    setActiveView: (state, action: PayloadAction<{activeView: string}>) => {
      state.activeView = action.payload.activeView;
    },
  }
});

export const { setActiveView } = appSlice.actions;

export default appSlice.reducer;
