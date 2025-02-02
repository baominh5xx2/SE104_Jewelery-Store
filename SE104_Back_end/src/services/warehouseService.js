const WarehouseManage = require('../models/warehouse.model');
const PurchaseOrder = require('../models/purchaseOrder.model');
const PurchaseDetail = require('../models/purchaseOrderDetails.model');
const SaleInvoice = require('../models/saleInvoice.model');
const SaleInvoiceDetail = require('../models/saleInvoiceDetail.model');
const Product = require('../models/product.model');
const ProductCategory = require('../models/category.model');
const Unit = require('../models/unit.model');
const { Op } = require('sequelize');

class WarehouseManageService {
    // Lấy tất cả báo cáo tồn kho
    static async getAllReports() {
        return await WarehouseManage.findAll();
    }

    // Tính toán và tạo/cập nhật báo cáo tồn kho
    static async generateReport(year, month) {
        try {
            const period = `${year}-${String(month).padStart(2, '0')}`;
            const previousPeriod = month === 1 
                ? `${year - 1}-12` 
                : `${year}-${String(month - 1).padStart(2, '0')}`;

            // Get all products with their details
            const products = await Product.findAll({
                include: [{
                    model: ProductCategory,
                    as: 'category',
                    include: [{
                        model: Unit,
                        as: 'unit',
                        attributes: ['TenDVTinh']
                    }]
                }]
            });

            if (!products || products.length === 0) {
                throw new Error(`Không có sản phẩm nào trong hệ thống để tạo báo cáo cho kỳ ${period}`);
            }

            const reports = [];

            for (const product of products) {
                // Get previous report
                const previousReport = await WarehouseManage.findOne({
                    where: { 
                        Thang: previousPeriod, 
                        MaSanPham: product.MaSanPham 
                    }
                });

                const tonDau = previousReport ? previousReport.TonCuoi : 0;

                // Get purchases in period
                const muaVao = await PurchaseDetail.sum('SoLuong', {
                    where: { 
                        MaSanPham: product.MaSanPham,
                        createdAt: {
                            [Op.startsWith]: period
                        }
                    }
                }) || 0;

                // Get sales in period
                const banRa = await SaleInvoiceDetail.sum('SoLuong', {
                    where: { 
                        MaSanPham: product.MaSanPham,
                        createdAt: {
                            [Op.startsWith]: period
                        }
                    }
                }) || 0;

                const tonCuoi = tonDau + muaVao - banRa;
                const donViTinh = product.category?.unit?.TenDVTinh || 'N/A';

                // Create or update report
                const [report, created] = await WarehouseManage.findOrCreate({
                    where: { 
                        Thang: period, 
                        MaSanPham: product.MaSanPham 
                    },
                    defaults: {
                        TenSanPham: product.TenSanPham,
                        TonDau: tonDau,
                        SoLuongMuaVao: muaVao,
                        SoLuongBanRa: banRa,
                        TonCuoi: tonCuoi,
                        DonViTinh: donViTinh
                    }
                });

                if (!created) {
                    await report.update({
                        TenSanPham: product.TenSanPham,
                        TonDau: tonDau,
                        SoLuongMuaVao: muaVao,
                        SoLuongBanRa: banRa,
                        TonCuoi: tonCuoi,
                        DonViTinh: donViTinh
                    });
                }

                reports.push(report);
            }

            return reports;

        } catch (error) {
            console.error('Generate report error:', error);
            throw error;
        }
    }

    // Hàm hỗ trợ lấy tháng trước
    static getPreviousMonth(year, month) {
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
        }
        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    }

    // Update report when purchase/sale occurs
    static async updateReportForProduct(productId, quantity, isIncrease, date) {
        try {
            // Parse the provided order date correctly
            const orderDate = new Date(date);
            const month = orderDate.getMonth() + 1;
            const year = orderDate.getFullYear();
            const period = `${year}-${String(month).padStart(2, '0')}`;
    
            console.log('Updating report for:', {
                period,
                productId,
                quantity,
                isIncrease,
                orderDate: orderDate.toISOString()
            });
    
            // Find report for the transaction month
            let report = await WarehouseManage.findOne({
                where: { 
                    Thang: period,
                    MaSanPham: productId 
                }
            });
    
            if (!report) {
                // Generate report for the transaction month if it doesn't exist
                await this.generateReport(year, month);
                report = await WarehouseManage.findOne({
                    where: { 
                        Thang: period,
                        MaSanPham: productId 
                    }
                });
            }
    
            if (!report) {
                throw new Error(`Không thể tạo báo cáo cho sản phẩm ${productId} trong kỳ ${period}`);
            }
    
            // Update quantities based on operation type
            if (isIncrease) {
                // For purchases
                await report.update({
                    SoLuongMuaVao: (report.SoLuongMuaVao || 0) + quantity,
                    TonCuoi: (report.TonCuoi || 0) + quantity
                });
            } else {
                // For sales 
                await report.update({
                    SoLuongBanRa: (report.SoLuongBanRa || 0) + quantity,
                    TonCuoi: (report.TonCuoi || 0) - quantity
                });
            }
    
            // Update future months' reports starting from the transaction month
            await this.updateFutureReports(productId, period, isIncrease ? quantity : -quantity);
    
        } catch (error) {
            console.error('Update report error:', error);
            throw error;
        }
    }
    

    // Helper method to update future months' reports
    static async updateFutureReports(productId, fromPeriod, quantityChange) {
        try {
            const [year, month] = fromPeriod.split('-').map(Number);
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
    
            let nextYear = year;
            let nextMonth = month;
    
            while (nextYear < currentYear || (nextYear === currentYear && nextMonth <= currentMonth)) {
                const nextPeriod = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
                const nextReport = await WarehouseManage.findOne({
                    where: {
                        Thang: nextPeriod,
                        MaSanPham: productId
                    }
                });
    
                if (nextReport) {
                    await nextReport.update({
                        TonDau: nextReport.TonDau + quantityChange,
                        TonCuoi: nextReport.TonCuoi + quantityChange
                    });
                }
    
                // Move to the next month
                nextMonth++;
                if (nextMonth > 12) {
                    nextMonth = 1;
                    nextYear++;
                }
            }
        } catch (error) {
            console.error('Update future reports error:', error);
            throw error;
        }
    }
}    

module.exports = WarehouseManageService;
