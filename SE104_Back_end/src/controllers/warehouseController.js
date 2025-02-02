const WarehouseManage = require('../models/warehouse.model');
const { Op } = require('sequelize');

const warehouseController = {
    // Get all reports
    getAllReports: async (req, res) => {
        try {
            const reports = await WarehouseManage.findAll({
                order: [['Thang', 'DESC']]
            });
            res.json(reports);
        } catch (error) {
            console.error('Get all reports error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Generate or get report for specific period
    generateReport: async (req, res) => {
        try {
            const { year, month } = req.params;
            const period = `${year}-${String(month).padStart(2, '0')}`;

            // First try to find existing report
            let reports = await WarehouseManage.findAll({
                where: { Thang: period }
            });

            // If no report exists for this period, generate it
            if (!reports || reports.length === 0) {
                const previousPeriod = month === '01' 
                    ? `${Number(year)-1}-12` 
                    : `${year}-${String(Number(month)-1).padStart(2, '0')}`;

                // Get previous period's report for opening balance
                const previousReports = await WarehouseManage.findAll({
                    where: { Thang: previousPeriod }
                });

                // Create new reports based on previous period
                reports = await Promise.all(previousReports.map(async (prev) => {
                    return await WarehouseManage.create({
                        Thang: period,
                        MaSanPham: prev.MaSanPham,
                        TenSanPham: prev.TenSanPham,
                        TonDau: prev.TonCuoi,
                        SoLuongMuaVao: 0,
                        SoLuongBanRa: 0,
                        TonCuoi: prev.TonCuoi,
                        DonViTinh: prev.DonViTinh
                    });
                }));
            }

            res.json(reports);

        } catch (error) {
            console.error('Generate report error:', error);
            res.status(500).json({ 
                message: 'Error generating warehouse report',
                error: error.message 
            });
        }
    },

    // Update report
    updateReport: async (req, res) => {
        try {
            const { year, month } = req.params;
            const { productId, quantity, isIncrease } = req.body;
            const period = `${year}-${String(month).padStart(2, '0')}`;

            const report = await WarehouseManage.findOne({
                where: { 
                    Thang: period,
                    MaSanPham: productId 
                }
            });

            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }

            // Update quantities
            if (isIncrease) {
                await report.update({
                    SoLuongMuaVao: report.SoLuongMuaVao + quantity,
                    TonCuoi: report.TonCuoi + quantity
                });
            } else {
                await report.update({
                    SoLuongBanRa: report.SoLuongBanRa + quantity,
                    TonCuoi: report.TonCuoi - quantity
                });
            }

            // Update future months
            await updateFutureReports(productId, period, isIncrease ? quantity : -quantity);

            res.json({ message: 'Report updated successfully' });

        } catch (error) {
            console.error('Update report error:', error);
            res.status(500).json({ 
                message: 'Error updating warehouse report',
                error: error.message 
            });
        }
    }
};

// Helper function to update future reports
async function updateFutureReports(productId, fromPeriod, quantityChange) {
    try {
        const [year, month] = fromPeriod.split('-').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        let nextYear = year;
        let nextMonth = month + 1;

        while (nextYear < currentYear || (nextYear === currentYear && nextMonth <= currentMonth)) {
            if (nextMonth > 12) {
                nextMonth = 1;
                nextYear++;
            }

            const nextPeriod = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
            
            const report = await WarehouseManage.findOne({
                where: {
                    Thang: nextPeriod,
                    MaSanPham: productId
                }
            });

            if (report) {
                await report.update({
                    TonDau: report.TonDau + quantityChange,
                    TonCuoi: report.TonCuoi + quantityChange
                });
            }

            nextMonth++;
        }
    } catch (error) {
        console.error('Update future reports error:', error);
        throw error;
    }
}

module.exports = warehouseController;