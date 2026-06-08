import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import axios from 'axios';

import API_URL from '../config/api';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading } = useSelector(state => state.auth);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await axios.post(`${API_URL}/api/auth/logout`, { refreshToken });
    } catch (err) {
      console.log('Logout error:', err);
    }
    dispatch(logout());
    navigate('/');
  };

  const getToken = () => localStorage.getItem('token');

  const isAdmin = user?.role === 'admin';
  const isHR = user?.role === 'hr';
  const isManager = user?.role === 'manager';
  const canApprove = isAdmin || isHR || isManager;

  return {
    user,
    loading,
    handleLogout,
    getToken,
    isAdmin,
    isHR,
    isManager,
    canApprove,
    API_URL
  };
};

export default useAuth;