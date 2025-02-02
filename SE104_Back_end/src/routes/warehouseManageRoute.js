const express = require('express');
const router = express.Router();
const warehouseManageController = require('../controllers/warehouseController');
const verifyToken = require('../middleware/auth');
// Định tuyến cho báo cáo tồn kho
router.get('/reports', verifyToken, warehouseManageController.getAllReports); // Lấy tất cả báo cáo
router.get('/reports/:year/:month', verifyToken, warehouseManageController.generateReport); // Tạo báo cáo tồn kho theo năm và tháng
router.put('/reports/update/:year/:month', // Fix: Add forward slash before 'reports'
    verifyToken,
    warehouseManageController.updateReport
);
module.exports = router