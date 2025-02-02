const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const Customer = require('../models/customer.model');
const SaleInvoice = require('../models/saleInvoice.model');
const ServiceTicket = require('../models/serviceTicket.model');
const ServiceTicketDetail = require('../models/serviceTicketDetail.model');
const SaleInvoiceDetail = require('../models/saleInvoiceDetail.model');
const Product = require('../models/product.model');

class CustomerService {
    static async createCustomer(customerData) {
        try {
            // Generate UUID for MaKhachHang
            const customerWithId = {
                ...customerData,
                MaKhachHang: `KH${uuidv4().substring(0, 8)}` // Creates ID like "KH12345678"
            };

            const customer = await Customer.create(customerWithId);
            return customer;
        } catch (error) {
            throw error;
        }
    }

    static async updateCustomer(id, customerData) {
        const [updated] = await Customer.update(customerData, {
            where: { MaKhachHang: id }
        });
        if (!updated) throw new Error('Customer not found');
        return await Customer.findByPk(id);
    }

    static async deleteCustomer(id) {
        try {
            // 1. Delete service ticket details first
            await ServiceTicketDetail.destroy({
                where: {
                    SoPhieuDV: {
                        [Op.in]: sequelize.literal(`(SELECT SoPhieuDV FROM PHIEUDICHVU WHERE MaKhachHang = '${id}')`)
                    }
                }
            });

            // 2. Delete service tickets
            await ServiceTicket.destroy({
                where: { MaKhachHang: id }
            });

            // 3. Delete sale invoice details
            await SaleInvoiceDetail.destroy({
                where: {
                    SoPhieuBH: {
                        [Op.in]: sequelize.literal(`(SELECT SoPhieuBH FROM PHIEUBANHANG WHERE MaKhachHang = '${id}')`)
                    }
                }
            });

            // 4. Delete sale invoices
            await SaleInvoice.destroy({
                where: { MaKhachHang: id }
            });

            // 5. Finally delete the customer
            const deleted = await Customer.destroy({
                where: { MaKhachHang: id }
            });

            if (!deleted) {
                throw new Error('Customer not found');
            }

            return { message: 'Customer and all related records deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    static async getAllCustomers() {
        return await Customer.findAll();
    }

    static async getCustomerById(id) {
        const customer = await Customer.findByPk(id, {
            include: [{
                model: SaleInvoice,
                as: 'saleInvoices',
                include: [{
                    model: SaleInvoiceDetail,
                    as: 'details',
                    include: [{
                        model: Product,
                        as: 'product'
                    }]
                }]
            }]
        });
        
        if (!customer) throw new Error('Customer not found');
        return customer;
    }
}

module.exports = CustomerService;