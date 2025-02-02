const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const ChatBot = sequelize.define("ChatBot", {
  MaTinNhan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  MaTaiKhoan: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  RoleTinNhan: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  TinNhan: {
    type: DataTypes.STRING(10000),
    allowNull: false
  }
}, {
  tableName: 'CHATBOT',
  timestamps: false
});

module.exports = ChatBot;