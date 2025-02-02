import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateUnitType } from '../../../services/UnitTypeService';

const EditUnitTypeModal = ({ isVisible, onClose, initialData, unitTypes = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Update form values when initialData changes
  useEffect(() => {
    if (isVisible && initialData) {
      console.log('Initial Data:', initialData); // Thêm log để debug
      form.setFieldsValue({
        MaDonVi: initialData.id, // Đổi từ id sang MaDonVi
        TenDonVi: initialData.name // Đổi từ name sang TenDonVi
      });
    }
  }, [isVisible, initialData, form]);

  useEffect(() => {
    // Log ra form values mỗi khi form thay đổi
    console.log('Form values:', form.getFieldsValue());
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Kiểm tra tên đơn vị tính trùng, loại trừ chính nó
      const duplicateName = unitTypes.find(
        unit => unit.id !== values.MaDonVi && // Bỏ qua chính nó
          unit.TenDonVi.toLowerCase().trim() === values.TenDonVi.toLowerCase().trim()
      );
      if (duplicateName) {
        message.error('Tên đơn vị tính đã được sử dụng!');
        return;
      }

      await updateUnitType(initialData.MaDonVi, {
        MaDonVi: values.MaDonVi,
        TenDonVi: values.TenDonVi.trim()
      });

      message.success('Cập nhật đơn vị tính thành công');
      onClose(true);
    } catch (error) {
      if (error.message?.includes('duplicate')) {
        message.error('Tên đơn vị tính đã tồn tại!');
      } else {
        message.error('Mã hoặc tên đơn vị tính đã tồn tại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thông tin đơn vị tính"
      visible={isVisible}
      open={isVisible}
      destroyOnClose={true}
      maskClosable={true}
      keyboard={true}
      centered={true}
      width={500}
      onCancel={onClose}
      footer={null}
      zIndex={1001}
    >
      <Form 
        form={form}
        layout="vertical"
        initialValues={initialData}
        disabled={true}
      >
        <Form.Item
          name="MaDonVi"
          label="Mã đơn vị tính"
        >
          <Input readOnly />
        </Form.Item>

        <Form.Item
          name="TenDonVi"
          label="Tên đơn vị tính"
        >
          <Input readOnly />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUnitTypeModal;
