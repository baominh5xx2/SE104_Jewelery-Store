const { v4: uuidv4 } = require("uuid");
const ServiceTicket = require("../models/serviceTicket.model");
const ServiceTicketDetail = require("../models/serviceTicketDetail.model");
const ServiceType = require("../models/serviceType.model");
const Customer = require("../models/customer.model");  // Add this line

class ServiceTicketService {
  static async createServiceTicket(ticketData, details) {
    try {
      // Check if ticket number already exists
      const existingTicket = await ServiceTicket.findOne({
        where: { SoPhieuDV: ticketData.SoPhieuDV }
      });

      if (existingTicket) {
        throw new Error(`Phiếu dịch vụ có số ${ticketData.SoPhieuDV} đã tồn tại`);
      }

      console.log('Creating service ticket:', ticketData, details);
      // Validate ticket status
      if (
        ticketData.TinhTrang &&
        !["Đã giao", "Chưa giao"].includes(ticketData.TinhTrang)
      ) {
        throw new Error('Tình trạng chỉ có thể là "Đã giao" hoặc "Chưa giao"');
      }
      // Create the service ticket with auto-generated ID if not provided
      const ticket = await ServiceTicket.create({
        SoPhieuDV: ticketData.SoPhieuDV,
        NgayLap: ticketData.NgayLap,
        MaKhachHang: ticketData.MaKhachHang,
        TongTien: ticketData.TongTien,
        TongTienTraTruoc: ticketData.TongTienTraTruoc,
        TinhTrang: ticketData.TinhTrang || "Chưa giao",
      });

      // Create details with validation
      if (details && details.length > 0) {
        const detailsWithIds = [];
        for (const detail of details) {
          // Retrieve service type
          const serviceType = await ServiceType.findOne({
            where: { MaLoaiDV: detail.MaLoaiDV },
          });

          if (!serviceType) {
            throw new Error(
              `Không tìm thấy loại dịch vụ có mã ${detail.MaLoaiDV}`
            );
          }

          // Calculate final price including special costs
          const finalPrice = parseFloat(detail.DonGiaDuocTinh || 0) + parseFloat(detail.ChiPhiRieng || 0);

          // Calculate total amount 
          const soLuong = parseInt(detail.SoLuong || 1, 10);
          const thanhTien = soLuong * finalPrice;

          // Validate minimum prepayment based on service type percentage
          const phanTramTraTruoc = parseFloat(serviceType.PhanTramTraTruoc || 0);
          const minPrepayment = thanhTien * (phanTramTraTruoc / 100);
          const traTruoc = parseFloat(detail.TraTruoc || 0);
          if (traTruoc < minPrepayment) {
            throw new Error(
              `Số tiền trả trước phải >= ${serviceType.PhanTramTraTruoc}% thành tiền (${minPrepayment})`
            );
          }

          detailsWithIds.push({
            MaChiTietDV:
              detail.MaChiTietDV || `CTDV${uuidv4().substring(0, 8)}`,
            SoPhieuDV: ticket.SoPhieuDV,
            MaLoaiDV: detail.MaLoaiDV,
            SoLuong: detail.SoLuong || 1, // Add default value
            DonGiaDuocTinh: finalPrice || 0, // Add default value
            ThanhTien: thanhTien || 0, // Add default value
            TraTruoc: traTruoc || 0, // Add default value
            ConLai: (thanhTien - traTruoc) || 0, // Add default value
            NgayGiao: detail.NgayGiao || null,
            TinhTrang: detail.TinhTrang || "Chưa giao",
            ChiPhiRieng: detail.ChiPhiRieng || 0,
          });
        }

        await ServiceTicketDetail.bulkCreate(detailsWithIds);

        // Recalculate total with special costs
        const totalWithAllCosts = detailsWithIds.reduce(
          (sum, detail) => sum + detail.ThanhTien,
          0
        );

        // Update ticket with final total
        await ticket.update({ TongTien: totalWithAllCosts });
      }

      // Return complete ticket with details
      return await ServiceTicket.findByPk(ticket.SoPhieuDV, {
        include: [{ model: ServiceTicketDetail, as: "details" }],
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error(`Phiếu dịch vụ có số ${ticketData.SoPhieuDV} đã tồn tại`);
      }
      throw new Error(`Lỗi tạo phiếu dịch vụ: ${error.message}`);
    }
  }

  static async getAllServiceTickets() {
    try {
      return await ServiceTicket.findAll({
        include: [
          { model: ServiceTicketDetail, as: "details" },
          { model: Customer, as: "customer" },
        ],
      });
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách phiếu dịch vụ: ${error.message}`);
    }
  }

  static async getServiceTicketById(id) {
    try {
      const serviceTicket = await ServiceTicket.findOne({
        where: { SoPhieuDV: id },
        include: [
          {
            model: ServiceTicketDetail,
            as: "details",
            include: [
              {
                model: ServiceType,
                as: "serviceType",
                attributes: ["TenLoaiDichVu", "PhanTramTraTruoc"], // Lấy thông tin loại dịch vụ
              },
            ],
          },
          {
            model: Customer,
            as: "customer", // Lấy thông tin khách hàng
            attributes: ["TenKhachHang", "SoDT", "DiaChi"],
          },
        ],
      });

      if (!serviceTicket) {
        throw new Error("Không tìm thấy phiếu dịch vụ");
      }

      // Xử lý dữ liệu chi tiết phiếu
      const serviceDetails = serviceTicket.details.map((detail) => ({
        MaChiTietDV: detail.MaChiTietDV,
        MaLoaiDichVu: detail.MaLoaiDichVu,
        TenLoaiDichVu: detail.serviceType?.TenLoaiDichVu, // Tên loại dịch vụ
        SoLuong: detail.SoLuong,
        DonGiaDuocTinh: detail.DonGiaDuocTinh,
        ThanhTien: detail.ThanhTien,
        TraTruoc: detail.TraTruoc,
        ConLai: detail.ConLai,
        NgayGiao: detail.NgayGiao,
        TinhTrang: detail.TinhTrang,
        ChiPhiRieng: detail.ChiPhiRieng || null
      }));

      return {
        serviceTicket: {
          SoPhieuDV: serviceTicket.SoPhieuDV,
          NgayLap: serviceTicket.NgayLap,
          MaKhachHang: serviceTicket.MaKhachHang,
          TongTien: serviceTicket.TongTien,
          TongTienTraTruoc: serviceTicket.TongTienTraTruoc,
          TinhTrang: serviceTicket.TinhTrang,
          customer: {
            TenKhachHang: serviceTicket.customer?.TenKhachHang,
            SoDT: serviceTicket.customer?.SoDT,
            DiaChi: serviceTicket.customer?.DiaChi,
          },
        },
        serviceDetails: serviceDetails,
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy phiếu dịch vụ: ${error.message}`);
    }
  }

