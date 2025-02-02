import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Button, message } from 'antd';
import moment from 'moment';
import warehouseService from '../../services/warehouseService';
import './WarehouseReport.css';
import Topbar from '../../components/TopbarComponent/TopbarComponent';

const WarehouseReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment());

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'TenSanPham',
      key: 'TenSanPham',
      width: '20%',
    },
    {
      title: 'Tồn đầu',
      dataIndex: 'TonDau',
      key: 'TonDau',
      width: '15%',
    },
    {
      title: 'Số lượng mua vào',
      dataIndex: 'SoLuongMuaVao',
      key: 'SoLuongMuaVao',
      width: '15%',
    },
    {
      title: 'Số lượng bán ra',
      dataIndex: 'SoLuongBanRa',
      key: 'SoLuongBanRa',
      width: '15%',
    },
    {
      title: 'Tồn cuối',
      dataIndex: 'TonCuoi',
      key: 'TonCuoi',
      width: '15%',
    },
    {
      title: 'Đơn vị tính',
      dataIndex: 'DonViTinh',
      key: 'DonViTinh',
      width: '10%',
    },
  ];

  const fetchReport = async (year, month) => {
    try {
      setLoading(true);
      const response = await warehouseService.getReportByPeriod(year, month);
      setData(response);
    } catch (error) {
      message.error('Không thể tải báo cáo tồn kho');
      console.error('Fetch report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
      fetchReport(date.year(), date.month() + 1);
    }
  };

  useEffect(() => {
    fetchReport(selectedDate.year(), selectedDate.month() + 1);
  }, []);

  return (
    <div>
      <div style={{ marginLeft: '270px' }}>
        <Topbar title="Báo cáo tồn kho" />
      </div>

      <div className="warehouse-report-container">
        <div className="report-header">
          <DatePicker
            picker="month"
            value={selectedDate}
            onChange={handleDateChange}
            format="MM/YYYY"
            style={{ width: 200, marginRight: 16 }}
          />
          <Button
            type="primary"
            onClick={() => fetchReport(selectedDate.year(), selectedDate.month() + 1)}
          >
            Tạo báo cáo
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="MaSanPham"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} sản phẩm`
          }}
        />
      </div>
    </div>
  );
};

export default WarehouseReport;