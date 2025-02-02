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

export const createImportProduct = {
  getAllProvider: async () => {
    try {
      const response = await axiosInstance.get('/provider/get-all');
      return response.data;
    } catch (error) {
      console.error('Get all provider error', error);
      throw error;
    }
  },
  createProvider: async (providerData) => {
    try {
      const response = await axiosInstance.post('/provider/create', providerData);
      return response.data;
    } catch (error) {
      console.error('Creating provider error', error);
      throw error;
    }
  },
  getAllProducts: async () => {
    try {
      const response = await axiosInstance.get('/product/get-all');
      return response.data;
    } catch (error) {
      console.error('Get all products error', error);
      throw error;
    }
  },
  createProduct: async (productData) => {
    try {
      const response = await axiosInstance.post('/product/create', productData);
      return response.data;
    } catch (error) {
      console.error('Creating product error', error);
      throw error;
    }
  },
  getAllProductCategoryNames: async () => {
    try {
      const response = await axiosInstance.get('/product/get-all');
      const products = response.data;

      // Extract unique category names
      const categoryNames = [...new Set(products.map(product => product.TenLoaiSanPham))];

      return categoryNames;
    } catch (error) {
      console.error('Get all product category names error', error);
      throw error;
    }
  },
  createOrder: async (orderData) => {
    try {
      // Log dữ liệu request theo format yêu cầu
      console.log(JSON.stringify({
        soPhieu: orderData.soPhieu,
        ngayLap: orderData.ngayLap,
        nhaCungCap: orderData.nhaCungCap,
        diaChi: orderData.diaChi,
        soDienThoai: orderData.soDienThoai,
        chiTietSanPham: orderData.chiTietSanPham
      }, null, 4));

      // Tạo phiếu nhập hàng
      const response = await axiosInstance.post('/purchase/create', orderData);

      // Cập nhật đơn giá cho từng sản phẩm
      const updatePromises = orderData.chiTietSanPham.map(item => 
        createImportProduct.updateProductPrice(item.maSanPham, item.donGia)
      );
      await Promise.all(updatePromises);

      return response.data;
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('tồn tại')) {
        throw new Error('Mã đơn hàng đã tồn tại');
      }
      console.error('Create purchase order error:', error);
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
  },
  getProviderById: async (providerId) => {
    try {
      const response = await axiosInstance.get(`/provider/get-details/${providerId}`);
      return response.data;
    } catch (error) {
      console.error('Get provider details error:', error);
      throw error;
    }
  },
  getProductById: async (productId) => {
    try {
      const response = await axiosInstance.get(`/product/get-details/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Get product details error:', error);
      throw error;
    }
  },
  updatePurchase: async (id, updateData) => {
    try {
      const { updateDetails, addDetails, deleteDetails } = updateData;
      const response = await axiosInstance.patch(`/purchase/update/${id}`, {
        updateDetails: updateDetails || [],
        addDetails: addDetails || [],
        deleteDetails: deleteDetails || []
      });
      return response.data;
    } catch (error) {
      console.error('Update purchase error:', error);
      throw error;
    }
  },
  updateProductPrice: async (productId, newPrice) => {
    try {
      // Lấy thông tin sản phẩm hiện tại
      const currentProduct = await axiosInstance.get(`/product/get-details/${productId}`);
      const productData = currentProduct.data;

      // Cập nhật với đầy đủ thông tin
      const response = await axiosInstance.patch(`/product/update/${productId}`, {
        MaSanPham: productData.MaSanPham,
        TenSanPham: productData.TenSanPham,
        MaLoaiSanPham: productData.MaLoaiSanPham,
        DonGia: newPrice,
        SoLuong: productData.SoLuong,
        HinhAnh: productData.HinhAnh
      });

      return response.data;
    } catch (error) {
      console.error('Update product price error:', error);
      throw error;
    }
  },
  updateProvider: async (id, data) => {
    try {
      // Format dữ liệu đúng với model backend
      const updateData = {
        MaNCC: id,
        TenNCC: data.TenNCC,
        SoDienThoai: data.SoDienThoai, 
        DiaChi: data.DiaChi
      };

      console.log('Update provider data:', updateData);
      const response = await axiosInstance.patch(`/provider/update/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update provider error:', error);
      throw error;
    }
  },
  updateProductStatus: async (productId, isDeleted = true) => {
    try {
      const currentProduct = await axiosInstance.get(`/product/get-details/${productId}`);
      const productData = currentProduct.data;

      // Cập nhật với đầy đủ thông tin và set isDelete
      const response = await axiosInstance.patch(`/product/update/${productId}`, {
        MaSanPham: productData.MaSanPham,
        TenSanPham: productData.TenSanPham,
        MaLoaiSanPham: productData.MaLoaiSanPham,
        DonGia: productData.DonGia,
        SoLuong: productData.SoLuong,
        HinhAnh: productData.HinhAnh,
        isDelete: isDeleted ? 1 : 0  // Set isDelete = 1 khi chọn, 0 khi bỏ chọn
      });

      console.log('Update product status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update product status error:', error);
      throw error;
    }
  }
};

export default createImportProduct;
