import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, DatePicker, Space, Tag, Modal, message } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import AddOrderModal from "../../components/Modal/Modal_phieubanhang/AddOrderModal";
import EditOrderModal from "../../components/Modal/Modal_phieubanhang/EditOrderModal"; // Add this import
import "./OrderProductPage.css";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";
import { getAllOrders, deleteOrder } from "../../services/Orderproduct";

const calculateSellingPrice = (basePrice, profitMargin) => {
  const margin = (profitMargin || 0) / 100;
  const finalPrice = basePrice * (1 + margin);
  return parseFloat(finalPrice.toFixed(2));
};

const calculateOrderTotal = (orderDetails) => {
  if (!orderDetails || !Array.isArray(orderDetails)) return 0;
  
  return orderDetails.reduce((total, detail) => {
    const quantity = detail.SoLuong || 0;
    const basePrice = detail.DonGiaBanRa || 0;
    
    // Get profit margin from the product's category
    const profitMargin = detail.sanpham?.loaisanpham?.PhanTramLoiNhuan || 0;
    
    // Calculate selling price with profit margin
    const sellingPrice = calculateSellingPrice(basePrice, profitMargin);
    const itemTotal = quantity * sellingPrice;
    
    return total + itemTotal;
  }, 0);
};

const OrderProductPage = () => {
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const [state, setState] = useState({
    filters: {
      orderType: "Tất cả đơn hàng",
      date: null,
      dateString: "",
      searchQuery: "",
    },
    selectedOrders: [],
    data: [], // Initialize as empty array
    isModalVisible: false,
    isAddModalVisible: false,
  });
  const [isAddOrderModalVisible, setIsAddOrderModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      
      const formattedData = response.data.map(order => {
        return {
          id: order.SoPhieuBH,
          products: {
            name: order.chitiet?.[0]?.TenSanPham || 'N/A',
            otherProducts: order.chitiet?.slice(1).map(detail => detail.TenSanPham) || []
          },
          date: new Date(order.NgayLap).toLocaleDateString('vi-VN'),
          customer: order.TenKhachHang || 'Khách lẻ',
          maKhachHang: order.MaKhachHang,
          SoDienThoai: order.SoDienThoai,
          total: new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }).format(order.TongTien || 0),
          payment: order.PhuongThucThanhToan || 'Tiền mặt',
          action: order.TinhTrang || 'Chưa xác định',
          originalData: {
            ...order,
            TenKhachHang: order.TenKhachHang,
            MaKhachHang: order.MaKhachHang,
            SoDienThoai: order.SoDienThoai,
            chitiet: order.chitiet
          }
        };
      });

      setState(prev => ({
        ...prev,
        data: formattedData
      }));
    } catch (error) {
      message.error('Không thể tải dữ liệu đơn hàng');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
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

  const handleTabClick = (tabName) => {
    console.log("Tab clicked:", tabName); // Debug log
    setActiveTab(tabName);
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        orderType: tabName
      }
    }));
  };

  const getAllValues = (obj) => {
    let allValues = [];
    const recursive = (obj) => {
      if (obj && typeof obj === 'object') {
        for (let key in obj) {
          recursive(obj[key]);
        }
      } else {
        allValues.push(String(obj).toLowerCase());
      }
    };
    recursive(obj);
    return allValues;
  };

  const filteredData = useMemo(() => {
    const { orderType, dateString } = state.filters;
    let dataToFilter = state.data;

    if (orderType !== "Tất cả đơn hàng" && orderType !== "Tất cả") {
      dataToFilter = dataToFilter.filter((item) => item.action === orderType);
    }

    if (dateString) {
      dataToFilter = dataToFilter.filter((item) => item.date.includes(dateString));
    }

    if (searchText) {
      const lowerSearchText = searchText.toLowerCase();
        dataToFilter = dataToFilter.filter((item) => {
        const allValues = getAllValues(item);
        return allValues.some((value) => value.includes(lowerSearchText));
      });
    }

    return dataToFilter;
  }, [state.data, state.filters, searchText]);

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      for (const orderId of state.selectedOrders) {
        await deleteOrder(orderId);
      }
      message.success('Xóa đơn hàng thành công');
      setState(prev => ({
        ...prev,
        selectedOrders: [],
        isModalVisible: false
      }));
      fetchOrders(); // Refresh the data
    } catch (error) {
      message.error('Không thể xóa đơn hàng');
      console.error('Error deleting orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandRow = (record) => {
    console.log("Expanding row:", record);
    const isRowExpanded = expandedRowKeys.includes(record.id);
    setExpandedRowKeys(isRowExpanded 
      ? expandedRowKeys.filter((key) => key !== record.id) 
      : [...expandedRowKeys, record.id]);
  };

  const handleEditClick = (record) => {
    console.log('Clicking edit for record:', record); // Debug log

    // Check if necessary data exists
    if (!record || !record.originalData) {
      console.error('Invalid record data:', record);
      return;
    }

    const formattedData = { 
      SoPhieuBH: record.id,
      NgayLap: record.originalData.NgayLap,
      MaKhachHang: record.maKhachHang,
      TenKhachHang: record.customer,
      SoDienThoai: record.originalData.SoDienThoai || '',
      TongTien: record.originalData.TongTien || 0,
      chitiet: record.originalData.chitiet?.map(detail => ({
        MaSanPham: detail.MaSanPham,
        TenSanPham: detail.TenSanPham,
        SoLuong: detail.SoLuong,
        DonGiaBanRa: detail.DonGiaBanRa,
        ThanhTien: detail.ThanhTien,
        HinhAnh: detail.HinhAnh,
        id: detail.MaSanPham,
        name: detail.TenSanPham,
        price: `${new Intl.NumberFormat('vi-VN').format(detail.DonGiaBanRa)} đ`,
        rawPrice: detail.DonGiaBanRa,
        image: detail.HinhAnh || 'default-image-url',
        quantity: detail.SoLuong
      })) || []
    };

    console.log('Formatted data for edit:', formattedData); // Debug log
    setSelectedProduct(formattedData);
    setIsEditModalVisible(true);
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Ngày lập",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
    },
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Quản lý đơn hàng" />
      </div>

      <div className="orderproduct">
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm đơn hàng..."
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type="primary"
              className="export-button"
              icon={<ExportOutlined />}
            >
              Xuất file
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="add-product-button"
              onClick={() => setIsAddOrderModalVisible(true)}
            >
              Thêm đơn hàng
            </Button>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            <DatePicker
              placeholder="Chọn ngày"
              onChange={(date, dateString) => {
                handleChange("date", date);
                handleChange("dateString", dateString);
              }}
              format="DD/MM/YYYY"
              value={state.filters.date}
            />
          
          <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={state.selectedOrders.length === 0}
                        onClick={() => handleChange("isModalVisible", true)}
                        className="delete-all-button"
                      >
                        Xóa đã chọn
                      </Button>
            </div>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleEditClick(record),
            style: { cursor: 'pointer' }
          })}
          rowSelection={{
            selectedRowKeys: state.selectedOrders,
            onChange: (selectedRowKeys) =>
              handleChange("selectedOrders", selectedRowKeys),
          }}
          expandable={{
            expandedRowKeys,
            onExpand: (expanded, record) => handleExpandRow(record),
            expandedRowRender: (record) => (
              <div className="detail">
                {record.products.otherProducts.map((product, index) => (
                  <p key={index}>
                    {product}
                  </p>
                ))}
              </div>
            ),
            rowExpandable: (record) => record.products.otherProducts.length > 0,
            showExpandColumn: false,
            expandIcon: () => null
          }}
          pagination={{ pageSize: 5 }}
        />

        <Modal
          title="Xác nhận xóa"
          visible={state.isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => handleChange("isModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa những đơn hàng đã chọn?</p>
        </Modal>

        <AddOrderModal
          isVisible={isAddOrderModalVisible}
          onClose={() => {
            setIsAddOrderModalVisible(false);
            setSelectedProduct(null);
            fetchOrders(); // Refresh data when modal closes
          }}
          onSave={() => {
            fetchOrders(); // Add this - Refresh data immediately after successful save
          }}
          title="Thêm đơn hàng"
          save="Lưu"
        />

        <EditOrderModal
          isVisible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedProduct(null);
            fetchOrders();
          }}
          onSave={fetchOrders}
          initialData={selectedProduct}
        />
      </div>
    </div>
  );
};

export default OrderProductPage;
