import { useSelector, useDispatch } from 'react-redux';
import { toggleFavoriteMovie, toggleFavoriteSeries, fetchFavorites } from '../store/slices/favoritesSlice';

export const useFavorites = () => {
  const dispatch = useDispatch();
  const { movies, series } = useSelector((s) => s.favorites);
  const isFavoriteMovie  = (id) => movies.some((m) => m.id === id);
  const isFavoriteSeries = (id) => series.some((s) => s.id === id);
  return {
    favoriteMovies: movies, favoriteSeries: series,
    isFavoriteMovie, isFavoriteSeries,
    fetchFavorites:       ()   => dispatch(fetchFavorites()),
    toggleFavoriteMovie:  (id) => dispatch(toggleFavoriteMovie(id)),
    toggleFavoriteSeries: (id) => dispatch(toggleFavoriteSeries(id)),
  };
};
