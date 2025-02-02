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

export const importProduct = {
  getAllPurchases: async () => {
    try {
      const response = await axiosInstance.get('/purchase/get-all');
      return response.data;
    } catch (error) {
      console.error('Get all purchases error', error);
      throw error;
    }
  },
  deletePurchase: async (purchaseId) => {
    try {
      const response = await axiosInstance.delete(`/purchase/delete/${purchaseId}`);
      return response.data;
    } catch (error) {
      console.error('Delete purchase error', error);
      throw error;
    }
  },
  getPurchaseById: async (id) => {
    try {
      const response = await axiosInstance.get(`/purchase/get-details/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get purchase by id error:', error);
      throw error;
    }
  }
};

export default importProduct;