import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, DatePicker, Modal, message } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import "./ImportProduct.css";
import importProduct from "../../services/importProduct";

const initData = () => [
  {
    id: "1",
    products: {
      name: "Dầu gội trị viêm da cho thú cưng",
      otherProducts: [
        "Dầu dưỡng trị viêm da cho thú cưng",
        "Dầu gội trị viêm nấm cho thú cưng",
      ],
    },
    date: "29 Dec 2022",
    customer: "John Bushmill",
    total: "13,000,000",
  },
  {
    id: "2",
    products: {
      name: "Vòng Tay Kim Cương",
      otherProducts: [
        "Dầu dưỡng trị viêm da cho thú cưng",
        "Dầu gội trị viêm nấm cho thú cưng",
      ],
    },
    date: "24 Dec 2022",
    customer: "Linda Blair",
    total: "10,000,000",
  },
  {
    id: "3",
    products: {
      name: "Lắc Tay Bạc",
      otherProducts: [],
    },
    date: "12 Dec 2022",
    customer: "M Karim",
    total: "5,000,000",
  },
  {
    id: "4",
    products: {
      name: "Lắc Tay Bạc",
      otherProducts: [],
    },
    date: "12 Dec 2022",
    customer: "M Karim",
    total: "5,000,000",
  },
  {
    id: "5",
    products: {
      name: "Lắc Tay Bạc",
      otherProducts: [],
    },
    date: "12 Dec 2022",
    customer: "M Karim",
    total: "5,000,000",
  },
];

const ImportProduct = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    filters: {
      orderType: "Tất cả phiếu mua hàng",
      date: null,
      dateString: "",
      searchQuery: "",
    },
    selectedOrders: [],
    data: initData(),
    isModalVisible: false,
    isAddModalVisible: false, // Thêm trạng thái cho modal "Thêm sản phẩm"
  });
  const [loading, setLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState([]);
  const [searchText, setSearchText] = useState('');

  const fetchAllPurchases = async () => {
    try {
      setLoading(true);
      const data = await importProduct.getAllPurchases();
      const formattedPurchases = data.map((purchase) => ({
        id: purchase.SoPhieu,
        date: new Date(purchase.NgayLap).toLocaleDateString('vi-VN'),
        provider: purchase.TenNCC || purchase.MaNCC, // Use provider name if available, fallback to ID
        total: new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND' 
        }).format(purchase.TongTien)
      }));
      setPurchaseData(formattedPurchases);
    } catch (error) {
      message.error("Không thể tải danh sách phiếu mua hàng");
      console.error("Fetch purchases error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPurchases();
  }, []);

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

  const filteredData = useMemo(() => {
    const { date } = state.filters;
    let dataToFilter = purchaseData;

    // Date filter
    if (date) {
      dataToFilter = dataToFilter.filter((item) => 
        new Date(item.date).toLocaleDateString() === date.format("DD/MM/YYYY")
      );
    }

    // Search filter
    if (searchText) {
      const lowerSearchText = searchText.toLowerCase().trim();
      dataToFilter = dataToFilter.filter((item) => 
        item.id.toString().toLowerCase().includes(lowerSearchText) ||
        item.provider.toString().toLowerCase().includes(lowerSearchText) ||
        item.date.toString().toLowerCase().includes(lowerSearchText)
      );
    }

    return dataToFilter;
  }, [purchaseData, state.filters.date, searchText]);

  const handleDeletePurchase = async (purchaseId) => {
    try {
      await importProduct.deletePurchase(purchaseId);
      message.success("Xóa phiếu mua hàng thành công");
      fetchAllPurchases();
    } catch (error) {
      message.error("Lỗi khi xóa phiếu mua hàng");
      console.error("Delete purchase error:", error);
    }
  };

  const handleConfirmDelete = () => {
    state.selectedOrders.forEach((orderId) => handleDeletePurchase(orderId));
    setState((prev) => ({
      ...prev,
      selectedOrders: [],
      isModalVisible: false,
    }));
  };

  const handleRowClick = (record) => {
    console.log("Navigating to import product detail with ID:", record.id);
    navigate(`/import-product-detail/${record.id}`); // Changed to use template literal and record.id
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
      title: "Nhà cung cấp",
      dataIndex: "provider",
      key: "provider",
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
        <Topbar title="Quản lý phiếu mua hàng" />
      </div>

      <div className="order-table-container12">
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm phiếu mua hàng..."
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              style={{ width: '100%' }}
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
              onClick={() => navigate("/create-import-product")} // Điều hướng tới trang tạo phiếu
            >
              Thêm phiếu mua hàng
            </Button>
          </div>
        </header>

        {/* Filter */}
        <div className="filter-section">
          <div className="filter-button">
          </div>
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
          rowSelection={{
            selectedRowKeys: state.selectedOrders,
            onChange: (selectedRowKeys) =>
              handleChange("selectedOrders", selectedRowKeys),
          }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={{ pageSize: 5 }}
        />

        {/* Delete Modal */}
        <Modal
          title="Xác nhận xóa"
          visible={state.isModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => handleChange("isModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa những phiếu mua hàng đã chọn?</p>
        </Modal>
      </div>
    </div>
  );
};

export default ImportProduct;