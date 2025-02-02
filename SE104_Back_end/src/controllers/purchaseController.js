const PurchaseService = require("../services/purchaseOrderService");

class PurchaseController {
  static async createPurchase(req, res) {
    try {
      const { soPhieu, ngayLap, nhaCungCap, chiTietSanPham } = req.body;

      const result = await PurchaseService.createPurchase({
        soPhieu,
        ngayLap,
        nhaCungCap,
        chiTietSanPham,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getAllPurchases(req, res) {
    try {
      const purchases = await PurchaseService.getAllPurchases();
      res.status(200).json(purchases);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getPurchaseDetails(req, res) {
    try {
      const { soPhieu } = req.params;
      const purchaseDetails = await PurchaseService.getPurchaseDetails(soPhieu);
      if (purchaseDetails) {
        res.status(200).json(purchaseDetails);
      } else {
        res.status(404).json({ message: "Phiếu mua hàng không tồn tại" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // static async updatePurchase(req, res) {
  //   try {
  //     const { soPhieu } = req.params;
  //     const { NgayLap, MaNCC, ChiTietSanPham } = req.body;

  //     // Kiểm tra nếu ChiTietSanPham không phải là mảng
  //     if (!Array.isArray(ChiTietSanPham)) {
  //       return res
  //         .status(400)
  //         .json({ message: "Dữ liệu ChiTietSanPham phải là một mảng" });
  //     }

  //     const result = await PurchaseService.updatePurchase(soPhieu, {
  //       NgayLap,
  //       MaNCC,
  //       ChiTietSanPham,
  //     });

  //     if (result) {
  //       res.status(200).json(result);
  //     } else {
  //       res.status(404).json({ message: "Phiếu mua hàng không tồn tại" });
  //     }
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: `Lỗi khi cập nhật phiếu mua hàng: ${error.message}` });
  //   }
  // }

  static async updatePurchase(req, res) {
    try {
      const { soPhieu } = req.params;
      const { updateDetails, addDetails, deleteDetails } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (
        !Array.isArray(updateDetails) ||
        !Array.isArray(addDetails) ||
        !Array.isArray(deleteDetails)
      ) {
        return res
          .status(400)
          .json({
            message:
              "Dữ liệu updateDetails, addDetails và deleteDetails phải là mảng",
          });
      }

      // Gọi service để xử lý cập nhật
      const result = await PurchaseService.updatePurchase(soPhieu, {
        updateDetails,
        addDetails,
        deleteDetails,
      });

      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Phiếu mua hàng không tồn tại" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: `Lỗi khi cập nhật phiếu mua hàng: ${error.message}` });
    }
  }

  static async deletePurchase(req, res) {
    try {
      const { soPhieu } = req.params;
      const result = await PurchaseService.deletePurchase(soPhieu);
      if (result) {
        res.status(200).json({ message: "Xóa phiếu mua hàng thành công" });
      } else {
        res.status(404).json({ message: "Phiếu mua hàng không tồn tại" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = PurchaseController;
