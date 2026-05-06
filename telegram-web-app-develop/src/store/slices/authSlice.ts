import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AuthorizationService, setApiToken } from '@/api';

interface AuthState {
  token: string | null;
  telegramId: number | null;
  isLoading: boolean;
  isRefreshed: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('auth_token'),
  telegramId: localStorage.getItem('telegram_id') ? Number(localStorage.getItem('telegram_id')) : null,
  isLoading: false,
  isRefreshed: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
};

// Async thunk for Telegram authentication
export const loginByTelegram = createAsyncThunk(
  'auth/loginByTelegram',
  async (initData: string, { rejectWithValue }) => {
    try {
      const response = await AuthorizationService.apiViewsGetTokenByTelegram(initData);
      const token = response.token;
      
      // Persist token
      localStorage.setItem('auth_token', token);
      setApiToken(token);
      
      return token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      return rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.telegramId = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('telegram_id');
      setApiToken(undefined);
    },
    setTelegramId: (state, action: PayloadAction<number>) => {
      state.telegramId = action.payload;
      localStorage.setItem('telegram_id', action.payload.toString());
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('auth_token', action.payload);
      setApiToken(action.payload);
    },
    setRefreshed: (state, action: PayloadAction<boolean>) => {
      state.isRefreshed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginByTelegram.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginByTelegram.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
        state.isAuthenticated = true;
        state.isRefreshed = true;
        state.error = null;
      })
      .addCase(loginByTelegram.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, setToken, setTelegramId, setRefreshed } = authSlice.actions;
export default authSlice.reducer;
