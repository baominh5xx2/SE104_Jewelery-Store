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

// Add request interceptor for dynamic token
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

export const customerService = {
    createCustomer: async (orderData) => {
        try {
            const formattedData = {
                TenKhachHang: orderData.TenKhachHang,
                SoDT: orderData.SoDT,
                DiaChi: orderData.DiaChi
            };

            console.log('Sending formatted data:', formattedData);
            const response = await axiosInstance.post('/customers/create', formattedData);
            return response.data;
        } catch (error) {
            console.error('Create customer error:', error);
            if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập hết hạn');
            }
            throw error;
        }
    },

    updateCustomer: async (id, customerData) => {
        try {
            const formattedData = {
                TenKhachHang: customerData.TenKhachHang,
                SoDienThoai: customerData.SoDienThoai,
                DiaChi: customerData.DiaChi
            };
            
            const response = await axiosInstance.put(`/customers/update/${id}`, formattedData);
            return response.data;
        } catch (error) {
            console.error('Update customer error:', error);
            if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập hết hạn');
            }
            throw error;
        }
    },

    getAllCustomer: async () => {
        try {
            const response = await axiosInstance.get(`/customers/get-all`);        
            return response.data;
            
        } catch (error) {
            console.error('Get all customer error', error);
            throw error;
        }
    },

    deleteCustomer: async (id) => {
        try {
            await axiosInstance.delete(`/customers/delete/${id}`);
        } catch (error) {
            console.error('Delete customer error:', error);
            throw error;
        }
    },

    getCustomerById: async (id) => {
        try {
            const response = await axiosInstance.get(`/customers/get-by-id/${id}`);
            return response.data;
        } catch (error) {
            console.error('Get customer by id error:', error);
            if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập hết hạn');
            }
            throw error;
        }
    }
};

export default customerService;