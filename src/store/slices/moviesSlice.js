// src/store/slices/moviesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Django يرجع { results: [...] }
export const fetchMovies   = createAsyncThunk('movies/fetchAll',  (params) => api.get('/movies/', { params }).then(r => r.data));
export const fetchTrending = createAsyncThunk('movies/trending',  ()       => api.get('/trending/').then(r => r.data));
export const searchMovies  = createAsyncThunk('movies/search',    (query)  => api.get('/search-suggestions/', { params: { q: query } }).then(r => r.data));

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    list: [], trending: [], current: null,
    searchResults: [], loading: false, error: null,
  },
  reducers: {
    clearCurrent: (state) => { state.current = null; },
    clearSearch:  (state) => { state.searchResults = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovies.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMovies.fulfilled,  (state, { payload }) => {
        state.loading = false;
        state.list = payload.results ?? payload;
      })
      .addCase(fetchMovies.rejected,   (state, { error }) => { state.loading = false; state.error = error.message; })
      .addCase(fetchTrending.fulfilled, (state, { payload }) => {
        state.trending = payload.results ?? payload;
      })
      .addCase(searchMovies.fulfilled, (state, { payload }) => {
        state.searchResults = payload.results ?? payload;
      });
  },
});

export const { clearCurrent, clearSearch } = moviesSlice.actions;
export default moviesSlice.reducer;
