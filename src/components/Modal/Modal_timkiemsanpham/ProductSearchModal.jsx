import React, { useState, useEffect } from "react";
import { Modal, Input, Table, Button, message } from "antd";
import axios from 'axios';
import "./ProductSearchModal.css";
import productService from '../../../services/productService';
import { getUnitById } from "../../../services/UnitTypeService";

const ProductSearchModal = ({ 
  isVisible, 
  onCancel, 
  onConfirm, 
  isProductPage = false, // Add default value
  cart = [] 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [quantities, setQuantities] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      fetchProducts();
    }
  }, [isVisible]); // Remove isProductPage from dependency array since it's now properly defined

  const fetchProducts = async () => {
    try {
        setLoading(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
            axios.get('http://localhost:3000/api/product/get-all'),
            axios.get('http://localhost:3000/api/category/get-all')
        ]);

        const categoryMap = {};
        categoriesResponse.data.forEach(cat => {
            categoryMap[cat.MaLoaiSanPham] = {
                TenLoaiSanPham: cat.TenLoaiSanPham,
                PhanTramLoiNhuan: cat.PhanTramLoiNhuan,
                MaDVTinh: cat.MaDVTinh,
                TenDVTinh: cat.TenDVTinh
            };
        });

        // Filter out products with isDelete=true AND stock=0
        const formattedProducts = productsResponse.data
            .filter(product => !product.isDelete && product.SoLuong > 0) // Thêm điều kiện SoLuong > 0
            .map(product => {
                const category = categoryMap[product.MaLoaiSanPham];
                return {
                    id: product.MaSanPham,
                    name: product.TenSanPham,
                    price: `${product.DonGia?.toLocaleString('vi-VN')} VNĐ`,
                    rawPrice: product.DonGia,
                    image: product.HinhAnh || 'default-image.png',
                    PhanTramLoiNhuan: parseFloat(category?.PhanTramLoiNhuan || 0),
                    stock: product.SoLuong || 0,
                    availableStock: product.SoLuong || 0,
                    categoryName: category?.TenLoaiSanPham || 'Chưa phân loại',
                    MaDVTinh: category?.MaDVTinh,
                    TenDVTinh: category?.TenDVTinh || 'N/A'
                };
            });

        setProducts(formattedProducts);
    } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu sản phẩm');
    } finally {
        setLoading(false);
    }
};

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableStock = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    const currentQty = cartItem ? (quantities[productId] || 1) : 0;
    const product = products.find(p => p.id === productId);
    return product ? product.stock - currentQty : 0;
  };

  const handleQuantityChange = (productId, change) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Calculate available stock considering current cart
    const cartItem = cart.find(item => item.id === productId);
    const cartQuantity = cartItem ? cartItem.quantity || 0 : 0;
    const availableStock = product.stock - cartQuantity;

    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = currentQty + change;

      if (newQty < 1) return prev;
      if (newQty > availableStock) {
        message.warning(`Số lượng không thể vượt quá số lượng tồn kho (${availableStock})`);
        return prev;
      }

      return { ...prev, [productId]: newQty };
    });
  };

  const handleProductConfirm = (product) => {
    const selectedQuantity = quantities[product.id] || 1;
    const availableStock = product.stock - (cart.find(item => item.id === product.id)?.quantity || 0);

    if (selectedQuantity > availableStock) {
      message.error('Số lượng vượt quá tồn kho hiện có!');
      return;
    }

    const updatedProduct = {
      ...product,
      quantity: selectedQuantity,
      availableStock: availableStock - selectedQuantity
    };

    onConfirm(updatedProduct);
    setQuantities(prev => ({ ...prev, [product.id]: selectedQuantity }));
    onCancel();
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      render: (image) => (
        <img
          src={image}
          alt="Sản phẩm"
          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
        />
      ),
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
    },
    {
      title: 'Giá',
      dataIndex: 'price',
    },
    {
      title: '',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleProductConfirm(record)}
        >
          Chọn
        </Button>
      ),
    },
  ];

  return (
    <div className="modal-for-product1">
    <Modal
      title="Chọn sản phẩm"
      visible={isVisible} // dùng visible cho AntD 4 hoặc cũ hơn
      onCancel={onCancel}
      footer={null}
      width={1000}
    >
      <Input.Search
        placeholder="Tìm kiếm sản phẩm..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", marginBottom: 16 }}
      />
      <Table
        loading={loading}
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        pagination={false}
        scroll={{ y: 300 }}
      />
    </Modal>
    </div>
  );
};

export default ProductSearchModal;