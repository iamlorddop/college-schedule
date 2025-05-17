import { type FC, useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { TeacherForm } from "./TeacherForm";
import { type Teacher } from "../../../types";
import { deleteTeacher, getTeachers } from "../../../api";
import { useApi } from "../../../hooks";

export const TeachersManager: FC = () => {
  const { data: teachers, loading, request: refresh } = useApi(getTeachers);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    refresh({});
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteTeacher(id);
      message.success("Преподаватель удален");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении преподавателя");
      throw error;
    }
  };

  const filteredTeachers =
    teachers?.filter(
      (teacher) =>
        teacher.last_name.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.first_name.toLowerCase().includes(searchText.toLowerCase()) ||
        (teacher.middle_name &&
          teacher.middle_name.toLowerCase().includes(searchText.toLowerCase()))
    ) || [];

  const columns = [
    {
      title: "Фамилия",
      dataIndex: "last_name",
      key: "last_name",
      sorter: (a: Teacher, b: Teacher) =>
        a.last_name.localeCompare(b.last_name),
    },
    {
      title: "Имя",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Отчество",
      dataIndex: "middle_name",
      key: "middle_name",
    },
    {
      title: "Краткое имя",
      key: "short_name",
      render: (_: any, record: Teacher) =>
        `${record.last_name} ${record.first_name[0]}.${
          record.middle_name ? record.middle_name[0] + "." : ""
        }`,
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Teacher) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentTeacher(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить преподавателя?"
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
          placeholder="Поиск преподавателей"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentTeacher(null);
            setModalOpen(true);
          }}
        >
          Добавить преподавателя
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredTeachers}
        rowKey="id"
        loading={loading}
      />

      <TeacherForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        teacher={currentTeacher}
      />
    </div>
  );
};
