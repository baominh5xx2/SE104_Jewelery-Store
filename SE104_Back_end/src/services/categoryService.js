const ProductCategory = require("../models/category.model");
const Unit = require("../models/unit.model");
class ProductCategoryService {
  // Lấy tất cả danh mục sản phẩm
  async getAllCategories() {
    return await ProductCategory.findAll({
      include: [
        {
          model: Unit, // Tham chiếu chính model
          as: "unit", // Alias phải trùng với alias trong model
        },
      ],
    });
  }

  // Lấy thông tin chi tiết danh mục sản phẩm
  async getCategoryById(MaLoaiSanPham) {
    const category = await ProductCategory.findByPk(MaLoaiSanPham, {
      include: [
        {
          model: Unit,
          as: "unit",
        },
      ],
    });
    if (!category) {
      throw new Error("Không tìm thấy danh mục sản phẩm với mã này.");
    }
    return category;
  }

  // Thêm danh mục sản phẩm mới (giữ nguyên code của bạn)
  async createCategory(data) {
    if (
      !data.MaLoaiSanPham ||
      !data.TenLoaiSanPham ||
      !data.MaDVTinh ||
      data.PhanTramLoiNhuan == null
    ) {
      throw new Error("Vui lòng cung cấp đầy đủ thông tin.");
    }

    const existingCategory = await ProductCategory.findByPk(data.MaLoaiSanPham);
    if (existingCategory) {
      throw new Error("Mã danh mục sản phẩm đã tồn tại.");
    }

    return await ProductCategory.create(data);
  }

  // Cập nhật danh mục sản phẩm (giữ nguyên code của bạn)
  async updateCategory(MaLoaiSanPham, data) {
    const category = await ProductCategory.findByPk(MaLoaiSanPham);
    if (!category) {
      throw new Error("Không tìm thấy danh mục sản phẩm với mã này.");
    }

    return await category.update(data);
  }

  // Xóa danh mục sản phẩm (giữ nguyên code của bạn)
  // Xóa danh mục sản phẩm
  async deleteCategory(MaLoaiSanPham) {
    const category = await ProductCategory.findByPk(MaLoaiSanPham);
    if (!category) {
      throw new Error("Không tìm thấy danh mục sản phẩm với mã này.");
    }

    // Sequelize sẽ tự động xóa các danh mục con nhờ `onDelete: 'CASCADE'`
    await category.destroy();
    return {
      message: "Danh mục sản phẩm và các danh mục con đã được xóa thành công.",
    };
  }
}

module.exports = new ProductCategoryService();
