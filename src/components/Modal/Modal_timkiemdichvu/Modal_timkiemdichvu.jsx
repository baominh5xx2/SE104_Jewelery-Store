import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Checkbox, Input, Table, DatePicker } from "antd";
import ServiceTypeService from "../../../services/ServiceTypeService";
import "./Modal_timkiemdichvu.css";

const ServiceModal = ({ isVisible, onCancel, onConfirm }) => {
    const [selectedServices, setSelectedServices] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [quantities, setQuantities] = useState({});
    const [fetchedServices, setFetchedServices] = useState([]);
    const [deliveryDates, setDeliveryDates] = useState({}); // Add new state for delivery dates

    // Add debugging logs
    useEffect(() => {
        console.log("Modal visibility:", isVisible);
        console.log("Available services:", fetchedServices);
    }, [isVisible, fetchedServices]);

    // Reset states when modal closes
    useEffect(() => {
        if (!isVisible) {
            setSelectedServices([]);
            setQuantities({});
            setSearchValue("");
        }
    }, [isVisible]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await ServiceTypeService.getAllServiceTypes();
                console.log("Fetched service types:", data); // Debug log
                const mappedData = (Array.isArray(data) ? data : []).map((item) => ({
                    id: item.MaLoaiDV,        // ID để tracking trong UI
                    MaLoaiDV: item.MaLoaiDV,  // MaLoaiDV thật từ database
                    name: item.TenLoaiDichVu,
                    price: parseFloat(item.DonGiaDV),
                    pttr: parseFloat(item.PhanTramTraTruoc)
                }));
                setFetchedServices(mappedData);
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };

        if (isVisible) {
            fetchServices();
        }
    }, [isVisible]);

    // Filter services based on search
    const filteredServices = useMemo(() => {
        return fetchedServices.filter((service) => service.name.toLowerCase().includes(searchValue.toLowerCase()));
    }, [fetchedServices, searchValue]);

    // Handle quantity updates
    const updateQuantity = (serviceId, change) => {
        setQuantities((prev) => ({
            ...prev,
            [serviceId]: Math.max(1, (prev[serviceId] || 1) + change),
        }));
    };

    // Handle service selection
    const handleSelect = (record) => {
        setSelectedServices((prev) => {
            const isSelected = prev.some((s) => s.id === record.id);
            if (isSelected) {
                return prev.filter((s) => s.id !== record.id);
            } else {
                return [...prev, record];
            }
        });

        // Initialize quantity if not exists
        if (!quantities[record.id]) {
            setQuantities((prev) => ({
                ...prev,
                [record.id]: 1,
            }));
        }
    };

    // Thêm hàm định dạng tiền
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        })
            .format(amount)
            .replace("₫", "VND");
    };

    // Thêm hàm tính toán số tiền trả trước tối thiểu
    const calculateMinPrepayment = (service) => {
        const basePrice = parseFloat(service.price) || 0;
        const pttr = parseFloat(service.pttr) || 0;
        return (basePrice * pttr) / 100;
    };

    const columns = [
        {
            title: "Dịch vụ",
            dataIndex: "name",
            key: "name",
            width: "25%",
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
        },
        {
            title: "Giá (VND)",
            dataIndex: "price",
            key: "price",
            width: "20%",
            render: (price) => formatCurrency(price),
        },
        {
            title: "Phần trăm trả trước",
            dataIndex: "pttr",
            key: "pttr",
            width: "15%",
            render: (pttr) => `${pttr}%`,
        },
        {
            title: "Số tiền trả trước tối thiểu",
            key: "minPrepayment",
            width: "20%",
            render: (_, record) => formatCurrency(calculateMinPrepayment(record)),
        },
        {
            title: "",
            key: "select",
            width: "20%",
            render: (_, record) => (
                <Checkbox
                    checked={selectedServices.some((s) => s.id === record.id)}
                    onChange={() => handleSelect(record)}
                >
                    Chọn
                </Checkbox>
            ),
        },
    ];

    const handleDeliveryDateChange = (serviceId, date) => {
        setDeliveryDates((prev) => ({
            ...prev,
            [serviceId]: date,
        }));
    };

    // Sửa lại hàm handleOk để bao gồm thông tin về số tiền tối thiểu
    const handleOk = () => {
        const servicesWithQuantities = selectedServices.map((service) => {
            const quantity = quantities[service.id] || 1;
            const basePrice = parseFloat(service.price);
            const totalPrice = basePrice * quantity;
            const minPrepayment = calculateMinPrepayment(service) * quantity;

            return {
                id: service.id,
                MaLoaiDV: service.MaLoaiDV,
                name: service.name,
                price: service.price,
                quantity: quantity,
                total: totalPrice,
                prepayment: minPrepayment, // Set default prepayment to minimum required
                additionalCost: "0",
                status: "Chưa giao",
                deliveryDate: deliveryDates[service.id],
                pttr: service.pttr,
                minPrepayment: minPrepayment // Add minimum prepayment information
            };
        });

        console.log("Selected services with details:", servicesWithQuantities);
        onConfirm(servicesWithQuantities);
    };

    const handleServiceSelect = (service) => {
        const selectedService = {
            ...service,
            MaLoaiDV: service.MaLoaiDV,
            id: service.id,
            name: service.name,
            price: service.price,
        };
    };

    return (
        <Modal
            title="Tìm kiếm dịch vụ"
            visible={isVisible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} style={{ borderRadius: "8px" }}>
                    Hủy
                </Button>,
                <Button key="confirm" type="primary" onClick={handleOk} style={{ borderRadius: "8px" }}>
                    Hoàn tất chọn
                </Button>,
            ]}
            centered
            className="service-modal"
            width={800} // Điều chỉnh độ rộng modal
        >
            <Input
                placeholder="Tìm kiếm dịch vụ"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                    marginBottom: "16px",
                    padding: "8px",
                    borderRadius: "4px",
                }}
            />
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table
                    dataSource={filteredServices}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    bordered
                    scroll={{ y: 350 }} // Thêm cuộn dọc với chiều cao cố định
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                    }}
                />
            </div>
        </Modal>
    );
};

export default ServiceModal;
