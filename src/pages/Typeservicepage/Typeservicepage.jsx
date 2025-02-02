import React, { useState, useMemo, useEffect } from "react";
import { Input, Button, Table, Modal, Form, Select, message } from "antd";
import { ExportOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Typeservicepage.css";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import ServiceTypeService from '../../services/ServiceTypeService';

const TypeServicePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [params, setParams] = useState({
    search: "",
    selectedRowKeys: [],
    isDeleteModalVisible: false,
  });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addTypeForm] = Form.useForm();
  const [units, setUnits] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      setLoading(true);
      const data = await ServiceTypeService.getAllServiceTypes();
      setTypes(data);
    } catch (error) {
      message.error('Không thể tải danh sách loại dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Check for duplicate MaLoaiDV
      const duplicateCode = types.find(type => type.MaLoaiDV === values.MaLoaiDV);
      if (duplicateCode) {
        message.error('Mã loại dịch vụ đã tồn tại');
        return;
      }

      // Check for duplicate TenLoaiDichVu (case insensitive)
      const duplicateName = types.find(type => 
        type.TenLoaiDichVu.toLowerCase().trim() === values.TenLoaiDichVu.toLowerCase().trim()
      );
      if (duplicateName) {
        message.error('Mã hoặc tên loại dịch vụ đã tồn tại');
        return;
      }

      const serviceTypeData = {
        MaLoaiDV: values.MaLoaiDV,
        TenLoaiDichVu: values.TenLoaiDichVu.trim(),
        DonGiaDV: parseFloat(values.DonGiaDV),
        PhanTramTraTruoc: parseFloat(values.PhanTramTraTruoc)
      };
      await ServiceTypeService.createServiceType(serviceTypeData);
      message.success('Thêm loại dịch vụ thành công');
      fetchServiceTypes();
      setIsAddModalVisible(false);
      addTypeForm.resetFields();
    } catch (error) {
      message.error('Không thể thêm loại dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(
        params.selectedRowKeys.map(id => ServiceTypeService.deleteServiceType(id))
      );
      message.success('Xóa loại dịch vụ thành công');
      setParams(prev => ({ ...prev, selectedRowKeys: [], isDeleteModalVisible: false }));
      fetchServiceTypes();
    } catch (error) {
      message.error('Không thể xóa loại dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setParams(prevParams => ({
      ...prevParams,
      [key]: value,
    }));
  };

  const handleRowClick = (record) => {
    setEditingServiceType(record);
    editForm.setFieldsValue({
      MaLoaiDV: record.MaLoaiDV,
      TenLoaiDichVu: record.TenLoaiDichVu,
      DonGiaDV: record.DonGiaDV,
      PhanTramTraTruoc: record.PhanTramTraTruoc
    });
    setIsEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      setLoading(true);
      // Check for duplicate TenLoaiDichVu (case insensitive), excluding the current service type
      const duplicateName = types.find(type => 
        type.MaLoaiDV !== values.MaLoaiDV && 
        type.TenLoaiDichVu.toLowerCase().trim() === values.TenLoaiDichVu.toLowerCase().trim()
      );
      if (duplicateName) {
        message.error('Mã hoặc tên loại dịch vụ đã tồn tại');
        return;
      }

      const serviceTypeData = {
        MaLoaiDV: values.MaLoaiDV,
        TenLoaiDichVu: values.TenLoaiDichVu.trim(),
        DonGiaDV: parseFloat(values.DonGiaDV),
        PhanTramTraTruoc: parseFloat(values.PhanTramTraTruoc)
      };

      await ServiceTypeService.updateServiceType(values.MaLoaiDV, serviceTypeData);
      message.success('Cập nhật loại dịch vụ thành công');
      fetchServiceTypes();
      setIsEditModalVisible(false);
      setEditingServiceType(null);
    } catch (error) {
      message.error('Không thể cập nhật loại dịch vụ: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = useMemo(() => {
    if (!params.search.trim()) {
      return types;
    }
    
    const searchTerm = params.search.toLowerCase().trim();
    return types.filter(type => {
      return (
        (type.TenLoaiDichVu || '').toLowerCase().includes(searchTerm) ||
        (type.MaLoaiDV || '').toLowerCase().includes(searchTerm)
      );
    });
  }, [types, params.search]);

  const columns = [
    {
      title: "Mã loại dịch vụ",
      dataIndex: "MaLoaiDV",
      key: "MMaLoaiDV",
      align: "left",
    },
    {
      title: "Tên loại dịch vụ",
      dataIndex: "TenLoaiDichVu",
      key: "TenLoaiDichVu",
      align: "left",
    },
    {
      title: "Đơn giá dịch vụ",
      dataIndex: "DonGiaDV",
      key: "DonGiaDV",
      align: "left",
      render: (value) => (value ? `${value.toLocaleString('vi-VN')} đ` : 'N/A')
    },
    {
      title: "Phần trăm trả trước",
      dataIndex: "PhanTramTraTruoc",
      key: "PhanTramTraTruoc",
      align: "left",
      render: (value) => `${value}%`
    }
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Danh sách loại dịch vụ" />
      </div>
      <div className="type-product-page">
        <header className="type-service-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm loại dịch vụ..."
              allowClear
              value={params.search}
              onChange={(e) => handleChange("search", e.target.value)}
              onSearch={(value) => handleChange("search", value)}
              className="search-box"
            />
            <div className="right-buttons">
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
                className="add-type-button"
                onClick={() => setIsAddModalVisible(true)}
              >
                Thêm loại dịch vụ
              </Button>
            </div>
          </div>
        </header>

        <div className="filter-section">
          <div className="filter-button">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              disabled={params.selectedRowKeys.length === 0}
              className="delete-all-button"
            >
              Xóa đã chọn
            </Button>
          </div>
        </div>

        <Table
          loading={loading}
          rowSelection={{
            selectedRowKeys: params.selectedRowKeys,
            onChange: (selectedRowKeys) => handleChange("selectedRowKeys", selectedRowKeys),
          }}
          columns={columns}
          dataSource={filteredTypes}
          rowKey="MaLoaiDV"  // Change from MaLoaiSanPham to MaLoaiDV
          pagination={{ pageSize: 5 }}
          style={{ marginTop: 20 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />

        <Modal
          title="Xác nhận xóa"
          visible={params.isDeleteModalVisible}
          onOk={handleDelete}
          onCancel={() => handleChange("isDeleteModalVisible", false)}
          confirmLoading={loading}
        >
          <p>Bạn có chắc chắn muốn xóa loại dịch vụ đã chọn?</p>
        </Modal>

        <Modal
          title="Thêm loại dịch vụ mới"
          visible={isAddModalVisible}
          onCancel={() => setIsAddModalVisible(false)}
          footer={null}
        >
          <Form
            form={addTypeForm}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="MaLoaiDV"
              label="Mã loại dịch vụ"
              rules={[{ required: true, message: 'Vui lòng nhập mã loại dịch vụ' }]}
            >
              <Input placeholder="Nhập mã loại dịch vụ" />
            </Form.Item>

            <Form.Item
              name="TenLoaiDichVu"
              label="Tên loại dịch vụ"
              rules={[{ required: true, message: 'Vui lòng nhập tên loại dịch vụ' }]}
            >
              <Input placeholder="Nhập tên loại dịch vụ" />
            </Form.Item>

            <Form.Item
              name="DonGiaDV"
              label="Đơn giá dịch vụ"
              rules={[
                { required: true, message: 'Vui lòng nhập đơn giá dịch vụ' },
                {
                  type: 'number',
                  transform: (value) => parseFloat(value),
                  min: 0,
                  message: 'Đơn giá phải là số dương'
                }
              ]}
            >
              <Input
                type="number"
                min={0}
                placeholder="Nhập đơn giá dịch vụ"
                suffix="VNĐ"
              />
            </Form.Item>

            <Form.Item
              name="PhanTramTraTruoc"
              label="Phần trăm trả trước"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm trả trước' },
                {
                  type: 'number',
                  transform: (value) => parseFloat(value),
                  min: 0,
                  max: 100,
                  message: 'Phần trăm trả trước phải từ 0-100'
                }
              ]}
            >
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Nhập phần trăm trả trước"
                suffix="%"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Sửa loại dịch vụ"
          visible={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditingServiceType(null);
          }}
          footer={null}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEdit}
            initialValues={editingServiceType}
          >
            <Form.Item
              name="MaLoaiDV"
              label="Mã loại dịch vụ"
              rules={[{ required: true, message: 'Vui lòng nhập mã loại dịch vụ' }]}
            >
              <Input placeholder="Nhập mã loại dịch vụ" disabled />
            </Form.Item>

            <Form.Item
              name="TenLoaiDichVu"
              label="Tên loại dịch vụ"
              rules={[{ required: true, message: 'Vui lòng nhập tên loại dịch vụ' }]}
            >
              <Input placeholder="Nhập tên loại dịch vụ" />
            </Form.Item>

            <Form.Item
              name="DonGiaDV"
              label="Đơn giá dịch vụ"
              rules={[
                { required: true, message: 'Vui lòng nhập đơn giá dịch vụ' },
                {
                  type: 'number',
                  transform: (value) => parseFloat(value),
                  min: 0,
                  message: 'Đơn giá phải là số dương'
                }
              ]}
            >
              <Input
                type="number"
                min={0}
                placeholder="Nhập đơn giá dịch vụ"
                suffix="VNĐ"
              />
            </Form.Item>

            <Form.Item
              name="PhanTramTraTruoc"
              label="Phần trăm trả trước"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm trả trước' },
                {
                  type: 'number',
                  transform: (value) => parseFloat(value),
                  min: 0,
                  max: 100,
                  message: 'Phần trăm trả trước phải từ 0-100'
                }
              ]}
            >
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Nhập phần trăm trả trước"
                suffix="%"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                Cập nhật
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default TypeServicePage;
