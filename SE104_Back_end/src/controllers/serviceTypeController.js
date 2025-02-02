const ServiceTypeService = require('../services/serviceTypeService');

const createServiceType = async (req, res) => {
    try {
        const serviceType = await ServiceTypeService.createServiceType(req.body);
        return res.status(201).json(serviceType);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAllServiceTypes = async (req, res) => {
    try {
        const serviceTypes = await ServiceTypeService.getAllServiceTypes();
        return res.status(200).json(serviceTypes);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getServiceTypeById = async (req, res) => {
    try {
        const serviceType = await ServiceTypeService.getServiceTypeById(req.params.id);
        if (!serviceType) return res.status(404).json({ message: 'Service type not found' });
        return res.status(200).json(serviceType);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateServiceType = async (req, res) => {
    try {
        const serviceType = await ServiceTypeService.updateServiceType(req.params.id, req.body);
        return res.status(200).json(serviceType);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const deleteServiceType = async (req, res) => {
    try {
        await ServiceTypeService.deleteServiceType(req.params.id);
        return res.status(200).json({ message: 'Service type deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createServiceType,
    getAllServiceTypes,
    getServiceTypeById,
    updateServiceType,
    deleteServiceType
};