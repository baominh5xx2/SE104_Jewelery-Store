import React, { useState, useEffect } from 'react';
import { Modal, Input, Table, message } from 'antd';
import axios from 'axios';
import { API_URL } from '../../../config/constants';
import { getAccessToken } from '../../../utils/auth';

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

const CustomerSearchModal = ({ isVisible, onCancel, onConfirm }) => {
    const [searchText, setSearchText] = useState('');
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('Modal visibility changed:', isVisible);
        if (isVisible) {
            fetchCustomers();
        }
    }, [isVisible]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/customers/get-all');
            console.log('Customers data:', response.data);
            setCustomers(response.data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            message.error('Không thể tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const filteredCustomers = customers.filter(customer => {
        if (!searchText) return true;
        
        const search = searchText.toLowerCase();
        const name = (customer.TenKhachHang || '').toLowerCase();
        const phone = (customer.SoDT || '').toLowerCase();
        const id = (customer.MaKhachHang || '').toLowerCase();
        
        return name.includes(search) || phone.includes(search) || id.includes(search);
    });

    const handleSelect = (record) => {
        console.log('Selected customer:', record);
        onConfirm({
            id: record.MaKhachHang,
            name: record.TenKhachHang,
            phone: record.SoDT
        });
        onCancel();
    };

    const columns = [
        {
            title: 'Mã KH',
            dataIndex: 'MaKhachHang',
            key: 'MaKhachHang',
        },
        {
            title: 'Tên khách hàng',
            dataIndex: 'TenKhachHang',
            key: 'TenKhachHang',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'SoDT',
            key: 'SoDT',
        }
    ];

    return (
        <Modal
            title="Tìm kiếm khách hàng"
            visible={isVisible} // Thay đổi từ open sang visible
            open={isVisible}   // Giữ cả hai để tương thích với các phiên bản antd
            onCancel={() => {
                console.log('Modal closing');
                onCancel();
            }}
            footer={null}
            width={800}
            destroyOnClose={true}
            maskClosable={false}
            style={{ top: 20 }}
            bodyStyle={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
        >
            <div style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm kiếm theo tên, số điện thoại..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredCustomers}
                rowKey="MaKhachHang"
                loading={loading}
                onRow={record => ({
                    onClick: () => handleSelect(record),
                    style: { cursor: 'pointer' }
                })}
                pagination={{ pageSize: 5 }}
            />
        </Modal>
    );
};

export default CustomerSearchModal;
