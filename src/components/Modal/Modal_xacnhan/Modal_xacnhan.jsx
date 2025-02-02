import React from "react";
import { Modal, Select, Checkbox } from "antd";

const { Option } = Select;

const ServiceConfirmationModal = ({
  isVisible,
  onConfirm,
  onCancel,
  title,
  content,
  amount
}) => {
  return (
    <Modal
      className="xacn"
      title={title || "Xác nhận lập phiếu"}
      open={isVisible}  // Thay đổi thành open
      onOk={onConfirm}
      onCancel={onCancel}
      maskClosable={false}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <p>{content}</p>
      {amount && (
        <div style={{ marginTop: "20px" }}>
          <label>Tổng tiền: </label>
          <span style={{ fontWeight: "bold" }}>{amount.toLocaleString()} VND</span>
        </div>
      )}
    </Modal>
  );
};

export default ServiceConfirmationModal;
