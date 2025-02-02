const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Customer = require('./customer.model');

const ServiceTicket = sequelize.define('PHIEUDICHVU', {
    SoPhieuDV: {
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
    },
    TongTienTraTruoc: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    TinhTrang: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'Chưa giao',
        validate: {
            isIn: [['Đã giao', 'Chưa giao']]
        }
    }
}, {
    tableName: 'PHIEUDICHVU',
    timestamps: true
});

// Add this association
ServiceTicket.belongsTo(Customer, {
    foreignKey: 'MaKhachHang',
    as: 'customer'
});

module.exports = ServiceTicket;