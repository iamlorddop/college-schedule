import { useState, type FC } from "react";
import { Table, Button, Space, Popconfirm, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { GroupForm } from "./GroupForm";
import { type Group } from "../../../types";
import { getGroups, deleteGroup } from "../../../api";
import { useApi } from "../../../hooks";

export const GroupsManager: FC = () => {
  const { data: groups, loading, request: refresh } = useApi(getGroups);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteGroup(id);
      message.success("Группа удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении группы");
      throw error;
    }
  };

  const columns = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Специальность",
      dataIndex: ["specialty", "name"],
      key: "specialty",
    },
    {
      title: "Курс",
      dataIndex: ["course", "number"],
      key: "course",
      render: (num: number) => `${num} курс`,
    },
    {
      title: "Форма обучения",
      dataIndex: "study_form",
      key: "study_form",
      render: (form: string) => {
        const forms = { б: "Бюджет", п: "Коммерция", в: "Вечернее" };
        return forms[form as keyof typeof forms];
      },
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Group) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentGroup(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить группу?"
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
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentGroup(null);
            setModalOpen(true);
          }}
        >
          Добавить группу
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={groups || []}
        rowKey="id"
        loading={loading}
      />

      <GroupForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        group={currentGroup}
      />
    </div>
  );
};
