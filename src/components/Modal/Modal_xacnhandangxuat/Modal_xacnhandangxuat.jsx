// src/components/Modal/Modal_xacnhandangxuat/Modal_xacnhandangxuat.jsx
import React from "react";
import { Modal } from "antd";
import "./Modal_xacnhandangxuat.css";

const LogoutConfirmationModal = ({ isVisible, onConfirm, onCancel }) => {
  return (
    <Modal
      title="Xác nhận đăng xuất"
      open={isVisible} // Changed from visible to open
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Đăng xuất"
      cancelText="Hủy"
      centered
    >
      <p>Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?</p>
    </Modal>
  );
};

export default LogoutConfirmationModal;