import { type FC, useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { getSpecialties, deleteSpecialty } from "../../../api";
import { useApi } from "../../../hooks";
import { type Specialty } from "../../../types";
import { SpecialtyForm } from "./SpecialtyForm";

export const SpecialtiesManager: FC = () => {
  const {
    data: specialties,
    loading,
    request: refresh,
  } = useApi(getSpecialties);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentSpecialty, setCurrentSpecialty] = useState<Specialty | null>(
    null
  );
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    refresh({});
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteSpecialty(id);
      message.success("Специальность удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении специальности");
      throw error;
    }
  };

  const filteredSpecialties =
    specialties?.filter(
      (spec) =>
        spec.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (spec.code &&
          spec.code.toLowerCase().includes(searchText.toLowerCase()))
    ) || [];

  const columns = [
    {
      title: "Код",
      dataIndex: "code",
      key: "code",
      sorter: (a: Specialty, b: Specialty) =>
        (a.code || "").localeCompare(b.code || ""),
    },
    {
      title: "Название специальности",
      dataIndex: "name",
      key: "name",
      sorter: (a: Specialty, b: Specialty) => a.name.localeCompare(b.name),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: any, record: Specialty) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentSpecialty(record);
              setModalOpen(true);
            }}
          />
          <Popconfirm
            title="Удалить специальность?"
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
          placeholder="Поиск по названию или коду"
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setCurrentSpecialty(null);
            setModalOpen(true);
          }}
        >
          Добавить специальность
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSpecialties}
        rowKey="id"
        loading={loading}
      />

      <SpecialtyForm
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          refresh({});
        }}
        specialty={currentSpecialty}
      />
    </div>
  );
};
