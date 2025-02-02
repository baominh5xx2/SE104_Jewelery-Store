const Unit = require("../models/unit.model");
const ProductCategory = require("../models/category.model");
class UnitService {
  // Lấy tất cả đơn vị tính
  async getAllUnits() {
    const units = await Unit.findAll();
    return {
      message: "Lấy danh sách đơn vị tính thành công.",
      data: units,
    };
  }

  // Lấy thông tin chi tiết đơn vị tính
  async getUnitById(MaDVTinh) {
    const unit = await Unit.findByPk(MaDVTinh);
    if (!unit) {
      throw new Error("Không tìm thấy đơn vị tính với mã này.");
    }
    return {
      message: "Lấy thông tin chi tiết đơn vị tính thành công.",
      data: unit,
    };
  }

  // Thêm đơn vị tính mới
  async createUnit(data) {
    if (!data.MaDVTinh || !data.TenDVTinh) {
      throw new Error("Vui lòng cung cấp đầy đủ thông tin.");
    }

    const existingUnit = await Unit.findByPk(data.MaDVTinh);
    if (existingUnit) {
      throw new Error("Mã đơn vị tính đã tồn tại.");
    }

    const newUnit = await Unit.create(data);
    return {
      message: "Thêm đơn vị tính thành công.",
      data: newUnit,
    };
  }

  // Cập nhật đơn vị tính
  async updateUnit(MaDVTinh, data) {
    const transaction = await Unit.sequelize.transaction();
    
    try {
      // Find existing unit
      const unit = await Unit.findByPk(MaDVTinh, { transaction });
      if (!unit) {
        throw new Error("Không tìm thấy đơn vị tính với mã này.");
      }
  
      // If unit code is being changed, update foreign key references
      if (data.MaDVTinh && data.MaDVTinh !== MaDVTinh) {
        // Update foreign key in ProductCategory table
        await ProductCategory.update(
          { MaDVTinh: data.MaDVTinh },
          { 
            where: { MaDVTinh: MaDVTinh },
            transaction 
          }
        );
      }
  
      // Update the unit
      const updatedUnit = await unit.update(data, { transaction });
  
      await transaction.commit();
  
      return {
        message: "Cập nhật đơn vị tính thành công.",
        data: updatedUnit,
      };
  
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật đơn vị tính: ${error.message}`);
    }
  }

  // Xóa đơn vị tính
  async deleteUnit(MaDVTinh) {
    const unit = await Unit.findByPk(MaDVTinh);
    if (!unit) {
      throw new Error("Không tìm thấy đơn vị tính với mã này.");
    }

    await unit.destroy();
    return {
      message: "Đơn vị tính đã được xóa thành công.",
    };
  }
}

module.exports = new UnitService();
