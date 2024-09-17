import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';

const TIMEOUT_IN_MINUTES = 15; // Adjust timeout duration as needed

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    const logout = useCallback(() => {
      sessionStorage.removeItem('user');
      setIsLoggedIn(false);
    }, []);

    const resetSessionTimer = useCallback(() => {
      const timer = setTimeout(() => {
        logout();
      }, TIMEOUT_IN_MINUTES * 60 * 1000); // Convert minutes to milliseconds

      return timer;
    }, [logout]);

    useEffect(() => {
      let sessionTimer = resetSessionTimer();

      const resetTimerOnActivity = () => {
        clearTimeout(sessionTimer);
        sessionTimer = resetSessionTimer();
      };

      window.addEventListener('mousemove', resetTimerOnActivity);
      window.addEventListener('keydown', resetTimerOnActivity);

      return () => {
        clearTimeout(sessionTimer);
        window.removeEventListener('mousemove', resetTimerOnActivity);
        window.removeEventListener('keydown', resetTimerOnActivity);
      };
    }, [resetSessionTimer]);

    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!user || !isLoggedIn) {
      return <Navigate to="/login" />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
