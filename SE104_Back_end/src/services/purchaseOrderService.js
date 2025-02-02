const { v4: uuidv4 } = require("uuid"); // Thư viện để tạo mã tự động
const PurchaseOrder = require("../models/purchaseOrder.model");
const PurchaseDetail = require("../models/purchaseOrderDetails.model");
const Provider = require("../models/provider.model");
const Product = require("../models/product.model");
const ProductCategory = require("../models/category.model");
const WarehouseManageService = require('./warehouseService');

class PurchaseService {
  static async createPurchase(data) {
    const { soPhieu, ngayLap, nhaCungCap, chiTietSanPham } = data;

    // Khởi tạo giao dịch
    const transaction = await PurchaseOrder.sequelize.transaction();

    try {
      // Tính tổng tiền
      const tongTien = chiTietSanPham.reduce(
        (sum, item) => sum + item.thanhTien,
        0
      );

      // Lưu phiếu mua hàng
      const purchaseOrder = await PurchaseOrder.create(
        {
          SoPhieu: soPhieu,
          NgayLap: ngayLap,
          MaNCC: nhaCungCap,
          TongTien: tongTien,
        },
        { transaction }
      );

      // Lưu chi tiết sản phẩm và cập nhật tồn kho
      const savedDetails = [];
      for (const product of chiTietSanPham) {
        // Tạo chi tiết sản phẩm
        const detail = await PurchaseDetail.create(
          {
            MaChiTietMH: `${soPhieu}_${product.maSanPham}`,
            SoPhieu: soPhieu,
            MaSanPham: product.maSanPham,
            SoLuong: product.soLuong,
            DonGia: product.donGia,
            ThanhTien: product.thanhTien,
          },
          { transaction }
        );

        // Truy xuất mã loại sản phẩm
        const currentProduct = await Product.findOne({
          where: { MaSanPham: product.maSanPham },
          transaction,
        });

        if (!currentProduct) {
          throw new Error(`Không tìm thấy sản phẩm có mã ${product.maSanPham}`);
        }

        // Lấy thông tin loại sản phẩm
        const productType = await ProductCategory.findOne({
          where: { MaLoaiSanPham: currentProduct.MaLoaiSanPham },
          transaction,
        });

        if (!productType) {
          throw new Error(`Không tìm thấy loại sản phẩm cho mã ${currentProduct.MaLoaiSanPham}`);
        }

        // Tăng số lượng tồn kho = Tồn kho hiện tại + Số lượng mua thêm
        const updatedQuantity = currentProduct.SoLuong + product.soLuong;

        console.log("Số lượng update: ", updatedQuantity)

        await Product.update(
          {
            SoLuong: updatedQuantity,
          },
          {
            where: { MaSanPham: product.maSanPham },
            transaction,
          }
        );

        savedDetails.push({
          ...detail.toJSON(),
          TenLoaiSanPham: productType.TenLoaiSanPham
        });
      }

      // Update warehouse report for each product
      for (const product of chiTietSanPham) {
        await WarehouseManageService.updateReportForProduct(
          product.maSanPham,
          product.soLuong,
          true, // isIncrease = true for purchases
          new Date(ngayLap)
        );
      }

      // Commit giao dịch
      await transaction.commit();

      // Trả về kết quả
      return {
        message: "Phiếu mua hàng tạo thành công",
        purchaseOrder: {
          SoPhieu: soPhieu,
          NgayLap: ngayLap,
          MaNCC: nhaCungCap,
          TongTien: tongTien,
          ChiTietSanPham: savedDetails,
        },
      };
    } catch (error) {
      // Rollback giao dịch khi có lỗi
      await transaction.rollback();
      throw new Error("Lỗi khi tạo phiếu mua hàng: " + error.message);
    }
  }

  static async getAllPurchases() {
    const purchases = await PurchaseOrder.findAll();

    return purchases.map((purchase) => ({
      SoPhieu: purchase.SoPhieu,
      NgayLap: purchase.NgayLap,
      MaNCC: purchase.MaNCC,
      TongTien: purchase.TongTien,
    }));
  }

