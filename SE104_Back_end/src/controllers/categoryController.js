const productCategoryService = require("../services/categoryService");

class ProductCategoryController {
  async getAllCategories(req, res) {
    try {
      const categories = await productCategoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await productCategoryService.getCategoryById(id);
      res.status(200).json(category);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const data = req.body;
      const newCategory = await productCategoryService.createCategory(data);
      res.status(201).json({
        message: "Danh mục sản phẩm đã được thêm thành công.",
        data: newCategory,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedCategory = await productCategoryService.updateCategory(
        id,
        data
      );
      res.status(200).json({
        message: "Danh mục sản phẩm đã được cập nhật thành công.",
        data: updatedCategory,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const result = await productCategoryService.deleteCategory(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ProductCategoryController();
