import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./DetailCustomer.css";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import { customerService } from "../../services/customerService";
import avatar from "../../assets/customer1.jpg";
import {
    CopyOutlined,
    MailOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    ClockCircleOutlined,
    MenuOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
} from "@ant-design/icons";
import { Form, Input, Button, DatePicker, message } from "antd";

const CustomerDetail = () => {
    const { id } = useParams();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [isChanged, setIsChanged] = useState(false);
    const [state, setState] = useState({
        customerData: {},
        filters: {
            date: null,
            dateString: "",
        },
        orders: [],
        filteredOrders: [],
        totalSpending: 0, // Add total spending state
        totalOrders: 0 // Add total orders state
    });

    useEffect(() => {
        fetchCustomerDetails();
    }, [id]);

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            const updatedData = {
                TenKhachHang: values.name,
                SoDT: values.phone,
                DiaChi: values.address,
            };

            await customerService.updateCustomer(id, updatedData);
            message.success("Cập nhật thông tin khách hàng thành công");
            setIsChanged(false);
            fetchCustomerDetails(); // Refresh data
        } catch (error) {
            message.error("Không thể cập nhật thông tin khách hàng");
            console.error("Update customer error:", error);
        }
    };

    // Fetch customer details including total spending
    const fetchCustomerDetails = async () => {
        try {
            setLoading(true);
            const data = await customerService.getCustomerById(id);

            // Calculate total spending and get orders from sale invoices
            const totalSpending = data.saleInvoices?.reduce((sum, invoice) => 
                sum + (parseFloat(invoice.TongTien) || 0), 0
            ) || 0;

            // Get total number of orders
            const totalOrders = data.saleInvoices?.length || 0;

            // Format order history
            const orderHistory = data.saleInvoices?.map(invoice => ({
                id: invoice.SoPhieuBH,
                products: invoice.chitiet?.map(detail => ({
                    name: detail.TenSanPham,
                    quantity: detail.SoLuong
                })),
                total: new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(invoice.TongTien),
                date: new Date(invoice.NgayLap).toLocaleDateString('vi-VN')
            })) || [];

            setState(prev => ({
                ...prev,
                customerData: {
                    id: data.MaKhachHang,
                    name: data.TenKhachHang,
                    phone: data.SoDT,
                    address: data.DiaChi
                },
                totalSpending: totalSpending,
                totalOrders: totalOrders,
                orders: orderHistory,
                filteredOrders: orderHistory
            }));

            form.setFieldsValue({
                id: data.MaKhachHang,
                name: data.TenKhachHang,
                phone: data.SoDT,
                address: data.DiaChi
            });
        } catch (error) {
            message.error("Không thể tải thông tin khách hàng");
            console.error("Fetch customer error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const applyDateFilter = () => {
        const { dateString } = state.filters;
        const filtered = dateString
            ? state.orders.filter((order) => order.date === dateString) // Use state.orders
            : state.orders; // Use state.orders as default
        setState((prev) => ({
            ...prev,
            filteredOrders: filtered,
        }));
    };

    const handleFormChange = () => {
        setIsChanged(true);
    };

    return (
        <div>
            <div style={{ marginLeft: "270px" }}>
                <Topbar title="Thông tin chi tiết khách hàng" />
            </div>

            <div className="customer-detail">
                <div className="customer-info">
                    <div className="left-section">
                        <div className="avatar-placeholder">
                            <img src={avatar} alt="avatar-customer" />
                        </div>
                        <h2 className="customer-name">{state.customerData.name}</h2>
                        <span className="status active">{state.customerData.status}</span>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            initialValues={state.customerData}
                            onValuesChange={handleFormChange}
                        >
                            <Form.Item name="id" label="Mã khách hàng">
                                <Input prefix={<CopyOutlined />} disabled />
                            </Form.Item>

                            <Form.Item
                                name="name"
                                label="Tên khách hàng"
                                rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                            >
                                <Input prefix={<PhoneOutlined />} />
                            </Form.Item>

                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                            >
                                <Input prefix={<EnvironmentOutlined />} />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                className={`save-button ${isChanged ? "" : "disabled-button"}`}
                            >
                                Cập nhật
                            </Button>
                        </Form>
                    </div>
                </div>

                <div className="customer-container">
                    {/* Right Section */}
                    <div className="customer-stats">
                        {/* Card 1: Chi tiêu */}
                        <div className="stat-card">
                            <div className="header">
                                <div className="icon-wrapper">
                                    <ClockCircleOutlined className="icon" />
                                </div>
                            </div>
                            <div>
                                <div className="stat-title">Chi tiêu</div>
                                <div className="stat-value">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(state.totalSpending)}
                                </div>
                            </div>
                        </div>
                        {/* Card 2: Tổng đơn hàng */}
                        <div className="stat-card">
                            <div className="header">
                                <div className="icon-wrapper">
                                    <ShoppingOutlined className="icon" />
                                </div>
                            </div>
                            <div>
                                <div className="stat-title">Tổng đơn hàng</div>
                                <div className="stat-value">{state.totalOrders}</div>
                            </div>
                        </div>
                    </div>

                    {/* Purchase History */}
                    <div className="purchase-history">
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h3>Lịch sử mua hàng</h3>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <DatePicker
                                    placeholder="Chọn ngày"
                                    style={{ width: 150, marginRight: "10px" }}
                                    onChange={(date, dateString) =>
                                        handleChange("filters", {
                                            ...state.filters,
                                            date,
                                            dateString,
                                        })
                                    }
                                />
                                <Button
                                    type="primary"
                                    onClick={applyDateFilter}
                                    icon={<MenuOutlined />}
                                    style={{ backgroundColor: "#091057" }}
                                />
                            </div>
                        </div>
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Mã đơn hàng</th>
                                    <th>Sản phẩm</th>
                                    <th>Tổng tiền</th>
                                    <th>Ngày đặt hàng</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.filteredOrders.map((order, index) => (
                                    <tr key={index}>
                                        <td>{order.id}</td>
                                        <td>
                                            {order.products?.map((p, i) => (
                                                <div key={i}>
                                                    {p.name} x{p.quantity}
                                                </div>
                                            ))}
                                        </td>
                                        <td>{order.total}</td>
                                        <td>{order.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetail;
