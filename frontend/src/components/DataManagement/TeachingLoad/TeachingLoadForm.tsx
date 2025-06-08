import { useEffect, useState, type FC } from "react";
import {
  Form,
  Modal,
  Select,
  Row,
  Col,
  InputNumber,
  message,
  Tabs,
} from "antd";

import {
  getDisciplines,
  getGroups,
  getTeachers,
  updateTeachingLoad,
  createTeachingLoad,
} from "../../../api";
import { type TeachingLoad } from "../../../types";

const { Option } = Select;
const { TabPane } = Tabs;

interface TeachingLoadFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  load: TeachingLoad | null;
}

export const TeachingLoadForm: FC<TeachingLoadFormProps> = ({
  open,
  onCancel,
  onSuccess,
  load,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [discRes, groupsRes, teachersRes] = await Promise.all([
          getDisciplines(),
          getGroups(),
          getTeachers(),
        ]);
        setDisciplines(discRes.data);
        setGroups(groupsRes.data);
        setTeachers(teachersRes.data);
        setDataLoaded(true);
      } catch (error) {
        message.error("Ошибка загрузки данных");
        throw error;
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (load && dataLoaded) {
      form.setFieldsValue({
        discipline_id: load.discipline_id,
        group_id: load.group_id,
        teacher_id: load.teacher,
        total_hours: load.total_hours,
        self_study_hours: load.self_study_hours,
        current_year_hours: load.current_year_hours,
        semester1_hours: load.semester1_hours,
        semester2_hours: load.semester2_hours,
        hours_to_issue: load.hours_to_issue,
        course_design_hours: load.course_design_hours,
        semester1_exams: load.semester1_exams,
        semester2_exams: load.semester2_exams,
        course_work_check_hours: load.course_work_check_hours,
        consultations_hours: load.consultations_hours,
        dp_review_hours: load.dp_review_hours,
        dp_guidance_hours: load.dp_guidance_hours,
        total_teaching_hours: load.total_teaching_hours,
        master_training_hours: load.master_training_hours,
        advanced_level_hours: load.advanced_level_hours,
        notebook_check_10_percent: load.notebook_check_10_percent,
        notebook_check_15_percent: load.notebook_check_15_percent,
      });
    } else if (dataLoaded) {
      form.resetFields();
    }
  }, [load, form, dataLoaded]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const payload = {
        discipline: values.discipline_id,
        group: values.group_id,
        teacher: values.teacher_id,
        ...values,
      };

      if (load) {
        await updateTeachingLoad(load.id, payload);
        message.success("Нагрузка обновлена");
      } else {
        await createTeachingLoad(payload);
        message.success("Нагрузка создана");
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
      title={load ? "Редактировать нагрузку" : "Создать нагрузку"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="discipline_id"
              label="Дисциплина"
              rules={[{ required: true, message: "Выберите дисциплину" }]}
            >
              <Select placeholder="Дисциплина" loading={!dataLoaded}>
                {disciplines.map((disc) => (
                  <Option key={disc.id} value={disc.id}>
                    {disc.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="group_id"
              label="Группа"
              rules={[{ required: true, message: "Выберите группу" }]}
            >
              <Select placeholder="Группа" loading={!dataLoaded}>
                {groups.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="teacher_id"
              label="Преподаватель"
              rules={[{ required: true, message: "Выберите преподавателя" }]}
            >
              <Select placeholder="Преподаватель" loading={!dataLoaded}>
                {teachers.map((teacher) => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.short_name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Основные" key="1">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="total_hours" label="Общий объем">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="self_study_hours"
                  label="Самостоятельная нагрузка"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="current_year_hours"
                  label="Часов в текущем году"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="semester1_hours" label="Часов в 1 семестре">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="semester2_hours" label="Часов во 2 семестре">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Дополнительно" key="2">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="course_design_hours"
                  label="Курсовое проектирование"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="semester1_exams" label="Экзамены 1 семестр">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="semester2_exams" label="Экзамены 2 семестр">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="consultations_hours" label="Консультации">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dp_review_hours" label="Рецензирование ДП">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dp_guidance_hours" label="Руководство ДП">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Прочее" key="3">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="notebook_check_10_percent"
                  label="Проверка тетрадей 10%"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="notebook_check_15_percent"
                  label="Проверка тетрадей 15%"
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="master_training_hours" label="Мастер-обучение">
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};
