import { type FC, useEffect, useState } from "react";
import { Form, Modal, Input, Select, message } from "antd";

import {
  getSpecialties,
  createDiscipline,
  updateDiscipline,
} from "../../../api";
import { type Discipline } from "../../../types";

const { Option } = Select;

interface DisciplineFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  discipline: Discipline | null;
}

export const DisciplineForm: FC<DisciplineFormProps> = ({
  open,
  onCancel,
  onSuccess,
  discipline,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<any[]>([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialties();
        setSpecialties(res.data);
      } catch (error) {
        message.error("Ошибка загрузки специальностей");
        throw error;
      }
    };
    fetchSpecialties();
  }, []);

  useEffect(() => {
    if (discipline) {
      form.setFieldsValue({
        name: discipline.name,
        specialty_id: discipline.specialty.id,
      });
    } else {
      form.resetFields();
    }
  }, [discipline, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      // Преобразуем specialty_id -> specialty
      const payload = {
        name: values.name,
        specialty: values.specialty_id,
      };

      if (discipline) {
        await updateDiscipline(discipline.id, payload);
        message.success("Дисциплина обновлена");
        form.resetFields();
      } else {
        await createDiscipline(payload);
        message.success("Дисциплина создана");
        form.resetFields();
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
      title={discipline ? "Редактировать дисциплину" : "Добавить дисциплину"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Название дисциплины"
          rules={[{ required: true, message: "Введите название дисциплины" }]}
        >
          <Input placeholder="Например: Математика" />
        </Form.Item>

        <Form.Item
          name="specialty_id"
          label="Специальность"
          rules={[{ required: true, message: "Выберите специальность" }]}
        >
          <Select placeholder="Выберите специальность">
            {specialties.map((spec) => (
              <Option key={spec.id} value={spec.id}>
                {spec.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
