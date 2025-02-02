import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Card, Tag, Spin, message } from 'antd';
import { saleService } from '../../services/saleService';

const OrderProductDetail = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    const fetchOrderDetails = async () => {
        try {
            const data = await saleService.getSaleOrderById(id);
            setOrderData(data);
        } catch (error) {
            message.error('Không thể tải thông tin đơn hàng');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spin size="large" />;

    return (
        <div className="order-detail">
            <Card title={`Chi tiết đơn hàng #${id}`}>
                <Table 
                    dataSource={orderData?.details}
                    columns={[
                        {
                            title: 'Sản phẩm',
                            dataIndex: 'TenSanPham',
                            key: 'name'
                        },
                        {
                            title: 'Hình ảnh',
                            dataIndex: 'HinhAnh',
                            key: 'image',
                            render: url => <img src={url || 'default-image.png'} style={{width: 50}} />
                        },
                        {
                            title: 'Số lượng',
                            dataIndex: 'SoLuong',
                            key: 'quantity'
                        },
                        {
                            title: 'Đơn giá',
                            dataIndex: 'DonGiaBanRa',
                            key: 'price',
                            render: price => `${price.toLocaleString('vi-VN')}đ`
                        },
                        {
                            title: 'Thành tiền',
                            dataIndex: 'ThanhTien',
                            key: 'total',
                            render: total => `${total.toLocaleString('vi-VN')}đ`
                        }
                    ]}
                />
            </Card>
        </div>
    );
};

export default OrderProductDetail;
