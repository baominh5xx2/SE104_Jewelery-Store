import React, { useState, useEffect } from "react";
import { Input, Button, Tag, Table, message, Modal, Form, Select } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./ListEmployeePage.css";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import employeeService from "../../services/listEmployee";

const EmployeeList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Tất cả chức vụ"); // Add this line

  const [params, setParams] = useState({
    employees: [],
    selectedRowKeys: [],
    filters: "Tất cả chức vụ",
    isModalVisible: false,
    isDeleteModalVisible: false,
    search: "",
  });

  // Add this function
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    handleChange("filters", tabName);
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAllEmployees();
      handleChange("employees", data);
    } catch (error) {
      message.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleAddEmployee = async (values) => {
    try {
      setLoading(true);
      await employeeService.createEmployee({
        username: values.username,
        password: values.password,
        role: values.role,
        permissions: values.permissions // Add permissions
      });
      
      message.success("Thêm nhân viên thành công");
      form.resetFields();
      handleChange("isModalVisible", false);
      fetchEmployees();
    } catch (error) {
      message.error(error.message || "Lỗi khi thêm nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const deletePromises = params.selectedRowKeys.map(id => 
        employeeService.deleteEmployee(id)
      );
      await Promise.all(deletePromises);
      message.success("Xóa nhân viên thành công");
      handleChange("selectedRowKeys", []);
      handleChange("isDeleteModalVisible", false);
      fetchEmployees();
    } catch (error) {
      message.error("Lỗi khi xóa nhân viên");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = params.employees.filter(employee => {
    const matchesFilter = params.filters === "Tất cả chức vụ" || employee.role === params.filters;
    const matchesSearch = !params.search || 
      employee.username.toLowerCase().includes(params.search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const columns = [
    { title: "Mã nhân viên", dataIndex: "employeeCode", key: "employeeCode" },
    
    { title: "Username", dataIndex: "username", key: "username" },
    {
      title: "Chức vụ",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "";
        switch (role) {
          case "Quản lý":
            color = "blue";
            break;
          case "Nhân viên":
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{role}</Tag>;
      },
    },
  ];

  // Update role options to match database roles
  const roleOptions = [
    { label: "Quản lý", value: "Quản lý" },
    { label: "Nhân viên bán hàng", value: "Nhân viên bán hàng" },
    { label: "Nhân viên kho", value: "Nhân viên kho" }
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Danh sách nhân viên" />
      </div>
      <div className="employee-page">
        {/* Header */}
        <header className="employee-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm nhân viên..."
              value={params.search}
              onChange={(e) => handleChange("search", e.target.value)}
            />

            <Button
              icon={<ExportOutlined />}
              className="export-button"
            >
              Xuất file
            </Button>

            {/* Thêm nhân viên button next to Export file */}
            <Button
              icon={<PlusOutlined />}
              onClick={() => handleChange("isModalVisible", true)}
              className="add-employee-button"
            >
              Thêm nhân viên
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-button">
            {["Tất cả chức vụ", "Quản lý", "Nhân viên"].map((role) => (
              <Button
                key={role}
                onClick={() => handleTabClick(role)}
                className={`filter-btn ${activeTab === role ? "active" : ""}`}
              >
                {role}
              </Button>
            ))}
          </div>
          <div className="filter-buttons">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              disabled={params.selectedRowKeys.length === 0}
              onClick={() => handleChange("isDeleteModalVisible", true)}
            >
              Xóa đã chọn
            </Button>
          </div>
        </div>

        {/* Modal */}
        <Modal
          title="Thêm nhân viên mới"
          visible={params.isModalVisible}
          onCancel={() => handleChange("isModalVisible", false)}
          footer={null}
          centered
        >
          <Form form={form} layout="vertical" onFinish={handleAddEmployee}>
            
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Vui lòng nhập username" }]}
            >
              <Input placeholder="Nhập username..." />
            </Form.Item>
           
            <Form.Item
              label="Chức vụ"
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn chức vụ" }]}
            >
              <Select
                placeholder="Chọn chức vụ"
                options={roleOptions}
              />
            </Form.Item>
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
              hasFeedback
            >
              <Input.Password placeholder="Nhập mật khẩu..." />
            </Form.Item>
            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Xác nhận mật khẩu..." />
            </Form.Item>
            {/* Thêm trường Quyền hạn */}
            <Form.Item
              label="Quyền hạn"
              name="permissions"
              rules={[{ required: true, message: "Vui lòng chọn quyền hạn" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn quyền hạn"
                options={[
                  { label: "Quản trị viên", value: "Admin" },
                  { label: "Quản lý kho", value: "Product Manager" },
                  { label: "Quản lý mua hàng", value: "Import Manager" },
                  { label: "Quản lý dịch vụ", value: "Service Manager" },
                  { label: "Quản lý nhân viên", value: "Employee Manager" },
                  { label: "Quản lý đơn hàng", value: "Order Manager" },
                  { label: "Quản lý khách hàng", value: "Customer Manager" },
                  { label: "Quản lý doanh thu", value: "Revenue Manager" },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor: "#091057",
                }}
              >
                Thêm nhân viên
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Xác nhận xóa"
          visible={params.isDeleteModalVisible}
          onOk={handleConfirmDelete}
          onCancel={() => handleChange("isDeleteModalVisible", false)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <p>Bạn có chắc chắn muốn xóa nhân viên đã chọn?</p>
        </Modal>

        {/* Table */}
        <Table
          rowSelection={{
            selectedRowKeys: params.selectedRowKeys,
            onChange: (keys) => handleChange("selectedRowKeys", keys),
          }}
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          onRow={(record) => ({
            onClick: () => navigate(`/employee-detail/${record.id}`),
          })}
        />
      </div>
    </div>
  );
};

export default EmployeeList;