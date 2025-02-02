CREATE DATABASE QLBH
USE QLBH
DROP DATABASE QLBH
CREATE TABLE KHACHHANG (
    MaKhachHang VARCHAR(50) PRIMARY KEY,
    TenKhachHang NVARCHAR(100),
    SoDT VARCHAR(15),
    DiaChi NVARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng DONVITINH
CREATE TABLE DONVITINH (
    MaDVTinh VARCHAR(50) PRIMARY KEY,
    TenDVTinh NVARCHAR(100),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng LOAISANPHAM
CREATE TABLE LOAISANPHAM (
    MaLoaiSanPham VARCHAR(50) PRIMARY KEY,
    TenLoaiSanPham NVARCHAR(100) NOT NULL,
    MaDVTinh VARCHAR(50) NOT NULL,
    PhanTramLoiNhuan DECIMAL(5, 2) NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaDVTinh) REFERENCES DONVITINH(MaDVTinh)
);

-- Bảng SANPHAM
CREATE TABLE SANPHAM (
    MaSanPham VARCHAR(50) PRIMARY KEY,
    TenSanPham NVARCHAR(100),
    MaLoaiSanPham VARCHAR(50),
    DonGia DECIMAL(18, 2),
    SoLuong INT,
    HinhAnh VARCHAR(300),
    isDelete BOOLEAN,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaLoaiSanPham) REFERENCES LOAISANPHAM(MaLoaiSanPham)
);


-- Bảng NHACUNGCAP
CREATE TABLE NHACUNGCAP (
    MaNCC VARCHAR(50) PRIMARY KEY,
    TenNCC NVARCHAR(100),
    SoDienThoai VARCHAR(15),
    DiaChi NVARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng PHIEUMUAHANG
CREATE TABLE PHIEUMUAHANG (
    SoPhieu VARCHAR(50) PRIMARY KEY,
    NgayLap DATETIME,
    MaNCC VARCHAR(50),
    TongTien DECIMAL(18, 2),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaNCC) REFERENCES NHACUNGCAP(MaNCC)
);

-- Bảng CHITIETPHIEUMUAHANG
CREATE TABLE CHITIETPHIEUMUAHANG (
    MaChiTietMH VARCHAR(50) PRIMARY KEY,
    SoPhieu VARCHAR(50),
    MaSanPham VARCHAR(50),
    SoLuong INT,
    DonGia DECIMAL(18, 2),
    ThanhTien DECIMAL(18, 2),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SoPhieu) REFERENCES PHIEUMUAHANG(SoPhieu),
    FOREIGN KEY (MaSanPham) REFERENCES SANPHAM(MaSanPham)
);

-- Bảng PHIEUBANHANG
CREATE TABLE PHIEUBANHANG (
    SoPhieuBH VARCHAR(50) PRIMARY KEY,
    NgayLap DATETIME,
    MaKhachHang VARCHAR(50),
    TongTien DECIMAL(18, 2),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaKhachHang) REFERENCES KHACHHANG(MaKhachHang)
);

-- Bảng CHITIETPHIEUBANHANG
CREATE TABLE CHITIETPHIEUBANHANG (
    MaChiTietBH VARCHAR(50) PRIMARY KEY,
    SoPhieuBH VARCHAR(50),
    MaSanPham VARCHAR(50),
    SoLuong INT,
    DonGiaBanRa DECIMAL(18, 2),
    ThanhTien DECIMAL(18, 2),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SoPhieuBH) REFERENCES PHIEUBANHANG(SoPhieuBH),
    FOREIGN KEY (MaSanPham) REFERENCES SANPHAM(MaSanPham)
);

