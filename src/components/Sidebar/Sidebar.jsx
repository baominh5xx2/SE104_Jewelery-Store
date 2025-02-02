import React from "react";
import {
  DashboardOutlined,
  AppstoreOutlined,
  FileAddOutlined,
  ShoppingCartOutlined,
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  DollarOutlined,
  LogoutOutlined,
  TagOutlined, // Add this import for unit type icon
} from "@ant-design/icons";
import { useNavigate } from 'react-router-dom'; // Add this import
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate(); // Add this hook

  return (
    <aside className="sidebar">
        <header className="sidebar-header">
          <a href="#" className="header-logo">
            <img src="logo_admin.png" alt="GemiraElegance" />
          </a>
        </header>
        <nav className="sidebar-nav">
          <ul className="nav-list primary-nav">
            <li>
              <a href="#" className="nav-link">
                <DashboardOutlined />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <AppstoreOutlined />
                <span>Quản lý kho</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <ShoppingCartOutlined />
                <span>Quản lý phiếu mua hàng</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <FileOutlined />
                <span>Quản lý phiếu dịch vụ</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <TeamOutlined />
                <span>Quản lý khách hàng</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <UserOutlined />
                <span>Quản lý nhân viên</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <DollarOutlined />
                <span>Quản lý doanh thu</span>
              </a>
            </li>
            <li>
              <a onClick={() => navigate('/unit-type')} className="nav-link">
                <TagOutlined />
                <span>Quản lý đơn vị tính</span>
              </a>
            </li>
          </ul>
          <ul className="nav-list secondary-nav">
            <li>
              <a href="#" className="nav-link">
                <UserOutlined />
                <span>Cá nhân</span>
              </a>
            </li>
            <li>
              <a href="#" className="nav-link">
                <LogoutOutlined />
                <span>Đăng xuất</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
  );
};

export default Sidebar;
