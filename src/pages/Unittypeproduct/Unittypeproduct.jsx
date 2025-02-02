import React, { useState, useEffect } from "react";
import { Table, Button, Input, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import Topbar from "../../components/TopbarComponent/TopbarComponent";
import AddUnitTypeModal from "../../components/Modal/Modal_unittype/AddUnitTypeModal";
import EditUnitTypeModal from "../../components/Modal/Modal_unittype/EditUnitTypeModal";
import "./Unittypeproduct.css";
import { getAllUnitTypes } from '../../services/UnitTypeService';

const Unittypeproduct = () => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState({
    data: [],
    isModalVisible: false,
  });
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleChange = (key, value) => {
    setState((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddModalClose = (shouldRefresh) => {
    setIsAddModalVisible(false);
    if (shouldRefresh) {
      fetchUnitTypes();
    }
  };

  const handleRowClick = (record) => {
    console.log('Row clicked:', record);
    const unitData = {
      id: record.id,
      name: record.name
    };
    setSelectedUnit(unitData);
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = (shouldRefresh) => {
    setIsEditModalVisible(false);
    setSelectedUnit(null);
    if (shouldRefresh) {
      fetchUnitTypes();
    }
  };

  const fetchUnitTypes = async () => {
    try {
      setLoading(true);
      const response = await getAllUnitTypes();
      const formattedData = response.data.map(unit => ({
        id: unit.MaDVTinh,
        name: unit.TenDVTinh
      }));
      setState(prev => ({
        ...prev,
        data: formattedData
      }));
    } catch (error) {
      message.error('Không thể tải danh sách đơn vị tính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitTypes();
  }, []);

  const filteredData = state.data.filter(item =>
    item.id.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Mã đơn vị tính",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên đơn vị tính",
      dataIndex: "name",
      key: "name",
    }
  ];

  return (
    <div>
      <div style={{ marginLeft: "270px" }}>
        <Topbar title="Quản lý đơn vị tính" />
      </div>

      <div className="unit" style={{ marginLeft: "270px", padding: "20px", position: "relative" }}>
        <header className="order-header">
          <div className="header-actions">
            <Input.Search
              placeholder="Tìm kiếm đơn vị tính..."
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="add-product-button"
              onClick={() => setIsAddModalVisible(true)}
            >
              Thêm đơn vị tính
            </Button>
          </div>
        </header>

        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
          pagination={{ pageSize: 5 }}
        />

        <AddUnitTypeModal 
          isVisible={isAddModalVisible}
          onClose={handleAddModalClose}
          unitTypes={state.data}
        />

      </div>

      <EditUnitTypeModal 
        isVisible={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedUnit(null);
        }}
        initialData={selectedUnit}
      />

    </div>
  );
};

export default Unittypeproduct;
