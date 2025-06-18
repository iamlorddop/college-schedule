import { useEffect, useState, type FC, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Select,
  Flex,
  Grid,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import { TimeSlotForm } from "./TimeSlotForm";
import { type TimeSlot } from "../../../types";
import { getTimeSlots, deleteTimeSlot } from "../../../api";
import { useApi } from "../../../hooks";

const { Option } = Select;
const { useBreakpoint } = Grid;

const daysOfWeek = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

export const TimeSlotsManager: FC = () => {
  const screens = useBreakpoint();
  const { data: timeSlots, loading, request: refresh } = useApi(getTimeSlots);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlot, setCurrentSlot] = useState<TimeSlot | null>(null);
  const [searchDay, setSearchDay] = useState<number | undefined>();

  useEffect(() => {
    refresh({});
  }, []);

  const filteredSlots = useMemo(() => {
    return (
      timeSlots?.filter(
        (slot: TimeSlot) => !searchDay || slot.day_of_week === searchDay
      ) || []
    );
  }, [timeSlots, searchDay]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTimeSlot(id);
      message.success("Временной слот удален");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении временного слота");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "День",
      dataIndex: "day_of_week",
      key: "day",
      render: (day: number) => {
        return screens.sm
          ? daysOfWeek[day - 1] || `День ${day}`
          : daysOfWeek[day - 1]?.substring(0, 2) || day;
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
      width: screens.xs ? 100 : undefined,
      render: (_: unknown, record: TimeSlot) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentSlot(record);
              setModalOpen(true);
            }}
            size="small"
          />
          <Popconfirm
            title="Удалить слот?"
            onConfirm={() => handleDelete(record.id)}
            okText="Удалить"
            cancelText="Отмена"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Flex
        justify="space-between"
        align="center"
        gap={16}
        wrap="wrap"
        style={{ marginBottom: 16 }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentSlot(null);
            setModalOpen(true);
          }}
          size={screens.xs ? "small" : "middle"}
        >
          {screens.xs ? "Добавить" : "Добавить слот"}
        </Button>

        <Select
          placeholder={screens.xs ? "День" : "Фильтр по дню недели"}
          value={searchDay}
          onChange={setSearchDay}
          allowClear
          style={{ width: screens.xs ? 120 : 200 }}
          size={screens.xs ? "small" : "middle"}
        >
          {daysOfWeek.slice(0, 6).map((day, index) => (
            <Option key={index + 1} value={index + 1}>
              {screens.xs ? day.substring(0, 2) : day}
            </Option>
          ))}
        </Select>
      </Flex>

      <Table
        columns={columns}
        dataSource={filteredSlots}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
        size={screens.xs ? "small" : "middle"}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          responsive: true,
          size: screens.xs ? "small" : "default",
        }}
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
