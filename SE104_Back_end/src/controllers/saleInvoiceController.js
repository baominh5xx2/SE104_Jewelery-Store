const SaleInvoiceService = require("../services/saleInvoiceService");

const createSaleInvoice = async (req, res) => {
  try {
    const { soPhieu, ngayLap, khachHang, chiTietSanPham } = req.body;
    const result = await SaleInvoiceService.createSaleInvoice({
      soPhieu,
      ngayLap,
      khachHang,
      chiTietSanPham,
    });
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getAllSaleInvoices = async (req, res) => {
  try {
    const invoices = await SaleInvoiceService.getAllSaleInvoices();
    return res.status(200).json(invoices);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getSaleInvoiceById = async (req, res) => {
  try {
    const invoice = await SaleInvoiceService.getSaleInvoiceById(req.params.id);
    if (!invoice)
      return res.status(404).json({ message: "Sale invoice not found" });
    return res.status(200).json(invoice);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateSaleInvoice = async (req, res) => {
  try {
    const invoice = await SaleInvoiceService.updateSaleInvoice(
      req.params.id,
      req.body
    );
    return res.status(200).json(invoice);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteSaleInvoice = async (req, res) => {
  try {
    await SaleInvoiceService.deleteSaleInvoice(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSaleInvoice,
  getAllSaleInvoices,
  getSaleInvoiceById,
  updateSaleInvoice,
  deleteSaleInvoice,
};
