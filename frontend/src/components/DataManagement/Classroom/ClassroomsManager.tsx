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

import { ClassroomForm } from "./ClassroomForm";
import { type Classroom } from "../../../types";
import { getClassrooms, deleteClassroom } from "../../../api";
import { useApi } from "../../../hooks";

const { Option } = Select;
const { useBreakpoint } = Grid;

const classroomTypes = {
  lecture: "Лекционная",
  lab: "Лаборатория",
  practice: "Практическая",
} as const;

export const ClassroomsManager: FC = () => {
  const { data: classrooms, loading, request: refresh } = useApi(getClassrooms);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(
    null
  );
  const [searchType, setSearchType] = useState<string>();
  const screens = useBreakpoint();

  useEffect(() => {
    refresh({});
  }, []);

  const filteredClassrooms = useMemo(() => {
    return (
      classrooms?.filter(
        (classroom: Classroom) => !searchType || classroom.type === searchType
      ) || []
    );
  }, [classrooms, searchType]);

  const handleDelete = async (id: string) => {
    try {
      await deleteClassroom(id);
      message.success("Аудитория удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении аудитории");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "Номер",
      dataIndex: "number",
      key: "number",
    },
    {
      title: "Тип",
      dataIndex: "type",
      key: "type",
      render: (type: keyof typeof classroomTypes) =>
        classroomTypes[type] || type,
    },
    {
      title: "Вместимость",
      dataIndex: "capacity",
      key: "capacity",
      render: (cap: number) => cap || "—",
    },
    {
      title: "Действия",
      key: "actions",
      width: 120,
      render: (_: any, record: Classroom) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentClassroom(record);
              setModalOpen(true);
            }}
            aria-label="Редактировать"
          />
          <Popconfirm
            title="Удалить аудиторию?"
            onConfirm={() => handleDelete(record.id)}
            okText="Удалить"
            cancelText="Отмена"
          >
            <Button icon={<DeleteOutlined />} danger aria-label="Удалить" />
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
        style={{ marginBottom: 16 }}
        wrap="wrap"
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentClassroom(null);
            setModalOpen(true);
          }}
          style={{ marginBottom: !screens.sm ? 8 : 0 }}
        >
          {screens.sm ? "Добавить аудиторию" : "Добавить"}
        </Button>

        <Select
          placeholder="Фильтр по типу"
          value={searchType}
          onChange={setSearchType}
          allowClear
          style={{ width: screens.xs ? "100%" : 200 }}
          aria-label="Тип аудитории"
        >
          {Object.entries(classroomTypes).map(([value, label]) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
      </Flex>

      <Table
        columns={columns}
        dataSource={filteredClassrooms}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          responsive: true,
        }}
      />

      <ClassroomForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        classroom={currentClassroom}
      />
    </div>
  );
};
