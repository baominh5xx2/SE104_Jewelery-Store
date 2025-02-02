const express = require('express');
const { 
    createSaleInvoice, 
    getAllSaleInvoices, 
    getSaleInvoiceById, 
    updateSaleInvoice,
    deleteSaleInvoice
} = require('../controllers/saleInvoiceController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Protected routes requiring authentication
router.post('/create', verifyToken, createSaleInvoice);
router.get('/get-all', verifyToken, getAllSaleInvoices);
router.get('/get-by-id/:id', verifyToken, getSaleInvoiceById);
router.put('/update/:id', verifyToken, updateSaleInvoice);
router.delete('/delete/:id', verifyToken, deleteSaleInvoice);

module.exports = router;