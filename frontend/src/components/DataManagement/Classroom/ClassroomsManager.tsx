import { useEffect, useState, type FC } from "react";
import { Table, Button, Space, Popconfirm, message, Select } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { ClassroomForm } from "./ClassroomForm";
import { type Classroom } from "../../../types";
import { getClassrooms, deleteClassroom } from "../../../api";
import { useApi } from "../../../hooks";

const { Option } = Select;

export const ClassroomsManager: FC = () => {
  const { data: classrooms, loading, request: refresh } = useApi(getClassrooms);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState<Classroom | null>(
    null
  );
  const [searchType, setSearchType] = useState<string | undefined>();

  useEffect(() => {
    refresh({});
  }, []);

  const filteredClassrooms =
    classrooms?.filter(
      (classroom: Classroom) => !searchType || classroom.type === searchType
    ) || [];

  const handleDelete = async (id: string) => {
    try {
      await deleteClassroom(id);
      message.success("Аудитория удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении аудитории");
      throw error;
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
      render: (type: string) => {
        const types: Record<string, string> = {
          lecture: "Лекционная",
          lab: "Лаборатория",
          practice: "Практическая",
        };
        return types[type] || type;
      },
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
      render: (_: any, record: Classroom) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentClassroom(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить аудиторию?"
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
            setCurrentClassroom(null);
            setModalOpen(true);
          }}
        >
          Добавить аудиторию
        </Button>

        <Select
          placeholder="Фильтр по типу"
          value={searchType}
          onChange={setSearchType}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="lecture">Лекционная</Option>
          <Option value="lab">Лаборатория</Option>
          <Option value="practice">Практическая</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredClassrooms}
        rowKey="id"
        loading={loading}
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
