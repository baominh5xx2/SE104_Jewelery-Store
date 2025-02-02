import React, { useState } from "react";
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
  TagOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  MessageOutlined, // Add this import for chatbot icon
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import logo from '../../assets/logo.png'
import "./SidebarComponent.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

const SidebarComponent = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userRole = userData?.role?.toLowerCase();

  if (!isAuthenticated) {
    return null;
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success('Đăng xuất thành công');
    navigate('/', { replace: true });
  };

  const getMenuItems = () => {
    if (!userRole) return [];

    const menuItems = {
      admin: [
        {
          path: '/dashboard',
          icon: <DashboardOutlined />,
          text: 'Dashboard'
        },
        {
          path: '/list-product',
          icon: <AppstoreOutlined />,
          text: 'Quản lý sản phẩm'
        },
        // {
        //   path: '/product-list',
        //   icon: <ShoppingOutlined />,
        //   text: 'Quản lý kho'
        // },
        {
          path: '/warehouse-report',  // Add this new route
          icon: <BarChartOutlined />,
          text: 'Báo cáo tồn kho'
        },
        {
          path: '/unit-type',
          icon: <TagOutlined />,
          text: 'Quản lý đơn vị tính'
        },
        {
          path: '/list-order-product',
          icon: <FileAddOutlined />,
          text: 'Quản lý phiếu bán hàng'
        },
        {
          path: '/list-import-product',
          icon: <ShoppingCartOutlined />,
          text: 'Quản lý phiếu mua hàng'
        },
        {
          path: '/type-product',  // Add this new route
          icon: <TagOutlined/>,
          text: 'Quản lý loại sản phẩm'
        },
        {
          path: '/type-service',
          icon: <TagOutlined />,
          text: 'Quản lý loại dịch vụ'
        },
        {
          path: '/list-service',
          icon: <FileOutlined />,
          text: 'Quản lý phiếu dịch vụ'
        },
        {
          path: '/list-customer',
          icon: <TeamOutlined />,
          text: 'Quản lý khách hàng'
        },
        {
          path: '/list-employee',
          icon: <UserOutlined />,
          text: 'Quản lý nhân viên'
        },
        {
          path: '/chatbot',
          icon: <MessageOutlined />,
          text: 'Trợ lý ảo'
        },
      ],
      seller: [
        {
          path: '/dashboard',
          icon: <DashboardOutlined />,
          text: 'Dashboard'
        },
        {
          path: '/list-order-product',
          icon: <FileAddOutlined />,
          text: 'Quản lý phiếu bán hàng'
        },
        {
          path: '/type-service',
          icon: <TagOutlined />,
          text: 'Quản lý loại dịch vụ'
        },
        {
          path: '/list-service',
          icon: <FileOutlined />,
          text: 'Quản lý phiếu dịch vụ'
        },
        {
          path: '/list-customer',
          icon: <TeamOutlined />,
          text: 'Quản lý khách hàng'
        },
        {
          path: '/chatbot',
          icon: <MessageOutlined />,
          text: 'Trợ lý ảo'
        },
      ],
      warehouse: [
        {
          path: '/dashboard',
          icon: <DashboardOutlined />,
          text: 'Dashboard'
        },
        {
          path: '/list-product',
          icon: <AppstoreOutlined />,
          text: 'Quản lý sản phẩm'
        },
        {
          path: '/list-import-product',
          icon: <ShoppingCartOutlined />,
          text: 'Quản lý phiếu mua hàng'
        },
        // {
        //   path: '/warehouse',
        //   icon: <ShoppingOutlined />,
        //   text: 'Quản lý kho'
        // },
        {
          path: '/unit-type',
          icon: <TagOutlined />,
          text: 'Quản lý đơn vị tính'
        },
        {
          path: '/warehouse-report',  // Add this new route
          icon: <BarChartOutlined />,
          text: 'Báo cáo tồn kho'
        },
        {
          path: '/chatbot',
          icon: <MessageOutlined />,
          text: 'Trợ lý ảo'
        },
      ]
    };

    return menuItems[userRole] || [];
  };

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div onClick={() => handleNavigation('/dashboard')} className="header-logo" style={{ cursor: 'pointer' }}>
          <img src={logo} alt="BUTTH Luxury Jewery" />
        </div>
      </header>
      
      <nav className="sidebar-nav">
        <ul className="nav-list primary-nav">
          {getMenuItems().map((item, index) => (
            <li key={index}>
              <div 
                onClick={() => handleNavigation(item.path)} 
                className="nav-link" 
                style={{ cursor: 'pointer' }}
              >
                {item.icon}
                <span>{item.text}</span>
              </div>
            </li>
          ))}
        </ul>

        <ul className="nav-list secondary-nav">
          <li>
            <div onClick={() => handleNavigation('/personal')} className="nav-link" style={{ cursor: 'pointer' }}>
              <UserOutlined />
              <span>Cá nhân</span>
            </div>
          </li>
          <li>
            <div onClick={handleLogout} className="nav-link" style={{ cursor: 'pointer', color: 'red' }}>
              <LogoutOutlined />
              <span>Đăng xuất</span>
            </div>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarComponent;
