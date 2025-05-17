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
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specRes, courseRes] = await Promise.all([
          getSpecialties(),
          getCourses(),
        ]);
        setSpecialties(specRes.data);
        setCourses(courseRes.data);
        setDataLoaded(true);
      } catch (error) {
        message.error("Ошибка загрузки данных");
        throw error;
      }
    };
    fetchData();
  }, []);

  // Устанавливаем значения формы только после загрузки specialties и courses
  useEffect(() => {
    if (group && dataLoaded) {
      form.setFieldsValue({
        name: group.name,
        specialty_id: group.specialty.id,
        course_id: group.course.id,
        study_form: group.study_form,
        subgroup: group.subgroup,
      });
    } else if (dataLoaded) {
      form.resetFields();
    }
  }, [group, form, dataLoaded]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Преобразуем значения формы к нужному виду для API
      const payload: any = {
        name: values.name,
        specialty: values.specialty_id,
        course: values.course_id,
        study_form: values.study_form,
      };
      if (values.subgroup !== undefined) {
        payload.subgroup = values.subgroup;
      }

      if (group) {
        await updateGroup(group.id, payload);
        message.success("Группа обновлена");
        form.resetFields();
      } else {
        await createGroup(payload);
        message.success("Группа создана");
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
          <Select placeholder="Выберите специальность" loading={!dataLoaded}>
            {specialties.map((spec) => (
              <Option key={spec.id} value={spec.id}>
                {spec.code} - {spec.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="course_id"
          label="Курс"
          rules={[{ required: true, message: "Выберите курс" }]}
        >
          <Select placeholder="Выберите курс" loading={!dataLoaded}>
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
