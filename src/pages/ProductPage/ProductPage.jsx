import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Tag, Space, Input, DatePicker, Dropdown, Menu, Button, Modal, message } from "antd";
import {
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    DownOutlined,
    PlusOutlined,
    ExportOutlined,
} from "@ant-design/icons";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import FilterBar from "../../components/FilterBar/FilterBar";
import DeleteConfirmationModal from "../../components/Modal/Modal_xacnhanxoa/Modal_xacnhanxoa";
import dayjs from "dayjs";
import "./ProductPage.css";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import productService from "../../services/productService";
import axios from "axios";

const { Search } = Input;

const ProductPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("Tất cả");
    const [expandedRowKeys, setExpandedRowKeys] = useState([]);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedDeleteOrder, setSelectedDeleteOrder] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState({});
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [allCategories, setAllCategories] = useState([]);

    const [state, setState] = useState({
        filters: {
            orderType: "Tất cả",
            date: null,
            dateString: "",
            searchQuery: "",
        },
        selectedProducts: [],
        isModalVisible: false,
    });

    const handleCreateProduct = () => {
        navigate("/add-product");
    };

    const handleExpandRow = (record) => {
        console.log("Expanding row:", record);
        const isRowExpanded = expandedRowKeys.includes(record.key);
        setExpandedRowKeys(
            isRowExpanded ? expandedRowKeys.filter((key) => key !== record.key) : [...expandedRowKeys, record.key]
        );
    };
    const handleEditProduct = (key) => {
        navigate(`/adjust-product/${key}`);
    };

    const handleDeleteClick = (product) => {
        setSelectedDeleteOrder({
            name: product.productName,
            key: product.key,
            code: product.productCode,
        });
        setIsDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await productService.deleteProduct(selectedDeleteOrder.key);
            message.success("Xóa sản phẩm thành công");
            fetchProducts(); // Refresh the list
            setIsDeleteModalVisible(false);
            setSelectedDeleteOrder(null);
        } catch (error) {
            message.error("Không thể xóa sản phẩm");
            console.error("Error deleting product:", error);
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleDateChange = (date, dateString, key) => {
        const updatedData = data.map((item) => (item.key === key ? { ...item, postedDate: dateString } : item));
        setData(updatedData);
    };

    const handleChange = (key, value) => {
        setState((prev) => {
            const updatedState = { ...prev };
            if (key in prev.filters) {
                updatedState.filters[key] = value;
            } else {
                updatedState[key] = value;
            }
            return updatedState;
        });
    };

    const handleConfirmDelete = async () => {
        try {
            await productService.deleteMultipleProducts(state.selectedProducts);
            message.success("Đã xóa các sản phẩm đã chọn");
            fetchProducts(); // Refresh the list
            setState((prev) => ({
                ...prev,
                selectedProducts: [],
                isModalVisible: false,
            }));
        } catch (error) {
            message.error("Không thể xóa các sản phẩm đã chọn");
            console.error("Error deleting products:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const products = await productService.getAllProducts();

            // Products will already be sorted by createdAt from the backend
            const formattedData = products.map((product) => ({
                ...product,
                stockDisplay: !product.stock || product.stock === 0 ? "0" : product.stock,
                price: !product.price || product.price === null || product.DonGia === null 
                    ? "Chưa có giá" 
                    : new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                    }).format(product.price || product.DonGia)
            }));

            setData(formattedData);
            setFilteredData(formattedData);
            console.log(formattedData);
            // Lấy danh sách unique categories
            const uniqueCats = [...new Set(formattedData.map((item) => item.category))];
            setUniqueCategories(uniqueCats);
        } catch (error) {
            console.error("Fetch error:", error);
            message.error("Không thể tải dữ liệu sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        // Lấy danh sách unique categories từ data
        const categories = [...new Set(data.map((item) => item.category))];
        setUniqueCategories(categories);
    }, [data]);

    useEffect(() => {
        let filtered = data;

        if (activeTab !== "Tất cả") {
            filtered = filtered.filter((item) => item.status === activeTab);
        }

        if (selectedCategory) {
            filtered = filtered.filter((item) => item.category === selectedCategory);
        }

        if (searchText) {
            const lowerSearchText = searchText.toLowerCase();
            filtered = filtered.filter((item) =>
                Object.values(item).some((value) => String(value).toLowerCase().includes(lowerSearchText))
            );
        }

        setFilteredData(filtered);
    }, [data, activeTab, searchText, selectedCategory]);

    useEffect(() => {
        setFilteredData(data);
    }, []);

    useEffect(() => {
        const fetchAllCategories = async () => {
            try {
                const categories = await productService.getAllCategories();
                setAllCategories(categories);
            } catch (error) {
                console.error("Error fetching all categories:", error);
            }
        };
        fetchAllCategories();
    }, []);

    const menu = (
        <Menu>
            <Menu.Item key="1">Sắp xếp tên</Menu.Item>
            <Menu.Item key="2">Sắp xếp theo</Menu.Item>
            <Menu.Item key="3">Sắp xếp theo lượng tồn</Menu.Item>
        </Menu>
    );

    const menu1 = (
        <Menu>
            <Menu.Item key="1">Sắp xếp tăng dần</Menu.Item>
            <Menu.Item key="2">Sắp xếp giảm dần</Menu.Item>
        </Menu>
    );

    const menu2 = (
        <Menu>
            <Menu.Item key="1">Tồn kho thấp</Menu.Item>
            <Menu.Item key="2">Đã đăng</Menu.Item>
            <Menu.Item key="3">Nháp</Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: "productName",
            key: "productName",
            render: (text, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                        src={record.image}
                        alt={record.productName}
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                    />
                    <div>{text}</div>
                </div>
            ),
        },
        {
            title: "Mã Sản phẩm",
            dataIndex: "productCode",
            key: "productCode",
        },
        {
            title: "Phân loại",
            dataIndex: "category",
            key: "category",
            filters: allCategories.map((cat) => ({
                text: cat.text,
                value: cat.text,
            })),
            onFilter: (value, record) => record.category === value,
            filterSearch: true,
            render: (category) => (
                <Tag color="#108ee9" style={{ fontSize: "12px" }}>
                    {category}
                </Tag>
            ),
        },
        {
            title: "Lượng tồn",
            dataIndex: "stockDisplay",
            key: "stock",
            sorter: (a, b) => {
                if (typeof a.stock === "number" && typeof b.stock === "number") {
                    return a.stock - b.stock;
                }
                return 0;
            },
            render: (stockDisplay, record) => (
                <span
                >
                    {stockDisplay}
                </span>
            ),
        },
        {
            title: "Giá",
            dataIndex: "price",
            key: "price",
            sorter: (a, b) => {
                // Chuyển đổi giá trị "Chưa có giá" thành 0 để so sánh
                const priceA = a.price === "Chưa có giá" ? 0 : parseFloat(a.price.replace(/[^\d]/g, ""));
                const priceB = b.price === "Chưa có giá" ? 0 : parseFloat(b.price.replace(/[^\d]/g, ""));
                return priceA - priceB;
            },
            sortDirections: ["ascend", "descend"],
            render: (price) => (
                <span
                    style={{
                        color: price === "Chưa có giá" ? "#ff4d4f" : "inherit",
                        fontWeight: price === "Chưa có giá" ? "bold" : "normal",
                    }}
                >
                    {price}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 200,
            render: (_, record) => (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    width: '100%',
                    gap: '8px',
                    minHeight: '32px', // Add fixed height
                    position: 'relative' // For absolute positioning
                }}>
                    <Tag color={record.isDelete ? 'error' : 'success'}>
                        {record.isDelete ? 'Không hoạt động' : 'Đang hoạt động'}
                    </Tag>
                    <div style={{ 
                        width: '80px',  // Fixed width for button space
                        marginLeft: '4px'
                    }}>
                        {record.isDelete && (
                            <Button
                                type="primary"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestoreProduct(record);
                                }}
                                style={{ 
                                    padding: '2px 12px',
                                    height: '24px',
                                    fontSize: '12px',
                                    background: 'white',
                                    color: '#1890ff',
                                    border: '1px solid #1890ff',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 0 rgba(0,0,0,0.02)'
                                }}
                            >
                                Kích hoạt
                            </Button>
                        )}
                    </div>
                </div>
            )
        }
    ];

    // Add restore handler
    const handleRestoreProduct = async (product) => {
      try {
          const loadingMessage = message.loading('Đang khôi phục sản phẩm...', 0);
          await productService.restoreProduct(product.key);
          loadingMessage();
          message.success('Khôi phục sản phẩm thành công');
          fetchProducts(); // Refresh the list
      } catch (error) {
          message.error('Không thể khôi phục sản phẩm');
          console.error('Error restoring product:', error);
      }
  };

    return (
        <div>
            <div style={{ marginLeft: "270px" }}>
                <Topbar title="Quản lý sản phẩm" />
            </div>

            <div className="order-table-container1">
                <header className="order-header">
                    <div className="header-actions">
                        <Input.Search
                            placeholder="Tìm kiếm sản phẩm..."
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <div className="filter-section" style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                disabled={state.selectedProducts.length === 0}
                                onClick={() => handleChange("isModalVisible", true)}
                                className="delete-all-button"
                            >
                                Xóa đã chọn
                            </Button>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            className="add-product-button"
                            onClick={handleCreateProduct}
                        >
                            Thêm sản phẩm
                        </Button>
                    </div>
                </header>

                <Table
                    loading={loading}
                    rowSelection={{
                        selectedRowKeys: state.selectedProducts,
                        onChange: (selectedRowKeys) => handleChange("selectedProducts", selectedRowKeys),
                    }}
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{ pageSize: 5 }}
                    onRow={(record) => ({
                        onClick: () => {
                            if (!record.isDelete) {
                                navigate(`/adjust-product/${record.key}`, {
                                    state: { productData: record },
                                });
                            }
                        },
                        style: {
                            cursor: record.isDelete ? "default" : "pointer",
                            ...(record.isDelete && {
                                opacity: 0.6,
                                backgroundColor: "#f5f5f5",
                                color: "#999",
                            }),
                        },
                    })}
                />

                <DeleteConfirmationModal
                    isVisible={isDeleteModalVisible}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    message={`Bạn có chắc chắn muốn xóa sản phẩm ${selectedDeleteOrder?.name} có mã sản phẩm là ${selectedDeleteOrder?.code} không?`}
                />

                <Modal
                    title="Xác nhận xóa"
                    visible={state.isModalVisible}
                    onOk={handleConfirmDelete}
                    onCancel={() => handleChange("isModalVisible", false)}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <p>Bạn có chắc chắn muốn xóa những sản phẩm đã chọn?</p>
                </Modal>
            </div>
        </div>
    );
};

export default ProductPage;
