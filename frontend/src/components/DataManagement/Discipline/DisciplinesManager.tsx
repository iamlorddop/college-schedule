import { type FC, useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, message, Input } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { DisciplineForm } from "./DisciplineForm";
import { type Discipline } from "../../../types";
import { getDisciplines, deleteDiscipline, getSpecialties } from "../../../api";
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

  // Справочник специальностей
  const [specialties, setSpecialties] = useState<any[]>([]);

  useEffect(() => {
    refresh({});
  }, []);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await getSpecialties();
        setSpecialties(res.data);
      } catch (error) {
        message.error("Ошибка загрузки специальностей");
        throw error;
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
      dataIndex: "specialty",
      key: "specialty",
      render: (specialty: number | { id: number; name: string }) => {
        // Если specialty — это объект, используем его name
        if (specialty && typeof specialty === "object" && "name" in specialty) {
          return specialty.name;
        }
        // Если specialty — это id, ищем в справочнике
        const spec = specialties.find((s) => s.id === specialty);
        return spec ? spec.name : "—";
      },
      sorter: (a: Discipline, b: Discipline) => {
        // Для сортировки ищем имена специальностей
        const getName = (spec: any) => {
          if (spec && typeof spec === "object" && "name" in spec)
            return spec.name;
          const found = specialties.find((s) => s.id === spec);
          return found ? found.name : "";
        };
        return getName(a.specialty).localeCompare(getName(b.specialty));
      },
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