-- Bảng BAOCAOTONKHO
CREATE TABLE BAOCAOTONKHO (
    Thang VARCHAR(7),
    MaSanPham VARCHAR(50),
    TenSanPham NVARCHAR(100),
    TonDau INT,
    SoLuongMuaVao INT,
    SoLuongBanRa INT,
    TonCuoi INT,
    DonViTinh VARCHAR(50),
    PRIMARY KEY (Thang, MaSanPham),
    FOREIGN KEY (MaSanPham) REFERENCES SANPHAM(MaSanPham)
);

-- Bảng LOAIDICHVU
CREATE TABLE LOAIDICHVU (
    MaLoaiDV VARCHAR(50) PRIMARY KEY,
    TenLoaiDichVu NVARCHAR(100),
    DonGiaDV DECIMAL(18, 2),
    PhanTramTraTruoc DECIMAL(5, 2),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng PHIEUDICHVU
CREATE TABLE PHIEUDICHVU (
    SoPhieuDV VARCHAR(50) PRIMARY KEY,
    NgayLap DATETIME,
    MaKhachHang VARCHAR(50),
    TongTien DECIMAL(18, 2),
    TongTienTraTruoc DECIMAL(18, 2),
    TinhTrang NVARCHAR(50),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (MaKhachHang) REFERENCES KHACHHANG(MaKhachHang)
);

-- Bảng CHITIETDICHVU
CREATE TABLE CHITIETDICHVU (
    MaChiTietDV VARCHAR(50) PRIMARY KEY,
    SoPhieuDV VARCHAR(50),
    MaLoaiDV VARCHAR(50),
    SoLuong INT,
    DonGiaDuocTinh DECIMAL(18, 2),
    ThanhTien DECIMAL(18, 2),
    TraTruoc DECIMAL(18, 2),
    ConLai DECIMAL(18, 2),
    NgayGiao DATETIME,
    TinhTrang NVARCHAR(50),
    ChiPhiRieng DECIMAL(18, 2),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SoPhieuDV) REFERENCES PHIEUDICHVU(SoPhieuDV),
    FOREIGN KEY (MaLoaiDV) REFERENCES LOAIDICHVU(MaLoaiDV)
);