  static async updateServiceTicket(id, ticketData, details) {
    const transaction = await ServiceTicket.sequelize.transaction();

    try {
        // Tìm phiếu dịch vụ
        const ticket = await ServiceTicket.findByPk(id, { transaction });
        if (!ticket) throw new Error("Không tìm thấy phiếu dịch vụ");

        // Kiểm tra ngày tạo phiếu
        const currentDate = new Date();
        const ticketDate = new Date(ticket.NgayLap);
        const timeDiff = Math.abs(currentDate - ticketDate);
        const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (dayDiff > 7) {
            throw new Error("Không thể sửa phiếu dịch vụ sau 7 ngày kể từ ngày tạo.");
        }

        // Cập nhật thông tin phiếu nếu được phép
        await ticket.update(ticketData, { transaction });

        let totalAmount = 0; // Tổng tiền mới

        // Cập nhật chi tiết phiếu dịch vụ nếu có
        if (details && details.length > 0) {
            for (const detail of details) {
                const serviceDetail = await ServiceTicketDetail.findByPk(detail.MaChiTietDV, { transaction });

                if (!serviceDetail) {
                    throw new Error(`Không tìm thấy chi tiết phiếu dịch vụ với mã ${detail.MaChiTietDV}`);
                }

                // Kiểm tra nếu mã loại dịch vụ bị thay đổi
                if (detail.MaLoaiDichVu !== serviceDetail.MaLoaiDichVu) {
                    // Lấy thông tin loại dịch vụ mới
                    const serviceType = await ServiceType.findOne({
                        where: { MaLoaiDichVu: detail.MaLoaiDichVu },
                        transaction
                    });
                    if (!serviceType) {
                        throw new Error(`Không tìm thấy loại dịch vụ có mã ${detail.MaLoaiDichVu}`);
                    }

                    // Tính toán lại giá trị liên quan
                    const finalPrice = detail.DonGiaDuocTinh + (detail.ChiPhiRieng || 0);
                    const thanhTien = detail.SoLuong * finalPrice;
                    const minPrepayment = thanhTien * (serviceType.PhanTramTraTruoc / 100);

                    if (detail.TraTruoc < minPrepayment) {
                        throw new Error(`Số tiền trả trước phải >= ${serviceType.PhanTramTraTruoc}% của thành tiền (${minPrepayment})`);
                    }

                    await serviceDetail.update({
                        MaLoaiDichVu: detail.MaLoaiDichVu,
                        SoLuong: detail.SoLuong,
                        DonGiaDuocTinh: finalPrice,
                        ThanhTien: thanhTien,
                        TraTruoc: detail.TraTruoc,
                        ConLai: thanhTien - detail.TraTruoc,
                        ChiPhiRieng: detail.ChiPhiRieng || 0,
                        TinhTrang: detail.TinhTrang || 'Chưa giao',
                        NgayGiao: detail.NgayGiao || null
                    }, { transaction });

                    totalAmount += thanhTien;
                } else {
                    // Nếu không thay đổi mã loại dịch vụ, chỉ cập nhật các giá trị đơn giản
                    await serviceDetail.update(detail, { transaction });
                    totalAmount += serviceDetail.ThanhTien;
                }
            }
        }

        // Cập nhật tổng tiền mới cho phiếu dịch vụ
        await ticket.update({ TongTien: totalAmount }, { transaction });

        // Commit giao dịch
        await transaction.commit();
        return { message: "Cập nhật phiếu dịch vụ thành công" };
    } catch (error) {
        // Rollback giao dịch nếu có lỗi
        await transaction.rollback();
        throw new Error(`Lỗi khi cập nhật phiếu dịch vụ: ${error.message}`);
    }
}

