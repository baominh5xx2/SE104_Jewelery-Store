const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Customer = require('./customer.model');

const SaleInvoice = sequelize.define('PHIEUBANHANG', {
    SoPhieuBH: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    NgayLap: {
        type: DataTypes.DATE,
        allowNull: false
    },
    MaKhachHang: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    TongTien: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    }
}, {
    tableName: 'PHIEUBANHANG',
    timestamps: true
});

// Define relationships
SaleInvoice.belongsTo(Customer, {
    foreignKey: 'MaKhachHang',
    as: 'customer'
});

Customer.hasMany(SaleInvoice, {
    foreignKey: 'MaKhachHang',
    as: 'saleInvoices'
});

module.exports = SaleInvoice;