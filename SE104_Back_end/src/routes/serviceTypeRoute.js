const express = require('express');
const router = express.Router();
const ServiceTypeController = require('../controllers/serviceTypeController');
const verifyToken = require('../middleware/auth');

// Protected routes requiring authentication
router.post('/create', verifyToken, ServiceTypeController.createServiceType);
router.get('/get-all', verifyToken, ServiceTypeController.getAllServiceTypes);
router.get('/get-by-id/:id', verifyToken, ServiceTypeController.getServiceTypeById);
router.put('/update/:id', verifyToken, ServiceTypeController.updateServiceType);
router.delete('/delete/:id', verifyToken, ServiceTypeController.deleteServiceType);

module.exports = router;