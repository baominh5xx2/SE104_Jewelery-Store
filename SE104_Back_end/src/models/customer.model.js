
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('KHACHHANG', {
    MaKhachHang: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
    },
    TenKhachHang: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    SoDT: {
        type: DataTypes.STRING(15)
    },
    DiaChi: {
        type: DataTypes.STRING(255)
    }
}, {
    tableName: 'KHACHHANG',
    timestamps: true
});

module.exports = Customer;