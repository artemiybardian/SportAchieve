import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { safeLocalStorageGet, safeLocalStorageRemove, safeLocalStorageSet } from '@/lib/safe-storage';

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

const TOKEN_KEY = 'sa_auth_token';

const persisted = safeLocalStorageGet(TOKEN_KEY);

const initialState: AuthState = {
  token: persisted,
  isAuthenticated: !!persisted,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
      safeLocalStorageSet(TOKEN_KEY, action.payload);
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      safeLocalStorageRemove(TOKEN_KEY);
    },
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
