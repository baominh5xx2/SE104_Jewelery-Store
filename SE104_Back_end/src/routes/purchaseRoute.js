const express = require('express');
const PurchaseController = require('../controllers/purchaseController');

const router = express.Router();

router.post('/create', PurchaseController.createPurchase);         // Tạo phiếu mua hàng
router.get('/get-all', PurchaseController.getAllPurchases);        // Lấy danh sách tất cả phiếu mua hàng
router.get('/get-details/:soPhieu', PurchaseController.getPurchaseDetails); // Lấy chi tiết phiếu mua hàng
router.patch('/update/:soPhieu', PurchaseController.updatePurchase); // Sửa phiếu mua hàng
router.delete('/delete/:soPhieu', PurchaseController.deletePurchase); // Xóa phiếu mua hàng

module.exports = router;