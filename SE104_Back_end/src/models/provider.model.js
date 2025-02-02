const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Cấu hình Sequelize

const Provider = sequelize.define(
  "NHACUNGCAP",
  {
    MaNCC: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    TenNCC: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    SoDienThoai: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    DiaChi: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "NHACUNGCAP",
    timestamps: true
  }
);

module.exports = Provider;
