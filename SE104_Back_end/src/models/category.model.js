const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Unit = require("./unit.model");
const ProductCategory = sequelize.define(
  "LOAISANPHAM",
  {
    MaLoaiSanPham: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    TenLoaiSanPham: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    MaDVTinh: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "DONVITINH",
        key: "MaDVTinh",
      },
    },
    PhanTramLoiNhuan: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    }
  },
  {
    tableName: "LOAISANPHAM",
    timestamps: true
  }
);

ProductCategory.belongsTo(Unit, {
  foreignKey: 'MaDVTinh',
  as: 'unit'
});

module.exports = ProductCategory;
