import React, { useState, useEffect } from "react";
import { Select, Input, Button, Space, message } from "antd";
import { UserOutlined } from '@ant-design/icons';
import CustomerSearchModal from "../Modal_timkiemkhachhang/Modal_timkiemkhachhang";
import ProductSearchModal from "../Modal_timkiemsanpham/ProductSearchModal";
import "./AddOrderModal.css";
import axios from 'axios';
import { getOrderById, updateOrder } from '../../../services/Orderproduct';
import productService from '../../../services/productService';

const { Option } = Select;

const EditOrderModal = ({ isVisible, onClose, onSave, initialData, title = "Sửa đơn hàng" }) => {
  // Add products state
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Trạng thái tìm kiếm
  const [filteredProducts, setFilteredProducts] = useState([]); // Sản phẩm được lọc
  const [cart, setCart] = useState([]); // Giỏ hàng
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [quantities, setQuantities] = useState({}); // Thêm state để lưu số lượng
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [deletedDetails, setDeletedDetails] = useState([]); // Add state to track deleted details
  const [invoiceNumber, setInvoiceNumber] = useState(''); // Add new state for invoice number
  const [newProducts, setNewProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  
  // Load initial data when modal opens
  useEffect(() => {
    const fetchOrderData = async () => {
      if (initialData && isVisible) {
        try {
          // Fetch tất cả dữ liệu cần thiết một lần
          const [orderResponse, productsRes, categoriesRes, unitsRes] = await Promise.all([
            getOrderById(initialData.SoPhieuBH),
            axios.get('http://localhost:3000/api/product/get-all'),
            axios.get('http://localhost:3000/api/category/get-all'),
            axios.get('http://localhost:3000/api/unit/get-all')
          ]);

          // 1. Tạo mapping cho đơn vị tính
          const unitsMap = {};
          const units = Array.isArray(unitsRes.data) ? unitsRes.data : 
                      (unitsRes.data.data ? unitsRes.data.data : []);
          
          units.forEach(unit => {
            if (unit && unit.MaDVTinh) {
              unitsMap[unit.MaDVTinh] = unit.TenDVTinh;
            }
          });

          // 2. Tạo mapping cho loại sản phẩm
          const categoryMap = {};
          categoriesRes.data.forEach(cat => {
            categoryMap[cat.MaLoaiSanPham] = {
              TenLoaiSanPham: cat.TenLoaiSanPham,
              PhanTramLoiNhuan: cat.PhanTramLoiNhuan,
              MaDVTinh: cat.MaDVTinh
            };
          });

          // 3. Map tất cả sản phẩm với đơn vị tính (cho ProductSearchModal)
          const productsWithDetails = productsRes.data
            .filter(product => !product.isDelete)
            .map(product => {
              const category = categoryMap[product.MaLoaiSanPham] || {};
              const maDVTinh = category.MaDVTinh;
              const tenDVTinh = unitsMap[maDVTinh];

              return {
                id: product.MaSanPham,
                name: product.TenSanPham,
                price: `${product.DonGia?.toLocaleString('vi-VN')} VNĐ`,
                rawPrice: product.DonGia,
                image: product.HinhAnh || 'default-image.png',
                MaLoaiSanPham: product.MaLoaiSanPham,
                TenLoaiSanPham: category.TenLoaiSanPham,
                DonGia: product.DonGia,
                stock: product.SoLuong || 0,
                PhanTramLoiNhuan: category.PhanTramLoiNhuan || 0,
                MaDVTinh: maDVTinh,
                TenDVTinh: tenDVTinh || 'N/A',
                categoryName: category.TenLoaiSanPham || 'Chưa phân loại'
              };
            });

          setProducts(productsWithDetails);

          if (orderResponse) {
            // Set invoice number
            setInvoiceNumber(orderResponse.SoPhieuBH);
            
            // Set order date
            setOrderDate(orderResponse.NgayLap);
            
            // Set customer info
            setSelectedCustomer({
              id: orderResponse.MaKhachHang,
              name: orderResponse.customer?.TenKhachHang || '',
              phone: orderResponse.customer?.SoDT || ''
            });

            // Set cart items with all details including unit
            if (Array.isArray(orderResponse.details)) {
              const cartItems = orderResponse.details.map(detail => {
                // Tìm sản phẩm tương ứng trong productsWithDetails
                const productWithDetails = productsWithDetails.find(p => p.id === detail.MaSanPham);

                return {
                  id: detail.MaSanPham,
                  name: detail.TenSanPham,
                  MaChiTietBH: detail.MaChiTietBH,
                  rawPrice: productWithDetails?.DonGia || 0,
                  price: `${new Intl.NumberFormat('vi-VN').format(productWithDetails?.DonGia || 0)} đ`,
                  PhanTramLoiNhuan: productWithDetails?.PhanTramLoiNhuan || 0,
                  quantity: detail.SoLuong,
                  ThanhTien: detail.ThanhTien,
                  MaLoaiSanPham: productWithDetails?.MaLoaiSanPham,
                  TenDVTinh: productWithDetails?.TenDVTinh || 'N/A',
                  stock: productWithDetails?.stock || 0,
                  image: productWithDetails?.image || 'default-image.png'
                };
              });

              console.log('Cart items with details:', cartItems);
              setCart(cartItems);

              // Set quantities
              const initQuantities = {};
              orderResponse.details.forEach(detail => {
                initQuantities[detail.MaSanPham] = detail.SoLuong;
              });
              setQuantities(initQuantities);
            }
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          message.error('Có lỗi khi tải thông tin');
        }
      }
    };

    fetchOrderData();
  }, [initialData, isVisible]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isVisible) {
      setCart([]);
      setQuantities({});
      setSelectedCustomer(null);
      setOrderDate(new Date().toISOString().split('T')[0]);
    }
  }, [isVisible]);

  // Cập nhật handleProductSelect để bao gồm đơn vị tính
  const handleProductSelect = (product) => {
    console.log('Selected product:', product);

    // Tìm sản phẩm trong danh sách products đã fetch
    const productWithDetails = products.find(p => p.id === product.id);
    if (!productWithDetails) {
      message.error('Không tìm thấy thông tin sản phẩm');
      return;
    }

    if (cart.some((item) => item.id === product.id)) {
      setQuantities(prev => {
        const currentQty = prev[product.id] || 1;
        const newQty = currentQty + 1;
        
        if (newQty > productWithDetails.stock) {
          message.warning(`Số lượng không thể vượt quá số lượng tồn kho (${productWithDetails.stock})`);
          return prev;
        }
        
        return {
          ...prev,
          [product.id]: newQty
        };
      });
    } else {
      setNewProducts(prev => [...prev, product.id]);

      const newProduct = {
        ...productWithDetails, // Lấy tất cả thông tin từ sản phẩm đã fetch
        quantity: 1
      };

      console.log('New product to cart:', newProduct);
      setCart(prevCart => [...prevCart, newProduct]);
      setQuantities(prev => ({
        ...prev,
        [product.id]: 1
      }));
    }
    
    setIsProductModalVisible(false);
  };

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product) => {
    if (!cart.some((item) => item.id === product.id)) {
      setCart((prevCart) => [...prevCart, product]);
    }
    setSearchTerm(""); // Reset thanh tìm kiếm về rỗng
    setFilteredProducts([]); // Reset danh sách sản phẩm
  };
  const handleQuantityChange = (productId, change) => {
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;

    setQuantities(prev => {
      const currentQty = prev[productId] || 1;
      const newQty = currentQty + change;

      // Kiểm tra số lượng tối thiểu
      if (newQty < 1) return prev;

      // Kiểm tra số lượng tồn kho
      if (newQty > cartItem.stock) {
        message.warning(`Số lượng không thể vượt quá số lượng tồn kho (${cartItem.stock})`);
        return prev;
      }

      // Cập nhật số lượng mới
      return { ...prev, [productId]: newQty };
    });
  };

  // Update removeFromCart function
  const removeFromCart = (productId) => {
    try {
      // Tìm sản phẩm cần xóa
      const productToRemove = cart.find(item => item.id === productId);
      console.log('Product to remove:', productToRemove);

      if (!productToRemove) {
        console.log('Product not found in cart');
        return;
      }

      // Nếu là sản phẩm từ đơn hàng gốc (có MaChiTietBH)
      if (productToRemove.MaChiTietBH) {
        const deletedProduct = {
          MaChiTietBH: productToRemove.MaChiTietBH,
          MaSanPham: productId,
          SoLuong: quantities[productId] || 1
        };

        // Cập nhật danh sách sản phẩm đã xóa
        setDeletedProducts(prevDeleted => {
          const newDeletedProducts = [...prevDeleted, deletedProduct];
          console.log('Updated deletedProducts:', newDeletedProducts);
          return newDeletedProducts;
        });
      }

      // Cập nhật giỏ hàng bằng cách tạo một mảng mới không có sản phẩm bị xóa
      setCart(prevCart => {
        const updatedCart = prevCart.filter(item => item.id !== productId);
        console.log('Updated cart:', updatedCart);
        return updatedCart;
      });

      // Cập nhật số lượng
      setQuantities(prev => {
        const newQuantities = { ...prev };
        delete newQuantities[productId];
        console.log('Updated quantities:', newQuantities);
        return newQuantities;
      });

    } catch (error) {
      console.error('Error in removeFromCart:', error);
      message.error('Có lỗi khi xóa sản phẩm');
    }
  };

  // Format ngày tháng khi gửi lên server
  const formatDateForServer = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  // Add function to calculate selling price with profit margin
  const calculateSellingPrice = (basePrice, profitMargin) => {
    const margin = (profitMargin || 0) / 100;
    const finalPrice = basePrice * (1 + margin);
    return parseFloat(finalPrice.toFixed(2)); // Ensure 2 decimal places
  };

  // Add the single calculateTotal function
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const quantity = quantities[item.id] || 1;
      const sellingPrice = calculateSellingPrice(item.rawPrice, item.PhanTramLoiNhuan);
      return total + (quantity * sellingPrice);
    }, 0);
  };

