import React, { useState, useEffect} from "react";
import {
  Input,
  Button,
  Form,
  Modal,
  Select,
  Upload,
  message,
  Table,
  Checkbox,
  DatePicker,
  Space,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import "./CreateImportProduct.css";
import { useNavigate } from "react-router-dom";
import createImportProduct from "../../services/createImportProduct";
import moment from 'moment';

const CreateImportOrder = () => {
  const navigate = useNavigate(); // Khai báo useNavigate

  // Hàm xử lý khi nhấn nút Hủy
  const handleCancel = () => {
    navigate(-1); // Quay lại trang trước
  };

  const [showNewSupplierModal, setShowNewSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    id: "",
    name: "",
    address: "",
    phone: "",
  });

  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    code: "",
    name: "",
    category: "",
    image: null,
    quantity: "",
    unitPrice: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);

  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date());

  // Thêm state cho modal chỉnh sửa nhà cung cấp
  const [editSupplierModalVisible, setEditSupplierModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await createImportProduct.getAllProvider();
      const formattedProviders = data.map((provider) => ({
        id: provider.MaNCC,
        name: provider.TenNCC,
        phone: provider.SoDienThoai,
        address: provider.DiaChi,
      }));
      setSupplierData(formattedProviders);
    } catch (error) {
      message.error("Không thể tải danh sách nhà cung cấp");
      console.error("Fetch providers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await createImportProduct.getAllProducts();
      const formattedProducts = data.map((product) => ({
        code: product.MaSanPham,
        image: product.HinhAnh,
        name: product.TenSanPham,
        category: product.category.TenLoaiSanPham,
      }));
      setProductData(formattedProducts);

      // Extract unique categories from the fetched products
      const categories = [...new Set(data.map(product => product.category.TenLoaiSanPham))];
      setProductCategories(categories);
    } catch (error) {
      message.error("Không thể tải danh sách sản phẩm");
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateOrderId = () => {
    return `ORD-${Date.now()}`;
  };

  const handleSave = async () => {
    if (!orderId) {
      message.error("Vui lòng nhập mã phiếu mua hàng");
      return;
    }

    if (!isFormComplete()) {
      message.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    // Kiểm tra thông tin sản phẩm
    const invalidProducts = selectedProducts.filter(
      product => !product.quantity || !product.unitPrice
    );
    
    if (invalidProducts.length > 0) {
      message.error("Vui lòng nhập đầy đủ số lượng và đơn giá cho tất cả sản phẩm");
      return;
    }

    const currentDate = new Date().toISOString().split('T')[0];

    const orderData = {
      soPhieu: orderId,
      ngayLap: orderDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      nhaCungCap: selectedSuppliers[0].id,
      diaChi: selectedSuppliers[0].address,
      soDienThoai: selectedSuppliers[0].phone,
      chiTietSanPham: selectedProducts.map(product => ({
        maSanPham: product.code,
        soLuong: parseInt(product.quantity),
        donGia: parseFloat(product.unitPrice),
        thanhTien: parseInt(product.quantity) * parseFloat(product.unitPrice)
      }))
    };

    // Log dữ liệu theo format yêu cầu
    console.log(JSON.stringify({
      soPhieu: orderData.soPhieu,
      ngayLap: orderData.ngayLap,
      nhaCungCap: orderData.nhaCungCap,
      diaChi: orderData.diaChi,
      soDienThoai: orderData.soDienThoai,
      chiTietSanPham: orderData.chiTietSanPham
    }, null, 4));

    try {
      await createImportProduct.createOrder(orderData);
      message.success("Phiếu mua hàng đã được lưu thành công");
      navigate("/list-import-product");
    } catch (error) {
      if (error.message === 'Mã đơn hàng đã tồn tại') {
        message.error("Mã đơn hàng đã tồn tại");
      } else {
        message.error("Mã đơn hàng đã tồn tại");
      }
    }
  };

  const handleSelectSupplier = (supplier) => {
    setSelectedSuppliers((prev) => {
      if (prev.some((item) => item.id === supplier.id)) {
        return prev.filter((item) => item.id !== supplier.id);
      } else {
        return [...prev, supplier];
      }
    });
  };

  const handleRemoveSupplier = (supplierId) => {
    setSelectedSuppliers((prev) =>
      prev.filter((supplier) => supplier.id !== supplierId)
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSuppliers = supplierData.filter(
    (supplier) =>
      (supplier.id &&
        supplier.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (supplier.name &&
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNewSupplierChange = (key, value) => {
    setNewSupplier((prev) => ({ ...prev, [key]: value }));
  };

  const handleNewProductChange = (key, value) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Use the provided API for image upload
      const response = await fetch('http://localhost:3000/api/product/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      const imageUrl = data.url; // Get the URL from the response

      setNewProduct((prev) => ({ ...prev, HinhAnh: imageUrl }));
      message.success(`${file.name} đã được tải lên.`);
    } catch (error) {
      message.error(`Lỗi khi tải ảnh lên: ${error.message}`);
      console.error("Image upload error:", error);
    }
    return false; // Prevent default upload behavior
  };

  const openNewSupplierModal = () => {
    setShowNewSupplierModal(true);
  };

  const closeNewSupplierModal = () => {
    setShowNewSupplierModal(false);
  };

  const handleAddProvider = async () => {
    try {
      const providerData = {
        MaNCC: newSupplier.id,
        TenNCC: newSupplier.name,
        SoDienThoai: newSupplier.phone,
        DiaChi: newSupplier.address,
      };

      console.log('Adding provider with data:', providerData);
      const response = await createImportProduct.createProvider(providerData);
      console.log('Provider added successfully:', response);
      message.success("Thêm nhà cung cấp thành công");
      setShowNewSupplierModal(false);
      setNewSupplier({ id: "", name: "", address: "", phone: "" });
      fetchProviders();
    } catch (error) {
      message.error("Lỗi khi thêm nhà cung cấp");
      console.error("Add provider error:", error.response ? error.response.data : error.message);
    }
  };

  const saveNewSupplier = () => {
    if (
      !newSupplier.id ||
      !newSupplier.name ||
      !newSupplier.address ||
      !newSupplier.phone
    ) {
      alert("Vui lòng điền đầy đủ thông tin nhà cung cấp.");
      return;
    }

    handleAddProvider();
  };

  const openNewProductModal = async () => {
    setShowNewProductModal(true);
  };

  const closeNewProductModal = () => {
    setShowNewProductModal(false);
    setNewProduct({ code: "", name: "", category: "", image: null, quantity: "", unitPrice: "" });
  };

  const handleAddProduct = async () => {
    try {
      const productData = {
        MaSanPham: newProduct.code,
        TenSanPham: newProduct.name,
        MaLoaiSanPham: newProduct.category,
        DonGia: newProduct.unitPrice,
        SoLuong: newProduct.quantity,
        HinhAnh: newProduct.HinhAnh,
      };

      console.log('Adding product with data:', productData);
      const response = await createImportProduct.createProduct(productData);
      console.log('Product added successfully:', response);
      message.success("Thêm sản phẩm thành công");
      setShowNewProductModal(false);
      setNewProduct({ code: "", name: "", category: "", HinhAnh: null, quantity: "", unitPrice: "" });
      fetchProducts();
    } catch (error) {
      message.error("Lỗi khi thêm sản phẩm");
      console.error("Add product error:", error.response ? error.response.data : error.message);
    }
  };

  const saveNewProduct = () => {
    if (!newProduct.code || !newProduct.name || !newProduct.category || !newProduct.quantity || !newProduct.unitPrice) {
      alert("Vui lòng điền đầy đủ thông tin sản phẩm.");
      return;
    }

    handleAddProduct();
  };

  const handleProductSearch = (e) => {
    setProductSearchTerm(e.target.value);
  };

  const handleSelectProduct = async (product) => {
    try {
      setSelectedProducts((prev) => {
        if (prev.some((item) => item.code === product.code)) {
          return prev.filter((item) => item.code !== product.code);
        } else {
          try {
            createImportProduct.updateProductStatus(product.code);
          } catch (error) {
            console.error('Error updating product status:', error);
            message.error('Không thể cập nhật trạng thái sản phẩm');
          }
          return [...prev, product];
        }
      });
    } catch (error) {
      console.error('Error in handleSelectProduct:', error);
      message.error('Có lỗi xảy ra khi chọn sản phẩm');
    }
  };

  const handleRemoveProduct = async (productCode) => {
    try {
      await createImportProduct.updateProductStatus(productCode, false);
      setSelectedProducts((prev) =>
        prev.filter((product) => product.code !== productCode)
      );
    } catch (error) {
      console.error('Error removing product:', error);
      message.error('Không thể xóa sản phẩm');
    }
  };

  const handleProductInfoChange = (productCode, key, value) => {
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.code === productCode ? { ...product, [key]: value } : product
      )
    );
  };

  const filteredProducts = productData.filter(
    (product) =>
      product.code.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const supplierColumns = [
    {
      title: 'Mã NCC',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên nhà cung cấp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type={selectedSuppliers.some(supplier => supplier.id === record.id) ? 'default' : 'primary'}
            onClick={() => {
              setSelectedSuppliers([record]);
              setSearchTerm('');
            }}
          >
            Chọn
          </Button>
          <Button
            type="link"
            onClick={() => {
              setEditingSupplier(record);
              setEditSupplierModalVisible(true);
            }}
          >
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  const selectedSupplierColumns = [
    { title: "Mã nhà cung cấp", dataIndex: "id", key: "id" },
    { title: "Tên nhà cung cấp", dataIndex: "name", key: "name" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    {
      title: 'Thao tác',
      key: 'action',
      render: () => (
        <Button
          danger
          onClick={() => setSelectedSuppliers([])}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const productColumns = [
    {
      title: (
        <Checkbox
          indeterminate={
            selectedProducts.length > 0 &&
            selectedProducts.length < productData.length
          }
          checked={selectedProducts.length === productData.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedProducts(productData);
            } else {
              setSelectedProducts([]);
            }
          }}
        />
      ),
      key: "select",
      render: (text, product) => (
        <Checkbox
          checked={selectedProducts.some((item) => item.code === product.code)}
          onChange={() => handleSelectProduct(product)}
        />
      ),
    },
    { title: "Mã sản phẩm", dataIndex: "code", key: "code" },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <a
          href={
            text || "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={
              text ||
              "https://cf.shopee.vn/file/ee4a29902c4a53dd211e6563a1b66d8d"
            }
            alt="Product"
            style={{ width: 50, height: 50 }}
          />
        </a>
      ),
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Loại sản phẩm", dataIndex: "category", key: "category" },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            if (selectedProducts.some(product => product.code === record.code)) {
              message.warning('Sản phẩm này đã được chọn!');
            } else {
              setSelectedProducts(prev => [...prev, { ...record, quantity: 1, unitPrice: 0 }]);
            }
            setProductSearchTerm(''); // Reset thanh tìm kiếm sau khi chọn
          }}
        >
          Chọn
        </Button>
      ),
    },
  ];

  const selectedProductColumns = [
    {
      title: (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => setSelectedProducts([])}
        />
      ),
      key: "action",
      render: (text, product) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(product.code)}
        />
      ),
    },
    { title: "Mã sản phẩm", dataIndex: "code", key: "code" },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (text) => (
        <a
          href={
            text
          }
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={
              text
            }
            alt="Product"
            style={{ width: 50, height: 50 }}
          />
        </a>
      ),
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Loại sản phẩm", dataIndex: "category", key: "category" },
    {
      title: "Số lượng",
      key: "quantity",
      render: (text, product) => (
        <Input
          type="number"
          min="1"
          value={product.quantity || ""}
          onChange={(e) =>
            handleProductInfoChange(product.code, "quantity", e.target.value)
          }
          placeholder="Nhập số lượng"
        />
      ),
    },
    {
      title: "Đơn giá",
      key: "unitPrice",
      render: (text, product) => (
        <Input
          type="number"
          min="0"
          value={product.unitPrice || ""}
          onChange={(e) =>
            handleProductInfoChange(product.code, "unitPrice", e.target.value)
          }
          placeholder="Nhập đơn giá"
        />
      ),
    },
  ];

  const isFormComplete = () => {
    if (selectedSuppliers.length === 0) {
      return false;
    }

    if (selectedProducts.length === 0) {
      return false;
    }

    // Kiểm tra xem tất cả sản phẩm đã có số lượng và đơn giá chưa
    const allProductsComplete = selectedProducts.every(
      product => product.quantity && product.unitPrice
    );

    return allProductsComplete;
  };

  const calculateTotalPrice = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = product.quantity || 0;
      const unitPrice = product.unitPrice || 0;
      return total + (quantity * unitPrice);
    }, 0);
  };

  // Thêm hàm xử lý chỉnh sửa nhà cung cấp
  const handleUpdateSupplier = async () => {
    try {
      if (!editingSupplier?.name || !editingSupplier?.phone || !editingSupplier?.address) {
        message.error('Vui lòng điền đầy đủ thông tin nhà cung cấp');
        return;
      }

      // Format dữ liệu đúng với yêu cầu của API
      const updateData = {
        TenNCC: editingSupplier.name,
        SoDienThoai: editingSupplier.phone,
        DiaChi: editingSupplier.address
      };

      await createImportProduct.updateProvider(editingSupplier.id, updateData);

      // Cập nhật lại danh sách nhà cung cấp
      await fetchProviders();

      // Cập nhật nhà cung cấp đã chọn nếu đang được chọn
      if (selectedSuppliers.some(s => s.id === editingSupplier.id)) {
        setSelectedSuppliers([{
          id: editingSupplier.id,
          name: editingSupplier.name,
          phone: editingSupplier.phone,
          address: editingSupplier.address
        }]);
      }

      message.success('Cập nhật thông tin nhà cung cấp thành công');
      setEditSupplierModalVisible(false);
      setEditingSupplier(null);
    } catch (error) {
      message.error('Lỗi khi cập nhật thông tin nhà cung cấp');
      console.error('Update supplier error:', error);
    }
  };

  // Thêm hàm kiểm tra số điện thoại
  const validatePhoneNumber = (phone) => {
    // Kiểm tra độ dài và chỉ chứa số
    return /^\d*$/.test(phone) && phone.length <= 10;
  };

  return (
    <div className="create-import-order-container1">
    <div className="create-import-order-container">
      <header className="header">
        <h2>Tạo phiếu mua hàng</h2>
      </header>

      <div className="form-container">
        <div className="form-section">
          <h3>Thông tin phiếu</h3>
          <Form.Item 
            label="Mã phiếu mua hàng" 
            required
          >
            <Input
              placeholder="Nhập mã phiếu"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
              }}
            />
          </Form.Item>

          {/* Add Date Picker */}
          <Form.Item 
            label="Ngày lập phiếu" 
            required
          >
            <DatePicker
              style={{ width: '100%' }}
              value={moment(orderDate)}
              onChange={(date) => setOrderDate(date ? date.toDate() : new Date())}
              format="DD/MM/YYYY"
            />
          </Form.Item>
        </div>

        {/* Supplier Section */}
        <div className="form-section">
          <h3>Nhà cung cấp</h3>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder="Tìm kiếm nhà cung cấp theo mã hoặc tên"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button type="link" onClick={openNewSupplierModal}>
              Thêm nhà cung cấp mới
            </Button>
          </div>
          {searchTerm && (
            <Table
              loading={loading}
              bordered
              dataSource={supplierData.filter(
                (supplier) =>
                  supplier.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              columns={supplierColumns}
              rowKey="id"
              style={{ marginTop: "16px" }}
            />
          )}
          <div style={{ marginTop: "16px" }}>
            <h4>Nhà cung cấp đã chọn:</h4>
            <Table
              bordered
              dataSource={selectedSuppliers}
              columns={selectedSupplierColumns}
              rowKey="id"
            />
          </div>
        </div>

        {/* Modal for adding new supplier */}
        <Modal
          title="Thêm nhà cung cấp mới"
          visible={showNewSupplierModal}
          onCancel={closeNewSupplierModal}
          onOk={saveNewSupplier}
          cancelText="Hủy"
          okText="Tạo mới"
        >
          <Form layout="vertical">
            <Form.Item label="Mã nhà cung cấp" required>
              <Input
                value={newSupplier.id}
                onChange={(e) => handleNewSupplierChange("id", e.target.value)}
                placeholder="Nhập mã nhà cung cấp"
              />
            </Form.Item>
            <Form.Item label="Tên nhà cung cấp" required>
              <Input
                value={newSupplier.name}
                onChange={(e) =>
                  handleNewSupplierChange("name", e.target.value)
                }
                placeholder="Nhập tên nhà cung cấp"
              />
            </Form.Item>
            <Form.Item label="Địa chỉ" required>
              <Input
                value={newSupplier.address}
                onChange={(e) =>
                  handleNewSupplierChange("address", e.target.value)
                }
                placeholder="Nhập địa chỉ nhà cung cấp"
              />
            </Form.Item>
            <Form.Item label="Số điện thoại" required>
              <Input
                value={newSupplier.phone}
                onChange={(e) => {
                  const newPhone = e.target.value;
                  // Kiểm tra nếu input không phải là số thì không cho nhập
                  if (!/^\d*$/.test(newPhone)) {
                    message.error('Vui lòng chỉ nhập số');
                    return;
                  }
                  // Kiểm tra độ dài
                  if (!validatePhoneNumber(newPhone)) {
                    message.error('Số điện thoại không được vượt quá 10 số');
                    return;
                  }
                  handleNewSupplierChange("phone", newPhone);
                }}
                maxLength={10}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal for editing supplier */}
        <Modal
          title="Chỉnh sửa thông tin nhà cung cấp"
          visible={editSupplierModalVisible}
          onOk={handleUpdateSupplier}
          onCancel={() => {
            setEditSupplierModalVisible(false);
            setEditingSupplier(null);
          }}
          okText="Lưu thay đổi"
          cancelText="Hủy"
        >
          <Form layout="vertical">
            <Form.Item label="Mã nhà cung cấp">
              <Input value={editingSupplier?.id} disabled />
            </Form.Item>
            <Form.Item label="Tên nhà cung cấp" required>
              <Input
                value={editingSupplier?.name}
                onChange={(e) => setEditingSupplier(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                placeholder="Nhập tên nhà cung cấp"
              />
            </Form.Item>
            <Form.Item label="Số điện thoại" required>
              <Input
                value={editingSupplier?.phone}
                onChange={(e) => {
                  const newPhone = e.target.value;
                  // Kiểm tra nếu input không phải là số thì không cho nhập
                  if (!/^\d*$/.test(newPhone)) {
                    message.error('Vui lòng chỉ nhập số');
                    return;
                  }
                  // Kiểm tra độ dài
                  if (!validatePhoneNumber(newPhone)) {
                    message.error('Số điện thoại không được vượt quá 10 số');
                    return;
                  }
                  setEditingSupplier(prev => ({
                    ...prev,
                    phone: newPhone
                  }));
                }}
                maxLength={10}
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>
            <Form.Item label="Địa chỉ" required>
              <Input
                value={editingSupplier?.address}
                onChange={(e) => setEditingSupplier(prev => ({
                  ...prev,
                  address: e.target.value
                }))}
                placeholder="Nhập địa chỉ"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Product Section */}
        <div className="form-section">
          <h3>Sản phẩm</h3>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder="Tìm kiếm sản phẩm theo mã hoặc tên"
              value={productSearchTerm}
              onChange={handleProductSearch}
            />
            <Button type="link" onClick={openNewProductModal}>
              Thêm sản phẩm mới
            </Button>
          </div>
          {productSearchTerm && (
            <Table
              bordered
              dataSource={filteredProducts}
              columns={productColumns}
              rowKey="code"
            />
          )}
          <div style={{ marginTop: "16px" }}>
            <h4>Sản phẩm đã chọn:</h4>
            <Table
              bordered
              dataSource={selectedProducts}
              columns={selectedProductColumns}
              rowKey="code"
            />
          </div>
          <div style={{ marginTop: "16px", textAlign: "right" }}>
            <h4>Tổng đơn giá: {calculateTotalPrice().toLocaleString()} VND</h4>
          </div>
        </div>

        {/* Modal for adding new product */}
        <Modal
          title="Thêm sản phẩm mới"
          visible={showNewProductModal}
          onCancel={closeNewProductModal}
          onOk={saveNewProduct}
          cancelText="Hủy"
          okText="Tạo mới"
        >
          <Form layout="vertical">
            <Form.Item label="Mã sản phẩm" required>
              <Input
                value={newProduct.code}
                onChange={(e) => handleNewProductChange("code", e.target.value)}
                placeholder="Nhập mã sản phẩm"
              />
            </Form.Item>
            <Form.Item label="Tên sản phẩm" required>
              <Input
                value={newProduct.name}
                onChange={(e) => handleNewProductChange("name", e.target.value)}
                placeholder="Nhập tên sản phẩm"
              />
            </Form.Item>
            <Form.Item label="Loại sản phẩm" required>
              <Select
                onChange={(value) => handleNewProductChange("category", value)}
                placeholder="Chọn loại sản phẩm"
              >
                {productCategories.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Tải hình ảnh">
              <Upload
                beforeUpload={handleImageUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        <div
          className="form-actions"
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <Button danger onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            type="primary"
            disabled={!isFormComplete()}
            onClick={handleSave}
            style={{
              backgroundColor: isFormComplete() ? "#1890ff" : "#d9d9d9",
            }}
          >
            Lưu tạo mới
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CreateImportOrder;
