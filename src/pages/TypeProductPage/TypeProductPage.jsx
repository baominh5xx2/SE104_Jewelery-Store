import React, { useState, useMemo, useEffect } from "react";
import { Input, Button, Table, Modal, Form, Select, message } from "antd";
import { ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./TypeProductPage.css";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import typeProductService from "../../services/typeProductService";
import unitService from "../../services/unitService";

const TypeProductPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [types, setTypes] = useState([]);
  const [params, setParams] = useState({
    search: "",
  });

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [addTypeForm] = Form.useForm();
  const [units, setUnits] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await typeProductService.getAllUnits();
        setUnits(response.data || []);
      } catch (error) {
        message.error('Không thể tải danh sách đơn vị tính');
      }
    };
    fetchUnits();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await typeProductService.getAllTypes();
      const typesWithUnits = response.data.map(type => ({
        key: type.MaLoaiSanPham,
        MaLoaiSanPham: type.MaLoaiSanPham,
        TenLoaiSanPham: type.TenLoaiSanPham,
        MaDVTinh: type.MaDVTinh,
        TenDVTinh: units.find(unit => unit.MaDVTinh === type.MaDVTinh)?.TenDVTinh || 'N/A',
        PhanTramLoiNhuan: parseInt(type.PhanTramLoiNhuan)
      }));
      setTypes(typesWithUnits);
    } catch (error) {
      message.error('Không thể tải danh sách loại sản phẩm');
      console.error('Fetch types error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (units.length > 0) {
      fetchTypes();
    }
  }, [units]);

  const handleChange = (key, value) => {
    setParams(prevParams => ({
      ...prevParams,
      [key]: value,
    }));
  };

  const filteredTypes = useMemo(() => {
    let filtered = types;

    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filtered = filtered.filter(
        (type) =>
          type.TenLoaiSanPham?.toLowerCase().includes(searchTerm) || 
          type.MaLoaiSanPham?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [types, params.search]);

  const checkDuplicate = (values, isEditing = false) => {
    const isDuplicateCode = types.some(type => 
      type.MaLoaiSanPham === values.code || 
      type.MaLoaiSanPham === values.MaLoaiSanPham
    );

    const isDuplicateName = types.some(type => 
      type.TenLoaiSanPham.toLowerCase() === (values.name?.toLowerCase() || values.TenLoaiSanPham?.toLowerCase())
    );

    if (isEditing && editingProduct) {
      if (values.MaLoaiSanPham === editingProduct.MaLoaiSanPham) {
        return isDuplicateName && values.TenLoaiSanPham !== editingProduct.TenLoaiSanPham;
      }
      if (values.TenLoaiSanPham === editingProduct.TenLoaiSanPham) {
        return isDuplicateCode && values.MaLoaiSanPham !== editingProduct.MaLoaiSanPham;
      }
    }

    return isDuplicateCode || isDuplicateName;
  };

  const handleAddType = async (values) => {
    try {
      if (checkDuplicate(values)) {
        message.error('Mã hoặc tên loại sản phẩm đã tồn tại!');
        return;
      }

      setLoading(true);
      const typeData = {
        MaLoaiSanPham: values.code,
        TenLoaiSanPham: values.name,
        MaDVTinh: values.unitCode,
        PhanTramLoiNhuan: parseInt(values.profitPercentage)
      };

      await typeProductService.createType(typeData);
      message.success('Thêm loại sản phẩm thành công');
      setIsAddModalVisible(false);
      addTypeForm.resetFields();
      await fetchTypes();
    } catch (error) {
      message.error('Lỗi khi thêm loại sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (record) => {
    setEditingProduct(record);
    editForm.setFieldsValue({
      MaLoaiSanPham: record.MaLoaiSanPham,
      TenLoaiSanPham: record.TenLoaiSanPham,
      MaDVTinh: record.MaDVTinh,
      PhanTramLoiNhuan: record.PhanTramLoiNhuan
    });
    setIsEditModalVisible(true);
  };

  const handleEdit = async (values) => {
    try {
      if (checkDuplicate(values, true)) {
        message.error('Mã hoặc tên loại sản phẩm đã tồn tại!');
        return;
      }

      setLoading(true);
      const typeData = {
        MaLoaiSanPham: values.MaLoaiSanPham,
        TenLoaiSanPham: values.TenLoaiSanPham,
        MaDVTinh: values.MaDVTinh,
        PhanTramLoiNhuan: parseInt(values.PhanTramLoiNhuan)
      };

      await typeProductService.updateType(values.MaLoaiSanPham, typeData);
      message.success('Cập nhật loại sản phẩm thành công');
      fetchTypes();
      setIsEditModalVisible(false);
      setEditingProduct(null);
    } catch (error) {
      message.error('Không thể cập nhật loại sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã loại sản phẩm",
      dataIndex: "MaLoaiSanPham",
      key: "MaLoaiSanPham",
      align: "left",
      className: "text-left"
    },
    {
      title: "Tên loại sản phẩm",
      dataIndex: "TenLoaiSanPham",
      key: "TenLoaiSanPham",
      align: "left",
      className: "text-left"
    },
    {
      title: "Mã đơn vị tính",
      dataIndex: "MaDVTinh",
      key: "MaDVTinh",
      align: "left",
      className: "text-left"
    },
    {
      title: "Đơn vị tính",
      dataIndex: "TenDVTinh",
      key: "TenDVTinh",
      align: "left",
      className: "text-left"
    },
    {
      title: "Phần trăm lợi nhuận",
      dataIndex: "PhanTramLoiNhuan",
      key: "PhanTramLoiNhuan",
      align: "left",
      className: "text-left",
      render: (value) => `${value}%`
    }
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Danh sách loại sản phẩm" />
      </div>
      <div className="type-product-page">
        <header className="type-product-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm loại sản phẩm..."
              value={params.search}
              onChange={(e) => handleChange("search", e.target.value)}
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
                Thêm loại sản phẩm
              </Button>
            </div>
          </div>
        </header>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredTypes}
          rowKey="MaLoaiSanPham"
          pagination={{ pageSize: 5 }}
          style={{ marginTop: 20 }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
        />

        <Modal
          title="Thêm loại sản phẩm mới"
          visible={isAddModalVisible}
          onCancel={() => setIsAddModalVisible(false)}
          footer={null}
        >
          <Form
            form={addTypeForm}
            layout="vertical"
            onFinish={handleAddType}
          >
            <Form.Item
              name="code"
              label="Mã loại sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập mã loại sản phẩm' }]}
            >
              <Input placeholder="Nhập mã loại sản phẩm" />
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên loại sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên loại sản phẩm' }]}
            >
              <Input placeholder="Nhập tên loại sản phẩm" />
            </Form.Item>

            <Form.Item
              name="unitCode"
              label="Đơn vị tính"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
            >
              <Select placeholder="Chọn đơn vị tính">
                {units.map(unit => (
                  <Select.Option key={unit.MaDVTinh} value={unit.MaDVTinh}>
                    {unit.TenDVTinh}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="profitPercentage"
              label="Phần trăm lợi nhuận"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm lợi nhuận' },
                {
                  type: 'number',
                  transform: (value) => parseInt(value),
                  min: 0,
                  max: 100,
                  message: 'Phần trăm lợi nhuận phải là số nguyên từ 0-100'
                }
              ]}
            >
              <Input 
                type="number" 
                min={0}
                max={100}
                step={1}
                placeholder="Nhập phần trăm lợi nhuận"
                suffix="%" 
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Tạo mới
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Sửa loại sản phẩm"
          visible={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false);
            setEditingProduct(null);
          }}
          footer={null}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEdit}
            initialValues={editingProduct}
          >
            <Form.Item
              name="MaLoaiSanPham"
              label="Mã loại sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập mã loại sản phẩm' }]}
            >
              <Input placeholder="Nhập mã loại sản phẩm" disabled />
            </Form.Item>

            <Form.Item
              name="TenLoaiSanPham"
              label="Tên loại sản phẩm"
              rules={[{ required: true, message: 'Vui lòng nhập tên loại sản phẩm' }]}
            >
              <Input placeholder="Nhập tên loại sản phẩm" />
            </Form.Item>

            <Form.Item
              name="MaDVTinh"
              label="Đơn vị tính"
              rules={[{ required: true, message: 'Vui lòng chọn đơn vị tính' }]}
            >
              <Select placeholder="Chọn đơn vị tính">
                {units.map(unit => (
                  <Select.Option key={unit.MaDVTinh} value={unit.MaDVTinh}>
                    {unit.TenDVTinh}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="PhanTramLoiNhuan"
              label="Phần trăm lợi nhuận"
              rules={[
                { required: true, message: 'Vui lòng nhập phần trăm lợi nhuận' },
                {
                  type: 'number',
                  transform: (value) => parseInt(value),
                  min: 0,
                  max: 100,
                  message: 'Phần trăm lợi nhuận phải là số nguyên từ 0-100'
                }
              ]}
            >
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                placeholder="Nhập phần trăm lợi nhuận"
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

export default TypeProductPage;
