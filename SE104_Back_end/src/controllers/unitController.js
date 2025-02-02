const unitService = require("../services/unitService");

class UnitController {
  // Lấy tất cả đơn vị tính
  async getAllUnits(req, res) {
    try {
      const units = await unitService.getAllUnits();
      res.status(200).json(units);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Lấy thông tin chi tiết đơn vị tính
  async getUnitById(req, res) {
    try {
      const { id } = req.params;
      const unit = await unitService.getUnitById(id);
      res.status(200).json(unit);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Thêm đơn vị tính mới
  async createUnit(req, res) {
    try {
      const data = req.body;
      const newUnit = await unitService.createUnit(data);
      res.status(201).json(newUnit);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Cập nhật đơn vị tính
  async updateUnit(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedUnit = await unitService.updateUnit(id, data);
      res.status(200).json(updatedUnit);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Xóa đơn vị tính
  async deleteUnit(req, res) {
    try {
      const { id } = req.params;
      const result = await unitService.deleteUnit(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UnitController();
