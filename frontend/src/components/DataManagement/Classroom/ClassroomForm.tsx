import { useEffect, useState, type FC } from "react";
import { Form, Modal, Input, InputNumber, Select, message } from "antd";

import { updateClassroom, createClassroom } from "../../../api";
import { type Classroom } from "../../../types";

const { Option } = Select;

interface ClassroomFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  classroom: Classroom | null;
}

export const ClassroomForm: FC<ClassroomFormProps> = ({
  open,
  onCancel,
  onSuccess,
  classroom,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classroom) {
      form.setFieldsValue({
        number: classroom.number,
        type: classroom.type,
        capacity: classroom.capacity,
      });
    } else {
      form.resetFields();
    }
  }, [classroom, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (classroom) {
        await updateClassroom(classroom.id, values);
        message.success("Аудитория обновлена");
      } else {
        await createClassroom(values);
        message.success("Аудитория создана");
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
      title={classroom ? "Редактировать аудиторию" : "Создать аудиторию"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="number"
          label="Номер аудитории"
          rules={[{ required: true, message: "Введите номер аудитории" }]}
        >
          <Input placeholder="Например: 101" />
        </Form.Item>

        <Form.Item
          name="type"
          label="Тип аудитории"
          rules={[{ required: true, message: "Выберите тип аудитории" }]}
        >
          <Select placeholder="Выберите тип">
            <Option value="lecture">Лекционная</Option>
            <Option value="lab">Лаборатория</Option>
            <Option value="practice">Практическая</Option>
          </Select>
        </Form.Item>

        <Form.Item name="capacity" label="Вместимость">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
