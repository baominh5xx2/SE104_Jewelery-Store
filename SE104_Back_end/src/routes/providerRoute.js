const express = require('express');
const ProviderController = require('../controllers/providerController');

const router = express.Router();
// done
router.get('/get-all', ProviderController.getAllProviders);         // Lấy danh sách nhà cung cấp
router.get('/get-details/:id', ProviderController.getProviderById); // Lấy thông tin chi tiết nhà cung cấp
router.post('/create', ProviderController.createProvider);          // Thêm nhà cung cấp mới
router.patch('/update/:id', ProviderController.updateProvider);       // Cập nhật nhà cung cấp
router.delete('/delete/:id', ProviderController.deleteProvider);    // Xóa nhà cung cấp

module.exports = router;