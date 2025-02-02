import React, { useState, useEffect } from "react";
import { Input, Button, DatePicker, Form, Table, message, Spin } from "antd";
import "./DetailImportProduct.css";
import { useNavigate, useParams } from "react-router-dom";
import importProduct from "../../services/importProduct";
import createImportProduct from "../../services/createImportProduct";

const DetailImportOrder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [purchaseData, setPurchaseData] = useState(null);

  useEffect(() => {
    const fetchPurchaseDetail = async () => {
      try {
        setLoading(true);
        const data = await importProduct.getPurchaseById(id);
        console.log('Purchase Detail Data:', data);

        if (!data) {
          throw new Error('Không có dữ liệu phiếu mua hàng');
        }

        const providerData = await createImportProduct.getProviderById(data.purchaseOrder.MaNCC);
        console.log('Provider Data:', providerData);

        const productsWithDetails = await Promise.all(
          data.purchaseDetails.map(async (item) => {
            const productData = await createImportProduct.getProductById(item.MaSanPham);
            return {
              code: item.MaChiTietMH,
              productId: item.MaSanPham,
              name: productData?.TenSanPham || 'N/A',
              quantity: item.SoLuong,
              price: parseFloat(item.DonGia),
              total: parseFloat(item.ThanhTien),
              category: item.TenLoaiSanPham || 'N/A'
            };
          })
        );

        setPurchaseData({
          id: data.purchaseOrder.SoPhieu,
          date: new Date(data.purchaseOrder.NgayLap).toLocaleDateString('vi-VN'),
          supplier: {
            id: data.purchaseOrder.MaNCC,
            name: providerData?.TenNCC || 'N/A',
            phone: providerData?.SoDienThoai || 'N/A',
            address: providerData?.DiaChi || 'N/A'
          },
          products: productsWithDetails,
          totalAmount: parseFloat(data.purchaseOrder.TongTien)
        });
      } catch (error) {
        message.error("Không thể tải thông tin phiếu mua hàng");
        console.error("Fetch purchase detail error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseDetail();
  }, [id]);

  const handleCancel = () => {
    navigate(-1);
  };

  const columns = [
    { 
      title: 'Mã sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
    },
    { 
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Loại sản phẩm',
      dataIndex: 'category',
      key: 'category'
    },
    { 
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right'
    },
    { 
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    },
    { 
      title: 'Thành tiền',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(total)
    }
  ];

  const buttonStyle = {
    marginLeft: '8px'
  };

  const calculateTotal = (products) => {
    return products?.reduce((sum, product) => sum + product.total, 0) || 0;
  };

  if (loading) {
    return <div className="loading-container"><Spin size="large" /></div>;
  }

  return (
    <div className="product-detail">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ 
          margin: 0, 
          fontWeight: 'normal',
          fontSize: '24px'
        }}>Chi tiết phiếu mua hàng - Mã phiếu: {purchaseData?.id}</h2>
        <div>
          <Button 
            type="primary" 
            onClick={() => navigate(`/adjust-import-product/${purchaseData?.id}`)}
            style={buttonStyle}
          >
            Chỉnh sửa
          </Button>
          <Button 
            danger 
            onClick={handleCancel}
            style={buttonStyle}
          >
            Thoát
          </Button>
        </div>
      </header>

      <div className="form-container">
        <div className="form-section">
          <h3 style={{ 
            fontWeight: 'normal',
            fontSize: '20px'
          }}>Thông tin phiếu</h3>
          <p>Ngày lập: {purchaseData?.date}</p>
          <p>Mã phiếu: {purchaseData?.id}</p>
        </div>

        <div className="form-section">
          <h3 style={{ 
            fontWeight: 'normal',
            fontSize: '20px'
          }}>Thông tin nhà cung cấp</h3>
          <p>Mã nhà cung cấp: {purchaseData?.supplier.id}</p>
          <p>Tên nhà cung cấp: {purchaseData?.supplier.name}</p>
          <p>Số điện thoại: {purchaseData?.supplier.phone}</p>
          <p>Địa chỉ: {purchaseData?.supplier.address}</p>
        </div>

        <div className="form-section">
          <h3 style={{ 
            fontWeight: 'normal',
            fontSize: '20px'
          }}>Danh sách sản phẩm</h3>
          <Table 
            dataSource={purchaseData?.products} 
            columns={columns} 
            rowKey="code" 
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={5} style={{ fontSize: '16px' }}>
                    Tổng tiền
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}>
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(calculateTotal(purchaseData?.products))}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DetailImportOrder;