import { useEffect, useState, type FC } from "react";
import { Table, Button, Space, Popconfirm, message, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { TimeSlotForm } from "./TimeSlotForm";
import { type TimeSlot } from "../../../types";
import { getTimeSlots, deleteTimeSlot } from "../../../api";
import { useApi } from "../../../hooks";

const { Option } = Select;

export const TimeSlotsManager: FC = () => {
  const { data: timeSlots, loading, request: refresh } = useApi(getTimeSlots);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
  const [searchDay, setSearchDay] = useState<number | undefined>();

  useEffect(() => {
    refresh({});
  }, []);

  const filteredSlots =
    timeSlots?.filter(
      (slot: TimeSlot) => !searchDay || slot.day_of_week === searchDay
    ) || [];

  const handleDelete = async (id: string) => {
    try {
      await deleteTimeSlot(id);
      message.success("Временной слот удален");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении временного слота");
      throw error;
    }
  };

  const columns = [
    {
      title: "День недели",
      dataIndex: "day_of_week",
      key: "day",
      render: (day: number) => {
        const days = [
          "Понедельник",
          "Вторник",
          "Среда",
          "Четверг",
          "Пятница",
          "Суббота",
          "Воскресенье",
        ];
        return days[day - 1] || `День ${day}`;
      },
    },
    {
      title: "Начало",
      dataIndex: "start_time",
      key: "start",
      render: (time: string) => dayjs(time, "HH:mm:ss").format("HH:mm"),
    },
    {
      title: "Конец",
      dataIndex: "end_time",
      key: "end",
      render: (time: string) => dayjs(time, "HH:mm:ss").format("HH:mm"),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: TimeSlot) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentSlot(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить временной слот?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentSlot(null);
            setModalOpen(true);
          }}
        >
          Добавить временной слот
        </Button>

        <Select
          placeholder="Фильтр по дню недели"
          value={searchDay}
          onChange={setSearchDay}
          allowClear
          style={{ width: 200 }}
        >
          <Option value={1}>Понедельник</Option>
          <Option value={2}>Вторник</Option>
          <Option value={3}>Среда</Option>
          <Option value={4}>Четверг</Option>
          <Option value={5}>Пятница</Option>
          <Option value={6}>Суббота</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSlots}
        rowKey="id"
        loading={loading}
      />

      <TimeSlotForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        slot={currentSlot}
      />
    </div>
  );
};
