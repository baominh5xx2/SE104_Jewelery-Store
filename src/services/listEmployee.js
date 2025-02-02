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

const employeeService = {
  getAllEmployees: async () => {
    try {
      const response = await axiosInstance.get('/user/get-all');
      return response.data.map(user => ({
        key: user.MaTaiKhoan,
        id: user.MaTaiKhoan,
        employeeCode: `NV${user.MaTaiKhoan.toString().padStart(3, '0')}`,
        username: user.TenTaiKhoan,
        role: user.Role === 'admin' ? 'Quản lý' : 
              user.Role === 'seller' ? 'Nhân viên bán hàng' : 
              user.Role === 'warehouse' ? 'Nhân viên kho' : 'Nhân viên'
      }));
    } catch (error) {
      console.error('Get all employees error:', error);
      throw error;
    }
  },

  getEmployeeById: async (id) => {
    try {
      const response = await axiosInstance.get(`/user/get/${id}`);
      const user = response.data;
      return {
        id: user.MaTaiKhoan,
        employeeCode: `NV${user.MaTaiKhoan.toString().padStart(3, '0')}`,
        username: user.TenTaiKhoan,
        role: user.Role === 'admin' ? 'Quản lý' : 
              user.Role === 'seller' ? 'Nhân viên bán hàng' : 
              user.Role === 'warehouse' ? 'Nhân viên kho' : 'Nhân viên'
      };
    } catch (error) {
      console.error('Get employee by ID error:', error);
      throw error;
    }
  },

  createEmployee: async (employeeData) => {
    try {
      const roleMapping = {
        'Quản lý': 'admin',
        'Nhân viên bán hàng': 'seller',
        'Nhân viên kho': 'warehouse'
      };

      const response = await axiosInstance.post('/user/create', {
        TenTaiKhoan: employeeData.username,
        MatKhau: employeeData.password,
        Role: roleMapping[employeeData.role] || 'seller'
      });

      return response.data;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  },

  deleteEmployee: async (id) => {
    try {
      await axiosInstance.delete(`/user/delete/${id}`);
    } catch (error) {
      console.error('Delete employee error:', error);  
      throw error;
    }
  }
};

export default employeeService;