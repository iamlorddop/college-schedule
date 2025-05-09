import { type FC, useEffect, useState } from "react";
import { Form, Modal, Input, message } from "antd";

import { createTeacher, updateTeacher } from "../../../api";
import { type Teacher } from "../../../types";

interface TeacherFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  teacher: Teacher | null;
}

export const TeacherForm: FC<TeacherFormProps> = ({
  open,
  onCancel,
  onSuccess,
  teacher,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      form.setFieldsValue({
        last_name: teacher.last_name,
        first_name: teacher.first_name,
        middle_name: teacher.middle_name,
      });
    } else {
      form.resetFields();
    }
  }, [teacher, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (teacher) {
        await updateTeacher(teacher.id, values);
        message.success("Преподаватель обновлен");
      } else {
        await createTeacher(values);
        message.success("Преподаватель создан");
      }

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
      title={teacher ? "Редактировать преподавателя" : "Добавить преподавателя"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="last_name"
          label="Фамилия"
          rules={[{ required: true, message: "Введите фамилию" }]}
        >
          <Input placeholder="Иванов" />
        </Form.Item>

        <Form.Item
          name="first_name"
          label="Имя"
          rules={[{ required: true, message: "Введите имя" }]}
        >
          <Input placeholder="Иван" />
        </Form.Item>

        <Form.Item name="middle_name" label="Отчество">
          <Input placeholder="Иванович" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
