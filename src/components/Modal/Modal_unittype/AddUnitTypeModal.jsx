import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { createUnitType } from '../../../services/UnitTypeService';

const AddUnitTypeModal = ({ isVisible, onClose, unitTypes = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Check for duplicate ID
      const duplicateId = unitTypes.find(
        unit => unit.id.toLowerCase() === values.id.toLowerCase().trim()
      );
      if (duplicateId) {
        message.error('Mã đơn vị tính này đã tồn tại trong hệ thống!');
        setLoading(false);
        return;
      }

      // Check for duplicate name - make case-insensitive comparison
      const duplicateName = unitTypes.find(
        unit => unit.name.toLowerCase() === values.name.toLowerCase().trim()
      );
      if (duplicateName) {
        message.error('Tên đơn vị tính này đã tồn tại trong hệ thống!');
        setLoading(false);
        return;
      }
      
      await createUnitType({
        id: values.id.trim(),
        name: values.name.trim()
      });
      message.success('Thêm đơn vị tính thành công');
      form.resetFields();
      onClose(true);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Có lỗi xảy ra khi thêm đơn vị tính!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm đơn vị tính"
      visible={isVisible}
      open={isVisible}
      confirmLoading={loading}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      okText="Thêm"
      cancelText="Hủy"
      width={500}
      centered
      maskClosable={false}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="id"
          label="Mã đơn vị tính"
          rules={[
            { required: true, message: 'Vui lòng nhập mã đơn vị tính' },
            { max: 50, message: 'Mã đơn vị tính không được vượt quá 50 ký tự' }
          ]}
        >
          <Input placeholder="Nhập mã đơn vị tính" maxLength={50} />
        </Form.Item>

        <Form.Item
          name="name"
          label="Tên đơn vị tính"
          rules={[
            { required: true, message: 'Vui lòng nhập tên đơn vị tính' },
            { max: 100, message: 'Tên đơn vị tính không được vượt quá 100 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tên đơn vị tính" maxLength={100} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUnitTypeModal;
