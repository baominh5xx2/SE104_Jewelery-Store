const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('TAIKHOAN', {
    MaTaiKhoan: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    TenTaiKhoan: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    MatKhau: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    Role: {
        type: DataTypes.ENUM('admin', 'seller', 'warehouse'),
        defaultValue: 'seller',
        allowNull: false
    }
}, {
    tableName: 'TAIKHOAN',
    timestamps: true
});

module.exports = User;