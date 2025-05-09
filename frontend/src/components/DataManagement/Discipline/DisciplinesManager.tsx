import { type FC, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { DisciplineForm } from "./DisciplineForm";
import { type Discipline } from "../../../types";
import { getDisciplines, deleteDiscipline } from "../../../api";
import { useApi } from "../../../hooks";

export const DisciplinesManager: FC = () => {
  const {
    data: disciplines,
    loading,
    request: refresh,
  } = useApi(getDisciplines);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState<Discipline | null>(
    null
  );
  const [searchText, setSearchText] = useState("");

  const handleDelete = async (id: string) => {
    try {
      await deleteDiscipline(id);
      message.success("Дисциплина удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении дисциплины");
      throw error;
    }
  };

  const filteredDisciplines =
    disciplines?.filter((discipline) =>
      discipline.name.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      sorter: (a: Discipline, b: Discipline) => a.name.localeCompare(b.name),
    },
    {
      title: "Специальность",
      dataIndex: ["specialty", "name"],
      key: "specialty",
      sorter: (a: Discipline, b: Discipline) =>
        a.specialty.name.localeCompare(b.specialty.name),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Discipline) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentDiscipline(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить дисциплину?"
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
        <Input
          placeholder="Поиск дисциплин"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentDiscipline(null);
            setModalOpen(true);
          }}
        >
          Добавить дисциплину
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredDisciplines}
        rowKey="id"
        loading={loading}
      />

      <DisciplineForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        discipline={currentDiscipline}
      />
    </div>
  );
};
