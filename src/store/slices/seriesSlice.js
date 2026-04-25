import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSeries     = createAsyncThunk('series/fetchAll', (params) => api.get('/series/', { params }).then(r => r.data));
export const fetchSeriesById = createAsyncThunk('series/fetchOne', (id)     => api.get(`/series/${id}/`).then(r => r.data));
export const searchSeries    = createAsyncThunk('series/search',   (query)  => api.get('/series/', { params: { search: query } }).then(r => r.data));

const seriesSlice = createSlice({
  name: 'series',
  initialState: { list: [], current: null, searchResults: [], loading: false, error: null },
  reducers: { clearCurrent: (state) => { state.current = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeries.pending,      (state) => { state.loading = true; })
      .addCase(fetchSeries.fulfilled,    (state, { payload }) => { state.loading = false; state.list = payload.results ?? payload; })
      .addCase(fetchSeries.rejected,     (state, { error })   => { state.loading = false; state.error = error.message; })
      .addCase(fetchSeriesById.fulfilled,(state, { payload }) => { state.current = payload; })
      .addCase(searchSeries.fulfilled,   (state, { payload }) => { state.searchResults = payload.results ?? payload; });
  },
});

export const { clearCurrent: clearCurrentSeries } = seriesSlice.actions;
export default seriesSlice.reducer;