  static async deleteServiceTicket(id) {
    const transaction = await ServiceTicket.sequelize.transaction();
    
    try {
        console.log('Starting delete process for service ticket:', id);
        
        // First, find and delete all related service details
        const detailsDeleted = await ServiceTicketDetail.destroy({
            where: { SoPhieuDV: id },
            transaction
        });
        
        console.log(`Deleted ${detailsDeleted} service details`);

        // Then delete the service ticket
        const ticketDeleted = await ServiceTicket.destroy({
            where: { SoPhieuDV: id },
            transaction
        });

        if (!ticketDeleted) {
            throw new Error("Không tìm thấy phiếu dịch vụ");
        }

        // If everything is successful, commit the transaction
        await transaction.commit();
        console.log('Successfully deleted service ticket and details');
        
        return { 
            message: "Xóa phiếu dịch vụ thành công",
            deletedDetails: detailsDeleted,
            deletedTicket: ticketDeleted
        };
    } catch (error) {
        // If there's an error, rollback the transaction
        await transaction.rollback();
        console.error('Error in deleteServiceTicket:', error);
        throw new Error(`Lỗi khi xóa phiếu dịch vụ: ${error.message}`);
    }
}

}

const createServiceTicket = async (ticketData) => {
  try {
    // Validate required fields
    if (!ticketData.SoPhieuDV || !ticketData.MaKhachHang) {
      throw new Error('SoPhieuDV and MaKhachHang are required');
    }

    // Create the ticket
    const ticket = {
      SoPhieuDV: ticketData.SoPhieuDV,
      NgayLap: ticketData.NgayLap || new Date(),
      MaKhachHang: ticketData.MaKhachHang,
      TongTien: ticketData.TongTien || 0,
      TongTienTraTruoc: ticketData.TongTienTraTruoc || 0,
      TinhTrang: ticketData.TinhTrang || 'Chưa hoàn thành',
    };

    const response = await axiosInstance.post('/service-tickets', ticket);
    
    // If there are details, create them
    if (ticketData.details && ticketData.details.length > 0) {
      const detailsWithIds = ticketData.details.map(detail => ({
        MaChiTietDV: detail.MaChiTietDV || `CTDV${uuidv4().substring(0, 8)}`,
        SoPhieuDV: ticket.SoPhieuDV,
        MaLoaiDichVu: detail.MaLoaiDichVu,
        SoLuong: detail.SoLuong || 1,
        DonGiaDuocTinh: detail.DonGiaDuocTinh || 0,
        ThanhTien: detail.ThanhTien || 0,
        TraTruoc: detail.TraTruoc || 0,
        ConLai: detail.ConLai || 0,
        NgayGiao: detail.NgayGiao || null,
        TinhTrang: detail.TinhTrang || "Chưa giao",
        ChiPhiRieng: detail.ChiPhiRieng || 0
      }));

      await axiosInstance.post('/service-ticket-details/bulk', detailsWithIds);
    }

    return response.data;

  } catch (error) {
    console.error('Error creating service ticket:', error);
    throw new Error(`Lỗi tạo phiếu dịch vụ: ${error.message}`);
  }
};

module.exports = ServiceTicketService;
