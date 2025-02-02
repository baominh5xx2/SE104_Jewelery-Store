const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ServiceType = sequelize.define('LOAIDICHVU', {
    MaLoaiDV: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    TenLoaiDichVu: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    DonGiaDV: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    PhanTramTraTruoc: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    }
}, {
    tableName: 'LOAIDICHVU',
    timestamps: true
});

module.exports = ServiceType;