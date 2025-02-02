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

// Add request interceptor for authentication
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

const warehouseService = {
    // Get all warehouse reports
    getAllReports: async () => {
        try {
            const response = await axiosInstance.get('/warehouse/reports');
            return response.data;
        } catch (error) {
            console.error('Get all reports error:', error);
            throw error;
        }
    },

    // Get or generate report by month and year
    getReportByPeriod: async (year, month) => {
        try {
            const response = await axiosInstance.get(`/warehouse/reports/${year}/${month}`);
            return response.data;
        } catch (error) {
            console.error('Get report by period error:', error);
            throw error;
        }
    },

    // Update report for a product
    updateReport: async (year, month, productId, quantity, isIncrease) => {
        try {
            const response = await axiosInstance.put(`/warehouse/reports/update/${year}/${month}`, {
                productId,
                quantity,
                isIncrease
            });
            return response.data;
        } catch (error) {
            console.error('Update report error:', error);
            throw error;
        }
    }
};

export default warehouseService;