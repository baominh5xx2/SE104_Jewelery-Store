
const express = require('express');
const { createCustomer, updateCustomer, deleteCustomer, getAllCustomers, getCustomerById } = require('../controllers/customerController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/create', verifyToken, createCustomer);
router.put('/update/:id', verifyToken, updateCustomer);
router.delete('/delete/:id', verifyToken, deleteCustomer);
router.get('/get-all', verifyToken, getAllCustomers);
router.get('/get-by-id/:id', verifyToken, getCustomerById);

module.exports = router;   