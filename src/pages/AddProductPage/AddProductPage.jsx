import React, { useState, useEffect } from "react"; // Thêm useEffect
import { useNavigate } from "react-router-dom"; // Thêm dòng này
import axios from "axios"; // Thêm import axios
import { message, Upload } from "antd"; // Thêm import message và Upload
import { UploadOutlined } from "@ant-design/icons"; // Thêm import UploadOutlined
import productService from "../../services/productService";
import {
    Layout,
    Menu,
    Input,
    Select,
    Button,
    Checkbox,
    Row,
    Col,
    Tag,
    Breadcrumb, // Thêm import Breadcrumb
} from "antd";
import {
    DashboardOutlined,
    AppstoreOutlined,
    FileAddOutlined,
    ShoppingCartOutlined,
    FileOutlined,
    TeamOutlined,
    UserOutlined,
    DollarOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import "./AddProductPage.css";

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const App = () => {
    const navigate = useNavigate(); // Thêm dòng này
    const [attributes, setAttributes] = useState([{ key: 1, property: "", detail: "" }]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        productName: "",
        categoryId: "",
        productCode: "",
        image: "", // Add image field
        imagePreview: "", // Add image preview field
    });

    // Hàm thêm thuộc tính mới
    const addAttribute = () => {
        const newKey = attributes.length + 1;
        setAttributes([...attributes, { key: newKey, property: "", detail: "" }]);
    };

    // Thêm useEffect để lấy danh sách loại sản phẩm
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await productService.getCategories();
                console.log("Categories fetched:", categoriesData); // Debug log
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching categories:", error);
                message.error("Không thể tải danh sách phân loại");
            }
        };

        fetchCategories();
    }, []);

    console.log("Current categories:", categories); // Debug log

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileUpload = (file) => {
        console.log("File upload started:", file);

        // Validate file type
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error("Chỉ chấp nhận file hình ảnh!");
            return false;
        }

        // Validate file size (max 5MB)
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error("Kích thước hình ảnh phải nhỏ hơn 5MB!");
            return false;
        }

        // Store the file object directly
        handleInputChange("image", file);

        // Create preview URL
        const previewURL = URL.createObjectURL(file);
        handleInputChange("imagePreview", previewURL);

        console.log("File processed successfully:", {
            name: file.name,
            type: file.type,
            size: file.size,
            preview: previewURL,
        });

        return false; // Prevent default upload behavior
    };

    const handleSaveProduct = async () => {
        try {
            if (!formData.productName || !formData.categoryId || !formData.productCode) {
                message.error("Vui lòng điền đầy đủ thông tin sản phẩm");
                return;
            }

            const productData = {
                TenSanPham: formData.productName.trim(),
                MaLoaiSanPham: formData.categoryId,
                MaSanPham: formData.productCode.trim(),
                SoLuong: 0,
                DonGia: 0,
            };

            const loadingMessage = message.loading("Đang tạo sản phẩm...", 0);

            try {
                console.log("Sending product data:", {
                    ...productData,
                    hasImage: !!formData.image,
                });

                await productService.createProduct(productData, formData.image);
                loadingMessage();
                message.success("Thêm sản phẩm thành công");
                navigate("/list-product");
            } catch (error) {
                loadingMessage();
                console.error("Create product error:", error);
                message.error(error.message);
            }
        } catch (error) {
            console.error("Outer error:", error);
            message.error("Có lỗi xảy ra: " + error.message);
        }
    };

    return (
        <Layout className="app-layout_app">
            {/* Sidebar */}
            <div className="body_them">
                <Layout>
                    <Content className="app-content">
                        <div className="title-container">
                            <h1 className="title">Thêm sản phẩm</h1>
                            <img src="/bell.jpg" alt="Logo" className="logo-image111" />
                            <img src="/girl.jpg" alt="Logo" className="logo-image211" />
                        </div>
                        <div className="header-actions">
                            <Button
                                type="default"
                                className="action-btn"
                                onClick={() => navigate("/list-product")} // Add this line
                                style={{
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "30px",
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                className="action-btn"
                                onClick={handleSaveProduct}
                                style={{
                                    borderRadius: "8px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "30px",
                                }}
                            >
                                + Lưu sản phẩm
                            </Button>
                        </div>
                        {/* Phân loại */}
                        {/* Thông tin chung */}
                        <div
                            className="section"
                            style={{
                                backgroundColor: "#f8f9ff",
                                padding: "20px",
                                borderRadius: "12px",
                                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
                                border: "1px solid #e6e9f0",
                                marginBottom: "20px",
                            }}
                        >
                            <Row gutter={16}>
                                <Col span={24}>
                                    <label>Mã sản phẩm</label>
                                    <Input
                                        placeholder="Nhập mã sản phẩm"
                                        value={formData.productCode}
                                        onChange={(e) => handleInputChange("productCode", e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <label>Tên sản phẩm</label>
                                    <Input
                                        placeholder="Nhập tên sản phẩm"
                                        value={formData.productName}
                                        onChange={(e) => handleInputChange("productName", e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <label>Phân loại</label>
                                    <Select
                                        className="select1"
                                        placeholder="Chọn loại sản phẩm"
                                        value={formData.categoryId || undefined}
                                        onChange={(value) => {
                                            // Sửa lại tham số và cách xử lý
                                            console.log("Selected category:", value);
                                            handleInputChange("categoryId", value);
                                        }}
                                    >
                                        {categories.map((cat) => (
                                            <Option key={cat.MaLoaiSanPham} value={cat.MaLoaiSanPham}>
                                                {cat.TenLoaiSanPham}
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <label>Hình ảnh sản phẩm</label>
                                    <Upload
                                        beforeUpload={handleFileUpload}
                                        showUploadList={true}
                                        maxCount={1}
                                        accept="image/*"
                                        listType="picture-card"
                                    >
                                        {!formData.image && (
                                            <div>
                                                <UploadOutlined />
                                                <div style={{ marginTop: 8 }}>Chọn hình ảnh</div>
                                            </div>
                                        )}
                                    </Upload>
                                </Col>
                            </Row>
                        </div>
                    </Content>
                </Layout>
            </div>
        </Layout>
    );
};

export default App;
