const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Product = require("./product.model");

const PurchaseDetail = sequelize.define(
  "CHITIETPHIEUMUAHANG",
  {
    MaChiTietMH: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    SoPhieu: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    MaSanPham: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    SoLuong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    DonGia: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    ThanhTien: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    tableName: "CHITIETPHIEUMUAHANG",
    timestamps: true
  }
);

PurchaseDetail.belongsTo(Product, {
  foreignKey: "MaSanPham",
  as: "product"
});

module.exports = PurchaseDetail;
