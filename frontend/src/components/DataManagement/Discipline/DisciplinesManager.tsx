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

import { DisciplineForm } from "./DisciplineForm";
import { type Discipline, type Specialty } from "../../../types"; // Make sure to import Specialty type
import { getDisciplines, deleteDiscipline, getSpecialties } from "../../../api";
import { useApi } from "../../../hooks";

const { useBreakpoint } = Grid;

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
  const [specialties, setSpecialties] = useState<Specialty[]>([]); // Properly typed specialties
  const screens = useBreakpoint();

  useEffect(() => {
    refresh({});
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialties();
        setSpecialties(res.data);
      } catch (error) {
        message.error("Ошибка загрузки специальностей");
        console.error(error);
      }
    };
    fetchSpecialties();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDiscipline(id);
      message.success("Дисциплина удалена");
      refresh({});
    } catch (error) {
      message.error("Ошибка при удалении дисциплины");
      console.error(error);
    }
  };

  const filteredDisciplines =
    disciplines?.filter((discipline) =>
      discipline.name.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

  const renderSpecialty = (specialty: string | Specialty) => {
    if (
      typeof specialty === "object" &&
      "id" in specialty &&
      "name" in specialty
    ) {
      return <Tag color="blue">{specialty.name}</Tag>;
    }

    // Handle case where specialty is just an ID (string)
    const spec = specialties.find((s) => s.id === specialty);
    return spec ? <Tag color="blue">{spec.name}</Tag> : "—";
  };

  const getSpecialtyName = (specialty: string | Specialty): string => {
    if (typeof specialty === "object" && "name" in specialty) {
      return specialty.name;
    }
    const spec = specialties.find((s) => s.id === specialty);
    return spec ? spec.name : "";
  };

  const baseColumns: ColumnType<Discipline>[] = [
    {
      title: "Название",
      dataIndex: "name",
      key: "name",
      sorter: (a: Discipline, b: Discipline) => a.name.localeCompare(b.name),
    },
    {
      title: "Специальность",
      dataIndex: "specialty",
      key: "specialty",
      render: renderSpecialty,
      sorter: (a: Discipline, b: Discipline) => {
        return getSpecialtyName(a.specialty).localeCompare(
          getSpecialtyName(b.specialty)
        );
      },
      responsive: ["md"],
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
            size={screens.xs ? "small" : "middle"}
          />
          <Popconfirm
            title="Удалить дисциплину?"
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

  const mobileColumns: ColumnType<Discipline>[] = [
    {
      title: "Дисциплина",
      key: "name",
      render: (_: any, record: Discipline) => (
        <div>
          <Typography.Text strong>{record.name}</Typography.Text>
          <div style={{ marginTop: 4 }}>
            {renderSpecialty(record.specialty)}
          </div>
        </div>
      ),
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
            size="small"
          />
          <Popconfirm
            title="Удалить дисциплину?"
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
            placeholder="Поиск дисциплин"
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
              setCurrentDiscipline(null);
              setModalOpen(true);
            }}
            size={screens.xs ? "small" : "middle"}
            block={screens.xs}
          >
            {screens.xs ? "Добавить" : "Добавить дисциплину"}
          </Button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={filteredDisciplines}
        rowKey="id"
        loading={loading}
        size={screens.xs ? "small" : "middle"}
        scroll={screens.xs ? { x: true } : undefined}
        bordered
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
