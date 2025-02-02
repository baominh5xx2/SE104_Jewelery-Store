const { v4: uuidv4 } = require('uuid');
const ServiceType = require('../models/serviceType.model');

class ServiceTypeService {
    // Create new service type
    static async createServiceType(serviceTypeData) {
        try {
            const serviceTypeWithId = {
                ...serviceTypeData,
                MaLoaiDV: `DV${uuidv4().substring(0, 8)}` // Creates ID like "DV12345678"
            };
            
            const serviceType = await ServiceType.create(serviceTypeWithId);
            return serviceType;
        } catch (error) {
            throw error;
        }
    }

    // Get all service types
    static async getAllServiceTypes() {
        try {
            return await ServiceType.findAll();
        } catch (error) {
            throw error;
        }
    }

    // Get service type by ID
    static async getServiceTypeById(id) {
        try {
            const serviceType = await ServiceType.findByPk(id);
            if (!serviceType) throw new Error('Service type not found');
            return serviceType;
        } catch (error) {
            throw error;
        }
    }

    // Update service type
    static async updateServiceType(id, updateData) {
        try {
            const [updated] = await ServiceType.update(updateData, {
                where: { MaLoaiDV: id }
            });
            if (!updated) throw new Error('Service type not found');
            
            return await ServiceType.findByPk(id);
        } catch (error) {
            throw error;
        }
    }

    // Delete service type
    static async deleteServiceType(id) {
        try {
            const deleted = await ServiceType.destroy({
                where: { MaLoaiDV: id }
            });
            
            if (!deleted) throw new Error('Service type not found');
            return { message: 'Service type deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ServiceTypeService;