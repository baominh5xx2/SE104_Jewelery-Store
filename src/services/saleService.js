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

export const saleService = {
    createSaleOrder: async (orderData) => {
        try {
            const formattedData = {
                NgayLap: orderData.NgayLap,
                MaKhachHang: orderData.MaKhachHang,
                TongTien: parseFloat(orderData.TongTien),
                ChiTietPhieuBanHang: orderData.ChiTietPhieuBanHang.map((item, index) => ({
                    MaChiTietBH: `CTBH${Date.now()}_${index}`,
                    MaSanPham: item.MaSanPham,
                    SoLuong: parseInt(item.SoLuong),
                    DonGiaBanRa: parseFloat(item.DonGiaBanRa),
                    ThanhTien: parseFloat(item.ThanhTien)
                }))
            };

            console.log('Sending formatted data:', formattedData);
            const response = await axiosInstance.post('/sale/create', formattedData);
            return response.data;
        } catch (error) {
            console.error('Create sale error:', error);
            if (error.response?.status === 401) {
                throw new Error('Phiên đăng nhập hết hạn');
            }
            throw error;
        }
    },

    getSaleOrders: async () => {
        try {
            const response = await axiosInstance.get('/sale/get-all');
            return response.data;
        } catch (error) {
            console.error('Get sales error:', error);
            throw error;
        }
    },

    getSaleOrderById: async (id) => {
        try {
            const response = await axiosInstance.get(`/sale/get-by-id/${id}`);
            
            // Just return the raw data directly from the backend
            console.log("Raw backend response:", response.data);
            return response.data;
            
        } catch (error) {
            console.error('Get sale by id error:', error);
            throw error;
        }
    },

    deleteSaleOrder: async (id) => {
        try {
            await axiosInstance.delete(`/sale/delete/${id}`);
        } catch (error) {
            console.error('Delete sale error:', error);
            throw error;
        }
    }
};
