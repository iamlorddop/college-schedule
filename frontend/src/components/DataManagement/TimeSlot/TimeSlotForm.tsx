import { useEffect, useState, type FC } from "react";
import { Form, Modal, Select, TimePicker, message } from "antd";
import dayjs from "dayjs";

import { updateTimeSlot, createTimeSlot } from "../../../api";
import { type TimeSlot } from "../../../types";

const { Option } = Select;

interface TimeSlotFormProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  slot: TimeSlot | null;
}

export const TimeSlotForm: FC<TimeSlotFormProps> = ({
  open,
  onCancel,
  onSuccess,
  slot,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slot) {
      form.setFieldsValue({
        day_of_week: slot.day_of_week,
        start_time: dayjs(slot.start_time, "HH:mm:ss"),
        end_time: dayjs(slot.end_time, "HH:mm:ss"),
      });
    } else {
      form.resetFields();
    }
  }, [slot, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const payload = {
        day_of_week: values.day_of_week,
        start_time: values.start_time.format("HH:mm:ss"),
        end_time: values.end_time.format("HH:mm:ss"),
      };

      if (slot) {
        await updateTimeSlot(slot.id, payload);
        message.success("Временной слот обновлен");
      } else {
        await createTimeSlot(payload);
        message.success("Временной слот создан");
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
      title={slot ? "Редактировать временной слот" : "Создать временной слот"}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="day_of_week"
          label="День недели"
          rules={[{ required: true, message: "Выберите день недели" }]}
        >
          <Select placeholder="Выберите день недели">
            <Option value={1}>Понедельник</Option>
            <Option value={2}>Вторник</Option>
            <Option value={3}>Среда</Option>
            <Option value={4}>Четверг</Option>
            <Option value={5}>Пятница</Option>
            <Option value={6}>Суббота</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="start_time"
          label="Время начала"
          rules={[{ required: true, message: "Укажите время начала" }]}
        >
          <TimePicker format="HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="end_time"
          label="Время окончания"
          rules={[{ required: true, message: "Укажите время окончания" }]}
        >
          <TimePicker format="HH:mm" style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
