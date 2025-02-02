const express = require('express');
const { createServiceTicket,
    getAllServiceTickets,
    getServiceTicketById,
    updateServiceTicket,
    deleteServiceTicket } = require('../controllers/serviceTicketController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/create', verifyToken, createServiceTicket);
router.get('/get-all', verifyToken, getAllServiceTickets);
router.get('/:id', verifyToken, getServiceTicketById);
router.put('/update/:id', verifyToken, updateServiceTicket);
router.delete('/delete/:id', verifyToken, deleteServiceTicket);
module.exports = router;