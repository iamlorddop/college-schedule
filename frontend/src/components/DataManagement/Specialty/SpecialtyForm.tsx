import { type FC, useEffect, useState } from "react";
import { Form, Modal, Input, message } from "antd";

import { createSpecialty, updateSpecialty } from "../../../api";
import { type Specialty } from "../../../types";

interface SpecialtyFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  specialty: Specialty | null;
}

export const SpecialtyForm: FC<SpecialtyFormProps> = ({
  open,
  onCancel,
  onSuccess,
  specialty,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (specialty) {
      form.setFieldsValue({
        name: specialty.name,
        code: specialty.code,
      });
    } else {
      form.resetFields();
    }
  }, [specialty, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      if (specialty) {
        await updateSpecialty(specialty.id, values);
        message.success("Специальность обновлена");
      } else {
        await createSpecialty(values);
        message.success("Специальность создана");
      }
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error("Ошибка при сохранении");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        specialty ? "Редактировать специальность" : "Создать специальность"
      }
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="code"
          label="Код специальности"
          rules={[
            { required: true, message: "Введите код специальности" },
            { max: 32, message: "Слишком длинный код" },
          ]}
        >
          <Input placeholder="Например: 09.02.07" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Название специальности"
          rules={[
            { required: true, message: "Введите название специальности" },
            { max: 128, message: "Слишком длинное название" },
          ]}
        >
          <Input placeholder="Например: Информационные системы и программирование" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
