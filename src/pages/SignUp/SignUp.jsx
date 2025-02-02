import React, { useState } from 'react';
import { Layout, Form, Input, Button, Typography, message,Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './SignUp.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    try {
      // Store form data
      localStorage.setItem('signupBasicData', JSON.stringify({
        username: values.username,
        email: values.email    // Add email to stored data
      }));
      
      // Navigate to details page
      navigate('/signup-details');
    } catch (error) {
      message.error('Lỗi khi lưu thông tin đăng ký');
    }
  };

  return (
    <Layout className="app-layout-signupp">
      <Header className="header">
        <div className="header-content">
          <img src="/logo.png" alt="Logo" className="logo-image" />
        </div>
        <div className="icons-and-search1">
            <img 
              src="/1.png" 
              alt="message-icon" 
              className="header-icon11" 
            />
            <img 
              src="/2.png" 
              alt="notification-icon" 
              className="header-icon21" 
            />
          </div>
      </Header>

      <Content className="content">
        <div className="signup-container1">
          <Title level={2} className="signup-title">Đăng Ký</Title>
          <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nhập tên đăng nhập"
              style={{
                height: '40px',
                fontSize: '16px',
                fontWeight: '500',
                borderRadius: '8px',
                border: '2px solid #d9d9d9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Nhập email" style={{
                height: '40px',
                fontSize: '16px',
                fontWeight: '500',
                borderRadius: '8px',
                border: '2px solid #d9d9d9',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}/>
            </Form.Item>
            <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              style={{ width: '100%' }}
            >
              Tiếp tục
            </Button>
          </Form.Item>

            <div className="signup-links">
              Đã có tài khoản? <a href="/dang-nhap">Đăng nhập</a>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default SignUp;