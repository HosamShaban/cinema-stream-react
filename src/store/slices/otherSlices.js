// src/store/slices/seriesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { seriesService } from '../../services';

export const fetchSeries      = createAsyncThunk('series/fetchAll', (params) => seriesService.getAll(params).then(r => r.data));
export const fetchSeriesById  = createAsyncThunk('series/fetchOne', (id)     => seriesService.getById(id).then(r => r.data));
export const searchSeries     = createAsyncThunk('series/search',   (query)  => seriesService.search(query).then(r => r.data));

const seriesSlice = createSlice({
  name: 'series',
  initialState: { list: [], current: null, searchResults: [], loading: false, error: null },
  reducers: {
    clearCurrent: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeries.pending,     (state) => { state.loading = true; })
      .addCase(fetchSeries.fulfilled,   (state, { payload }) => { state.loading = false; state.list = payload.results ?? payload; })
      .addCase(fetchSeries.rejected,    (state, { error }) => { state.loading = false; state.error = error.message; })
      .addCase(fetchSeriesById.fulfilled, (state, { payload }) => { state.current = payload; })
      .addCase(searchSeries.fulfilled,  (state, { payload }) => { state.searchResults = payload.results ?? payload; });
  },
});

export const { clearCurrent: clearCurrentSeries } = seriesSlice.actions;
export default seriesSlice.reducer;


// ─────────────────────────────────────────────
// src/store/slices/reviewsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewsService } from '../../services';

export const fetchReviews  = createAsyncThunk('reviews/fetch',  (params) => reviewsService.getForMovie(params).then(r => r.data));
export const createReview  = createAsyncThunk('reviews/create', (data)   => reviewsService.create(data).then(r => r.data));
export const updateReview  = createAsyncThunk('reviews/update', ({ id, data }) => reviewsService.update(id, data).then(r => r.data));
export const deleteReview  = createAsyncThunk('reviews/delete', (id)     => reviewsService.delete(id).then(() => id));

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.fulfilled,  (state, { payload }) => { state.list = payload.results ?? payload; })
      .addCase(createReview.fulfilled,  (state, { payload }) => { state.list.unshift(payload); })
      .addCase(updateReview.fulfilled,  (state, { payload }) => {
        const idx = state.list.findIndex(r => r.id === payload.id);
        if (idx !== -1) state.list[idx] = payload;
      })
      .addCase(deleteReview.fulfilled,  (state, { payload: id }) => {
        state.list = state.list.filter(r => r.id !== id);
      });
  },
});

export default reviewsSlice.reducer;


// ─────────────────────────────────────────────
// src/store/slices/favoritesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { favoritesService } from '../../services';

export const fetchFavorites  = createAsyncThunk('favorites/fetch',        ()        => favoritesService.getAll().then(r => r.data));
export const toggleFavoriteMovie  = createAsyncThunk('favorites/toggleMovie',  (id) => favoritesService.toggleMovie(id).then(r => ({ ...r.data, id })));
export const toggleFavoriteSeries = createAsyncThunk('favorites/toggleSeries', (id) => favoritesService.toggleSeries(id).then(r => ({ ...r.data, id })));

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: { movies: [], series: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled,      (state, { payload }) => {
        state.movies = payload.movies ?? [];
        state.series = payload.series ?? [];
      })
      .addCase(toggleFavoriteMovie.fulfilled,  (state, { payload }) => {
        const exists = state.movies.find(m => m.id === payload.id);
        state.movies = exists
          ? state.movies.filter(m => m.id !== payload.id)
          : [...state.movies, payload];
      })
      .addCase(toggleFavoriteSeries.fulfilled, (state, { payload }) => {
        const exists = state.series.find(s => s.id === payload.id);
        state.series = exists
          ? state.series.filter(s => s.id !== payload.id)
          : [...state.series, payload];
      });
  },
});

export default favoritesSlice.reducer;
