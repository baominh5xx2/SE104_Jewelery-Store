import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Input, DatePicker, Space, Tag, Menu, Modal, Row, Col, message } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import {
  DownOutlined,
} from "@ant-design/icons";
import "./ServicePage.css";
import serviceService from '../../services/serviceService';
const { Search } = Input;

// Add formatCurrency function
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount).replace('₫', 'VND');
};

const App1 = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await serviceService.getAllServiceTickets();
        console.log('Raw service data:', response); // Debug log

        const formattedData = (response || []).map(service => ({
          key: service.SoPhieuDV,
          SoPhieuDV: service.SoPhieuDV,
          NgayLap: service.NgayLap,
          customer: service.customer?.TenKhachHang || 'N/A',
          TongTien: service.TongTien || 0,
          TongTienTraTruoc: service.TongTienTraTruoc || 0,
          TinhTrang: service.TinhTrang || 'Chưa hoàn thành'
        }));

        setData(formattedData);
      } catch (error) {
        console.error('Error fetching services:', error);
        message.error('Không thể tải danh sách phiếu dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Remove the actions column and update handleRowClick
  const columns = [
    {
      title: "Số phiếu",
      dataIndex: "SoPhieuDV",
      key: "SoPhieuDV",
      width: "10%"
    },
    {
      title: "Ngày lập",
      dataIndex: "NgayLap",
      key: "NgayLap",
      width: "15%",
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: "Khách hàng", 
      dataIndex: "customer",
      key: "customer",
      width: "20%"
    },
    {
      title: "Tổng tiền",
      dataIndex: "TongTien",
      key: "TongTien", 
      width: "15%",
      render: (amount) => formatCurrency(amount)
    },
    {
      title: "Trả trước",
      dataIndex: "TongTienTraTruoc",
      key: "TongTienTraTruoc",
      width: "15%", 
      render: (amount) => formatCurrency(amount)
    },
    {
      title: "Còn lại",
      key: "ConLai",
      width: "15%",
      render: (_, record) => formatCurrency(record.TongTien - record.TongTienTraTruoc)
    },
    {
      title: "Tình trạng",
      dataIndex: "TinhTrang",
      key: "TinhTrang",
      width: "10%",
      render: (status) => (
        <Tag color={status === "Hoàn thành" ? "success" : "warning"}>
          {status}
        </Tag>
      )
    }
  ];

  // Add row click handler
  const handleRowClick = (record) => {
    navigate(`/view-service/${record.SoPhieuDV}`);
  };

  const handleDeleteSelected = async () => {
    try {
        if (selectedRows.length === 0) {
            message.warning('Vui lòng chọn ít nhất một phiếu dịch vụ để xóa');
            return;
        }

        setIsDeleteModalVisible(false);
        
        // Add loading state
        setLoading(true);

        console.log('Selected rows for deletion:', selectedRows); // Debug log

        // Delete services one by one and collect any errors
        const errors = [];
        for (const id of selectedRows) {
            try {
                await serviceService.deleteServiceTicket(id);
            } catch (error) {
                errors.push(`Phiếu ${id}: ${error.message}`);
            }
        }

        // Check if there were any errors
        if (errors.length > 0) {
            message.error(`Lỗi khi xóa: ${errors.join(', ')}`);
        } else {
            message.success(`Đã xóa ${selectedRows.length} phiếu dịch vụ thành công`);
            
            // Update data after successful deletion
            const updatedData = data.filter(item => !selectedRows.includes(item.SoPhieuDV));
            setData(updatedData);
            setSelectedRows([]);
        }
    } catch (error) {
        console.error('Error deleting services:', error);
        message.error(error.message || 'Có lỗi xảy ra khi xóa phiếu dịch vụ');
    } finally {
        setLoading(false);
    }
};

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Quản lý phiếu dịch vụ" />
      </div>

      <div className="order-table-container12">
        <header className="order-header">
          <div className="header-actions">
            <Search
              placeholder="Tìm kiếm phiếu dịch vụ..."
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              style={{ width: '100%' }}
            />
            <div className="button-group">
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
                onClick={() => navigate("/add-service")}
              >
                Thêm phiếu dịch vụ
              </Button>
            </div>
          </div>
        </header>
        <div className="filter-section">
            <div className="filter-button">
            </div>
            <div className="filter-button">
              <DatePicker
                placeholder="Chọn ngày"
                onChange={(date, dateString) => {
                  // Handle date change
                }}
                format="DD/MM/YYYY"
              />
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setIsDeleteModalVisible(true)}
                disabled={selectedRows.length === 0}
                className="delete-all-button"
              >
                Xóa đã chọn ({selectedRows.length})
              </Button>
            </div>
          </div>

        <Table
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: (selectedRowKeys) => setSelectedRows(selectedRowKeys),
          }}
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={{
            pageSize: 5,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/adjust-service/${record.SoPhieuDV}`),
            style: { cursor: 'pointer' }
          })}
        />

        {/* Add Delete Confirmation Modal */}
        <Modal
          title="Xác nhận xóa"
          visible={isDeleteModalVisible}
          onOk={handleDeleteSelected}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa {selectedRows.length} phiếu dịch vụ đã chọn?</p>
        </Modal>
      </div>
    </div>
  );
};

export default App1;
