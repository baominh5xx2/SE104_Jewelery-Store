const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ServiceTicket = require('./serviceTicket.model');
const ServiceType = require('./serviceType.model');

const ServiceTicketDetail = sequelize.define('CHITIETDICHVU', {
    MaChiTietDV: {
        type: DataTypes.STRING(50),
        primaryKey: true
    },
    SoPhieuDV: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    MaLoaiDV: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    SoLuong: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DonGiaDuocTinh: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    ThanhTien: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    TraTruoc: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    ConLai: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false
    },
    NgayGiao: {
        type: DataTypes.DATE
    },
    TinhTrang: {
        type: DataTypes.STRING(50)
    },
    ChiPhiRieng: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true
    }
}, {
    tableName: 'CHITIETDICHVU',
    timestamps: true
});

ServiceTicketDetail.belongsTo(ServiceTicket, {
    foreignKey: 'SoPhieuDV',
    as: 'serviceTicket'
});

ServiceTicket.hasMany(ServiceTicketDetail, {
    foreignKey: 'SoPhieuDV',
    as: 'details'
});

ServiceTicketDetail.belongsTo(ServiceType, {
    foreignKey: 'MaLoaiDV',
    targetKey: 'MaLoaiDV',
    as: 'serviceType'
});

ServiceType.hasMany(ServiceTicketDetail, {
    foreignKey: 'MaLoaiDV',
    sourceKey: 'MaLoaiDV',
    as: 'serviceDetails'
});

module.exports = ServiceTicketDetail;