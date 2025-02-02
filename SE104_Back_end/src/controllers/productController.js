const productService = require("../services/productService");
const { uploadToCloudinary } = require("../config/cloudinary");

class ProductController {
  // Get all products
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Đã xảy ra lỗi khi lấy danh sách sản phẩm." });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "ID sản phẩm không được để trống." });
      }

      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: "Không tìm thấy sản phẩm với mã này." });
      }

      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Đã xảy ra lỗi khi lấy sản phẩm." });
    }
  }

  // Create new product
  async createProduct(req, res) {
    try {
      console.log('Received request:', {
        body: req.body,
        file: req.file ? {
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        } : 'No file'
      });

      if (!req.body.TenSanPham || !req.body.MaLoaiSanPham || !req.body.MaSanPham) {
        return res.status(400).json({ 
          error: "Thiếu thông tin sản phẩm bắt buộc.",
          received: req.body 
        });
      }

      const productData = {
        TenSanPham: req.body.TenSanPham,
        MaLoaiSanPham: req.body.MaLoaiSanPham,
        MaSanPham: req.body.MaSanPham,
        DonGia: null,  // Set to null instead of 0
        SoLuong: 0     // Keep stock at 0 for "Hết hàng"
      };

      // Handle image upload
      if (req.file) {
        try {
          console.log('Uploading file:', req.file.path);
          const imageUrl = await uploadToCloudinary(req.file);
          productData.HinhAnh = imageUrl;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(400).json({ 
            error: "Lỗi khi tải lên hình ảnh.",
            details: uploadError.message 
          });
        }
      }

      const newProduct = await productService.createProduct(productData);
      res.status(201).json({
        message: "Sản phẩm đã được tạo thành công.",
        product: {
          ...newProduct,
          price: "Chưa có giá",
          stockDisplay: "Hết hàng"
        }
      });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;
      const imageFile = req.file;

      if (!id) {
        return res.status(400).json({ error: "ID sản phẩm không được để trống." });
      }

      // Handle image upload if present
      if (imageFile) {
        try {
          const imageUrl = await uploadToCloudinary(imageFile);
          productData.HinhAnh = imageUrl;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return res.status(400).json({ 
            error: "Lỗi khi tải lên hình ảnh.",
            details: uploadError.message 
          });
        }
      }

      const updatedProduct = await productService.updateProduct(id, productData);
      res.status(200).json({
        message: "Sản phẩm đã được cập nhật thành công.",
        product: updatedProduct
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "ID sản phẩm không được để trống." });
      }

      const result = await productService.deleteProduct(id);
      res.status(200).json({
        message: "Sản phẩm đã được xóa thành công.",
        result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update isDelete field for a product
  // Soft delete product
  async softDeleteProduct(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ 
          error: "ID sản phẩm không được để trống." 
        });
      }

      const result = await productService.softDeleteProduct(id);
      res.status(200).json(result);
    } catch (error) {
      console.error('Soft delete controller error:', error);
      res.status(400).json({ 
        error: error.message || "Không thể xóa sản phẩm" 
      });
    }
  }

  async restoreProduct(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "ID sản phẩm không được để trống." });
        }

        const result = await productService.restoreProduct(id);
        res.status(200).json(result);
        
    } catch (error) {
        console.error('Restore controller error:', error);
        res.status(400).json({ 
            error: error.message || "Không thể khôi phục sản phẩm"
        });
    }
  }
}

const productController = new ProductController();
module.exports = productController;