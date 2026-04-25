import { configureStore } from '@reduxjs/toolkit';
import authReducer      from './slices/authSlice';
import moviesReducer    from './slices/moviesSlice';
import seriesReducer    from './slices/seriesSlice';
import reviewsReducer   from './slices/reviewsSlice';
import favoritesReducer from './slices/favoritesSlice';

const store = configureStore({
  reducer: {
    auth:      authReducer,
    movies:    moviesReducer,
    series:    seriesReducer,
    reviews:   reviewsReducer,
    favorites: favoritesReducer,
  },
});

export default store;
