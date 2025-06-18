import { type FC, useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Typography,
  Grid,
  Card,
} from "antd";
import type { ColumnType, ColumnGroupType } from "antd/es/table";
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

const { useBreakpoint } = Grid;

export const TeachersManager: FC = () => {
  const { data: teachers, loading, request: refresh } = useApi(getTeachers);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [searchText, setSearchText] = useState("");
  const screens = useBreakpoint();

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

  const baseColumns: (ColumnGroupType<Teacher> | ColumnType<Teacher>)[] = [
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
      responsive: ["md"],
    },
    {
      title: "Краткое имя",
      key: "short_name",
      render: (_: any, record: Teacher) =>
        `${record.last_name} ${record.first_name[0]}.${
          record.middle_name ? record.middle_name[0] + "." : ""
        }`,
      responsive: ["sm"],
    },
    {
      title: "Логин",
      key: "username",
      render: (_: any, record: Teacher) => (
        <Typography.Text copyable={!!record.user?.username}>
          {record.user?.username || "-"}
        </Typography.Text>
      ),
      responsive: ["lg"],
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
            size={screens.xs ? "small" : "middle"}
          />
          <Popconfirm
            title="Удалить преподавателя?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size={screens.xs ? "small" : "middle"}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const mobileColumns: (ColumnGroupType<Teacher> | ColumnType<Teacher>)[] = [
    {
      title: "Преподаватель",
      key: "name",
      render: (_: any, record: Teacher) => (
        <div>
          <div>
            {record.last_name} {record.first_name} {record.middle_name}
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>
            {record.user?.username && (
              <>
                Логин:{" "}
                <Typography.Text copyable>
                  {record.user.username}
                </Typography.Text>
              </>
            )}
          </div>
        </div>
      ),
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
            size="small"
          />
          <Popconfirm
            title="Удалить преподавателя?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const columns = screens.xs ? mobileColumns : baseColumns;

  return (
    <div style={{ padding: screens.xs ? 8 : 16 }}>
      <Card
        bordered={false}
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: screens.xs ? 8 : 16 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: screens.xs ? "column" : "row",
            gap: screens.xs ? 12 : 16,
            justifyContent: "space-between",
          }}
        >
          <Input
            placeholder="Поиск преподавателей"
            prefix={<SearchOutlined />}
            style={{ width: screens.xs ? "100%" : 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            size={screens.xs ? "small" : "middle"}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentTeacher(null);
              setModalOpen(true);
            }}
            size={screens.xs ? "small" : "middle"}
            block={screens.xs}
          >
            {screens.xs ? "Добавить" : "Добавить преподавателя"}
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredTeachers}
        rowKey="id"
        loading={loading}
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        bordered
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
