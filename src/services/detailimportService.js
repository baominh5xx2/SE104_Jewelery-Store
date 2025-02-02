import axios from 'axios';
import { getAccessToken } from '../utils/auth';

const API_URL = 'http://localhost:3000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle token
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

const detailImportService = {
  // Get provider details
  getProviderDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/provider/get-details/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching provider details:', error);
      throw error;
    }
  },

  // Get purchase order details
  getPurchaseDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/purchase/get-details/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      throw error;
    }
  },

  // Get products
  getProducts: async () => {
    try {
      const response = await axiosInstance.get('/product/get-all');
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
};

export default detailImportService;