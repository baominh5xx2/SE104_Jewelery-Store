INSERT INTO DONVITINH (MaDVTinh, TenDVTinh)
VALUES 
    ('DVT01', N'Chiếc'),          -- Dùng cho bông tai, vòng tay, dây chuyền
    ('DVT02', N'Gram'),           -- Dùng cho vàng, bạc, kim cương
    ('DVT03', N'Cây vàng'),       -- Đơn vị đo lường cho vàng (1 cây = 37.5 gram)
    ('DVT04', N'Lượng vàng'),     -- Đơn vị vàng (thường dùng ở Việt Nam, 1 lượng = 1 cây)
    ('DVT05', N'Viên'),           -- Dùng cho kim cương, đá quý
    ('DVT06', N'Cặp'),            -- Dùng cho bông tai
    ('DVT07', N'Bộ'),             -- Dùng cho bộ trang sức
    ('DVT08', N'Sợi');            -- Dùng cho dây chuyền

INSERT INTO LOAISANPHAM (MaLoaiSanPham, TenLoaiSanPham, MaDVTinh, PhanTramLoiNhuan, ParentID)
VALUES 
    ('LSP01', N'Vàng', 'DVT03', 20.00, NULL),       -- Vàng
    ('LSP02', N'Bạc', 'DVT02', 15.00, NULL),       -- Bạc
    ('LSP03', N'Kim cương', 'DVT05', 50.00, NULL), -- Kim cương
    ('LSP04', N'Đá quý', 'DVT05', 45.00, NULL);    -- Đá quý

INSERT INTO LOAISANPHAM (MaLoaiSanPham, TenLoaiSanPham, MaDVTinh, PhanTramLoiNhuan, ParentID)
VALUES 
    -- Danh mục con của "Vàng"
    ('LSP01_1', N'Vòng tay', 'DVT01', 30.00, 'LSP01'),
    ('LSP01_2', N'Nhẫn', 'DVT01', 35.00, 'LSP01'),
    ('LSP01_3', N'Vòng chân', 'DVT01', 32.00, 'LSP01'),
    ('LSP01_4', N'Dây chuyền', 'DVT08', 25.00, 'LSP01'),
    ('LSP01_5', N'Bông tai', 'DVT06', 28.00, 'LSP01'),

    -- Danh mục con của "Bạc"
    ('LSP02_1', N'Vòng tay', 'DVT01', 30.00, 'LSP02'),
    ('LSP02_2', N'Nhẫn', 'DVT01', 35.00, 'LSP02'),
    ('LSP02_3', N'Vòng chân', 'DVT01', 32.00, 'LSP02'),
    ('LSP02_4', N'Dây chuyền', 'DVT08', 25.00, 'LSP02'),
    ('LSP02_5', N'Bông tai', 'DVT06', 28.00, 'LSP02'),

    -- Danh mục con của "Kim cương"
    ('LSP03_1', N'Vòng tay', 'DVT01', 30.00, 'LSP03'),
    ('LSP03_2', N'Nhẫn', 'DVT01', 35.00, 'LSP03'),
    ('LSP03_3', N'Vòng chân', 'DVT01', 32.00, 'LSP03'),
    ('LSP03_4', N'Dây chuyền', 'DVT08', 25.00, 'LSP03'),
    ('LSP03_5', N'Bông tai', 'DVT06', 28.00, 'LSP03'),

    -- Danh mục con của "Đá quý"
    ('LSP04_1', N'Vòng tay', 'DVT01', 30.00, 'LSP04'),
    ('LSP04_2', N'Nhẫn', 'DVT01', 35.00, 'LSP04'),
    ('LSP04_3', N'Vòng chân', 'DVT01', 32.00, 'LSP04'),
    ('LSP04_4', N'Dây chuyền', 'DVT08', 25.00, 'LSP04'),
    ('LSP04_5', N'Bông tai', 'DVT06', 28.00, 'LSP04');

