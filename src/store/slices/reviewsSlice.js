import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchReviews = createAsyncThunk('reviews/fetch',  (movieId) => api.get(`/reviews/?movie=${movieId}`).then(r => r.data));
export const createReview = createAsyncThunk('reviews/create', (data)    => api.post('/reviews/', data).then(r => r.data));
export const updateReview = createAsyncThunk('reviews/update', ({ id, data }) => api.patch(`/reviews/${id}/`, data).then(r => r.data));
export const deleteReview = createAsyncThunk('reviews/delete', (id)      => api.delete(`/reviews/${id}/`).then(() => id));

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
