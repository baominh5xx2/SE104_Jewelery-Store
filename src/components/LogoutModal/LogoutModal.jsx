import React from 'react';
import { Modal } from 'antd';

const LogoutModal = ({ isVisible, onCancel, onConfirm }) => {
  return (
    <Modal
      title="Xác nhận đăng xuất"
      open={isVisible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Đăng xuất"
      cancelText="Hủy"
      okButtonProps={{ 
        danger: true,
        type: 'primary'
      }}
      maskClosable={false}
      destroyOnClose
      centered
    >
      <p>Bạn có chắc chắn muốn đăng xuất không?</p>
    </Modal>
  );
};

export default LogoutModal;
