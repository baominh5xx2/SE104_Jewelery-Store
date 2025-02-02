import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
        const result = await authService.login(values.username, values.password);
        if (result.token) {
            // Login successful, redirect to home page
            navigate('/home');
        }
    } catch (error) {
        // Handle login error
        message.error('Login failed: ' + error.message);
    }
  };

  // ...existing code...
};

export default LoginPage;