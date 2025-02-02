// models/WarehouseManage.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WarehouseManage = sequelize.define('WarehouseManage', {
  Thang: {
    type: DataTypes.STRING(7),
    allowNull: false,
    primaryKey: true,
  },
  MaSanPham: {
    type: DataTypes.STRING(50),
    allowNull: false,
    primaryKey: true,
  },
  TenSanPham: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  TonDau: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  SoLuongMuaVao: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  SoLuongBanRa: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  TonCuoi: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  DonViTinh: {
    type: DataTypes.STRING(50), // Không xử lý logic trong setter nữa
    allowNull: false,
  },
}, {
  tableName: 'BAOCAOTONKHO',
  timestamps: false,
});

module.exports = WarehouseManage;