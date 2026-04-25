import { useSelector, useDispatch } from 'react-redux';
import { login, logout, register, loadProfile } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, loading, error, isAuthenticated } = useSelector((s) => s.auth);
  return {
    user, loading, error, isAuthenticated,
    login:       (credentials) => dispatch(login(credentials)),
    logout:      ()            => dispatch(logout()),
    register:    (data)        => dispatch(register(data)),
    loadProfile: ()            => dispatch(loadProfile()),
  };
};
