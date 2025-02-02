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

const typeProductService = {
  // Get all product types with their unit information
  getAllTypes: async () => {
    try {
      const response = await axiosInstance.get('/category/get-all');
      return {
        data: response.data.map(type => ({
          MaLoaiSanPham: type.MaLoaiSanPham,
          TenLoaiSanPham: type.TenLoaiSanPham,
          MaDVTinh: type.MaDVTinh,
          PhanTramLoiNhuan: type.PhanTramLoiNhuan
        }))
      };
    } catch (error) {
      console.error('Get all types error:', error);
      throw error;
    }
  },

  getAllUnits: async () => {
    try {
      const response = await axiosInstance.get('/unit/get-all');
      return response.data;
    } catch (error) {
      console.error('Get units error:', error);
      throw error;
    }
  },

  // Add createType method
  createType: async (data) => {
    try {
      // Validate data
      if (!data.MaLoaiSanPham || !data.TenLoaiSanPham || !data.MaDVTinh || data.PhanTramLoiNhuan === undefined) {
        throw new Error('Missing required fields');
      }
      const response = await axiosInstance.post('/category/create', data);
      return response.data;
    } catch (error) {
      console.error('Create type error:', error);
      throw error;
    }
  },

  // Fix the updateType method with correct endpoint
  updateType: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/category/update/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error in updateType:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default typeProductService;