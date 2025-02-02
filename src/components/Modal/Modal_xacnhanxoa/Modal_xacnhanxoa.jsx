import React from "react";
import { Modal } from "antd";
import "./Modal_xacnhanxoa.css"; // Import CSS

const DeleteConfirmationModal = ({ isVisible, onConfirm, onCancel, message }) => {
  return (
    <Modal
      className="ttcc"
      title="Xác nhận xóa"
      open={isVisible}  // Thay đổi thành open
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Xóa"
      cancelText="Hủy"
      maskClosable={false}
      okButtonProps={{ danger: true }}
    >
      <p className="delete-modal-message">{message}</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