// Hàm format ngày tháng
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Update handleUpdateOrder function
const handleUpdateOrder = async () => {
  try {
    if (!selectedCustomer?.id || !orderDate || cart.length === 0 || !invoiceNumber) {
      message.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    // Format dữ liệu theo cấu trúc backend yêu cầu
    const requestData = {
      updateDetails: [
        {
          NgayLap: formatDate(orderDate),
          MaKH: selectedCustomer.id
        }
      ],
      addDetails: cart
        .filter(item => !item.MaChiTietBH)  // Chỉ lấy sản phẩm mới thêm vào
        .map(item => {
          const quantity = parseInt(quantities[item.id]) || 1;
          const price = Number(calculateSellingPrice(
            parseFloat(item.rawPrice),
            parseFloat(item.PhanTramLoiNhuan)
          ));
          return {
            MaSanPham: item.id,
            SoLuong: quantity,
            DonGiaBanRa: price,
            ThanhTien: quantity * price
          };
        }),
      deleteDetails: deletedProducts  // Sử dụng danh sách sản phẩm đã xóa
    };

    // In ra console theo format yêu cầu
    console.log(JSON.stringify({
      updateDetails: requestData.updateDetails,
      addDetails: requestData.addDetails,
      deleteDetails: requestData.deleteDetails
    }, null, 2));

    const response = await updateOrder(invoiceNumber, requestData);
    if (response) {
      message.success('Cập nhật phiếu bán hàng thành công!');
      onSave && onSave();
      onClose();
    }
  } catch (error) {
    console.error('Error in handleUpdateOrder:', error);
    message.error('Có lỗi xảy ra khi cập nhật phiếu bán hàng: ' + error.message);
  }
};

// Add useEffect to handle cart updates
useEffect(() => {
    if (initialData?.details && Array.isArray(initialData.details)) {
        const cartItems = initialData.details.map(detail => ({
            id: detail.MaSanPham,
            name: detail.TenSanPham,
            image: detail.HinhAnh || 'default-image.png',
            price: `${new Intl.NumberFormat('vi-VN').format(detail.DonGiaBanRa)} đ`,
            rawPrice: detail.DonGiaBanRa,
            PhanTramLoiNhuan: detail.PhanTramLoiNhuan || 0,
            quantity: detail.SoLuong,
            MaChiTietBH: detail.MaChiTietBH
        }));

        setCart(cartItems);

        const initQuantities = {};
        initialData.details.forEach(detail => {
            initQuantities[detail.MaSanPham] = detail.SoLuong;
        });
        setQuantities(initQuantities);
    }
}, [initialData]);

  if (!isVisible) return null;
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer({
      id: customer.id,
      name: customer.name,
      phone: customer.phone
    });
    setIsCustomerModalVisible(false);
  };

  return (
    <div className="tc1">
      <div className="overlay1">
        <div className="modal1">
          <div className="modal-content">
            <h3 className="modal-title">{title}</h3>
            <div className="modal-body">
              {/* Cột bên trái: Thông tin */}
              <div className="modal-column left-column">
                {/* Add Invoice Number input field */}
                <div className="header-row">
                  <label>Mã phiếu bán hàng</label>
                </div>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  style={{
                    marginBottom: '16px',
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    width: "100%",
                    height: "40px",
                  }}
                  disabled // Make it read-only since it's an identifier
                />
                <div className="header-row">
                  <label>Thông tin khách hàng </label>
                  <div className="toggle-container">
                  </div>
                </div>
                <form>
                  <div className="custom-select-container">
                  <Button
                      type="primary"
                      className="custom-inputt"
                      onClick={() => setIsCustomerModalVisible(true)}
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        marginBottom: selectedCustomer ? '16px' : '0'
                      }}
                    >
                      Tìm kiếm khách hàng
                    </Button>
                    {selectedCustomer && (
                        <div style={{
                          padding: '12px',
                          border: '1px solid #e6e9f0',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9ff'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <UserOutlined style={{ fontSize: '24px' }} />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{selectedCustomer.name}</div>
                              <div style={{ color: '#666' }}>SĐT: {selectedCustomer.phone}</div>
                              <div style={{ color: '#666' }}>Địa chỉ: {selectedCustomer.address}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      <CustomerSearchModal
                        isVisible={isCustomerModalVisible}
                        onCancel={() => setIsCustomerModalVisible(false)}
                        title={"Tìm kiếm khách hàng"}
                        onConfirm={handleCustomerSelect}
                      />
                  </div>
                  <br />
                  <div style={{ display: "flex", gap: "16px" }} className="row3">
                  </div>
                  <br />
                  <label>Ngày tháng năm đặt hàng</label>
                  <br />
                  <div className="days" style={{ display: "flex", gap: "16px" }}>
                    <Input
                      type="date"
                      value={orderDate}
                      onChange={(e) => setOrderDate(e.target.value)}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        width: "100%",
                        height: "40px",
                      }}
                    />
                  </div>
                </form>
              </div>

              {/* Cột bên phải: Chọn sản phẩm */}
              {/* Cột bên phải: Chọn sản phẩm và giỏ hàng */}
              <div className="modal-column right-column">
                <h3>Sản phẩm</h3>
                <Button
                  type="primary"
                  onClick={() => setIsProductModalVisible(true)}
                  style={{ width: "100%", marginTop: "-5px", borderRadius: '8px',height: '40px' }}
                >
                  Chọn sản phẩm
                </Button>
                <ProductSearchModal
                  isVisible={isProductModalVisible}
                  onCancel={() => setIsProductModalVisible(false)}
                  onConfirm={handleProductSelect}
                  cart={cart} // Pass the cart prop
                  isProductPage={false} // Explicitly set to false for editing orders
                />
                {/* Hiển thị giỏ hàng */}
                <div className="cart-container" style={{
                  maxHeight: '400px',  // Giới hạn chiều cao tối đa
                  overflowY: 'auto',   // Thêm thanh cuộn dọc khi nội dung vượt quá
                  paddingRight: '10px', // Thêm padding để tránh nội dung bị che bởi thanh cuộn
                  marginBottom: '20px'  // Thêm khoảng cách với footer
                }}>
                  <h3>Giỏ hàng</h3>
                  {cart.length > 0 ? (
                    <>
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="cart-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: 10,
                            padding: "10px",
                            backgroundColor: "#f8f9ff",
                            borderRadius: "8px"
                          }}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              marginRight: "10px",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <strong>{item.name}</strong>
                            <div style={{ color: "gray" }}>
                              Đơn giá gốc: {item.price}
                            </div>
                            <div style={{ color: "gray" }}>
                              Lợi nhuận: {item.PhanTramLoiNhuan}%
                            </div>
                            <div style={{ color: "blue" }}>
                              Thành tiền: {new Intl.NumberFormat('vi-VN').format(
                                calculateSellingPrice(item.rawPrice, item.PhanTramLoiNhuan) * (quantities[item.id] || 1)
                              )} VNĐ
                            </div>
                            <div style={{ color: "gray" }}>
                              Đơn vị tính: {item.TenDVTinh || 'N/A'}
                            </div>
                            <div style={{ color: "gray" }}>
                              Số lượng: {quantities[item.id] || 1} {item.TenDVTinh || 'N/A'}
                            </div>
                          </div>

                          {/* Chỉ hiển thị nút điều chỉnh số lượng cho sản phẩm mới */}
                          {!item.MaChiTietBH && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '15px' }}>
                              <Button 
                                size="small"
                                onClick={() => handleQuantityChange(item.id, -1)}
                                disabled={quantities[item.id] <= 1}
                              >
                                -
                              </Button>
                              <span style={{ 
                                padding: '4px 8px',
                                backgroundColor: '#e6f7ff',
                                borderRadius: '4px',
                                minWidth: '40px',
                                textAlign: 'center'
                              }}>
                                {quantities[item.id] || 1}
                              </span>
                              <Button
                                size="small"
                                onClick={() => handleQuantityChange(item.id, 1)}
                                disabled={quantities[item.id] >= item.stock}
                              >
                                +
                              </Button>
                            </div>
                          )}

                          <button
                            onClick={() => removeFromCart(item.id)}
                            style={{
                              backgroundColor: "#ff4d4f",
                              color: "#fff",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      ))}
                      <div style={{
                        marginTop: "16px",
                        padding: "10px",
                        borderTop: "1px solid #eee",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}>
                        <strong>Tổng cộng:</strong>
                        <span style={{ fontSize: "18px", color: "#1890ff" }}>
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(calculateTotal())}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p>Chưa có sản phẩm trong giỏ hàng</p>
                  )}
                </div>
                        
                        {/* Di chuyển modal-footer vào đây */}
                        <div className="modal-footer">
                          <button className="cancel-btn" onClick={onClose}>
                            Hủy
                          </button>
                          <button className="submit-btn" onClick={handleUpdateOrder}>
                            Cập nhật
                          </button>
                        </div>
                      </div>
                    </div>  
                  </div>
                </div>
              </div>
          </div>
  );
};


export default EditOrderModal;
