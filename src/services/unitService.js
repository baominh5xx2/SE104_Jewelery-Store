import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const unitService = {
  getAllUnits: async () => {
    try {
      const response = await axiosInstance.get('/unit/get-all');
      return response.data.data;
    } catch (error) {
      console.error('Get all units error:', error);
      throw error;
    }
  }
};

export default unitService;
