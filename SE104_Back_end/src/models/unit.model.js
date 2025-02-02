const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Cấu hình Sequelize

const Unit = sequelize.define(
  "DONVITINH",
  {
    MaDVTinh: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    TenDVTinh: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "DONVITINH",
    timestamps: true
  }
);

module.exports = Unit;
