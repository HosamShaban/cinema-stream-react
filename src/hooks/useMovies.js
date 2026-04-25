import { useSelector, useDispatch } from 'react-redux';
import { fetchMovies, fetchTrending, searchMovies } from '../store/slices/moviesSlice';

export const useMovies = () => {
  const dispatch = useDispatch();
  const { list, trending, current, searchResults, loading, error } = useSelector((s) => s.movies);

  return {
    movies: list,        // ← list مش movies
    trending,
    current,
    searchResults,
    loading,
    error,
    fetchMovies:   (params) => dispatch(fetchMovies(params)),
    fetchMovie:    (id)     => dispatch(fetchMovies(id)),
    searchMovies:  (query)  => dispatch(searchMovies(query)),
    fetchTrending: ()       => dispatch(fetchTrending()),
  };
};