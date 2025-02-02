import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import serviceService from "../../services/serviceService";
import { Table, Layout, Menu, Input, Select, Button, Checkbox, Row, Col, Card, Modal, DatePicker, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import ServiceConfirmationModal from "../../components/Modal/Modal_xacnhan/Modal_xacnhan";
import ServiceModal from "../../components/Modal/Modal_timkiemdichvu/Modal_timkiemdichvu";
import "./AdjustServicePage.css";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import moment from "moment";

const { Sider, Content } = Layout;
const { TextArea } = Input;
const { Search } = Input;

const App = () => {
    const { id } = useParams(); // Get service ticket ID from URL
    const [loading, setLoading] = useState(true);
    const [serviceTicket, setServiceTicket] = useState(null);
    const [data, setData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isPaid, setIsPaid] = useState(null); // null: chưa chọn, true: Đã thanh toán, false: Thanh toán sau
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [totalQuantity, setTotalQuantity] = useState(0); // Tổng số lượng dịch vụ
    const [totalAmount, setTotalAmount] = useState(0); // Tổng tiền
    const [totalPrepaid, setTotalPrepaid] = useState(0);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [shippingFee, setShippingFee] = useState(0);
    const [services] = useState([
        { id: 1, name: "Dịch vụ kiểm định và định giá", price: 1000000 },
        { id: 2, name: "Thiết kế trang sức theo yêu cầu", price: 5000000 },
        { id: 3, name: "Tư vấn cá nhân hóa", price: 1000000 },
        { id: 4, name: "Dịch vụ bảo hành và đổi trả", price: 2000000 },
        { id: 5, name: "Chương trình khách hàng thân thiết", price: 5000000 },
    ]);
    const navigate = useNavigate();
    const [invalidPrepayments, setInvalidPrepayments] = useState({});
    const [totalPossiblePrepayment, setTotalPossiblePrepayment] = useState(0);
    const [serviceDeliveryDates, setServiceDeliveryDates] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);

    // Calculate derived values
    const subTotal = totalAmount - discount;
    const totalPayable = subTotal + shippingFee;

    // Add validatePrepayment function
    const validatePrepayment = (record, value) => {
        const basePrice = Number(record.price) + Number(record.additionalCost || 0);
        const total = (record.quantity || 1) * basePrice;
        const minPrepayment = total * (record.pttr / 100);
        return value >= minPrepayment;
    };

    useEffect(() => {
        const fetchServiceTicket = async () => {
            try {
                setLoading(true);
                const response = await serviceService.getServiceTicketById(id);

                console.log("Check:", response);

                if (!response || !response.ticketInfo || !response.services) {
                    throw new Error("Invalid response data");
                }


                

                // Format ticket info
                const formattedTicketInfo = {
                    SoPhieuDV: response.ticketInfo.SoPhieuDV,
                    NgayLap: response.ticketInfo.NgayLap,
                    MaKhachHang: response.ticketInfo.MaKhachHang,
                    TongTien: response.ticketInfo.TongTien.toString(),
                    TongTienTraTruoc: response.ticketInfo.TongTienTraTruoc.toString(),
                    TinhTrang: response.ticketInfo.TinhTrang,
                    customer: {
                        TenKhachHang: response.ticketInfo.customer?.TenKhachHang,
                        SoDT: response.ticketInfo.customer?.SoDT,
                        DiaChi: response.ticketInfo.customer?.DiaChi,
                    },
                };

                // Format services data
                const formattedServices = response.services.map((detail) => ({
                    MaChiTietDV: detail.MaChiTietDV,
                    TenLoaiDichVu: detail.TenLoaiDichVu,
                    DonGiaDuocTinh: parseFloat(detail.DonGiaDuocTinh),
                    SoLuong: parseInt(detail.SoLuong),
                    ThanhTien: parseFloat(detail.ThanhTien),
                    TraTruoc: parseFloat(detail.TraTruoc),
                    TinhTrang: detail.TinhTrang,
                    NgayGiao: detail.NgayGiao,
                    ChiPhiRieng: parseFloat(detail.ChiPhiRieng || 0),
                    // pttr: parseFloat(detail.serviceType?.PhanTramTraTruoc) || 0,
                    // serviceType: {
                    //     TenLoaiDichVu: detail.TenLoaiDichVu,
                    //     PhanTramTraTruoc: parseFloat(detail.serviceType?.PhanTramTraTruoc) || 0,
                    // },
                }));

                // Set state with formatted data
                setServiceTicket(formattedTicketInfo);
                setData(formattedServices);

                // Set customer info
                if (response.services.customer) {
                    setSelectedCustomer({
                        id: response.serviceTicket.MaKhachHang,
                        name: response.serviceTicket.customer.TenKhachHang,
                        phone: response.serviceTicket.customer.SoDT,
                        address: response.serviceTicket.customer.DiaChi,
                    });
                }

                // Calculate totals
                const totals = formattedServices.reduce(
                    (acc, item) => {
                        acc.amount += item.total;
                        acc.quantity += item.quantity;
                        acc.prepaid += item.prepaid;
                        return acc;
                    },
                    { amount: 0, quantity: 0, prepaid: 0 }
                );

                setTotalAmount(totals.amount);
                setTotalQuantity(totals.quantity);
                setTotalPrepaid(totals.prepaid);

                // Debug log
                console.log("Formatted data:", {
                    ticketInfo: formattedTicketInfo,
                    services: formattedServices,
                });
            } catch (error) {
                console.error("Error fetching service ticket:", error);
                message.error("Không thể tải thông tin phiếu dịch vụ");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchServiceTicket();
        }
    }, [id]);

    // Hàm xử lý khi nhấn vào nút "Đã thanh toán"
    const handlePaidClick = () => {
        setIsPaid(true);
    };

    const handlePayLaterClick = () => {
        setIsPaid(false);
    };

    const { Option } = Select;

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleConfirm = (selectedServices, totalPrepayment, deliveryDates) => {
        console.log("Dịch vụ đã chọn:", selectedServices);
        const updatedData = [
            ...data,
            ...selectedServices.map((service) => {
                const basePrice = service.price;
                const quantity = service.quantity || 1;
                const total = basePrice * quantity;

                return {
                    ...service,
                    additionalCost: 0,
                    total: total,
                    prepayment: (total * service.pttr) / 100,
                    pttr: service.pttr,
                };
            }),
        ];

        const newTotalAmount = updatedData.reduce((sum, item) => {
            const basePrice = parseFloat(item.price) || 0;
            const additionalCost = parseFloat(item.additionalCost) || 0;
            const quantity = parseInt(item.quantity) || 1;
            return sum + (basePrice + additionalCost) * quantity;
        }, 0);

        const newTotalQuantity = updatedData.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
        const newTotalPrepaid = totalPrepayment || 0;

        setData(updatedData);
        setTotalPossiblePrepayment(totalPrepayment);
        setServiceDeliveryDates(deliveryDates);
        setTotalAmount(newTotalAmount);
        setTotalQuantity(newTotalQuantity);
        setTotalPrepaid(newTotalPrepaid);
        setIsModalVisible(false);
    };

    const customers = [
        { id: 1, name: "Nguyễn Văn A", phone: "0312456789" },
        { id: 2, name: "Trần Thị Ngọc B", phone: "0918276345" },
        { id: 3, name: "Văn Mây", phone: "0328345671" },
    ];

    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const handleConfirmSave = async () => {
        try {
            // Format the data according to the required structure
            const updatedTicketData = {
                ticketData: {
                    // Format NgayLap to YYYY-MM-DD
                    NgayLap: moment(serviceTicket?.NgayLap).format("YYYY-MM-DD"), // Sử dụng optional chaining để tránh lỗi nếu serviceTicket null/undefined
                    MaKhachHang: selectedCustomer?.id || null, // Fallback null nếu không có selectedCustomer
                    TinhTrang: serviceTicket?.TinhTrang || "Chưa hoàn thành", // Nếu không có trạng thái, mặc định là "Chưa hoàn thành"
                },
                details: data.map((service) => ({
                    MaChiTietDV: service.id, // ID của dịch vụ
                    MaLoaiDV: service.MaLoaiDV || null, // Fallback null nếu không có MaLoaiDV
                    SoLuong: parseInt(service.quantity, 10) || 1, // Mặc định là 1 nếu không có số lượng
                    DonGiaDuocTinh: service.price?.toString() || "0", // Fallback "0" nếu không có giá
                    TraTruoc: service.prepayment?.toString() || "0", // Fallback "0" nếu không có trả trước
                    ChiPhiRieng: (service.additionalCost || 0).toString(), // Fallback 0 nếu không có chi phí riêng
                    TinhTrang: service.status || "Chưa giao", // Mặc định "Chưa giao" nếu không có trạng thái
                    NgayGiao: service.deliveryDate ? moment(service.deliveryDate).toISOString() : null, // Fallback null nếu không có ngày giao
                })),
            };

            // Log the formatted data for debugging
            console.log("Formatted data for backend:", JSON.stringify(updatedTicketData, null, 2));

            // Call the API to update the service ticket
            await serviceService.updateServiceTicket(id, updatedTicketData);
            message.success("Cập nhật phiếu dịch vụ thành công");
            navigate("/list-service");
        } catch (error) {
            console.error("Update service ticket error:", error);
            message.error("Lỗi khi cập nhật phiếu dịch vụ: " + (error.response?.data?.message || error.message));
        }
    };

    const handleCancelSave = () => {
        setIsConfirmModalVisible(false);
    };

    const handleBulkDelete = () => {
        const updatedData = data.filter((item) => !selectedRows.includes(item.MaChiTietDV));
        setData(updatedData);
        setSelectedRows([]);
    };

    const columns = [
        {
            title: "STT",
            dataIndex: "stt",
            key: "stt",
            width: "5%",
            align: "center",
            render: (_, __, index) => index + 1,
        },
        {
            title: "Loại dịch vụ",
            dataIndex: "TenLoaiDichVu",
            key: "TenLoaiDichVu",
            width: "15%",
        },
        {
            title: "Đơn giá",
            dataIndex: "DonGiaDuocTinh",
            key: "DonGiaDuocTinh",
            width: "12%",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Chi phí riêng",
            dataIndex: "ChiPhiRieng",
            key: "ChiPhiRieng",
            width: "12%",
            render: (value) => formatCurrency(value || 0),
        },
        {
            title: "Số lượng",
            dataIndex: "SoLuong",
            key: "SoLuong",
            width: "10%",
            render: (value) => value, // Just display the value, no input
        },
        {
            title: "Thành tiền",
            dataIndex: "ThanhTien",
            key: "ThanhTien",
            width: "12%",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Trả trước",
            dataIndex: "TraTruoc",
            key: "TraTruoc",
            width: "12%",
            render: (value) => formatCurrency(value),
        },
        {
            title: "Còn lại",
            dataIndex: "ConLai",
            key: "ConLai",
            width: "12%",
            render: (_, record) => formatCurrency(record.ThanhTien - record.TraTruoc),
        },
        {
            title: "Tình trạng",
            dataIndex: "TinhTrang",
            key: "TinhTrang",
            width: "10%",
            render: (_, record) => (
                <Select
                    value={record.TinhTrang}
                    style={{ width: "100%" }}
                    onChange={(value) => {
                        const updatedData = data.map((item) =>
                            item.MaChiTietDV === record.MaChiTietDV ? { ...item, TinhTrang: value } : item
                        );
                        setData(updatedData);
                    }}
                >
                    <Option value="Chưa giao">Chưa giao</Option>
                    <Option value="Đã giao">Đã giao</Option>
                </Select>
            ),
        },
    ];

    // Add handler for service type change
    const handleServiceTypeChange = (recordId, newValue, option) => {
        const newPrice = option["data-price"];
        const updatedData = data.map((item) => {
            if (item.id === recordId) {
                const newTotal = newPrice * (item.quantity || 1) + (item.additionalCost || 0);
                return {
                    ...item,
                    name: newValue,
                    price: newPrice,
                    total: newTotal,
                };
            }
            return item;
        });
        setData(updatedData);
        calculateTotals(updatedData);
    };

    const handleConfirm_cus = (customers) => {
        console.log("Selected customers:", customers);
        setSelectedCustomers(customers);
        setIsCustomerModalVisible(false);
    };

    const ServiceHeader = () => (
        <div style={{ marginBottom: 20 }}>
            <Row gutter={24}>
                <Col span={12}>
                    <Row>
                        <Col span={8}>Số phiếu:</Col>
                        <Col span={16}>{serviceTicket?.SoPhieuDV}</Col>
                    </Row>
                    <Row>
                        <Col span={8}>Khách hàng:</Col>
                        <Col span={16}>{selectedCustomer?.name}</Col>
                    </Row>
                </Col>
                <Col span={12}>
                    <Row>
                        <Col span={8}>Ngày lập:</Col>
                        <Col span={16}>
                            {new Date(serviceTicket?.NgayLap).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={8}>Số điện thoại:</Col>
                        <Col span={16}>{selectedCustomer?.phone}</Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
                <Col span={8}>
                    <span>Tổng tiền: {formatCurrency(totalAmount)}</span>
                </Col>
                <Col span={8}>
                    <span>Tổng tiền trả trước: {formatCurrency(serviceTicket?.TongTienTraTruoc)}</span>
                </Col>
                <Col span={8}>
                    <span>
                        Tổng tiền còn lại: {formatCurrency(totalAmount - (serviceTicket?.TongTienTraTruoc || 0))}
                    </span>
                </Col>
            </Row>
        </div>
    );

    const handlePriceChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newPrice = parseFloat(value) || 0;
                const quantity = item.quantity || 0;
                const additionalCost = item.additionalCost || 0;
                const total = newPrice * quantity + additionalCost;
                return { ...item, price: newPrice, total };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleCalculatedPriceChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newCalculatedPrice = parseFloat(value) || 0;
                const quantity = item.quantity || 0;
                const additionalCost = item.additionalCost || 0;
                const total = newCalculatedPrice * quantity + additionalCost;
                return { ...item, calculatedPrice: newCalculatedPrice, total };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleQuantityChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newQuantity = parseInt(value) || 0;
                const price = item.price || 0;
                const additionalCost = item.additionalCost || 0;
                const total = price * newQuantity + additionalCost;
                return { ...item, quantity: newQuantity, total };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handlePrepaidChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newPrepaid = parseFloat(value) || 0;
                const total = item.total || 0;
                const remaining = total - newPrepaid;
                return { ...item, prepaid: newPrepaid, remaining };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleAdditionalCostChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                const newAdditionalCost = parseFloat(value) || 0;
                const total = item.total || 0;
                const remaining = total - newAdditionalCost;
                return { ...item, additionalCost: newAdditionalCost, remaining };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleDeliveryDateChange = (key, date) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                return { ...item, deliveryDate: date };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const handleStatusChange = (key, value) => {
        const newData = data.map((item) => {
            if (item.key === key) {
                return { ...item, status: value };
            }
            return item;
        });
        setData(newData);
        updateTotals(newData);
    };

    const updateTotals = (newData) => {
        const newTotalAmount = newData.reduce((sum, item) => sum + (item.total || 0), 0);
        const newTotalPrepaid = newData.reduce((sum, item) => sum + (item.prepaid || 0), 0);
        setTotalAmount(newTotalAmount);
        setTotalPrepaid(newTotalPrepaid);
    };

    // Add missing utility functions
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "0 VND";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
            .format(amount)
            .replace("₫", "VND");
    };

    const calculateTotals = (currentData) => {
        if (!currentData?.length) return;

        const totals = currentData.reduce(
            (acc, item) => {
                const basePrice = parseFloat(item.price) || 0;
                const additionalCost = parseFloat(item.additionalCost) || 0;
                const quantity = parseInt(item.quantity) || 1;
                const prepayment = parseFloat(item.prepayment) || 0;

                acc.amount += (basePrice + additionalCost) * quantity;
                acc.prepaid += prepayment;
                acc.quantity += quantity;

                return acc;
            },
            { amount: 0, prepaid: 0, quantity: 0 }
        );

        setTotalAmount(totals.amount);
        setTotalPrepaid(totals.prepaid);
        setTotalQuantity(totals.quantity);
    };

    const formatDate = (date) => {
        if (!date) return "";
        return moment(date).format("DD/MM/YYYY");
    };

    const formatNumber = (value) => {
        if (!value) return "0";
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    // Thêm hàm tính toán số tiền tối thiểu cần trả
    const calculateMinimumPayment = () => {
        return data.reduce((total, service) => {
            const basePrice = Number(service.price) + Number(service.additionalCost || 0);
            const quantity = service.quantity || 1;
            const serviceTotal = basePrice * quantity;
            const minPrepayment = (serviceTotal * service.pttr) / 100;
            return total + minPrepayment;
        }, 0);
    };

    return (
        <Layout className="app-layout-adjust-servicessss">
            <div className="bod">
                <Layout>
                    <Content className="app-content">
                        <div className="title-container">
                            <h1 className="title">Điều chỉnh phiếu dịch vụ</h1>
                        </div>

                        {/* Thêm phần action buttons */}
                        <div
                            className="header-actions"
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                                marginBottom: "20px",
                                padding: "16px",
                                backgroundColor: "#fff",
                                borderRadius: "8px",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <Button
                                onClick={() => navigate("/list-service")}
                                style={{
                                    width: "120px",
                                    height: "36px",
                                    borderRadius: "8px",
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => setIsConfirmModalVisible(true)}
                                style={{
                                    width: "120px",
                                    height: "36px",
                                    backgroundColor: "#091057",
                                    borderColor: "#091057",
                                    borderRadius: "8px",
                                }}
                            >
                                Lưu thay đổi
                            </Button>
                        </div>

                        {/* Service Ticket Information Section */}
                        <div
                            className="section"
                            style={{
                                backgroundColor: "#f8f9ff",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                                border: "1px solid #e6e9f0",
                                marginBottom: "40px",
                                marginTop: "20px",
                            }}
                        >
                            <h2>Thông tin phiếu</h2>
                            <Row gutter={16} style={{ marginBottom: "16px" }}>
                                <Col span={12}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "8px" }}>
                                            Số phiếu dịch vụ
                                        </label>
                                        <Input
                                            value={serviceTicket?.SoPhieuDV}
                                            disabled
                                            style={{
                                                width: "100%",
                                                height: "40px",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={{ display: "block", marginBottom: "8px" }}>Ngày lập</label>
                                        <Input
                                            value={new Date(serviceTicket?.NgayLap).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                            })}
                                            disabled
                                            style={{
                                                width: "100%",
                                                height: "40px",
                                                borderRadius: "8px",
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            {/* Customer Information */}
                            {/* Customer Information */}
                            <h3>Thông tin khách hàng</h3>
                            {serviceTicket?.customer && (
                                <div
                                    style={{
                                        padding: "12px",
                                        border: "1px solid #e6e9f0",
                                        borderRadius: "8px",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <p>Tên khách hàng: {serviceTicket.customer.TenKhachHang}</p>
                                    <p>Số điện thoại: {serviceTicket.customer.SoDT}</p>
                                    <p>Địa chỉ: {serviceTicket.customer.DiaChi}</p>
                                </div>
                            )}
                        </div>

                        {/* Services Section */}
                        <Row gutter={16} className="classification-status">
                            <Col span={24}>
                                <div className="section">
                                    <h2>Dịch vụ đăng ký</h2>
                                    <Button
                                        type="primary"
                                        style={{
                                            width: "200px",
                                            marginBottom: "20px",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            backgroundColor: "#1890ff",
                                            borderRadius: "8px",
                                            boxShadow: "0 2px 6px rgba(24, 144, 255, 0.2)",
                                        }}
                                        onClick={showModal}
                                    >
                                        Chọn dịch vụ
                                    </Button>

                                    <div className="button-group" style={{ marginBottom: 16 }}>
                                        {/* <Button
                                            type="primary"
                                            onClick={() => setIsModalVisible(true)}
                                            style={{
                                                marginRight: 8,
                                                backgroundColor: "#1890ff"
                                            }}
                                        >
                                            Thêm dịch vụ
                                        </Button> */}
                                        <Button danger onClick={handleBulkDelete} disabled={selectedRows.length === 0}>
                                            Xóa dịch vụ đã chọn ({selectedRows.length})
                                        </Button>
                                    </div>

                                    <Table
                                        rowSelection={{
                                            type: "checkbox",
                                            selectedRowKeys: selectedRows,
                                            onChange: (selectedRowKeys) => setSelectedRows(selectedRowKeys),
                                        }}
                                        columns={columns}
                                        dataSource={data}
                                        rowKey="MaChiTietDV"
                                    />

                                    {/* <Row
                                        style={{
                                            marginTop: "16px",
                                            fontWeight: "bold",
                                            padding: "12px",
                                            backgroundColor: "#fff",
                                            borderRadius: "8px",
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                    </Row> */}
                                </div>
                            </Col>
                        </Row>

                        <ServiceModal
                            isVisible={isModalVisible}
                            onCancel={handleCancel}
                            onConfirm={handleConfirm}
                            services={services}
                        />

                        {/* <div className="customer-section">
                            <h2>Khách hàng</h2>
                            {selectedCustomer && (
                                <Card>
                                    <Row align="middle">
                                        <Col span={2}>
                                            <UserOutlined />
                                        </Col>
                                        <Col span={18}>
                                            <div>
                                                <div>{selectedCustomer.name}</div>
                                                <div>{selectedCustomer.phone}</div>
                                                <div>{selectedCustomer.address}</div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            )}
                        </div> */}

                        <div
                            className="payment-section"
                            style={{
                                backgroundColor: "#f8f9ff",
                                padding: "24px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 15px rgba(0, 0, 0, 0.1)",
                                border: "1px solid #e6e9f0",
                                marginTop: "20px",
                            }}
                        >
                            <h2>Thanh toán</h2>
                            <Col span={24}>
                                <div
                                    style={{
                                        backgroundColor: "white",
                                        padding: "20px",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                                    }}
                                >
                                    <Row justify="space-between" className="payment-row">
                                        <Col span={12}>Số lượng dịch vụ</Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {totalQuantity}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12}>Tổng tiền dịch vụ</Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {formatCurrency(totalAmount)}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12}>Giảm giá</Col>
                                        <Col
                                            span={12}
                                            style={{ textAlign: "right", color: "#52c41a", fontWeight: "500" }}
                                        >
                                            -{formatCurrency(discount)}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12}>Tạm tính</Col>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {formatCurrency(subTotal)}
                                        </Col>
                                    </Row>
                                    <Row justify="space-between" className="payment-row" style={{ marginTop: "12px" }}>
                                        <Col span={12} style={{ textAlign: "right", fontWeight: "500" }}>
                                            {formatCurrency(shippingFee)}
                                        </Col>
                                    </Row>
                                    <div
                                        style={{
                                            marginTop: "16px",
                                            paddingTop: "16px",
                                            borderTop: "2px dashed #e8e8e8",
                                        }}
                                    >
                                        <Row
                                            justify="space-between"
                                            style={{
                                                fontWeight: "bold",
                                                fontSize: "16px",
                                                color: "#1890ff",
                                            }}
                                        >
                                            <Col span={12}>Phải thu</Col>
                                            <Col span={12} style={{ textAlign: "right" }}>
                                                {formatCurrency(totalPayable)}
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Col>
                        </div>

                        {/* Confirmation Modal */}
                        <Modal
                            title="Xác nhận lưu thay đổi"
                            visible={isConfirmModalVisible}
                            onOk={handleConfirmSave}
                            onCancel={handleCancelSave}
                            okText="Lưu"
                            cancelText="Hủy"
                            centered
                            okButtonProps={{
                                style: {
                                    backgroundColor: "#091057",
                                    borderColor: "#091057",
                                },
                            }}
                        >
                            <p>Bạn có chắc chắn muốn lưu những thay đổi này?</p>
                        </Modal>
                    </Content>
                </Layout>
            </div>
        </Layout>
    );
};

export default App;
