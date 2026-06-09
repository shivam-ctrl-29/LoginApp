import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../redux/slices/authSlice';
import { useTheme } from '../../theme/ThemeContext';
import GlobalSearch from "../ui/GlobalSearch";
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, error } = useSelector(state => state.auth);

  useEffect(() => {
    if (!user) dispatch(fetchUser());
  }, [dispatch, user]);

  useEffect(() => {
    if (error) navigate('/');
  }, [error, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.bgGradient,
    }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div style={{ position: "fixed", top: 16, left: 280, right: 24, zIndex: 900, display: "flex" }}>
        <GlobalSearch />
      </div>
      <main className="main-content" style={{
        marginLeft: 260,
        padding: '80px 36px 32px',
        minHeight: '100vh',
        transition: 'margin 0.3s ease',
      }}>
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
