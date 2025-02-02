import React, { useState, useMemo, useEffect } from "react";
import { Input, Button, Tag, Table, Modal, Form, message } from "antd"; // Add Form
import { ExportOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ListCustomerPage.css";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import { customerService } from "../../services/customerService"; // Add customerService


const CustomerList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [params, setParams] = useState({
    search: "",
    selectedRowKeys: [],
    isDeleteModalVisible: false,
  });

  // Add new states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addCustomerForm] = Form.useForm();

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Update the fetchCustomers function to include address
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomer();
      const formattedCustomers = data.map(customer => ({
        id: customer.MaKhachHang,
        name: customer.TenKhachHang,
        phone: customer.SoDT,
        address: customer.DiaChi,
        customerCode: customer.MaKhachHang
      }));
      setCustomers(formattedCustomers);
    } catch (error) {
      message.error('Không thể tải danh sách khách hàng');
      console.error('Fetch customers error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle parameter changes
  const handleChange = (key, value) => {
    setParams(prevParams => ({
      ...prevParams,
      [key]: value,
    }));
  };

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm) ||      // Search by name
          customer.customerCode.toLowerCase().includes(searchTerm)  // Search by code
      );
    }

    return filtered;
  }, [customers, params.search]);

  // Xử lý xóa các khách hàng đã chọn
  const handleDeleteSelected = async () => {
    try {
      // Call delete service for each selected customer
      for (const customerId of params.selectedRowKeys) {
        await customerService.deleteCustomer(customerId);
      }
      
      // Update local state
      const remainingCustomers = customers.filter(
        (customer) => !params.selectedRowKeys.includes(customer.id)
      );
      setCustomers(remainingCustomers);
      handleChange("selectedRowKeys", []);
      handleChange("isDeleteModalVisible", false);
      message.success('Xóa khách hàng thành công');
      
      // Refresh customer list
      await fetchCustomers();
    } catch (error) {
      message.error('Không thể xóa khách hàng');
      console.error('Delete customers error:', error);
    }
  };

  // Handler for adding new customer
  const handleAddCustomer = async (values) => {
    try {
      const customerData = {
        TenKhachHang: values.name,    // Maps to KHACHHANG.TenKhachHang
        SoDT: values.phone,           // Maps to KHACHHANG.SoDT  
        DiaChi: values.address        // Maps to KHACHHANG.DiaChi
      };

      console.log(customerData);
      await customerService.createCustomer(customerData);
      message.success('Thêm khách hàng thành công');
      setIsAddModalVisible(false);
      addCustomerForm.resetFields();
      const updatedCustomers = await customerService.getAllCustomer();
      setCustomers(updatedCustomers);
    } catch (error) {
      message.error('Lỗi khi thêm khách hàng');
      console.error('Add customer error:', error);
    }
  };

  // Update the columns definition
  const columns = [
    {
      title: "Mã khách hàng",
      dataIndex: "customerCode",
      key: "customerCode", 
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone"
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address"
    }
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Danh sách khách hàng" />
      </div>
      <div className="customer-pagee">
        {/* Header */}
        <header className="customer-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm khách hàng..."
              value={params.search}
              onChange={(e) => handleChange("search", e.target.value)}
            />
            <Button
              type="primary"
              icon={<ExportOutlined />}
              className="export-button"
            >
              Xuất file
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />} 
              className="add-product-button"
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm khách hàng
            </Button>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            <Button
              type="primary" 
              danger
              icon={<DeleteOutlined />}
              disabled={params.selectedRowKeys.length === 0}
              onClick={() => handleChange("isDeleteModalVisible", true)}
              className="delete-all-button"
            >
              Xóa đã chọn  
            </Button>
          </div>
        </div>

        {/* Filters
        <div className="filter-section">
          <div className="filter-button">
            {["Tất cả trạng thái", "Hoạt động", "Mới", "Đã khóa"].map((type) => (
              <Button
                key={type}
                onClick={() => handleTabClick(type)}
                className={`filter-btn ${activeTab === type ? "active" : ""}`}
              >
                {type}
              </Button>
            ))}
          </div>
          <div className="filter-button">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              disabled={params.selectedRowKeys.length === 0}
              onClick={() => handleChange("isDeleteModalVisible", true)}
              className="delete-all-button"
            >
              Xóa đã chọn
            </Button>
          </div>
        </div> */}

        {/* Table */}
        <Table
          loading={loading}
          rowSelection={{
            selectedRowKeys: params.selectedRowKeys,
            onChange: (keys) => handleChange("selectedRowKeys", keys),
          }}
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          style={{ marginTop: 20 }}
          onRow={(record) => ({
            onClick: () => navigate(`/customer-detail/${record.id}`),
          })}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          title="Xác nhận xóa"
          visible={params.isDeleteModalVisible}
          onOk={handleDeleteSelected}
          onCancel={() => handleChange("isDeleteModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa khách hàng đã chọn?</p>
        </Modal>

        {/* Add Customer Modal */}
        <Modal
          title="Thêm khách hàng mới"
          visible={isAddModalVisible}
          onCancel={() => setIsAddModalVisible(false)}
          footer={null}
        >
          <Form 
            form={addCustomerForm}
            layout="vertical"
            onFinish={handleAddCustomer}
          >
            <Form.Item
              name="name"
              label="Tên khách hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
            >
              <Input placeholder="Nhập tên khách hàng" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default CustomerList;