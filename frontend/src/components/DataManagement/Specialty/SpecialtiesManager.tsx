import { type FC, useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Input,
  Grid,
  Card,
  Typography,
  Tag,
} from "antd";
import type { ColumnType } from "antd/es/table";
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

const { useBreakpoint } = Grid;

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
  const screens = useBreakpoint();

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
      console.error(error);
    }
  };

  const filteredSpecialties =
    specialties?.filter(
      (spec) =>
        spec.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (spec.code &&
          spec.code.toLowerCase().includes(searchText.toLowerCase()))
    ) || [];

  const baseColumns: ColumnType<Specialty>[] = [
    {
      title: "Код",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (code ? <Tag color="blue">{code}</Tag> : "-"),
      sorter: (a: Specialty, b: Specialty) =>
        (a.code || "").localeCompare(b.code || ""),
      responsive: ["sm"],
    },
    {
      title: "Название",
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
            size={screens.xs ? "small" : "middle"}
          />
          <Popconfirm
            title="Удалить специальность?"
            onConfirm={() => handleDelete(record.id)}
            placement={screens.xs ? "top" : "left"}
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

  const mobileColumns: ColumnType<Specialty>[] = [
    {
      title: "Специальность",
      key: "info",
      render: (_: any, record: Specialty) => (
        <div>
          <Typography.Text strong>{record.name}</Typography.Text>
          {record.code && (
            <div style={{ marginTop: 4 }}>
              <Tag color="blue">{record.code}</Tag>
            </div>
          )}
        </div>
      ),
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
            size="small"
          />
          <Popconfirm
            title="Удалить специальность?"
            onConfirm={() => handleDelete(record.id)}
            placement="top"
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
            placeholder="Поиск по названию или коду"
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
              setCurrentSpecialty(null);
              setModalOpen(true);
            }}
            size={screens.xs ? "small" : "middle"}
            block={screens.xs}
          >
            {screens.xs ? "Добавить" : "Добавить специальность"}
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredSpecialties}
        rowKey="id"
        loading={loading}
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        bordered
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
