import React, { useState } from 'react';
import { Layout, Form, Input, Button, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signIn } from '../../services/userAPI';
import './SignIn.css';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Search } = Input;

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSearch = (value) => console.log(value);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      console.log('Login attempt with:', values);
      
      const response = await signIn(values.username, values.password);
      console.log('Login response:', response);
      
      if (response && response.accessToken) {
        // Lưu token và user data
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('userData', JSON.stringify({
          userId: response.userId,
          username: response.username,
          role: response.role
        }));

        // Kiểm tra xem đã lưu thành công chưa
        const savedToken = localStorage.getItem('accessToken');
        const savedUserData = localStorage.getItem('userData');
        console.log('Stored token:', savedToken);
        console.log('Stored user data:', savedUserData);

        // Gọi login từ context nếu có
        if (login) {
          login(response);
        }
        
        message.success('Đăng nhập thành công!');
        
        // Delay chút trước khi chuyển hướng
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="app-layout-signin">
      <Header className="headerr">
        <div className="header-content">
          <img src="/logo.png" alt="Logo" className="logo-image" />

          <div className="icons-and-search">
            <img 
              src="/1.png" 
              alt="message-icon" 
              className="header-icon1" 
            />
            <img 
              src="/2.png" 
              alt="notification-icon" 
              className="header-icon2" 
            />
          </div>
        </div>
      </Header>

      <Content className="content">
        <div className="signin-container">
          <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
            ĐĂNG NHẬP
          </Title>
          
          <Form
            name="signin_form"
            layout="vertical"
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Nhập tên đăng nhập"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Nhập mật khẩu"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                style={{ width: '100%' }}
                loading={loading}
              >
                ĐĂNG NHẬP
              </Button>
            </Form.Item>

            <div className="signin-links">
              Chưa có tài khoản? <a href="/dang-ky">Đăng ký ngay</a>
            </div>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default SignIn;