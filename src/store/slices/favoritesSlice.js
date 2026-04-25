import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchFavorites       = createAsyncThunk('favorites/fetch',        ()   => api.get('/accounts/favorites/').then(r => r.data));
export const toggleFavoriteMovie  = createAsyncThunk('favorites/toggleMovie',  (id) => api.post(`/movies/${id}/toggle_favorite/`).then(r => ({ ...r.data, id })));
export const toggleFavoriteSeries = createAsyncThunk('favorites/toggleSeries', (id) => api.post(`/series/${id}/toggle_favorite/`).then(r => ({ ...r.data, id })));

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { movies: [], series: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled,       (state, { payload }) => {
        state.movies = payload.movies ?? [];
        state.series = payload.series ?? [];
      })
      .addCase(toggleFavoriteMovie.fulfilled,  (state, { payload }) => {
        const exists = state.movies.find(m => m.id === payload.id);
        state.movies = exists ? state.movies.filter(m => m.id !== payload.id) : [...state.movies, payload];
      })
      .addCase(toggleFavoriteSeries.fulfilled, (state, { payload }) => {
        const exists = state.series.find(s => s.id === payload.id);
        state.series = exists ? state.series.filter(s => s.id !== payload.id) : [...state.series, payload];
      });
  },
});

export default favoritesSlice.reducer;