-- Bảng TAIKHOAN
CREATE TABLE TAIKHOAN (
    MaTaiKhoan INT AUTO_INCREMENT PRIMARY KEY,
    TenTaiKhoan VARCHAR(50) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    Role ENUM('admin', 'seller', 'warehouse') NOT NULL DEFAULT 'seller',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
    

-- Dữ liệu mẫu KHACHHANG
INSERT INTO KHACHHANG (MaKhachHang, TenKhachHang, SoDT, DiaChi)
VALUES
('KH001', N'Nguyễn Văn A', '0912345678', N'123 Lê Lợi, Quận 1, TP.HCM'),
('KH002', N'Lê Thị B', '0987654321', N'45 Hai Bà Trưng, Quận 3, TP.HCM'),
('KH003', N'Trần Văn C', '0933224455', N'789 Nguyễn Huệ, Quận 1, TP.HCM'),
('KH004', N'Phạm Thị D', '0922334455', N'10 Lý Tự Trọng, Quận 1, TP.HCM'),
('KH005', N'Ngô Văn E', '0909112233', N'12 Phan Đăng Lưu, Quận Bình Thạnh, TP.HCM'),
('KH006', N'Hoàng Thị F', '0912341122', N'15 Võ Thị Sáu, Quận 3, TP.HCM'),
('KH007', N'Bùi Văn G', '0944556677', N'20 Tôn Đức Thắng, Quận 1, TP.HCM'),
('KH008', N'Lý Thị H', '0981234567', N'35 Nguyễn Văn Cừ, Quận 5, TP.HCM'),
('KH009', N'Doãn Văn I', '0976543210', N'50 Đinh Tiên Hoàng, Quận Bình Thạnh, TP.HCM'),
('KH010', N'Nguyễn Thị K', '0954321876', N'60 Lê Văn Sỹ, Quận Phú Nhuận, TP.HCM');

-- Dữ liệu mẫu DONVITINH
INSERT INTO DONVITINH (MaDVTinh, TenDVTinh)
VALUES
('DVT001', N'Cái'),
('DVT002', N'Gram'),
('DVT003', N'Hộp'),
('DVT004', N'Chiếc'),
('DVT005', N'Bộ'),
('DVT006', N'Sợi'),
('DVT007', N'Lạng'),
('DVT008', N'Kg'),
('DVT009', N'Đôi'),
('DVT010', N'Viên');

-- Dữ liệu mẫu LOAISANPHAM
INSERT INTO LOAISANPHAM (MaLoaiSanPham, TenLoaiSanPham, MaDVTinh, PhanTramLoiNhuan)
VALUES
('LSP001', N'Nhẫn Vàng', 'DVT001', 20.00),
('LSP002', N'Dây Chuyền Bạc', 'DVT006', 15.00),
('LSP003', N'Lắc Tay Kim Cương', 'DVT001', 30.00),
('LSP004', N'Khuyên Tai Vàng', 'DVT009', 18.00),
('LSP005', N'Bộ Trang Sức', 'DVT005', 25.00),
('LSP006', N'Nhẫn Bạc', 'DVT001', 10.00),
('LSP007', N'Vòng Tay Đá Quý', 'DVT006', 35.00),
('LSP008', N'Dây Chuyền Vàng', 'DVT006', 22.00),
('LSP009', N'Khuyên Tai Bạc', 'DVT009', 12.00),
('LSP010', N'Lắc Chân Bạc', 'DVT001', 15.00);

-- Dữ liệu mẫu SANPHAM
INSERT INTO SANPHAM (MaSanPham, TenSanPham, MaLoaiSanPham, DonGia, SoLuong, HinhAnh)
VALUES
('SP001', N'Nhẫn Vàng 24K', 'LSP001', 5000000, 100, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046695/nhanvang_xyz0js.png'),
('SP002', N'Dây Chuyền Bạc Ý', 'LSP002', 1500000, 50, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046695/daychuyenbac_o6lvf8.png'),
('SP003', N'Lắc Tay Kim Cương', 'LSP003', 10000000, 20, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046695/lactaykimcuong_jjygno.png'),
('SP004', N'Khuyên Tai Vàng 18K', 'LSP004', 3000000, 40, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046694/khuyentaivang_uyboso.jpg'),
('SP005', N'Bộ Trang Sức Vàng 18K', 'LSP005', 20000000, 10, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046695/botrangsucvang_ncerou.png'),
('SP006', N'Nhẫn Bạc Thái', 'LSP006', 800000, 60, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046693/nhanbacthai_xp2kfe.jpg'),
('SP007', N'Vòng Tay Đá Ruby', 'LSP007', 12000000, 15, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046693/vongtaydaruby_drp5a4.jpg'),
('SP008', N'Dây Chuyền Vàng 18K', 'LSP008', 6000000, 30, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046694/daychuyenvang_i2nh5y.png'),
('SP009', N'Khuyên Tai Bạc Thái', 'LSP009', 500000, 80, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046694/khuyentaibacthai_nk8cbp.png'),
('SP010', N'Lắc Chân Bạc Italy', 'LSP010', 2000000, 25, 'https://res.cloudinary.com/dsifu4gi9/image/upload/v1735046694/lacchanbac_ve181t.png');

-- Dữ liệu mẫu NHACUNGCAP
INSERT INTO NHACUNGCAP (MaNCC, TenNCC, SoDienThoai, DiaChi)
VALUES
('NCC001', N'Vàng Bạc Phú Nhuận', '0901234567', N'123 Lê Lợi, TP.HCM'),
('NCC002', N'Trung Tâm Vàng Mi Hồng', '0912345678', N'234 Nguyễn Trãi, TP.HCM'),
('NCC003', N'Vàng SJC', '0923456789', N'345 Hai Bà Trưng, TP.HCM'),
('NCC004', N'Kim Hoàn Lộc Phát', '0934567890', N'456 Võ Văn Tần, TP.HCM'),
('NCC005', N'Cửa Hàng Bạc PNJ', '0945678901', N'567 Lê Văn Sỹ, TP.HCM'),
('NCC006', N'Trung Tâm Đá Quý', '0956789012', N'678 Nguyễn Văn Cừ, TP.HCM'),
('NCC007', N'Vàng Kim Ngân', '0967890123', N'789 Lý Thường Kiệt, TP.HCM'),
('NCC008', N'Trung Tâm Trang Sức DOJI', '0978901234', N'890 Phan Đăng Lưu, TP.HCM'),
('NCC009', N'Kim Cương Cao Cấp', '0989012345', N'901 Tôn Đức Thắng, TP.HCM'),
('NCC010', N'Đá Quý Hoàng Gia', '0990123456', N'101 Đại Lộ Bình Dương, TP.HCM');

-- Dữ liệu mẫu PHIEUMUAHANG
INSERT INTO PHIEUMUAHANG (SoPhieu, NgayLap, MaNCC, TongTien)
VALUES
('PMH001', '2024-12-01 10:30:00', 'NCC001', 150000000),
('PMH002', '2024-12-02 14:15:00', 'NCC002', 120000000),
('PMH003', '2024-12-03 09:45:00', 'NCC003', 180000000),
('PMH004', '2024-12-04 11:00:00', 'NCC004', 220000000),
('PMH005', '2024-12-05 13:20:00', 'NCC005', 160000000),
('PMH006', '2024-12-06 15:50:00', 'NCC006', 140000000),
('PMH007', '2024-12-07 16:40:00', 'NCC007', 190000000),
('PMH008', '2024-12-08 10:20:00', 'NCC008', 210000000),
('PMH009', '2024-12-09 17:30:00', 'NCC009', 170000000),
('PMH010', '2024-12-10 12:00:00', 'NCC010', 200000000);

-- Dữ liệu mẫu CHITIETPHIEUMUAHANG
INSERT INTO CHITIETPHIEUMUAHANG (MaChiTietMH, SoPhieu, MaSanPham, SoLuong, DonGia, ThanhTien)
VALUES
('CTPMH001', 'PMH001', 'SP001', 10, 5000000, 50000000),
('CTPMH002', 'PMH001', 'SP002', 20, 1500000, 30000000),
('CTPMH003', 'PMH002', 'SP003', 5, 10000000, 50000000),
('CTPMH004', 'PMH002', 'SP004', 10, 3000000, 30000000),
('CTPMH005', 'PMH003', 'SP005', 2, 20000000, 40000000),
('CTPMH006', 'PMH003', 'SP006', 30, 800000, 24000000),
('CTPMH007', 'PMH004', 'SP007', 3, 12000000, 36000000),
('CTPMH008', 'PMH005', 'SP008', 5, 6000000, 30000000),
('CTPMH009', 'PMH006', 'SP009', 40, 500000, 20000000),
('CTPMH010', 'PMH007', 'SP010', 6, 2000000, 12000000);

-- Dữ liệu mẫu PHIEUBANHANG
INSERT INTO PHIEUBANHANG (SoPhieuBH, NgayLap, MaKhachHang, TongTien)
VALUES
('PBH001', '2024-12-01 10:50:00', 'KH001', 50000000),
('PBH002', '2024-12-02 15:00:00', 'KH002', 30000000),
('PBH003', '2024-12-03 11:20:00', 'KH003', 100000000),
('PBH004', '2024-12-04 16:10:00', 'KH004', 60000000),
('PBH005', '2024-12-05 13:50:00', 'KH005', 40000000),
('PBH006', '2024-12-06 10:00:00', 'KH006', 80000000),
('PBH007', '2024-12-07 14:45:00', 'KH007', 36000000),
('PBH008', '2024-12-08 18:00:00', 'KH008', 60000000),
('PBH009', '2024-12-09 09:30:00', 'KH009', 20000000),
('PBH010', '2024-12-10 16:00:00', 'KH010', 70000000);

-- Dữ liệu mẫu CHITIETPHIEUBANHANG
INSERT INTO CHITIETPHIEUBANHANG (MaChiTietBH, SoPhieuBH, MaSanPham, SoLuong, DonGiaBanRa, ThanhTien)
VALUES
('CTPBH001', 'PBH001', 'SP001', 5, 6000000, 30000000),
('CTPBH002', 'PBH001', 'SP002', 10, 1800000, 18000000),
('CTPBH003', 'PBH002', 'SP003', 2, 12000000, 24000000),
('CTPBH004', 'PBH003', 'SP004', 4, 4000000, 16000000),
('CTPBH005', 'PBH004', 'SP005', 1, 25000000, 25000000),
('CTPBH006', 'PBH005', 'SP006', 20, 1000000, 20000000),
('CTPBH007', 'PBH006', 'SP007', 1, 15000000, 15000000),
('CTPBH008', 'PBH007', 'SP008', 3, 7500000, 22500000),
('CTPBH009', 'PBH008', 'SP009', 25, 600000, 15000000),
('CTPBH010', 'PBH009', 'SP010', 2, 2500000, 5000000);

-- Dữ liệu mẫu BAOCAOTONKHO
INSERT INTO BAOCAOTONKHO (Thang, MaSanPham, TenSanPham, TonDau, SoLuongMuaVao, SoLuongBanRa, TonCuoi, DonViTinh)
VALUES
('2024-06', 'SP001', N'Nhẫn Vàng 24K', 120, 15, 20, 115, N'Cái'),
('2024-06', 'SP002', N'Dây Chuyền Bạc Ý', 55, 25, 15, 65, N'Sợi'),
('2024-06', 'SP003', N'Lắc Tay Kim Cương', 22, 7, 5, 24, N'Cái'),
('2024-06', 'SP004', N'Khuyên Tai Vàng 18K', 45, 12, 6, 51, N'Đôi'),
('2024-06', 'SP005', N'Bộ Trang Sức Vàng 18K', 12, 3, 2, 13, N'Bộ'),
('2024-06', 'SP006', N'Nhẫn Bạc Thái', 70, 35, 25, 80, N'Cái'),
('2024-06', 'SP007', N'Vòng Tay Đá Ruby', 18, 5, 3, 20, N'Cái'),
('2024-06', 'SP008', N'Dây Chuyền Vàng 18K', 28, 8, 4, 32, N'Sợi'),
('2024-06', 'SP009', N'Khuyên Tai Bạc Thái', 85, 45, 30, 100, N'Đôi'),
('2024-06', 'SP010', N'Lắc Chân Bạc Italy', 30, 10, 5, 35, N'Cái'),
('2024-07', 'SP001', N'Nhẫn Vàng 24K', 115, 12, 18, 109, N'Cái'),
('2024-07', 'SP002', N'Dây Chuyền Bạc Ý', 65, 22, 17, 70, N'Sợi'),
('2024-07', 'SP003', N'Lắc Tay Kim Cương', 24, 6, 4, 26, N'Cái'),
('2024-07', 'SP004', N'Khuyên Tai Vàng 18K', 51, 14, 8, 57, N'Đôi'),
('2024-07', 'SP005', N'Bộ Trang Sức Vàng 18K', 13, 2, 1, 14, N'Bộ'),
('2024-07', 'SP006', N'Nhẫn Bạc Thái', 80, 28, 18, 90, N'Cái'),
('2024-07', 'SP007', N'Vòng Tay Đá Ruby', 20, 4, 2, 22, N'Cái'),
('2024-07', 'SP008', N'Dây Chuyền Vàng 18K', 32, 7, 5, 34, N'Sợi'),
('2024-07', 'SP009', N'Khuyên Tai Bạc Thái', 100, 40, 35, 105, N'Đôi'),
('2024-07', 'SP010', N'Lắc Chân Bạc Italy', 35, 5, 3, 37, N'Cái'),
('2024-08', 'SP001', N'Nhẫn Vàng 24K', 109, 10, 15, 104, N'Cái'),
('2024-08', 'SP002', N'Dây Chuyền Bạc Ý', 70, 20, 18, 72, N'Sợi'),
('2024-08', 'SP003', N'Lắc Tay Kim Cương', 26, 5, 4, 27, N'Cái'),
('2024-08', 'SP004', N'Khuyên Tai Vàng 18K', 57, 10, 7, 60, N'Đôi'),
('2024-08', 'SP005', N'Bộ Trang Sức Vàng 18K', 14, 1, 1, 14, N'Bộ'),
('2024-08', 'SP006', N'Nhẫn Bạc Thái', 90, 25, 20, 95, N'Cái'),
('2024-08', 'SP007', N'Vòng Tay Đá Ruby', 22, 6, 4, 24, N'Cái'),
('2024-08', 'SP008', N'Dây Chuyền Vàng 18K', 34, 8, 6, 36, N'Sợi'),
('2024-08', 'SP009', N'Khuyên Tai Bạc Thái', 105, 30, 28, 107, N'Đôi'),
('2024-08', 'SP010', N'Lắc Chân Bạc Italy', 37, 6, 4, 39, N'Cái'),
('2024-09', 'SP001', N'Nhẫn Vàng 24K', 104, 15, 12, 107, N'Cái'),
('2024-09', 'SP002', N'Dây Chuyền Bạc Ý', 72, 18, 15, 75, N'Sợi'),
('2024-09', 'SP003', N'Lắc Tay Kim Cương', 27, 7, 6, 28, N'Cái'),
('2024-09', 'SP004', N'Khuyên Tai Vàng 18K', 60, 12, 10, 62, N'Đôi'),
('2024-09', 'SP005', N'Bộ Trang Sức Vàng 18K', 14, 2, 1, 15, N'Bộ'),
('2024-09', 'SP006', N'Nhẫn Bạc Thái', 95, 20, 18, 97, N'Cái'),
('2024-09', 'SP007', N'Vòng Tay Đá Ruby', 24, 5, 3, 26, N'Cái'),
('2024-09', 'SP008', N'Dây Chuyền Vàng 18K', 36, 9, 7, 38, N'Sợi'),
('2024-09', 'SP009', N'Khuyên Tai Bạc Thái', 107, 35, 30, 112, N'Đôi'),
('2024-09', 'SP010', N'Lắc Chân Bạc Italy', 39, 8, 5, 42, N'Cái'),
('2024-10', 'SP001', N'Nhẫn Vàng 24K', 107, 14, 13, 108, N'Cái'),
('2024-10', 'SP002', N'Dây Chuyền Bạc Ý', 75, 16, 14, 77, N'Sợi'),
('2024-10', 'SP003', N'Lắc Tay Kim Cương', 28, 6, 5, 29, N'Cái'),
('2024-10', 'SP004', N'Khuyên Tai Vàng 18K', 62, 10, 9, 63, N'Đôi'),
('2024-10', 'SP005', N'Bộ Trang Sức Vàng 18K', 15, 1, 1, 15, N'Bộ'),
('2024-10', 'SP006', N'Nhẫn Bạc Thái', 97, 22, 20, 99, N'Cái'),
('2024-10', 'SP007', N'Vòng Tay Đá Ruby', 26, 4, 2, 28, N'Cái'),
('2024-10', 'SP008', N'Dây Chuyền Vàng 18K', 38, 7, 5, 40, N'Sợi'),
('2024-10', 'SP009', N'Khuyên Tai Bạc Thái', 112, 25, 20, 117, N'Đôi'),
('2024-10', 'SP010', N'Lắc Chân Bạc Italy', 42, 6, 4, 44, N'Cái'),
('2024-11', 'SP001', N'Nhẫn Vàng 24K', 108, 12, 10, 110, N'Cái'),
('2024-11', 'SP002', N'Dây Chuyền Bạc Ý', 77, 18, 16, 79, N'Sợi'),
('2024-11', 'SP003', N'Lắc Tay Kim Cương', 29, 8, 6, 31, N'Cái'),
('2024-11', 'SP004', N'Khuyên Tai Vàng 18K', 63, 14, 12, 65, N'Đôi'),
('2024-11', 'SP005', N'Bộ Trang Sức Vàng 18K', 15, 2, 1, 16, N'Bộ'),
('2024-11', 'SP006', N'Nhẫn Bạc Thái', 99, 30, 25, 104, N'Cái'),
('2024-11', 'SP007', N'Vòng Tay Đá Ruby', 28, 5, 3, 30, N'Cái'),
('2024-11', 'SP008', N'Dây Chuyền Vàng 18K', 40, 10, 8, 42, N'Sợi'),
('2024-11', 'SP009', N'Khuyên Tai Bạc Thái', 117, 40, 35, 122, N'Đôi'),
('2024-11', 'SP010', N'Lắc Chân Bạc Italy', 44, 7, 5, 46, N'Cái'),
('2024-12', 'SP001', N'Nhẫn Vàng 24K', 100, 10, 15, 95, N'Cái'),
('2024-12', 'SP002', N'Dây Chuyền Bạc Ý', 50, 20, 10, 60, N'Sợi'),
('2024-12', 'SP003', N'Lắc Tay Kim Cương', 20, 5, 2, 23, N'Cái'),
('2024-12', 'SP004', N'Khuyên Tai Vàng 18K', 40, 10, 4, 46, N'Đôi'),
('2024-12', 'SP005', N'Bộ Trang Sức Vàng 18K', 10, 2, 1, 11, N'Bộ'),
('2024-12', 'SP006', N'Nhẫn Bạc Thái', 60, 30, 20, 70, N'Cái'),
('2024-12', 'SP007', N'Vòng Tay Đá Ruby', 15, 3, 1, 17, N'Cái'),
('2024-12', 'SP008', N'Dây Chuyền Vàng 18K', 30, 5, 3, 32, N'Sợi'),
('2024-12', 'SP009', N'Khuyên Tai Bạc Thái', 80, 40, 25, 95, N'Đôi'),
('2024-12', 'SP010', N'Lắc Chân Bạc Italy', 25, 6, 2, 29, N'Cái');



-- Dữ liệu mẫu LOAIDICHVU
INSERT INTO LOAIDICHVU (MaLoaiDV, TenLoaiDichVu, DonGiaDV, PhanTramTraTruoc)
VALUES
('LDV001', N'Đánh Bóng Trang Sức', 500000, 50.00),
('LDV002', N'Khắc Tên Trang Sức', 300000, 30.00),
('LDV003', N'Xi Mạ Trang Sức', 700000, 40.00),
('LDV004', N'Sửa Khóa Trang Sức', 200000, 20.00),
('LDV005', N'Làm Mới Trang Sức', 1000000, 50.00),
('LDV006', N'Thu Nhỏ Trang Sức', 800000, 60.00),
('LDV007', N'Nới Rộng Trang Sức', 900000, 70.00),
('LDV008', N'Kiểm Định Trang Sức', 600000, 50.00),
('LDV009', N'Chế Tác Theo Yêu Cầu', 1500000, 80.00),
('LDV010', N'Thiết Kế Trang Sức', 2000000, 90.00);

-- Dữ liệu mẫu PHIEUDICHVU
INSERT INTO PHIEUDICHVU (SoPhieuDV, NgayLap, MaKhachHang, TongTien, TongTienTraTruoc, TinhTrang)
VALUES
('PDV001', '2024-12-01 11:00:00', 'KH001', 2000000, 1000000, N'Đang Thực Hiện'),
('PDV002', '2024-12-02 14:30:00', 'KH002', 1500000, 750000, N'Hoàn Thành'),
('PDV003', '2024-12-03 16:45:00', 'KH003', 500000, 250000, N'Đang Thực Hiện'),
('PDV004', '2024-12-04 10:15:00', 'KH004', 1000000, 500000, N'Hủy'),
('PDV005', '2024-12-05 13:25:00', 'KH005', 3000000, 1500000, N'Đang Thực Hiện'),
('PDV006', '2024-12-06 09:50:00', 'KH006', 800000, 400000, N'Hoàn Thành'),
('PDV007', '2024-12-07 15:30:00', 'KH007', 600000, 300000, N'Đang Thực Hiện'),
('PDV008', '2024-12-08 17:10:00', 'KH008', 1200000, 600000, N'Hoàn Thành'),
('PDV009', '2024-12-09 11:40:00', 'KH009', 700000, 350000, N'Đang Thực Hiện'),
('PDV010', '2024-12-10 14:20:00', 'KH010', 2500000, 1250000, N'Hủy');

-- Dữ liệu mẫu CHITIETDICHVU
INSERT INTO CHITIETDICHVU (MaChiTietDV, SoPhieuDV, MaLoaiDV, SoLuong, DonGiaDuocTinh, ThanhTien, TraTruoc, ConLai, NgayGiao, TinhTrang, ChiPhiRieng)
VALUES
('CTDV001', 'PDV001', 'LDV001', 1, 500000, 500000, 250000, 250000, '2024-12-02 10:00:00', N'Hoàn Thành', 0),
('CTDV002', 'PDV002', 'LDV002', 2, 300000, 600000, 300000, 300000, '2024-12-03 15:00:00', N'Hoàn Thành', 0),
('CTDV003', 'PDV003', 'LDV003', 1, 700000, 700000, 350000, 350000, '2024-12-04 09:30:00', N'Đang Thực Hiện', 0),
('CTDV004', 'PDV004', 'LDV004', 3, 200000, 600000, 300000, 300000, NULL, N'Hủy', 0),
('CTDV005', 'PDV005', 'LDV005', 2, 1000000, 2000000, 1000000, 1000000, '2024-12-06 16:00:00', N'Đang Thực Hiện', 0),
('CTDV006', 'PDV006', 'LDV006', 1, 800000, 800000, 400000, 400000, '2024-12-07 18:00:00', N'Hoàn Thành', 0),
('CTDV007', 'PDV007', 'LDV007', 1, 900000, 900000, 450000, 450000, NULL, N'Đang Thực Hiện', 0),
('CTDV008', 'PDV008', 'LDV008', 1, 600000, 600000, 300000, 300000, '2024-12-09 08:30:00', N'Hoàn Thành', 0),
('CTDV009', 'PDV009', 'LDV009', 1, 1500000, 1500000, 750000, 750000, NULL, N'Đang Thực Hiện', 500000),
('CTDV010', 'PDV010', 'LDV010', 1, 2000000, 2000000, 1000000, 1000000, NULL, N'Hủy', 200000);


DELETE FROM BAOCAOTONKHO;



use qlbh

SELECT * FROM DONVITINH;
SELECT * FROM SANPHAM;
SELECT * FROM LOAISANPHAM;
SELECT * FROM NHACUNGCAP;
SELECT * FROM KHACHHANG;
SELECT * FROM PHIEUBANHANG;

SELECT * FROM CHITIETPHIEUBANHANG;
SELECT * FROM TAIKHOAN;
SELECT * FROM LOAIDICHVU;
SELECT * FROM PHIEUDICHVU;
SELECT * FROM CHITIETDICHVU;
SELECT * FROM BAOCAOTONKHO;


DELETE FROM PHIEUBANHANG;
DELETE FROM CHITIETPHIEUBANHANG;

