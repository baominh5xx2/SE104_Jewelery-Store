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

export const createOrder = async (orderData) => {
  try {
    // Format lại dữ liệu trước khi gửi
    const formattedData = {
      soPhieu: orderData.soPhieu,
      ngayLap: orderData.ngayLap,
      khachHang: orderData.khachHang,
      tongTien: orderData.tongTien,
      chiTietSanPham: orderData.chiTietSanPham.map(item => ({
        maSanPham: item.maSanPham,
        soLuong: item.soLuong,
        donGiaBanRa: item.donGiaBanRa,
        thanhTien: item.thanhTien
      }))
    };

    // Log dữ liệu trước khi gửi
    console.log('Data sending to backend:', JSON.stringify(formattedData, null, 4));

    const response = await axiosInstance.post('/sale/create', formattedData);
    return response.data;
  } catch (error) {
    // Log lỗi chi tiết
    if (error.response?.status === 400) {
      console.log('Error response from backend:', error.response.data);
    }
    throw error;
  }
};

export default {
  createOrder
}; 