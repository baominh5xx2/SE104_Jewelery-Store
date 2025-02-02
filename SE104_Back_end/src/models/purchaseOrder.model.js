const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const PurchaseDetail = require("./purchaseOrderDetails.model"); // Import bảng chi tiết
const Provider = require("./provider.model");

const PurchaseOrder = sequelize.define(
  "PHIEUMUAHANG",
  {
    SoPhieu: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    NgayLap: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    MaNCC: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    TongTien: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "PHIEUMUAHANG",
    timestamps: true
  }
);

// Thiết lập quan hệ
PurchaseOrder.hasMany(PurchaseDetail, {
  foreignKey: "SoPhieu",
  sourceKey: "SoPhieu",
  as: "ChiTietSanPham", // Alias cho frontend
});



PurchaseDetail.belongsTo(PurchaseOrder, {
  foreignKey: "SoPhieu",
  targetKey: "SoPhieu",
});

// Thiết lập quan hệ với NHACUNGCAP
PurchaseOrder.belongsTo(Provider, {
  foreignKey: "MaNCC",
  targetKey: "MaNCC",
  as: "NhaCungCap",
});

module.exports = PurchaseOrder;
