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

export const getAllOrders = async () => {
    try {
        // Get both orders and customers in parallel
        const [ordersRes, customersRes] = await Promise.all([
            axiosInstance.get('/sale/get-all'),
            axiosInstance.get('/customers/get-all')
        ]);

        // Create customer lookup map
        const customerMap = {};
        customersRes.data.forEach(customer => {
            customerMap[customer.MaKhachHang] = customer.TenKhachHang;
        });

        // Map the response including customer names
        const ordersWithCustomers = {
            ...ordersRes,
            data: ordersRes.data.map(order => ({
                ...order,
                TenKhachHang: customerMap[order.MaKhachHang] || 'Khách lẻ'
            }))
        };

        return ordersWithCustomers;
    } catch (error) {
        throw error;
    }
};

export const getOrderById = async (id) => {
    try {
        // Get both order and customer data
        const [orderResponse, customersResponse] = await Promise.all([
            axiosInstance.get(`/sale/get-by-id/${id}`),
            axiosInstance.get('/customers/get-all'),
        ]);

        // Find customer info from customer data
        const customerInfo = customersResponse.data.find(
            customer => customer.MaKhachHang === orderResponse.data.MaKhachHang
        );

        // Combine order data with customer info
        const enrichedResponse = {
            ...orderResponse.data,
            customer: {
                TenKhachHang: customerInfo?.TenKhachHang || '',
                SoDT: customerInfo?.SoDT || '',
                DiaChi: customerInfo?.DiaChi || ''
            }
        };

        console.log('Enriched order data:', enrichedResponse);
        return enrichedResponse;
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        // Format ngày tháng theo YYYY-MM-DD
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Format dữ liệu theo yêu cầu của backend
        const formattedData = {
            soPhieu: orderData.invoiceData.SoPhieuBH,
            ngayLap: formatDate(orderData.invoiceData.NgayLap),
            khachHang: orderData.invoiceData.MaKhachHang,
            chiTietSanPham: orderData.details.map(detail => ({
                maSanPham: detail.MaSanPham,
                soLuong: parseInt(detail.SoLuong),
                donGia: parseFloat(detail.DonGiaBanRa),
                thanhTien: parseFloat(detail.ThanhTien)
            }))
        };

        // Log dữ liệu trước khi gửi
        console.log('=== CREATE ORDER DATA ===');
        console.log(JSON.stringify(formattedData, null, 2));

        const response = await axiosInstance.post('/sale/create', formattedData);
        return response.data;
    } catch (error) {
        console.error('Error in createOrder:', error);
        if (error.response) {
            console.error('Error Response:', error.response.data);
            console.error('Error Status:', error.response.status);
        }
        throw error;
    }
};

export const updateOrder = async (id, orderData) => {
    try {
        // Log dữ liệu nhận được từ EditOrderModal
        console.log('=== RECEIVED DATA FROM MODAL ===');
        console.log('Order ID:', id);
        console.log('Order Data:', orderData);
        console.log('Update Details:', orderData.updateDetails);
        console.log('Add Details:', orderData.addDetails);
        console.log('Delete Details:', orderData.deleteDetails);

        // Format data theo yêu cầu của backend
        const formattedData = {
            updateDetails: [
                {
                    NgayLap: orderData.updateDetails[0].NgayLap,
                    MaKH: orderData.updateDetails[0].MaKH
                }
            ],
            addDetails: orderData.addDetails.map(detail => ({
                MaSanPham: detail.MaSanPham,
                SoLuong: parseInt(detail.SoLuong),
                DonGiaBanRa: parseFloat(detail.DonGiaBanRa),
                ThanhTien: parseFloat(detail.ThanhTien)
            })),
            deleteDetails: orderData.deleteDetails?.map(detail => ({
                MaChiTietBH: detail.MaChiTietBH,
                MaSanPham: detail.MaSanPham,
                SoLuong: parseInt(detail.SoLuong)
            })) || []
        };

        // Log dữ liệu đã format trước khi gửi
        console.log('=== FORMATTED DATA TO SEND ===');
        console.log('Formatted Data:', JSON.stringify(formattedData, null, 2));
        console.log('Update Details:', formattedData.updateDetails);
        console.log('Add Details:', formattedData.addDetails);
        console.log('Delete Details:', formattedData.deleteDetails);

        const response = await axiosInstance.put(`/sale/update/${id}`, formattedData);
        
        // Log response từ server
        console.log('=== SERVER RESPONSE ===');
        console.log('Response:', response.data);

        return response.data;
    } catch (error) {
        console.error('=== ERROR IN UPDATE ORDER ===');
        console.error('Error:', error);
        if (error.response) {
            console.error('Error Response:', error.response.data);
            console.error('Error Status:', error.response.status);
        }
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        await axiosInstance.delete(`/sale/delete/${id}`);
    } catch (error) {
        throw error;
    }
};
