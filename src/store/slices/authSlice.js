// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authService.login(credentials);
    if (data.success) return data.user;
    return rejectWithValue(data.error);
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authService.register(userData);
    if (data.success) return data.user;
    return rejectWithValue(data.errors || data.error);
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Registration failed');
  }
});

export const loadProfile = createAsyncThunk('auth/loadProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authService.getProfile();
    if (data.success) return data.user;
    return rejectWithValue(null);
  } catch {
    return rejectWithValue(null);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    initializing: true,   // ← جديد: true حتى نتحقق من الـ session
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.initializing = false;
      authService.logout().catch(() => {});
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.loading = false; state.user = payload;
        state.isAuthenticated = true; state.initializing = false;
      })
      .addCase(login.rejected,  (state, { payload }) => {
        state.loading = false; state.error = payload;
      })

      .addCase(register.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(register.fulfilled, (state, { payload }) => {
        state.loading = false; state.user = payload;
        state.isAuthenticated = true; state.initializing = false;
      })
      .addCase(register.rejected,  (state, { payload }) => {
        state.loading = false; state.error = payload;
      })

      // loadProfile — دايماً يخلص الـ initializing
      .addCase(loadProfile.pending,   (state) => { state.loading = true; })
      .addCase(loadProfile.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.user = payload;
        state.isAuthenticated = true;
        state.initializing = false;   // ← خلصنا
      })
      .addCase(loadProfile.rejected,  (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.initializing = false;   // ← خلصنا (مش مسجل)
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
