import { useEffect, useState, type FC } from "react";
import { Form, Modal, Select, Input, message } from "antd";

import {
  getSpecialties,
  getCourses,
  updateGroup,
  createGroup,
} from "../../../api";
import { type Group } from "../../../types";

const { Option } = Select;

interface GroupFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  group: Group | null;
}

export const GroupForm: FC<GroupFormProps> = ({
  open,
  onCancel,
  onSuccess,
  group,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, courseRes] = await Promise.all([
          getSpecialties(),
          getCourses(),
        ]);
        setSpecialties(specRes.data);
        setCourses(courseRes.data);
      } catch (error) {
        message.error("Ошибка загрузки данных");
        throw error;
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (group) {
      form.setFieldsValue({
        name: group.name,
        specialty_id: group.specialty.id,
        course_id: group.course.id,
        study_form: group.study_form,
        subgroup: group.subgroup,
      });
    } else {
      form.resetFields();
    }
  }, [group, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (group) {
        await updateGroup(group.id, values);
        message.success("Группа обновлена");
      } else {
        await createGroup(values);
        message.success("Группа создана");
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
      title={group ? "Редактировать группу" : "Создать группу"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Название группы"
          rules={[{ required: true, message: "Введите название группы" }]}
        >
          <Input placeholder="Например: ИСП-201" />
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

        <Form.Item
          name="course_id"
          label="Курс"
          rules={[{ required: true, message: "Выберите курс" }]}
        >
          <Select placeholder="Выберите курс">
            {courses.map((course) => (
              <Option key={course.id} value={course.id}>
                {course.number} курс
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="study_form"
          label="Форма обучения"
          rules={[{ required: true, message: "Выберите форму обучения" }]}
        >
          <Select placeholder="Выберите форму обучения">
            <Option value="б">Бюджет</Option>
            <Option value="п">Коммерция</Option>
            <Option value="в">Вечернее</Option>
          </Select>
        </Form.Item>

        <Form.Item name="subgroup" label="Подгруппа">
          <Select placeholder="Выберите подгруппу (если есть)">
            <Option value={1}>1 подгруппа</Option>
            <Option value={2}>2 подгруппа</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};
