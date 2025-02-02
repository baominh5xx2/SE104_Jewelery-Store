
const CustomerService = require('../services/customerService');

const createCustomer = async (req, res) => {
    try {
        const customer = await CustomerService.createCustomer(req.body);
        return res.status(201).json(customer);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customer = await CustomerService.updateCustomer(req.params.id, req.body);
        return res.status(200).json(customer);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        await CustomerService.deleteCustomer(req.params.id);
        return res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const customers = await CustomerService.getAllCustomers();
        return res.status(200).json(customers);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getCustomerById = async (req, res) => {
    try {
        const customer = await CustomerService.getCustomerById(req.params.id);
        return res.status(200).json(customer);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
};

module.exports = {
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getAllCustomers,
    getCustomerById
};