INSERT INTO SANPHAM (MaSanPham, TenSanPham, MaLoaiSanPham, DonGia, SoLuong)
VALUES
    -- Sản phẩm cho danh mục LSP01_1 (Vòng tay vàng)
    ('SP01', N'Vòng tay vàng 24k loại A', 'LSP01_1', 5000000, 10),
    ('SP02', N'Vòng tay vàng 18k loại B', 'LSP01_1', 4500000, 15),
    ('SP03', N'Vòng tay vàng 24k cao cấp', 'LSP01_1', 6000000, 8),
    ('SP04', N'Vòng tay vàng 18k mẫu mới', 'LSP01_1', 4800000, 12),

    -- Sản phẩm cho danh mục LSP01_2 (Nhẫn vàng)
    ('SP05', N'Nhẫn vàng 24k loại A', 'LSP01_2', 3000000, 20),
    ('SP06', N'Nhẫn vàng 18k mẫu B', 'LSP01_2', 2800000, 25),
    ('SP07', N'Nhẫn vàng 24k đính đá', 'LSP01_2', 3500000, 10),
    ('SP08', N'Nhẫn vàng 18k phong thủy', 'LSP01_2', 3200000, 18),

    -- Sản phẩm cho danh mục LSP02_1 (Vòng tay bạc)
    ('SP09', N'Vòng tay bạc cao cấp', 'LSP02_1', 500000, 30),
    ('SP10', N'Vòng tay bạc thiết kế', 'LSP02_1', 550000, 25),
    ('SP11', N'Vòng tay bạc trơn', 'LSP02_1', 400000, 40),
    ('SP12', N'Vòng tay bạc đính đá', 'LSP02_1', 700000, 15),

    -- Sản phẩm cho danh mục LSP02_2 (Nhẫn bạc)
    ('SP13', N'Nhẫn bạc cao cấp', 'LSP02_2', 400000, 20),
    ('SP14', N'Nhẫn bạc phong thủy', 'LSP02_2', 450000, 18),
    ('SP15', N'Nhẫn bạc đính đá', 'LSP02_2', 500000, 12),
    ('SP16', N'Nhẫn bạc khắc tên', 'LSP02_2', 480000, 10),

    -- Sản phẩm cho danh mục LSP03_1 (Vòng tay kim cương)
    ('SP17', N'Vòng tay kim cương cao cấp', 'LSP03_1', 25000000, 5),
    ('SP18', N'Vòng tay kim cương thiết kế', 'LSP03_1', 22000000, 8),
    ('SP19', N'Vòng tay kim cương mẫu A', 'LSP03_1', 26000000, 4),	
    ('SP20', N'Vòng tay kim cương mẫu B', 'LSP03_1', 24000000, 6),

    -- Sản phẩm cho danh mục LSP03_2 (Nhẫn kim cương)
    ('SP21', N'Nhẫn kim cương cao cấp', 'LSP03_2', 15000000, 8),
    ('SP22', N'Nhẫn kim cương thiết kế', 'LSP03_2', 14000000, 10),
    ('SP23', N'Nhẫn kim cương mẫu A', 'LSP03_2', 16000000, 5),
    ('SP24', N'Nhẫn kim cương mẫu B', 'LSP03_2', 15500000, 7),

    -- Sản phẩm cho danh mục LSP04_1 (Vòng tay đá quý)
    ('SP25', N'Vòng tay đá quý ruby', 'LSP04_1', 5000000, 8),
    ('SP26', N'Vòng tay đá quý sapphire', 'LSP04_1', 5200000, 6),
    ('SP27', N'Vòng tay đá quý thạch anh', 'LSP04_1', 4800000, 10),
    ('SP28', N'Vòng tay đá quý ngọc lục bảo', 'LSP04_1', 5500000, 5),

    -- Sản phẩm cho danh mục LSP04_2 (Nhẫn đá quý)
    ('SP29', N'Nhẫn đá quý ruby', 'LSP04_2', 7000000, 12),
    ('SP30', N'Nhẫn đá quý sapphire', 'LSP04_2', 7500000, 10),
    ('SP31', N'Nhẫn đá quý thạch anh', 'LSP04_2', 6800000, 15),
    ('SP32', N'Nhẫn đá quý ngọc lục bảo', 'LSP04_2', 7200000, 8);

INSERT INTO NHACUNGCAP (MaNCC, TenNCC, SoDienThoai, DiaChi) 
VALUES 
    ('NCC010', 'Công Ty TNHH Đá Quý Việt', '0987654321', '123 Đường Lê Lợi, Quận 1, TP.HCM'),
    ('NCC011', 'Gemstone World', '0912345678', '456 Đường Hai Bà Trưng, Quận 3, TP.HCM'),
    ('NCC012', 'Ruby & Sapphire Co.', '0938765432', '789 Đường Nguyễn Văn Linh, Quận 7, TP.HCM'),
    ('NCC013', 'Green Gemstone Supply', '0923456789', '12 Đường Hoàng Diệu, Quận 4, Hà Nội'),
    ('NCC014', 'Thế Giới Đá Quý', '0901234567', '34 Đường Lê Thanh Nghị, Đà Nẵng');
    