import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const signIn = async (username, password) => {
  try {
    // Sửa lại format request body để khớp với backend
    const response = await axiosInstance.post('/api/user/login', {
      username,
      password
    });

    // Log để debug
    console.log('Login API Response:', response.data);

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Login Error Details:', {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data
    });
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
  }
};

export const signUp = async (username, password, email, role) => {
  try {
    console.log('Sending signup request with data:', {
      username,
      password,
      email,
      role
    });

    const response = await axiosInstance.post('/api/user/register', {
      username,
      password,
      email,
      role
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Signup Error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng ký thất bại.'
    };
  }
};