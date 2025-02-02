import React, { useState, useEffect } from "react"; // Thêm useEffect
import axios from "axios"; // Thêm import axios
import { message } from "antd"; // Thêm import message
import productService from "../../services/productService";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Add this import
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
    Upload, // Add Upload component
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
    UploadOutlined, // Add UploadOutlined icon
} from "@ant-design/icons";
import "./AdjustProductPage.css";

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const App = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [attributes, setAttributes] = useState([{ key: 1, property: "", detail: "" }]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        productName: "",
        categoryId: "",
        productCode: "",
        price: "",
        stock: "", // Add stock field
        image: "", // Add image field
        unit: "", // Add unit field
    });

    // Thêm state để lưu trữ thông tin đơn vị tính
    const [categoryUnitMap, setCategoryUnitMap] = useState({});

    // Hàm thêm thuộc tính mới
    const addAttribute = () => {
        const newKey = attributes.length + 1;
        setAttributes([...attributes, { key: newKey, property: "", detail: "" }]);
    };

    // Cập nhật lại useEffect để fetch và xử lý categories với đơn vị tính
    useEffect(() => {
        const fetchCategoriesAndProduct = async () => {
            try {
                const categoriesData = await productService.getCategories();
                setCategories(categoriesData);

                if (location.state?.productData) {
                    const product = location.state.productData;
                    const selectedCategory = categoriesData.find((cat) => cat.MaLoaiSanPham === product.categoryId);
                    // Đảm bảo giá không bao giờ rỗng
                    const priceValue =
                        product.price === 0 || !product.price
                            ? "Chưa có giá"
                            : String(product.price).replace(/[^\d]/g, "") || "Chưa có giá";

                    setFormData({
                        productName: product.productName,
                        categoryId: product.categoryId,
                        productCode: product.productCode,
                        price: priceValue, // Luôn có giá trị
                        stock: String(product.stock),
                        image: product.image || "",
                        dvt: selectedCategory?.TenDVTinh || "Chưa có đơn vị",
                    });
                }
            } catch (error) {
                console.error("Error loading data:", error);
                message.error("Không thể tải thông tin sản phẩm");
            }
        };

        fetchCategoriesAndProduct();
    }, [location.state]);

    // Thêm effect để cập nhật đơn vị tính khi thay đổi category
    useEffect(() => {
        if (formData.categoryId && categories.length > 0) {
            const selectedCategory = categories.find((cat) => cat.MaLoaiSanPham === formData.categoryId);
            if (selectedCategory) {
                setFormData((prev) => ({
                    ...prev,
                    dvt: selectedCategory?.unit.TenDVTinh || "Chưa có đơn vị",
                }));
            }
        }
    }, [formData.categoryId, categories]);

    console.log("Current categories:", categories); // Debug log

    // Cập nhật hàm handleInputChange để xử lý thay đổi category
    const handleInputChange = (field, value) => {
        if (field === "categoryId") {
            const selectedCategory = categories.find((cat) => cat.MaLoaiSanPham === value);
            setFormData((prev) => ({
                ...prev,
                [field]: value,
                dvt: selectedCategory?.unit.TenDVTinh || "Chưa có đơn vị",
            }));

            // Debug log
            console.log("Selected new category:", selectedCategory);
            console.log("New unit name:", selectedCategory?.unit.TenDVTinh);
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    const handleSaveProduct = async () => {
        try {
            const currentProduct = location.state?.productData;
            if (!currentProduct) {
                message.error("Không tìm thấy thông tin sản phẩm");
                return;
            }

            // Validate required fields
            if (!formData.productName || !formData.categoryId) {
                message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            const loadingMessage = message.loading("Đang cập nhật sản phẩm...", 0);

            try {
                // Create FormData object
                const formDataToSend = new FormData();

                // Append product data
                formDataToSend.append("TenSanPham", formData.productName);
                formDataToSend.append("MaLoaiSanPham", formData.categoryId);
                formDataToSend.append("MaSanPham", formData.productCode);
                // Set price to 0 if it's "Chưa có giá"
                formDataToSend.append("DonGia", formData.price === "Chưa có giá" ? 0 : formData.price);
                formDataToSend.append("SoLuong", formData.stock || 0);

                // Append image file if exists
                if (formData.imageFile) {
                    formDataToSend.append("imageFile", formData.imageFile);
                }

                const response = await productService.updateProduct(currentProduct.key, formDataToSend);

                loadingMessage();
                message.success("Cập nhật sản phẩm thành công");

                setTimeout(() => {
                    navigate("/list-product");
                }, 1000);
            } catch (error) {
                loadingMessage();
                console.error("Update failed:", error);
                throw error;
            }
        } catch (error) {
            message.error("Không thể cập nhật sản phẩm: " + error.message);
        }
    };

    const handleFileUpload = (file) => {
        console.log("File upload started:", file);

        // Validate file
        if (!file.type.startsWith("image/")) {
            message.error("Chỉ chấp nhận file hình ảnh!");
            return false;
        }

        if (file.size > 5 * 1024 * 1024) {
            message.error("Kích thước hình ảnh phải nhỏ hơn 5MB!");
            return false;
        }

        // Update form data with new file
        setFormData((prev) => ({
            ...prev,
            imageFile: file,
            imagePreview: URL.createObjectURL(file),
        }));

        return false;
    };

    return (
        <Layout className="app-layout-container-adjust">
            {/* Sidebar */}
            <div className="body_them">
                <Layout>
                    <Content className="app-content">
                        <div className="title-container">
                            <h1 className="title">Sửa sản phẩm</h1>
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
                                + Lưu thay đổi
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
                            <h2>Thông tin chung</h2>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <label>Mã sản phẩm</label>
                                    <Input
                                        placeholder="Nhập mã sản phẩm"
                                        value={formData.productCode}
                                        disabled={true} // Disable input mã sản phẩm
                                        style={{
                                            backgroundColor: "#f5f5f5",
                                            cursor: "not-allowed",
                                        }}
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
                                    <label>Đơn vị tính</label>
                                    <Input
                                        placeholder="Đơn vị tính"
                                        value={formData.dvt}
                                        disabled={true}
                                        style={{
                                            backgroundColor: "#f5f5f5",
                                            cursor: "not-allowed",
                                        }}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <label>Hình ảnh sản phẩm</label>
                                    <div className="image-upload-section">
                                        {(formData.imagePreview || formData.image) && (
                                            <div className="image-preview" style={{ marginBottom: "16px" }}>
                                                <img
                                                    src={formData.imagePreview || formData.image}
                                                    alt="Product"
                                                    style={{
                                                        maxWidth: "200px",
                                                        maxHeight: "200px",
                                                        objectFit: "contain",
                                                        border: "1px solid #d9d9d9",
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <Upload accept="image/*" beforeUpload={handleFileUpload} showUploadList={false}>
                                            <Button icon={<UploadOutlined />}>
                                                {formData.image ? "Thay đổi ảnh" : "Tải ảnh lên"}
                                            </Button>
                                        </Upload>
                                    </div>
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
