import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { OnboardingService, SubscriptionService, UserSchema, SubscriptionSchema } from '@/api';
import { loginByTelegram, logout } from "./authSlice";

interface UserState {
  user: UserSchema | null;
  subscription: SubscriptionSchema | null;
  isLoading: boolean;
  error: string | null;
  isOnboardingComplete: boolean;
}

const initialState: UserState = {
  user: null,
  subscription: null,
  isLoading: false,
  error: null,
  isOnboardingComplete: localStorage.getItem('onboarding_complete') === 'true',
};

// Async thunk to fetch user info
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await OnboardingService.apiViewsGetUser();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to complete onboarding
export const completeOnboarding = createAsyncThunk(
  'user/completeOnboarding',
  async (_, { rejectWithValue }) => {
    try {
      await OnboardingService.apiViewsCompleteOnboarding();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete onboarding';
      return rejectWithValue(message);
    }
  }
);

// Async thunk to fetch subscription info
export const fetchSubscription = createAsyncThunk(
  'user/fetchSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await SubscriptionService.apiViewsGetUserSubscription();
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch subscription';
      return rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.subscription = null;
      state.error = null;
    },
    setOnboardingComplete: (state, action: PayloadAction<boolean>) => {
      state.isOnboardingComplete = action.payload;
      localStorage.setItem('onboarding_complete', action.payload.toString());
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<UserSchema>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isOnboardingComplete = action.payload.is_onboarding_complete;
        localStorage.setItem('onboarding_complete', action.payload.is_onboarding_complete.toString());
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch Subscription
      .addCase(fetchSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action: PayloadAction<SubscriptionSchema | null>) => {
        state.isLoading = false;
        state.subscription = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Complete Onboarding
      .addCase(completeOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOnboarding.fulfilled, (state) => {
        state.isLoading = false;
        state.isOnboardingComplete = true;
        localStorage.setItem('onboarding_complete', 'true');
      })
      .addCase(completeOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(loginByTelegram.fulfilled, (state) => {
        state.user = null;
        state.subscription = null;
        state.error = null;
      })
      .addCase(logout, (state) => {
        state.user = null;
        state.subscription = null;
        state.error = null;
      });
  },
});

export const { clearUser, setOnboardingComplete } = userSlice.actions;
export default userSlice.reducer;