  static async getPurchaseDetails(soPhieu) {
    const purchaseOrder = await PurchaseOrder.findOne({
      where: { SoPhieu: soPhieu },
      include: [
        {
          model: PurchaseDetail,
          as: 'ChiTietSanPham',
          include: [
            {
              model: Product,
              as: 'product', // Ensure this alias matches the one defined in your model associations
              attributes: ['MaLoaiSanPham'],
              include: [
                {
                  model: ProductCategory,
                  as: 'category', // Ensure this alias matches the one defined in your model associations
                  attributes: ['TenLoaiSanPham']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }

    const purchaseDetails = purchaseOrder.ChiTietSanPham.map((detail) => ({
      MaChiTietMH: detail.MaChiTietMH,
      SoPhieu: detail.SoPhieu,
      MaSanPham: detail.MaSanPham,
      SoLuong: detail.SoLuong,
      DonGia: detail.DonGia,
      ThanhTien: detail.ThanhTien,
      TenLoaiSanPham: detail.product?.category?.TenLoaiSanPham
    }));

    return {
      purchaseDetails: purchaseDetails,
      purchaseOrder: {
        SoPhieu: purchaseOrder.SoPhieu,
        NgayLap: purchaseOrder.NgayLap,
        MaNCC: purchaseOrder.MaNCC,
        TongTien: purchaseOrder.TongTien,
        NhaCungCap: purchaseOrder.NhaCungCap
      }
    };
  }

  static async updatePurchase(soPhieu, { updateDetails, addDetails, deleteDetails }) {
    const transaction = await PurchaseOrder.sequelize.transaction();

    try {
      // Find purchase order
      const purchaseOrder = await PurchaseOrder.findByPk(soPhieu);
      if (!purchaseOrder) {
        throw new Error("Phiếu mua hàng không tồn tại");
      }

      // Check date difference
      const currentDate = new Date();
      const orderDate = new Date(purchaseOrder.NgayLap);
      const timeDiff = Math.abs(currentDate - orderDate);
      const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (dayDiff > 2) {
        if (addDetails && addDetails.length > 0) {
          throw new Error("Không thể thêm chi tiết sau 2 ngày kể từ ngày tạo phiếu mua hàng.");
        }
        if (deleteDetails && deleteDetails.length > 0) {
          throw new Error("Không thể xóa chi tiết sau 2 ngày kể từ ngày tạo phiếu mua hàng.");
        }
      }

      // Update purchase order information
      if (updateDetails) {
        console.log("updateDetails received:", updateDetails);
        
        let formattedDate;
        // Check if updateDetails is an array or object and extract NgayLap accordingly
        const ngayLap = Array.isArray(updateDetails) ? updateDetails[0]?.NgayLap : updateDetails.NgayLap;
        
        if (ngayLap) {
          formattedDate = new Date(ngayLap);
          if (isNaN(formattedDate.getTime())) {
            throw new Error("Invalid date format");
          }
        } else {
          formattedDate = purchaseOrder.NgayLap;
        }

        console.log("Formatted date:", formattedDate);

        await purchaseOrder.update({
          NgayLap: formattedDate,
          MaNCC: Array.isArray(updateDetails) ? 
            updateDetails[0]?.MaNCC || purchaseOrder.MaNCC :
            updateDetails.MaNCC || purchaseOrder.MaNCC
        }, { 
          transaction,
          fields: ['NgayLap', 'MaNCC']
        });
      }

      // Thêm chi tiết phiếu mua hàng mới
      if (addDetails && addDetails.length > 0) {
        for (const product of addDetails) {
          await PurchaseDetail.create({
            MaChiTietMH: `${soPhieu}_${product.MaSanPham}`,
            SoPhieu: soPhieu,
            MaSanPham: product.MaSanPham,
            SoLuong: product.SoLuong,
            DonGia: product.DonGia,
            ThanhTien: product.ThanhTien,
          }, { transaction });

          await WarehouseManageService.updateReportForProduct(
            product.MaSanPham,
            product.SoLuong,
            true,
            new Date(purchaseOrder.NgayLap)
          );
        }
      }

      // Cập nhật chi tiết phiếu mua hàng
      if (updateDetails && updateDetails.length > 0) {
        for (const product of updateDetails) {
          await PurchaseDetail.update({
            SoLuong: product.SoLuong,
            DonGia: product.DonGia,
            ThanhTien: product.ThanhTien,
          }, {
            where: { MaChiTietMH: product.MaChiTietMH },
            transaction,
          });
        }
      }

      // Xóa chi tiết phiếu mua hàng
      if (deleteDetails && deleteDetails.length > 0) {
        for (const detail of deleteDetails) {
          await PurchaseDetail.destroy({
            where: { MaChiTietMH: detail.MaChiTietMH },
            transaction,
          });

          await WarehouseManageService.updateReportForProduct(
            detail.MaSanPham,
            detail.SoLuong,
            false,
            new Date(purchaseOrder.NgayLap)
          );
        }
      }

      // Tính lại tổng tiền
      const allDetails = await PurchaseDetail.findAll({
        where: { SoPhieu: soPhieu },
        transaction,
      });

      const tongTien = allDetails.reduce((sum, detail) => {
        const thanhTien = parseFloat(detail.ThanhTien);
        return sum + (isNaN(thanhTien) ? 0 : thanhTien);
      }, 0);

      console.log("Tổng tiền: ", tongTien);
      // Cập nhật tổng tiền của hóa đơn
      await purchaseOrder.update({ TongTien: tongTien }, { transaction });

      await transaction.commit();
      return { message: "Cập nhật phiếu mua hàng thành công" };
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Lỗi khi cập nhật phiếu mua hàng: ${error.message}`);
    }
  }

  static async deletePurchase(soPhieu) {
    const transaction = await PurchaseOrder.sequelize.transaction();

    try {
      // Xóa chi tiết phiếu mua hàng
      await PurchaseDetail.destroy({
        where: { SoPhieu: soPhieu },
        transaction,
      });

      // Xóa phiếu mua hàng
      const result = await PurchaseOrder.destroy({
        where: { SoPhieu: soPhieu },
        transaction,
      });

      await transaction.commit();

      if (result > 0) {
        return { message: "Xóa phiếu mua hàng thành công", soPhieu };
      } else {
        throw new Error("Phiếu mua hàng không tồn tại");
      }
    } catch (error) {
      await transaction.rollback();
      throw new Error("Lỗi khi xóa phiếu mua hàng: " + error.message);
    }
  }
}

module.exports = PurchaseService;
