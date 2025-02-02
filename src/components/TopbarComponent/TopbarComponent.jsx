import React from 'react';
import { Avatar } from 'antd';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import './TopbarComponent.css'

const Topbar = ({ title }) => {
  return (
    <div className="topbar-container">
      <h2 className="topbar-title">{title}</h2>
      <div className="topbar-actions">
        <BellOutlined className="topbar-icon" style={{ fontSize: 20, marginRight: 16 }} />
        <Avatar size="large" icon={<UserOutlined />} />
      </div>
    </div>
  );
};

export default Topbar;
