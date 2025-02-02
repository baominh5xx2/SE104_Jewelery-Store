const express = require("express");
const CategoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/get-all", CategoryController.getAllCategories); // Lấy tất cả danh mục
router.get("/get-details/:id", CategoryController.getCategoryById); // Lấy chi tiết danh mục
router.post("/create", CategoryController.createCategory); // Thêm mới danh mục
router.put("/update/:id", CategoryController.updateCategory); // Cập nhật danh mục
router.delete("/delete/:id", CategoryController.deleteCategory); // Xóa danh mục

module.exports = router;
