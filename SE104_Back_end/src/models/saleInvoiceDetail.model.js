const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const SaleInvoice = require('./saleInvoice.model');
const Product = require('./product.model');

const SaleInvoiceDetail = sequelize.define('CHITIETPHIEUBANHANG', {
    MaChiTietBH: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    SoPhieuBH: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    MaSanPham: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    SoLuong: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DonGiaBanRa: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    ThanhTien: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    }
}, {
    tableName: 'CHITIETPHIEUBANHANG',
    timestamps: true
});

// Fix relationships for SaleInvoiceDetail
SaleInvoiceDetail.belongsTo(SaleInvoice, {
    foreignKey: 'SoPhieuBH',
    as: 'saleInvoice'
});

SaleInvoice.hasMany(SaleInvoiceDetail, {
    foreignKey: 'SoPhieuBH',
    as: 'details'
});

SaleInvoiceDetail.belongsTo(Product, {
    foreignKey: 'MaSanPham',
    as: 'product'
});

Product.hasMany(SaleInvoiceDetail, {
    foreignKey: 'MaSanPham',
    as: 'saleDetails'
});

module.exports = SaleInvoiceDetail;